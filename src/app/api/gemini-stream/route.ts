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
  "gemini-3.5-flash",
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
        temperature: 0.55,
        topP: 0.92,
        maxOutputTokens: 12288,
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
[분량 통제 — 가장 중요한 규칙]
==============================================
1. 분량은 한국어 음절 수(공백 제외) 기준이다.
2. **각 섹션은 반드시 하한선 이상**으로 작성한다. 하한 미달은 자동 탈락이다.
3. 본문이 짧다 싶으면 다음 순서로 분량을 늘려서 채운다:
   (a) STAR 의 행동(Action) 단락을 한 문장 더 자세히 묘사
   (b) 결과(Result)의 정량/정성 효과를 한 문장 더 풀어쓴다
   (c) 본인이 배운 점(Insight)을 한 문장 덧붙인다
   (d) 지원 직무와의 연결 고리를 한 문장 더 추가
4. 본문 출력 직전, 머릿속으로 글자 수를 점검하고 하한선 미만이면 위 (a)~(d) 를 적용해 늘린다.
5. 절대 짧게 마무리하지 않는다. 짧으면 즉시 탈락.

==============================================
[5개 항목 양식 — 분량·구조 엄수]
==============================================

A) growth (성장과정 — 가치관) — **하한 480자, 권장 500~520자, 상한 540자**
구조 (합치면 약 500자):
- 한줄 소제목 [8~12자, 대괄호 포함]
- S1. 가치관 두괄식 선언: 1~2문장, **70~100자**
- S2. 가치관 형성 경험 STAR (라벨 노출 금지, 한 단락으로 자연스럽게):
  · 상황: 1문장, **50~70자**
  · 과제: 1문장, **60~80자**
  · 행동: 2~3문장, **150~190자** (본인 행동 중심 구체 묘사)
  · 결과: 1문장, **60~80자** (정량 결과 포함)
- S3. 지원 직무에서 발휘 방식: 1~2문장, **70~100자**

B) personality (성격의 장점) — **하한 480자, 권장 500~520자, 상한 540자**
구조:
- 한줄 소제목 [8~12자]
- S1. 직무 적합 장점 1: 선언 1문장 + STAR 사례 3문장 = **180~210자**
- S2. 직무 적합 장점 2: 선언 1문장 + STAR 사례 3문장 = **180~210자**
- S3. 직무 적합성 마무리: 1~2문장, **70~100자**
규칙: 단점은 절대 본문에 쓰지 않는다. 장점 2개만 사례로 증명한다.

C) motivation (직무 지원동기) — **하한 480자, 권장 500~520자, 상한 540자**
구조:
- 한줄 소제목 [10자 내외, 회사·직무 연결 메시지]
- S1. 왜 이 직무인가 (개인 동기): 2~3문장, **120~150자**
- S2. 준비된 지식·기술·태도 요약: 1~2문장, **80~110자**
- S3. 기업+직무 선택 이유: 2~3문장, **140~180자**
   · 산업/시장 동향 1줄 (50~70자)
   · 지원 기업의 사업 구조와 지원 직무의 연결 1~2문장 (90~110자)
- S4. 입사 후 하고 싶은 일과 준비된 역량의 활용 방식: 1~2문장, **80~110자**

D) competency (보유 직무역량 — NCS) — **하한 970자, 권장 1000~1040자, 상한 1080자**
구조:
- 한줄 소제목 [직무 핵심 역량 선언]
- S1. 지식 — 직무에 필요한 학습 결과: **240~280자**
- S2. 기술 — 구현 가능한 기술 + 프로젝트에서 어떻게 활용했는지 장면 묘사: **400~450자**
- S3. 태도 — 직무에 적합한 태도 2가지, 각각 선언 + 짧은 사례: **340~390자**
   · 태도 1: 선언 (한 문장) → 사례 (2문장), 170~190자
   · 태도 2: 선언 (한 문장) → 사례 (2문장), 170~190자

E) ambition (입사 후 포부) — **하한 480자, 권장 500~520자, 상한 540자**
구조:
- 한줄 소제목 [인턴/직무 기간의 목표]
- S1. 개발자/직무인으로서 성장 목표 (KPI 형): **230~270자**
   · 지원 직무 성과 지표를 KPI 로 제시 (120~140자)
   · 그 목표가 회사에 줄 영향 1문장 (90~110자)
- S2. 회사 성장 기여 계획: **230~270자**
   · 목표 달성을 위한 구체 활동 계획 (120~140자)
   · 향후 이루고 싶은 개선 방향 1문장 (90~110자)

==============================================
[문장 품질 — 강의 11가지 감점 표현 절대 금지]
==============================================
${badWritingRules.map((r, i) => `${i + 1}. ${r.rule}${r.example ? ` (예: ${r.example})` : ""}`).join("\n")}

[지향할 합격 문장 6원칙]
${goodWritingRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

==============================================
[작성 규칙 — 위반 시 자동 탈락]
==============================================
1. **각 섹션 분량 하한 엄수**. growth/personality/motivation/ambition 은 480자 이상, competency 는 970자 이상. 한국어 음절(공백 제외) 기준. 미달이면 출력 전에 본문을 늘려서 다시 작성한다.
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
