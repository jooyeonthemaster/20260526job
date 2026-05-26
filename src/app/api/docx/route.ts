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
import { sectionLabels, sectionOrder, sectionTargets } from "@/lib/lecture-data";
import type { DraftSection, StudioPayload } from "@/lib/types";

export const runtime = "nodejs";

const FONT = "Malgun Gothic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as StudioPayload;
    const doc = buildDocument(payload);
    const buffer = await Packer.toBuffer(doc);
    const rawName = payload.profile.name?.trim() || "학생";
    const filename = `${rawName}_AI자기소개서.docx`;

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
        error: "DOCX 생성 중 오류가 발생했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

function buildDocument(payload: StudioPayload) {
  const { profile, strengths, techStack, stories, sections } = payload;

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      children: [
        new TextRun({
          text: "자  기  소  개  서",
          bold: true,
          size: 36,
          font: FONT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({
          text: `[ 지원분야 : ${profile.targetRole || "지원분야"} / ${
            profile.careerType || "신입"
          } ]`,
          size: 22,
          font: FONT,
        }),
      ],
    }),

    infoTable([
      ["성    명", profile.name || ""],
      ["지원기업", profile.company || ""],
      ["산업/직무", `${profile.industry || ""} / ${profile.targetRole || ""}`],
      ["교육과정", profile.education || ""],
      ["훈련내용", profile.training || ""],
      ["대표 프로젝트", profile.project || ""],
      ["강점 키워드", strengths.join(", ")],
      ["사용 가능 기술", techStack.join(", ")],
    ]),

    spacer(280),

    sectionDivider("작성 근거 — STAR 경험"),
    ...stories.slice(0, 4).flatMap((story, index) => [
      new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [
          new TextRun({
            text: `${index + 1}. ${story.title || "경험"}`,
            bold: true,
            font: FONT,
            size: 20,
          }),
          ...(story.metric
            ? [
                new TextRun({
                  text: `  (${story.metric})`,
                  font: FONT,
                  size: 18,
                  color: "6366F1",
                }),
              ]
            : []),
        ],
      }),
      ...(story.situation
        ? [bulletLine(`S — ${story.situation}`)]
        : []),
      ...(story.task ? [bulletLine(`T — ${story.task}`)] : []),
      ...(story.action ? [bulletLine(`A — ${story.action}`)] : []),
      ...(story.result ? [bulletLine(`R — ${story.result}`)] : []),
      ...(story.insight
        ? [bulletLine(`배운 점 — ${story.insight}`)]
        : []),
    ]),
  ];

  sectionOrder.forEach((key, index) => {
    children.push(spacer(300));
    children.push(...sectionBlock(index + 1, sectionLabels[key], sectionTargets[key], sections[key]));
  });

  return new Document({
    creator: "가독성 있는 자기소개서",
    description: "자기소개서 강의 실습 결과물",
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20 },
          paragraph: { spacing: { line: 320, after: 100 } },
        },
      },
      paragraphStyles: [
        {
          id: "SectionHeading",
          name: "Section Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            bold: true,
            size: 26,
            font: FONT,
            color: "0F172A",
          },
          paragraph: {
            spacing: { before: 320, after: 120 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 8, color: "6366F1" },
            },
          },
        },
        {
          id: "Subhead",
          name: "Subhead",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, size: 22, font: FONT, color: "4338CA" },
          paragraph: { spacing: { before: 160, after: 100 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        children,
      },
    ],
  });
}

function infoTable(rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
    },
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 26, type: WidthType.PERCENTAGE },
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
              width: { size: 74, type: WidthType.PERCENTAGE },
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

function sectionDivider(label: string) {
  return new Paragraph({
    spacing: { before: 280, after: 140 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "94A3B8" },
    },
    children: [
      new TextRun({ text: label, bold: true, font: FONT, size: 22, color: "475569" }),
    ],
  });
}

function bulletLine(text: string) {
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 280, hanging: 200 },
    children: [
      new TextRun({ text: "  •  ", font: FONT, size: 18, color: "6366F1" }),
      new TextRun({ text, font: FONT, size: 19 }),
    ],
  });
}

function sectionBlock(
  number: number,
  label: string,
  target: string,
  section: DraftSection,
) {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      style: "SectionHeading",
      children: [
        new TextRun({
          text: `${number}. ${label}`,
          bold: true,
          font: FONT,
          size: 26,
        }),
        new TextRun({
          text: `   (${target})`,
          font: FONT,
          size: 20,
          color: "94A3B8",
        }),
      ],
    }),
  );

  if (section.title) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({ text: "[ ", font: FONT, size: 22, color: "6366F1", bold: true }),
          new TextRun({
            text: section.title,
            bold: true,
            font: FONT,
            size: 22,
            color: "1E1B4B",
          }),
          new TextRun({ text: " ]", font: FONT, size: 22, color: "6366F1", bold: true }),
        ],
      }),
    );
  }

  const body = section.body?.trim() || "(AI 초안을 생성하거나 직접 작성해 주세요.)";
  body.split(/\n+/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    paragraphs.push(
      new Paragraph({
        indent: { firstLine: 280 },
        spacing: { after: 140, line: 340 },
        children: [
          new TextRun({
            text: trimmed,
            font: FONT,
            size: 21,
          }),
        ],
      }),
    );
  });

  return paragraphs;
}

function spacer(after: number) {
  return new Paragraph({
    spacing: { after },
    children: [new TextRun({ text: "", font: FONT })],
  });
}
