import { NextResponse } from "next/server";
import {
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import {
  jobFitDimensionLabels,
  jobFitQuestions,
  summarizeJobFit,
  type JobFitAnswer,
  type JobFitReport,
} from "@/lib/job-fit";
import type { StudioPayload } from "@/lib/types";

export const runtime = "nodejs";

type JobFitDocxRequest = {
  payload: StudioPayload;
  answers: JobFitAnswer[];
  report: JobFitReport;
};

const FONT = "Malgun Gothic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JobFitDocxRequest;
    const summary = summarizeJobFit(body.answers || [], body.payload);
    const doc = buildDocument(body.payload, body.answers || [], body.report, summary);
    const buffer = await Packer.toBuffer(doc);
    const rawName = body.payload.profile.name?.trim() || "지원자";
    const filename = `${rawName}_직무유형_진단리포트.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "직무 진단 DOCX 생성 중 오류가 발생했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

function buildDocument(
  payload: StudioPayload,
  answers: JobFitAnswer[],
  report: JobFitReport,
  summary: ReturnType<typeof summarizeJobFit>,
) {
  const children: (Paragraph | Table)[] = [
    title("AI 직무 유형 진단 리포트"),
    centered(
      `${payload.profile.name || "지원자"} · ${payload.profile.targetRole || "희망 직무 미입력"} · ${report.readiness.label}`,
    ),
    spacer(180),
    infoTable([
      ["1순위 추천 직무", report.primaryRole],
      ["직무군", report.primaryRoleFamily],
      ["성향 유형", report.persona],
      ["준비도", `${report.readiness.overall}점 · ${report.readiness.label}`],
      ["지원 기업/산업", `${payload.profile.company || "미입력"} / ${payload.profile.industry || "미입력"}`],
    ]),
    heading("핵심 결론"),
    body(report.headline),
    body(report.primaryReason),
    heading("상위 직무군 매칭"),
    roleTable(
      (report.visualSummary?.roleBars?.length
        ? report.visualSummary.roleBars
        : summary.roleScores.slice(0, 8).map((role) => ({
            role: role.title,
            family: role.family,
            fit: role.fit,
            reason: role.description,
          }))
      ).map((role) => [
        role.role,
        role.family,
        String(role.fit),
        role.reason,
      ]),
    ),
    heading("성향 축"),
    infoTable(
      (report.visualSummary?.radar?.length
        ? report.visualSummary.radar.map((item) => [
            item.label,
            `${item.score}점 · ${item.note}`,
          ])
        : summary.topDimensions.map((dimension) => [
            jobFitDimensionLabels[dimension],
            `${summary.dimensionPercents[dimension]}점`,
          ])),
    ),
    heading("자소서 섹션 × 검사 응답 교차 분석"),
    ...(report.visualSummary?.sectionComparisons || []).flatMap((item) => [
      subhead(`${item.section} · 일치도 ${item.alignment}점`),
      bullet(`자소서 근거: ${item.coverLetterEvidence}`),
      bullet(`응답 신호: ${item.answerSignal}`),
      bullet(`보강 지점: ${item.gap}`),
      bullet(`수정 액션: ${item.action}`),
    ]),
    heading("준비도 세부"),
    ...(report.visualSummary?.preparationBars?.length
      ? report.visualSummary.preparationBars.flatMap((item) => [
          subhead(`${item.label} · ${item.score}점`),
          body(`${item.evidence} 다음 행동: ${item.next}`),
        ])
      : report.readiness.items.flatMap((item) => [
          subhead(`${item.label} · ${item.score}점`),
          body(item.note),
        ])),
    heading("강점"),
    ...bullets(report.strengths),
    heading("주의할 약점"),
    ...bullets(report.blindSpots),
    heading("부족한 증거"),
    ...bullets(report.missingEvidence),
    heading("4주 액션 플랜"),
    ...report.actionPlan.flatMap((step) => [
      subhead(`${step.period} · ${step.title}`),
      ...bullets(step.actions),
    ]),
    heading("탐색 직무 로드맵"),
    ...report.roleRoadmap.slice(0, 6).flatMap((role) => [
      subhead(role.role),
      body(role.why),
      bullet(`첫 산출물: ${role.firstPortfolio}`),
    ]),
    heading("이력서/면접 키워드"),
    body(report.resumeKeywords.join(" · ")),
    heading("예상 면접 질문"),
    ...bullets(report.interviewQuestions),
    heading("현실 조언"),
    ...bullets(report.realityAdvice),
    heading("응답 로그"),
    ...answers.map((answer, index) => {
      const question = jobFitQuestions.find((item) => item.id === answer.questionId);
      const choice = question?.choices.find((item) => item.id === answer.choiceId);
      return bullet(
        `${index + 1}. ${question?.axis || "질문"} - ${choice?.title || "응답 없음"}`,
      );
    }),
  ];

  return new Document({
    creator: "AI Cover Letter Lecture Studio",
    description: "AI 직무 유형 진단 결과 리포트",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20 },
          paragraph: { spacing: { line: 320, after: 100 } },
        },
      },
      paragraphStyles: [
        {
          id: "ReportHeading",
          name: "Report Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, size: 27, font: FONT, color: "0F172A" },
          paragraph: {
            spacing: { before: 280, after: 120 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 8, color: "111827" },
            },
          },
        },
        {
          id: "ReportSubhead",
          name: "Report Subhead",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, size: 22, font: FONT, color: "166534" },
          paragraph: { spacing: { before: 120, after: 80 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.78),
              right: convertInchesToTwip(0.78),
              bottom: convertInchesToTwip(0.78),
              left: convertInchesToTwip(0.78),
            },
          },
        },
        children,
      },
    ],
  });
}

function title(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 140 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 38,
        font: FONT,
        color: "0A0A12",
      }),
    ],
  });
}

function centered(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 180 },
    children: [new TextRun({ text, size: 21, font: FONT, color: "475569" })],
  });
}

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    style: "ReportHeading",
    children: [new TextRun({ text, bold: true, font: FONT, size: 27 })],
  });
}

function subhead(text: string) {
  return new Paragraph({
    style: "ReportSubhead",
    children: [new TextRun({ text, bold: true, font: FONT, size: 22 })],
  });
}

function body(text: string) {
  return new Paragraph({
    spacing: { after: 130, line: 330 },
    children: [new TextRun({ text, font: FONT, size: 20 })],
  });
}

function bullet(text: string) {
  return new Paragraph({
    spacing: { after: 70, line: 310 },
    indent: { left: 280, hanging: 180 },
    children: [
      new TextRun({ text: "• ", font: FONT, size: 19, color: "16A34A" }),
      new TextRun({ text, font: FONT, size: 19 }),
    ],
  });
}

function bullets(items: string[]) {
  return items.map((item) => bullet(item));
}

function infoTable(rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 28, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F5F9" },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: label, bold: true, font: FONT, size: 19 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 72, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: value, font: FONT, size: 19 })],
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

function roleTable(rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders(),
    rows: [
      new TableRow({
        children: ["직무", "군", "적합도", "근거"].map(
          (label) =>
            new TableCell({
              shading: { fill: "0A0A12" },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
                      bold: true,
                      font: FONT,
                      size: 18,
                      color: "FFFFFF",
                    }),
                  ],
                }),
              ],
            }),
        ),
      }),
      ...rows.map(
        ([role, family, fit, description]) =>
          new TableRow({
            children: [
              tableCell(role, true),
              tableCell(family),
              tableCell(fit),
              tableCell(description),
            ],
          }),
      ),
    ],
  });
}

function tableCell(text: string, bold = false) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold, font: FONT, size: 18 })],
      }),
    ],
  });
}

function tableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
  };
}

function spacer(after: number) {
  return new Paragraph({
    spacing: { after },
    children: [new TextRun({ text: "", font: FONT })],
  });
}
