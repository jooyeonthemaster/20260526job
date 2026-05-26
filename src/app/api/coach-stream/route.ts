import {
  badWritingRules,
  goodWritingRules,
  sectionGuides,
  sectionLabels,
} from "@/lib/lecture-data";
import type { StudioPayload } from "@/lib/types";

export const runtime = "nodejs";

type CoachRequest = {
  context: string;
  studentInput?: string;
  payload: StudioPayload;
};

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean) as string[];

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = (await request.json()) as CoachRequest;
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
          encoder.encode(`\n\n[ERROR] 응답 생성에 실패했습니다. ${lastErr}`),
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
        temperature: 0.35,
        topP: 0.85,
        maxOutputTokens: 1400,
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
        // Skip malformed line
      }
    }
  }
}

function buildPrompt({ context, studentInput, payload }: CoachRequest) {
  return `너는 김기홍 대표의 ‘가독성 있는 자기소개서 작성법’ 강의를 실시간으로 보조하는 코치다.
학생이 슬라이드에서 입력한 문장을 강의 공식 기준으로 점검한다.

[현재 슬라이드/작업]
${context}

[학생 문장]
${studentInput?.trim() || "(입력 없음. 예시 기준으로 피드백)"}

[학생 프로필 요약]
${JSON.stringify(payload?.profile || {}, null, 2)}

[항목별 강의 공식]
${JSON.stringify(
  Object.fromEntries(
    Object.entries(sectionGuides).map(([key, guide]) => [
      sectionLabels[key as keyof typeof sectionLabels],
      guide,
    ]),
  ),
  null,
  2,
)}

[문장 품질 기준]
피해야 할 표현: ${badWritingRules.map((rule) => rule.rule).join(", ")}
좋은 문장 원칙: ${goodWritingRules.join(" / ")}

[출력 규칙]
- 한국어로 쓴다.
- 사실을 지어내지 않는다.
- 학생이 바로 고칠 수 있게 짧고 강하게 쓴다.
- 아래 정확한 형식으로만 출력한다. 머리말·꼬리말·코드블록 금지.

## VERDICT
한 문장 총평.

## STRENGTHS
- 좋은 점 1
- 좋은 점 2

## RISKS
- 감점 위험 1
- 감점 위험 2

## REWRITE
고친 예시 문장 1개.

## NEXT
- 다음 행동 1
- 다음 행동 2
- 다음 행동 3

## QUESTIONS
- 학생에게 물어볼 질문 1
- 질문 2
`;
}
