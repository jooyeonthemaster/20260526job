import {
  badWritingRules,
  goodWritingRules,
  sectionLabels,
  sectionTargets,
} from "@/lib/lecture-data";
import type { StudioPayload } from "@/lib/types";

export const runtime = "nodejs";

type StreamRequest = { payload: StudioPayload };

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

  const body = (await request.json()) as StreamRequest;
  const prompt = buildPrompt(body.payload);

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
          encoder.encode(`\n\n[ERROR] 초안 생성에 실패했습니다. ${lastErr}`),
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
        temperature: 0.45,
        topP: 0.9,
        maxOutputTokens: 8192,
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

function buildPrompt(payload: StudioPayload) {
  return `너는 김기홍 대표의 ‘가독성 있는 자기소개서 작성법’ 강의를 진행하는 전문 강사이자 첨삭자다.
강의에서 가르친 양식·문장 원칙·분량 기준을 엄격하게 따라, 5개 자소서 항목 본문을 한 번에 생성한다.
학생이 입력한 모든 사실 정보(이력서 28필드, STAR 경험 배열, 강점 키워드, 기술 스택)를 빠짐없이 활용한다.

[학생 입력 데이터 — 모두 반영]
${JSON.stringify(payload, null, 2)}

==============================================
[5개 항목 양식 — 분량·구조 엄수]
==============================================

A) growth (성장과정 — 가치관) — ${sectionTargets.growth}, ±5% 엄수
구조:
[ 한줄 소제목 (8~12자, 핵심 가치 압축) ]
S1. 가치관 두괄식 선언 (40~60자) — 첫 문장에 핵심 가치 한 줄.
S2. 가치관 형성 경험 — STAR 흐름으로 풀어 작성 (라벨 노출 금지).
   · 상황 1문장 · 과제 1문장 · 행동 2문장(본인 행동 중심) · 결과 1문장(정량 포함)
S3. 지원 직무에서 발휘 방식 (40~60자, 설득형 마무리).

B) personality (성격의 장점) — ${sectionTargets.personality}, ±5% 엄수
구조:
[ 한줄 소제목 (8~12자) ]
S1. 직무 적합 장점 1 선언 (한 문장) + STAR 한 줄 사례 (3~4문장).
S2. 직무 적합 장점 2 선언 (한 문장) + STAR 한 줄 사례 (3~4문장).
S3. 직무 적합성 마무리 (40~60자).
규칙: 단점은 절대 본문에 쓰지 않는다. 장점 2개만 사례로 증명한다.

C) motivation (직무 지원동기) — ${sectionTargets.motivation}, ±5% 엄수
구조:
[ 한줄 소제목 (10자 내외) — 회사·직무 연결 메시지 ]
S1. 왜 이 직무인가 (개인 동기, 2~3문장).
S2. 준비된 지식·기술·태도 요약 (1~2문장).
S3. 기업+직무 선택 이유 (2~3문장):
   · 산업/시장 동향 1줄
   · 지원 기업의 사업 구조와 지원 직무의 연결 1~2줄
S4. 입사 후 하고 싶은 일과 준비된 역량의 활용 방식 (1~2문장).

D) competency (보유 직무역량 — NCS) — ${sectionTargets.competency}, ±5% 엄수
구조:
[ 한줄 소제목 — 직무 핵심 역량 선언 ]
S1. 지식 — 직무에 필요한 학습 결과 (220~260자)
S2. 기술 — 구현 가능한 기술 + 프로젝트에서 어떻게 활용했는지 장면 묘사 (350~420자)
S3. 태도 — 직무에 적합한 태도 2가지, 각각 선언 + 짧은 사례 (350~420자)
   태도 1: 선언 (한 문장) → 사례 (2문장)
   태도 2: 선언 (한 문장) → 사례 (2문장)

E) ambition (입사 후 포부) — ${sectionTargets.ambition}, ±5% 엄수
구조:
[ 한줄 소제목 — 인턴 기간의 목표 ]
S1. 개발자/직무인으로서 성장 목표 (200~250자, KPI 형)
   · 지원 직무 성과 지표를 KPI 로 제시
   · 그 목표가 회사에 줄 영향 한 문장
S2. 회사 성장 기여 계획 (200~250자)
   · 목표 달성을 위한 구체 활동 계획
   · 향후 이루고 싶은 개선 방향 한 문장

==============================================
[문장 품질 — 강의 11가지 감점 표현 절대 금지]
==============================================
${badWritingRules.map((r, i) => `${i + 1}. ${r.rule}${r.example ? ` (예: ${r.example})` : ""}`).join("\n")}

[지향할 합격 문장 6원칙]
${goodWritingRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

==============================================
[작성 규칙 — 위반 시 자동 탈락]
==============================================
1. 분량 ±5% 엄수. 한국어 음절(공백 제외) 기준.
2. 양식 구조 S1/S2/S3/S4 라벨은 본문에 노출하지 말고, 흐름으로 자연스럽게 녹인다.
3. 한줄 소제목은 첫 줄에 대괄호 [ ] 로 감싸 출력한다.
4. 사실을 지어내지 않는다. 수치/날짜/회사명이 없으면 "[수치 확인 필요]" 또는 "[사실 확인 필요]" 라고 표기.
5. ‘귀사의 비전에 공감’, ‘귀사’ 같은 빈말 금지. 학생 입력 회사명·산업을 자연스럽게 풀어 쓴다.
6. 두괄식 — 모든 항목 첫 문장에 핵심 가치/메시지가 드러나야 한다.
7. 피동형/번역투/접속어 남용/지시어 모호/긴 문장 절대 금지.
8. 항목 간 내용 중복 금지 (성장/성격/지원동기/직무역량/포부).
9. 단점은 제출 본문에 쓰지 않는다 (성격 = 장점만).
10. 학생 입력의 STAR 경험 배열을 직접 인용하지 말고, 직무 관점으로 재구성해 본문에 녹인다.

==============================================
[출력 형식 — 정확히 이 마커만 사용. 다른 텍스트·코드블록·설명 절대 금지]
==============================================

## SECTION growth
TITLE: [한줄 소제목 텍스트]
BODY:
{${sectionTargets.growth} 본문 — 양식 A 구조로 자연스럽게 작성. 빈 줄로 단락 구분 가능}
KEYWORDS: 활용한 강점 키워드 (쉼표 구분, 3~5개)
CHECKLIST:
- 학생이 다시 검토할 점 1
- 학생이 다시 검토할 점 2
- 학생이 다시 검토할 점 3

## SECTION personality
TITLE: ...
BODY:
...
KEYWORDS: ...
CHECKLIST:
- ...

## SECTION motivation
TITLE: ...
BODY:
...
KEYWORDS: ...
CHECKLIST:
- ...

## SECTION competency
TITLE: ...
BODY:
...
KEYWORDS: ...
CHECKLIST:
- ...

## SECTION ambition
TITLE: ...
BODY:
...
KEYWORDS: ...
CHECKLIST:
- ...

## QUALITY
HEADLINE: 전체 평가 1문장
SCORE: 0-100 정수
WARNINGS:
- 문장 품질 경고 (피동형/번역투/접속어 남용 등 발견 시)
MISSING:
- 학생에게 추가로 물어볼 질문 (최대 3개)

[항목별 라벨]
${Object.entries(sectionLabels).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

지금부터 위 형식만 사용해서 5개 SECTION + 1개 QUALITY 블록을 순서대로 출력하라. 다른 설명·머리말·꼬리말은 한 글자도 출력하지 마라.
`;
}
