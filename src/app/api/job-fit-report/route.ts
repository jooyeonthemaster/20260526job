import { NextResponse } from "next/server";
import {
  buildFallbackJobFitReport,
  jobFitDimensionLabels,
  jobFitQuestions,
  summarizeJobFit,
  type JobFitAnswer,
  type JobFitReport,
  type JobFitSummary,
} from "@/lib/job-fit";
import type { StudioPayload } from "@/lib/types";

export const runtime = "nodejs";

type JobFitReportRequest = {
  payload: StudioPayload;
  answers: JobFitAnswer[];
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const JOB_FIT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  required: [
    "headline",
    "primaryRole",
    "primaryRoleFamily",
    "primaryReason",
    "persona",
    "secondaryRoles",
    "aptitudeTags",
    "visualSummary",
    "readiness",
    "strengths",
    "blindSpots",
    "missingEvidence",
    "actionPlan",
    "roleRoadmap",
    "resumeKeywords",
    "interviewQuestions",
    "realityAdvice",
  ],
  properties: {
    headline: { type: "STRING" },
    primaryRole: { type: "STRING" },
    primaryRoleFamily: { type: "STRING" },
    primaryReason: { type: "STRING" },
    persona: { type: "STRING" },
    secondaryRoles: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["role", "reason", "fit"],
        properties: {
          role: { type: "STRING" },
          reason: { type: "STRING" },
          fit: { type: "NUMBER" },
        },
      },
    },
    aptitudeTags: { type: "ARRAY", items: { type: "STRING" } },
    visualSummary: {
      type: "OBJECT",
      required: [
        "radar",
        "roleBars",
        "keywordCloud",
        "sectionComparisons",
        "preparationBars",
      ],
      properties: {
        radar: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["label", "score", "note"],
            properties: {
              label: { type: "STRING" },
              score: { type: "NUMBER" },
              note: { type: "STRING" },
            },
          },
        },
        roleBars: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["role", "family", "fit", "reason"],
            properties: {
              role: { type: "STRING" },
              family: { type: "STRING" },
              fit: { type: "NUMBER" },
              reason: { type: "STRING" },
            },
          },
        },
        keywordCloud: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["text", "weight", "tone"],
            properties: {
              text: { type: "STRING" },
              weight: { type: "NUMBER" },
              tone: { type: "STRING", enum: ["strong", "risk", "action"] },
            },
          },
        },
        sectionComparisons: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: [
              "section",
              "coverLetterEvidence",
              "answerSignal",
              "alignment",
              "gap",
              "action",
            ],
            properties: {
              section: { type: "STRING" },
              coverLetterEvidence: { type: "STRING" },
              answerSignal: { type: "STRING" },
              alignment: { type: "NUMBER" },
              gap: { type: "STRING" },
              action: { type: "STRING" },
            },
          },
        },
        preparationBars: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["label", "score", "evidence", "next"],
            properties: {
              label: { type: "STRING" },
              score: { type: "NUMBER" },
              evidence: { type: "STRING" },
              next: { type: "STRING" },
            },
          },
        },
      },
    },
    readiness: {
      type: "OBJECT",
      required: ["overall", "label", "items"],
      properties: {
        overall: { type: "NUMBER" },
        label: { type: "STRING" },
        items: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            required: ["label", "score", "note"],
            properties: {
              label: { type: "STRING" },
              score: { type: "NUMBER" },
              note: { type: "STRING" },
            },
          },
        },
      },
    },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    blindSpots: { type: "ARRAY", items: { type: "STRING" } },
    missingEvidence: { type: "ARRAY", items: { type: "STRING" } },
    actionPlan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["period", "title", "actions"],
        properties: {
          period: { type: "STRING" },
          title: { type: "STRING" },
          actions: { type: "ARRAY", items: { type: "STRING" } },
        },
      },
    },
    roleRoadmap: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["role", "why", "firstPortfolio"],
        properties: {
          role: { type: "STRING" },
          why: { type: "STRING" },
          firstPortfolio: { type: "STRING" },
        },
      },
    },
    resumeKeywords: { type: "ARRAY", items: { type: "STRING" } },
    interviewQuestions: { type: "ARRAY", items: { type: "STRING" } },
    realityAdvice: { type: "ARRAY", items: { type: "STRING" } },
  },
} as const;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as JobFitReportRequest;
    const summary = summarizeJobFit(body.answers || [], body.payload);
    const fallback = buildFallbackJobFitReport(summary, body.payload);
    const prompt = buildPrompt(body.payload, body.answers || [], summary, fallback);

    const result = await callGemini(GEMINI_MODEL, prompt, apiKey, {
      responseSchema: JOB_FIT_RESPONSE_SCHEMA,
      maxOutputTokens: 16384,
    });
    if (!result.ok) {
      return NextResponse.json(
        {
          error: "Gemini 직무 진단 호출에 실패했습니다.",
          detail: result.detail,
          model: GEMINI_MODEL,
        },
        { status: result.status },
      );
    }

    let rawParsed: unknown;
    try {
      rawParsed = parseGeminiJson(result.text);
    } catch (parseError) {
      const repaired = await repairGeminiJson(
        GEMINI_MODEL,
        apiKey,
        result.text,
        parseError instanceof Error ? parseError.message : String(parseError),
      );
      if (!repaired.ok) {
        return NextResponse.json(
          {
            error: "Gemini 응답 JSON 복구에 실패했습니다.",
            detail: repaired.detail,
            model: GEMINI_MODEL,
          },
          { status: repaired.status },
        );
      }
      rawParsed = parseGeminiJson(repaired.text);
    }

    const parsed = normalizeReport(rawParsed, fallback);
    return NextResponse.json({ ...parsed, model: GEMINI_MODEL });
  } catch (error) {
    return NextResponse.json(
      {
        error: "직무 진단 처리 중 예기치 못한 오류가 발생했습니다.",
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
  options?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
    responseSchema?: unknown;
  },
): Promise<
  | { ok: true; text: string }
  | { ok: false; status: number; detail: string }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${apiKey}`;

  let response: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 70000);
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.48,
          topP: options?.topP ?? 0.86,
          responseMimeType: "application/json",
          ...(options?.responseSchema
            ? { responseSchema: options.responseSchema }
            : {}),
          maxOutputTokens: options?.maxOutputTokens ?? 16384,
        },
      }),
    });
  } catch (error) {
    return {
      ok: false,
      status: (error as { name?: string })?.name === "AbortError" ? 598 : 599,
      detail:
        (error as { name?: string })?.name === "AbortError"
          ? `${model} 응답 시간이 초과되었습니다.`
          : error instanceof Error
            ? error.message
            : String(error),
    };
  } finally {
    clearTimeout(timeout);
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

async function repairGeminiJson(
  model: string,
  apiKey: string,
  brokenJson: string,
  parseError: string,
): Promise<
  | { ok: true; text: string }
  | { ok: false; status: number; detail: string }
> {
  const repairPrompt = `다음 텍스트는 Gemini가 생성한 JSON이지만 문법 오류가 있다.
역할: JSON repair bot.
규칙:
- 내용을 요약하거나 새로 쓰지 말고 JSON 문법만 고쳐라.
- 누락된 쉼표, 잘못된 따옴표, trailing comma, 닫히지 않은 배열/객체만 수정한다.
- 마크다운 없이 유효한 JSON 객체만 출력한다.
- 최상위 객체는 반드시 기존 키 구조를 유지한다.

[파싱 오류]
${parseError}

[깨진 JSON]
${brokenJson}`;

  return callGemini(model, repairPrompt, apiKey, {
    temperature: 0,
    topP: 1,
    maxOutputTokens: 16384,
  });
}

function buildPrompt(
  payload: StudioPayload,
  answers: JobFitAnswer[],
  summary: JobFitSummary,
  fallback: JobFitReport,
) {
  const answerDetails = answers.map((answer, index) => {
    const question = jobFitQuestions.find((item) => item.id === answer.questionId);
    const choice = question?.choices.find((item) => item.id === answer.choiceId);
    return {
      no: index + 1,
      axis: question?.axis,
      prompt: question?.prompt,
      selected: choice
        ? {
            title: choice.title,
            body: choice.body,
            signals: choice.weights,
          }
        : null,
    };
  });

  return `너는 한국 취업준비생의 직무 적합도를 분석하는 커리어 전략가이자 데이터 시각화 설계자다.
검사 결과를 MBTI처럼 가볍게 포장하지 말고, 실제 채용 준비에 바로 쓸 수 있는 직무 추천/근거/액션 플랜으로 작성한다.
반드시 학생의 자소서 5개 섹션과 14개 이지선다 응답을 서로 비교한다. "응답에서는 X 성향이 강한데, 자소서의 Y 섹션에는 그 증거가 약하다"처럼 교차 분석해야 한다.
분석은 아래 점수 모델 결과와 학생 프로필, STAR 경험, 자소서 초안을 모두 근거로 삼는다.

[학생 프로필과 자소서 원자료]
${JSON.stringify(payload, null, 2)}

[14개 이지선다 응답]
${JSON.stringify(answerDetails, null, 2)}

[로컬 점수 모델 결과]
- 상위 직무군: ${summary.roleScores
    .slice(0, 8)
    .map((role) => `${role.title} ${role.fit}`)
    .join(" / ")}
- 성향 축 점수: ${Object.entries(summary.dimensionPercents)
    .map(
      ([key, value]) =>
        `${jobFitDimensionLabels[key as keyof typeof jobFitDimensionLabels]} ${value}`,
    )
    .join(" / ")}
- 준비도: ${summary.readiness.overall} (${summary.readiness.label})
- 준비도 세부: ${summary.readiness.items
    .map((item) => `${item.label} ${item.score} - ${item.note}`)
    .join(" / ")}

[기본 fallback 리포트]
${JSON.stringify(fallback, null, 2)}

[작성 원칙]
1. 사실을 지어내지 않는다. 근거가 부족하면 "부족한 증거"나 "확인 질문"으로 표시한다.
2. 직무명은 실제 취업 시장에서 쓰는 직무명으로 쓴다. 너무 넓은 "IT" 같은 표현 금지.
3. 추천은 1순위 직무 1개, 보조 직무 2~3개, 탐색 직무 5개 로드맵으로 나눈다.
4. "잘 맞아요"가 아니라 왜 맞는지, 어떤 증거가 부족한지, 이번 달에 뭘 만들어야 하는지 말한다.
5. 학생이 입력한 지원 직무와 검사 결과가 다르면 부드럽지만 분명하게 말한다.
6. 취준생에게 도움이 되는 현실 조언을 포함한다: 채용공고 분석, 포트폴리오, 자소서/면접, 역량 공백.
7. 시각화용 데이터는 실제 화면에 바로 그릴 수 있게 숫자와 짧은 문장으로 제공한다.
8. sectionComparisons는 성장과정, 성격의 장단점, 직무 지원동기, 보유 직무역량, 입사 후 포부 5개를 반드시 모두 포함한다.
9. 각 sectionComparisons 항목은 자소서의 실제 문장/내용 근거와 검사 응답 신호를 비교해야 한다.

[출력 JSON 스키마]
마크다운 코드블록 없이 JSON만 출력한다.
{
  "headline": "핵심 결론 1문장",
  "primaryRole": "1순위 추천 직무명",
  "primaryRoleFamily": "직무군",
  "primaryReason": "입력 응답과 프로필 근거를 결합한 추천 이유 4~6문장",
  "persona": "성향 유형명 1문장",
  "secondaryRoles": [
    { "role": "보조 추천 직무", "reason": "왜 보조 후보인지", "fit": 0 }
  ],
  "aptitudeTags": ["성향 태그 5~8개"],
  "visualSummary": {
    "radar": [
      { "label": "방사형 그래프 축명", "score": 0, "note": "왜 이 점수인지 짧은 근거" }
    ],
    "roleBars": [
      { "role": "직무명", "family": "직무군", "fit": 0, "reason": "응답+자소서 기반 매칭 근거" }
    ],
    "keywordCloud": [
      { "text": "키워드", "weight": 0, "tone": "strong" }
    ],
    "sectionComparisons": [
      {
        "section": "성장과정",
        "coverLetterEvidence": "자소서 섹션에서 확인한 실제 근거",
        "answerSignal": "14문항 응답에서 드러난 신호",
        "alignment": 0,
        "gap": "불일치/부족한 증거",
        "action": "바로 고칠 행동"
      }
    ],
    "preparationBars": [
      { "label": "준비도 항목", "score": 0, "evidence": "현재 근거", "next": "다음 행동" }
    ]
  },
  "readiness": {
    "overall": ${summary.readiness.overall},
    "label": "${summary.readiness.label}",
    "items": ${JSON.stringify(summary.readiness.items)}
  },
  "strengths": ["강점 4~6개"],
  "blindSpots": ["주의할 약점/리스크 4~6개"],
  "missingEvidence": ["취업 전 반드시 보강할 증거 5~7개"],
  "actionPlan": [
    { "period": "1주차", "title": "계획 제목", "actions": ["구체 행동"] },
    { "period": "2~3주차", "title": "계획 제목", "actions": ["구체 행동"] },
    { "period": "4주차", "title": "계획 제목", "actions": ["구체 행동"] }
  ],
  "roleRoadmap": [
    { "role": "탐색할 직무", "why": "검토 이유", "firstPortfolio": "첫 산출물" }
  ],
  "resumeKeywords": ["이력서/자소서 키워드 8~12개"],
  "interviewQuestions": ["면접에서 받을 가능성이 큰 질문 5~7개"],
  "realityAdvice": ["현실 조언 4~6개"]
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
    throw new Error("Gemini 직무 진단 응답을 JSON으로 파싱할 수 없습니다.");
  }
}

function normalizeReport(value: unknown, fallback: JobFitReport): JobFitReport {
  const data = value as Partial<JobFitReport>;
  return {
    headline: stringOr(data.headline, fallback.headline),
    primaryRole: stringOr(data.primaryRole, fallback.primaryRole),
    primaryRoleFamily: stringOr(data.primaryRoleFamily, fallback.primaryRoleFamily),
    primaryReason: stringOr(data.primaryReason, fallback.primaryReason),
    persona: stringOr(data.persona, fallback.persona),
    secondaryRoles: normalizeSecondary(data.secondaryRoles, fallback.secondaryRoles),
    aptitudeTags: listOr(data.aptitudeTags, fallback.aptitudeTags),
    visualSummary: normalizeVisualSummary(
      data.visualSummary,
      fallback.visualSummary,
    ),
    readiness: {
      overall:
        typeof data.readiness?.overall === "number"
          ? data.readiness.overall
          : fallback.readiness.overall,
      label: stringOr(data.readiness?.label, fallback.readiness.label),
      items: Array.isArray(data.readiness?.items)
        ? data.readiness.items
            .filter(
              (item): item is JobFitReport["readiness"]["items"][number] =>
                typeof item?.label === "string" &&
                typeof item?.score === "number" &&
                typeof item?.note === "string",
            )
            .slice(0, 6)
        : fallback.readiness.items,
    },
    strengths: listOr(data.strengths, fallback.strengths),
    blindSpots: listOr(data.blindSpots, fallback.blindSpots),
    missingEvidence: listOr(data.missingEvidence, fallback.missingEvidence),
    actionPlan: normalizePlan(data.actionPlan, fallback.actionPlan),
    roleRoadmap: normalizeRoadmap(data.roleRoadmap, fallback.roleRoadmap),
    resumeKeywords: listOr(data.resumeKeywords, fallback.resumeKeywords),
    interviewQuestions: listOr(data.interviewQuestions, fallback.interviewQuestions),
    realityAdvice: listOr(data.realityAdvice, fallback.realityAdvice),
  };
}

function normalizeVisualSummary(
  value: unknown,
  fallback: JobFitReport["visualSummary"],
): JobFitReport["visualSummary"] {
  const data = value as Partial<JobFitReport["visualSummary"]> | undefined;
  return {
    radar: normalizeRadar(data?.radar, fallback.radar),
    roleBars: normalizeRoleBars(data?.roleBars, fallback.roleBars),
    keywordCloud: normalizeKeywordCloud(
      data?.keywordCloud,
      fallback.keywordCloud,
    ),
    sectionComparisons: normalizeSectionComparisons(
      data?.sectionComparisons,
      fallback.sectionComparisons,
    ),
    preparationBars: normalizePreparationBars(
      data?.preparationBars,
      fallback.preparationBars,
    ),
  };
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function listOr(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );
  return list.length ? list : fallback;
}

function normalizeScore(value: unknown, fallback = 0) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeRadar(
  value: unknown,
  fallback: JobFitReport["visualSummary"]["radar"],
) {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .filter(
      (
        item,
      ): item is {
        label: string;
        score: number;
        note: string;
      } =>
        typeof item?.label === "string" &&
        typeof item?.score === "number" &&
        typeof item?.note === "string",
    )
    .map((item) => ({ ...item, score: normalizeScore(item.score) }))
    .slice(0, 8);
  return list.length >= 4 ? list : fallback;
}

function normalizeRoleBars(
  value: unknown,
  fallback: JobFitReport["visualSummary"]["roleBars"],
) {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .filter(
      (
        item,
      ): item is {
        role: string;
        family: string;
        fit: number;
        reason: string;
      } =>
        typeof item?.role === "string" &&
        typeof item?.family === "string" &&
        typeof item?.fit === "number" &&
        typeof item?.reason === "string",
    )
    .map((item) => ({ ...item, fit: normalizeScore(item.fit) }))
    .slice(0, 8);
  return list.length ? list : fallback;
}

function normalizeKeywordCloud(
  value: unknown,
  fallback: JobFitReport["visualSummary"]["keywordCloud"],
) {
  if (!Array.isArray(value)) return fallback;
  const tones = new Set(["strong", "risk", "action"]);
  const list = value
    .filter(
      (
        item,
      ): item is {
        text: string;
        weight: number;
        tone: "strong" | "risk" | "action";
      } =>
        typeof item?.text === "string" &&
        typeof item?.weight === "number" &&
        typeof item?.tone === "string" &&
        tones.has(item.tone),
    )
    .map((item) => ({ ...item, weight: normalizeScore(item.weight, 50) }))
    .slice(0, 20);
  return list.length ? list : fallback;
}

function normalizeSectionComparisons(
  value: unknown,
  fallback: JobFitReport["visualSummary"]["sectionComparisons"],
) {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .filter(
      (
        item,
      ): item is JobFitReport["visualSummary"]["sectionComparisons"][number] =>
        typeof item?.section === "string" &&
        typeof item?.coverLetterEvidence === "string" &&
        typeof item?.answerSignal === "string" &&
        typeof item?.alignment === "number" &&
        typeof item?.gap === "string" &&
        typeof item?.action === "string",
    )
    .map((item) => ({
      ...item,
      alignment: normalizeScore(item.alignment),
    }))
    .slice(0, 5);
  return list.length === 5 ? list : fallback;
}

function normalizePreparationBars(
  value: unknown,
  fallback: JobFitReport["visualSummary"]["preparationBars"],
) {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .filter(
      (
        item,
      ): item is JobFitReport["visualSummary"]["preparationBars"][number] =>
        typeof item?.label === "string" &&
        typeof item?.score === "number" &&
        typeof item?.evidence === "string" &&
        typeof item?.next === "string",
    )
    .map((item) => ({ ...item, score: normalizeScore(item.score) }))
    .slice(0, 6);
  return list.length ? list : fallback;
}

function normalizeSecondary(
  value: unknown,
  fallback: JobFitReport["secondaryRoles"],
) {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .filter(
      (
        item,
      ): item is {
        role: string;
        reason: string;
        fit: number;
      } =>
        typeof item?.role === "string" &&
        typeof item?.reason === "string" &&
        typeof item?.fit === "number",
    )
    .slice(0, 4);
  return list.length ? list : fallback;
}

function normalizePlan(value: unknown, fallback: JobFitReport["actionPlan"]) {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .filter(
      (
        item,
      ): item is {
        period: string;
        title: string;
        actions: string[];
      } =>
        typeof item?.period === "string" &&
        typeof item?.title === "string" &&
        Array.isArray(item?.actions),
    )
    .map((item) => ({ ...item, actions: listOr(item.actions, []) }))
    .filter((item) => item.actions.length)
    .slice(0, 4);
  return list.length ? list : fallback;
}

function normalizeRoadmap(value: unknown, fallback: JobFitReport["roleRoadmap"]) {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .filter(
      (
        item,
      ): item is {
        role: string;
        why: string;
        firstPortfolio: string;
      } =>
        typeof item?.role === "string" &&
        typeof item?.why === "string" &&
        typeof item?.firstPortfolio === "string",
    )
    .slice(0, 8);
  return list.length ? list : fallback;
}
