import { NextResponse } from "next/server";
import {
  badWritingRules,
  goodWritingRules,
  sectionGuides,
  sectionLabels,
  sectionTargets,
} from "@/lib/lecture-data";
import type { GeminiMode, SectionKey, StudioPayload } from "@/lib/types";

export const runtime = "nodejs";

type GeminiRequest = {
  mode: GeminiMode;
  sectionKey?: SectionKey;
  payload: StudioPayload;
};

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean) as string[];

const PRIMARY_MODEL = FALLBACK_MODELS[0];

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as GeminiRequest;
    const prompt = buildPrompt(body);

    let lastError: { status: number; detail: string; model: string } | null = null;

    for (const model of FALLBACK_MODELS) {
      const result = await callGemini(model, prompt, apiKey, body.mode);
      if (result.ok) {
        try {
          const parsed = parseGeminiJson(result.text);
          return NextResponse.json({ ...parsed, model });
        } catch (parseErr) {
          lastError = {
            status: 502,
            detail:
              parseErr instanceof Error ? parseErr.message : String(parseErr),
            model,
          };
          continue;
        }
      } else {
        lastError = { status: result.status, detail: result.detail, model };
        // 404 / 400 류 모델 오류라면 다음 후보로
        if (result.status >= 400 && result.status < 500) continue;
        break;
      }
    }

    return NextResponse.json(
      {
        error: "Gemini 호출에 실패했습니다.",
        detail: lastError?.detail || "알 수 없는 오류",
        model: lastError?.model || PRIMARY_MODEL,
      },
      { status: lastError?.status || 500 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "AI 생성 중 예기치 못한 오류가 발생했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

async function callGemini(
  model: string,
  prompt: string,
  apiKey: string,
  mode: GeminiMode,
): Promise<
  | { ok: true; text: string }
  | { ok: false; status: number; detail: string }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${apiKey}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: mode === "polish" ? 0.35 : 0.6,
          topP: 0.9,
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        },
      }),
    });
  } catch (e) {
    return {
      ok: false,
      status: 599,
      detail: e instanceof Error ? e.message : String(e),
    };
  }

  if (!response.ok) {
    const detail = await response.text();
    return { ok: false, status: response.status, detail: detail.slice(0, 1200) };
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    return {
      ok: false,
      status: 502,
      detail: JSON.stringify(data).slice(0, 1200),
    };
  }

  return { ok: true, text };
}

function buildPrompt({ mode, sectionKey, payload }: GeminiRequest) {
  const targetSections =
    mode === "section" && sectionKey
      ? [sectionKey]
      : (Object.keys(sectionLabels) as SectionKey[]);

  const sectionSummary = targetSections.map((key) => ({
    key,
    label: sectionLabels[key],
    target: sectionTargets[key],
    guide: sectionGuides[key],
  }));

  return `너는 김기홍 대표의 ‘가독성 있는 자기소개서 작성법’ 강의를 진행하는 전문 강사이자 첨삭자다.
강의 원칙과 학생이 입력한 사실 정보를 결합해, 실제 학원 자기소개서 양식에 들어갈 본문을 작성한다.

[작업 모드]
- draft: 5개 항목 전체 초안을 생성한다.
- section: sectionKey 항목만 더 정교하게 재작성한다.
- polish: 기존 초안을 유지하면서 문장 품질을 끌어올린다 (의미는 보존).
현재 모드: ${mode}
대상 항목: ${JSON.stringify(sectionSummary, null, 2)}

[반드시 지킬 강의 원칙]
1. 양식 흐름을 바꾸지 말고 항목별 자기소개서 형식으로 작성한다.
2. ‘붉은색 안내문’이나 메타 설명을 본문에 남기지 않는다.
3. 들여쓰기와 문장 정렬을 고려해 한 문단이 과하게 길어지지 않게 작성한다.
4. 사실을 과장하거나 만들어내지 않는다. 수치가 부족하면 본문에 “[수치 확인 필요]”라고 표기한다.
5. 단점은 제출 본문에서 길게 쓰지 않는다. 성격 항목은 ‘장점만’ 직무 적합성으로 설득한다.
6. 성장과정/성격/지원동기/직무역량/입사후포부의 내용이 서로 중복되지 않도록 배치한다.
7. 지원동기는 기업 IR을 복사하지 말고, 나의 해석과 직무 준비를 자연스럽게 연결한다.
8. 입사 후 포부는 ‘인성·태도 + 직무역량 + 인턴 종료 시점 목표’로 KPI형 목표를 포함한다.
9. 직무역량은 NCS 관점으로 ‘지식 / 기술 / 태도’를 분리해서 보여준다.
10. 두괄식으로 시작 — 첫 1~2문장 안에 핵심 가치/메시지가 드러나야 한다.

[피해야 할 ‘나쁜 글’]
${badWritingRules.map((r, i) => `${i + 1}. ${r.rule}${r.example ? ` (예: ${r.example})` : ""}`).join("\n")}

[지향할 ‘좋은 문장’ 6원칙]
${goodWritingRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

[학생 입력 데이터]
${JSON.stringify(payload, null, 2)}

[출력 JSON 스키마]
마크다운 코드블록·설명 없이 JSON만 출력한다.
{
  "sections": {
    "growth": {
      "title": "한줄 소제목 (10자 내외)",
      "body": "완성 본문 (목표 글자 수에 맞춰 작성)",
      "rationale": "왜 이 구조로 썼는지 1문장",
      "keywords": ["활용한 강점 키워드"],
      "checklist": ["학생이 검토할 포인트 2~4개"]
    }
  },
  "qualityReport": {
    "headline": "전체 평가 1문장",
    "score": 0,
    "styleWarnings": ["문장 품질 경고 (피동형/번역투 등)"],
    "missingQuestions": ["추가로 학생에게 물어볼 질문 3개 이내"],
    "strengthMapping": ["강점 키워드 ↔ 사용된 경험"]
  }
}

[모드별 출력 규칙]
- section 모드: 대상 항목만 sections에 포함한다. qualityReport는 헤드라인과 styleWarnings만 채워도 된다.
- draft / polish: growth, personality, motivation, competency, ambition 5개를 모두 포함한다.
- 본문 언어는 한국어. 각 항목 본문은 목표 글자 수를 ±10% 이내로 맞춘다.
- 마지막 출력은 반드시 위 JSON 스키마와 동일한 형태여야 한다.`;
}

function parseGeminiJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Gemini 응답을 JSON으로 파싱할 수 없습니다.");
  }
}
