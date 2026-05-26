import {
  badWritingRules,
  goodWritingRules,
  sectionLabels,
} from "@/lib/lecture-data";
import type { StudioPayload } from "@/lib/types";

export const runtime = "nodejs";

type InterviewMode = "start" | "reply" | "next";

type ChatTurn = { role: "ai" | "user"; content: string };

type InterviewRequest = {
  payload: StudioPayload;
  history: ChatTurn[];
  mode: InterviewMode;
  questionCount: number;
};

// Gemini 3.5 Flash (2026-05-19 GA) is the primary model used across all
// routes in this project. Keep this list in sync with the other api/*/route.ts.
const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean) as string[];

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = (await request.json()) as InterviewRequest;
  const prompt = buildPrompt(body);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let succeeded = false;
      let lastErr = "";

      for (const model of FALLBACK_MODELS) {
        try {
          await streamFromGemini({
            model,
            apiKey,
            prompt,
            onChunk: (text) => controller.enqueue(encoder.encode(text)),
          });
          succeeded = true;
          break;
        } catch (error) {
          lastErr = error instanceof Error ? error.message : String(error);
        }
      }

      if (!succeeded) {
        controller.enqueue(
          encoder.encode(`\n\n[ERROR] 면접관 응답 생성 실패: ${lastErr}`),
        );
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

async function streamFromGemini({
  model,
  apiKey,
  prompt,
  onChunk,
}: {
  model: string;
  apiKey: string;
  prompt: string;
  onChunk: (text: string) => void;
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        topP: 0.92,
        maxOutputTokens: 4096,
        // Disable Dynamic Thinking for the live interview chat — first-token
        // latency matters more than chain-of-thought depth here.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text();
    throw new Error(`${model} ${response.status}: ${detail.slice(0, 500)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let lineBreak: number;
    while ((lineBreak = buffer.indexOf("\n")) !== -1) {
      const rawLine = buffer.slice(0, lineBreak).trim();
      buffer = buffer.slice(lineBreak + 1);
      if (!rawLine.startsWith("data:")) continue;
      const json = rawLine.slice(5).trim();
      if (!json || json === "[DONE]") continue;
      try {
        const data = JSON.parse(json);
        const parts: { text?: string }[] =
          data?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.text) onChunk(part.text);
        }
      } catch {
        // skip malformed line
      }
    }
  }
}

function formatHistory(history: ChatTurn[]) {
  if (!history.length) return "(아직 대화 없음)";
  return history
    .map((turn, i) => {
      const speaker = turn.role === "ai" ? "면접관" : "지원자";
      return `[${i + 1}] ${speaker}:\n${turn.content.trim()}`;
    })
    .join("\n\n");
}

function summarizeSections(payload: StudioPayload) {
  return Object.entries(sectionLabels)
    .map(([key, label]) => {
      const sec = payload.sections?.[key as keyof typeof sectionLabels];
      if (!sec?.body) return `■ ${label}\n(작성 전)`;
      return `■ ${label}${sec.title ? ` — [${sec.title}]` : ""}\n${sec.body.trim()}`;
    })
    .join("\n\n");
}

function modeInstruction(mode: InterviewMode, questionCount: number) {
  if (mode === "start") {
    return `[현재 모드: 면접 시작]
1) 한 문장으로 따뜻하지만 단정한 말투로 면접 시작을 알리고, 지원자가 작성한 5개 항목 중 가장 인상적이거나 가장 검증이 필요한 지점을 골라 그 이유를 한 줄로 짚어라.
2) 그다음 바로 "1번 질문" 으로 첫 심층 질문 1개를 던져라.
3) 질문은 사실 검증·역량 확인·구체 경험을 캐는 압박형이어야 한다. 자소서 본문을 직접 인용하면서 "이 문장에서 'X' 라고 쓰셨는데..." 같은 방식으로 깊이 파고들어라.`;
  }
  if (mode === "next") {
    return `[현재 모드: 다음 질문 요청]
지원자가 추가 피드백 없이 다음 질문으로 넘어가길 원한다.
1) 직전 답변에 대한 피드백은 한 줄로만 짧게 정리한다(없으면 생략).
2) 바로 다음 심층 질문 1개를 던져라. 지금까지 다룬 주제와 겹치지 않도록 다른 항목/관점에서 파고들어라.
3) "${questionCount + 1}번 질문" 표기로 시작해라.`;
  }
  return `[현재 모드: 답변 받음 → 피드백 + 다음 질문]
지원자가 방금 직전 질문에 답했다.
1) 답변의 합격 포인트(좋은 점) 1~2가지와 감점 위험(구체성 부족 / 자소서 본문과 불일치 / STAR 결손 / 범용 문장 등) 1~2가지를 짧게 짚어라.
2) 답변이 충분히 구체적이면 칭찬하고 다음 질문으로 자연스럽게 넘어가라. 답변이 부족하면 "한 번 더 묻겠다" 며 같은 주제를 다른 각도로 다시 파고드는 질문을 던져라.
3) 모든 응답은 반드시 다음 질문 한 개로 마무리한다. 질문은 "${questionCount + 1}번 질문" 표기로 시작해라.`;
}

function buildPrompt(req: InterviewRequest) {
  const { payload, history, mode, questionCount } = req;

  return `너는 김기홍 대표의 ‘가독성 있는 자기소개서 작성법’ 강의 마지막 단계에서 진행되는 1:1 모의 면접 면접관이다.
지원자의 자기소개서(5개 항목 본문)와 이력 정보를 근거로, 실제 인사담당자/임원처럼 깊이 있는 질문을 던지고, 답변마다 합격/감점 포인트를 짚어준다.

[지원자 기본 정보]
- 이름: ${payload.profile.name || "(미입력)"}
- 지원 직무: ${payload.profile.targetRole || "(미입력)"} (${payload.profile.careerType || "신입"})
- 지원 기업: ${payload.profile.company || "(미입력)"} / 산업: ${payload.profile.industry || "(미입력)"}
- 교육/훈련: ${payload.profile.education || "(미입력)"}
- 강점 키워드: ${(payload.strengths || []).join(", ") || "(미입력)"}
- 기술 스택: ${(payload.techStack || []).join(", ") || "(미입력)"}

[지원자가 제출한 자기소개서 본문 — 모든 질문은 반드시 이 본문에 근거할 것]
${summarizeSections(payload)}

[지원자가 입력한 STAR 경험들 — 자소서 본문이 부족하면 이 원자료에서 사실을 검증하라]
${JSON.stringify(payload.stories || [], null, 2)}

[지금까지의 면접 대화 기록]
${formatHistory(history)}

==============================================
[면접관 페르소나]
==============================================
- 톤: 전문적, 단정함, 적당한 압박감. 존중하되 모호한 답변은 봐주지 않는다.
- 한국어로만 말한다. 영문 라벨/마크다운 헤더 사용 금지.
- 자소서 본문의 구체 문장을 직접 인용하면서 깊게 파고든다.
- 답변이 ‘준비된 자기소개서 문장’을 그대로 옮기는 수준이면 한 단계 더 깊이 파고든다(왜? 어떻게? 결과 수치는?).
- 강의에서 다룬 11가지 감점 표현을 답변에서 잡아낸다.

[강의 감점 표현 11가지]
${badWritingRules.map((r, i) => `${i + 1}. ${r.rule}`).join(" / ")}

[좋은 문장 6원칙]
${goodWritingRules.map((r, i) => `${i + 1}. ${r}`).join(" / ")}

==============================================
${modeInstruction(mode, questionCount)}
==============================================

[출력 규칙 — 반드시 지킬 것]
1) 한국어로만 답하라. 마크다운 코드블록·헤더(#)·영문 라벨 사용 금지.
2) 응답 전체는 500자 이내. 짧고 단단하게.
3) 출력 구조는 정확히 다음 라벨만 사용한다(있는 항목만 출력). 라벨은 줄 시작에 그대로 쓰고, 본문은 라벨 다음 줄부터 작성.

[피드백]
(답변에 대한 합격 포인트와 감점 위험 한 문단. start 모드면 생략하고 오프닝 인사로 대체)

[질문]
(${mode === "start" ? "1번" : `${questionCount + 1}번`} 질문 본문 한 단락)

4) [질문] 블록 외에는 절대로 질문을 던지지 마라. 본문에 의문문이 있어도 안 된다.
5) 자소서를 직접 인용할 때는 큰따옴표(\")로 짧게 인용하라.
6) ‘귀사’ 같은 빈말 금지. 회사명과 직무명을 자연스럽게 사용하라.

지금 위 규칙으로 응답을 출력하라. 다른 머리말·꼬리말은 한 글자도 출력하지 마라.
`;
}
