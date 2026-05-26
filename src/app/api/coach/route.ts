import { NextResponse } from "next/server";
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

type CoachReport = {
  context: string;
  headline: string;
  strengths: string[];
  risks: string[];
  nextActions: string[];
  rewrite?: string;
  questions?: string[];
};

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean) as string[];

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as CoachRequest;
    const prompt = buildCoachPrompt(body);
    let lastError: { status: number; detail: string; model: string } | null = null;

    for (const model of FALLBACK_MODELS) {
      const result = await callGemini(model, prompt, apiKey);
      if (!result.ok) {
        lastError = { status: result.status, detail: result.detail, model };
        if (result.status >= 400 && result.status < 500) continue;
        break;
      }

      try {
        const parsed = normalizeCoach(parseGeminiJson(result.text), body.context);
        return NextResponse.json({ ...parsed, model });
      } catch (error) {
        lastError = {
          status: 502,
          detail: error instanceof Error ? error.message : String(error),
          model,
        };
      }
    }

    return NextResponse.json(
      {
        error: "Gemini 코치 호출에 실패했습니다.",
        detail: lastError?.detail || "알 수 없는 오류",
        model: lastError?.model || FALLBACK_MODELS[0],
      },
      { status: lastError?.status || 500 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "AI 코치 처리 중 예기치 못한 오류가 발생했습니다.",
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
          temperature: 0.35,
          topP: 0.85,
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
        },
      }),
    });
  } catch (error) {
    return {
      ok: false,
      status: 599,
      detail: error instanceof Error ? error.message : String(error),
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

function buildCoachPrompt({ context, studentInput, payload }: CoachRequest) {
  return `너는 김기홍 대표의 ‘가독성 있는 자기소개서 작성법’ 강의를 보조하는 실시간 코치다.
학생이 현재 슬라이드에서 입력한 메모를 강의 공식 기준으로 빠르게 점검한다.

[현재 슬라이드/작업]
${context}

[학생이 방금 입력한 메모 또는 문장]
${studentInput?.trim() || "(입력 없음. 예시 기준으로 피드백)"}

[학생 전체 프로필과 기존 초안]
${JSON.stringify(payload, null, 2)}

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
- 사실을 지어내지 않는다. 근거가 없으면 질문으로 돌린다.
- 학생이 바로 고칠 수 있게 짧고 강하게 쓴다.
- 마크다운 코드블록 없이 JSON만 출력한다.

{
  "context": "현재 점검 대상 20자 내외",
  "headline": "총평 1문장",
  "strengths": ["좋은 점 1", "좋은 점 2"],
  "risks": ["감점 위험 1", "감점 위험 2"],
  "nextActions": ["다음 행동 1", "다음 행동 2", "다음 행동 3"],
  "rewrite": "가능하면 제출 문장 예시 1개",
  "questions": ["학생에게 더 물어볼 질문 1", "질문 2"]
}`;
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
    throw new Error("Gemini 코치 응답을 JSON으로 파싱할 수 없습니다.");
  }
}

function normalizeCoach(value: unknown, fallbackContext: string): CoachReport {
  const data = value as Partial<CoachReport>;
  return {
    context: typeof data.context === "string" ? data.context : fallbackContext,
    headline:
      typeof data.headline === "string"
        ? data.headline
        : "입력의 방향은 보이지만 근거와 항목 연결을 더 선명하게 해야 합니다.",
    strengths: normalizeList(data.strengths, ["핵심 경험을 항목과 연결하려는 방향이 좋습니다."]),
    risks: normalizeList(data.risks, ["구체 행동이나 결과가 부족하면 범용 문장처럼 보일 수 있습니다."]),
    nextActions: normalizeList(data.nextActions, [
      "행동 1개와 결과 1개를 추가하세요.",
      "지원 직무와 연결되는 단어를 첫 문장에 두세요.",
    ]),
    rewrite: typeof data.rewrite === "string" ? data.rewrite : undefined,
    questions: normalizeList(data.questions, []),
  };
}

function normalizeList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((item): item is string => typeof item === "string");
  return list.length ? list : fallback;
}
