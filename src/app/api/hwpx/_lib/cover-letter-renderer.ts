/**
 * Cover-letter HWPX 빌더.
 * 학생 프로필 + AI 생성 5개 항목 본문을 받아 HwpxDocument 로 변환한다.
 */

import { A4_HEIGHT, A4_WIDTH, mm, pt } from "./units";
import type {
  BlockNode,
  HwpxDocument,
  ParaStyle,
  ParagraphNode,
  RunStyle,
  SectionSpec,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "./types";
import { txt } from "./types";

const FONT_KR = "한컴바탕";
const FONT_KR_TITLE = "한컴 윤고딕 740";
const COLOR_INK = "#0A0A12";
const COLOR_MUTE = "#666666";
const COLOR_LINE = "#CCCCCC";

const titleStyle: RunStyle = {
  fontKr: FONT_KR_TITLE,
  size: 22,
  bold: true,
  color: COLOR_INK,
};

const subtitleStyle: RunStyle = {
  fontKr: FONT_KR,
  size: 10,
  color: COLOR_MUTE,
};

const sectionLabelStyle: RunStyle = {
  fontKr: FONT_KR_TITLE,
  size: 9,
  bold: true,
  color: COLOR_MUTE,
  letterSpacing: 12,
};

const sectionTitleStyle: RunStyle = {
  fontKr: FONT_KR_TITLE,
  size: 16,
  bold: true,
  color: COLOR_INK,
};

const bodyStyle: RunStyle = {
  fontKr: FONT_KR,
  size: 11,
  color: COLOR_INK,
};

const metaLabelStyle: RunStyle = {
  fontKr: FONT_KR,
  size: 8.5,
  bold: true,
  color: COLOR_MUTE,
  letterSpacing: 8,
};

const metaValueStyle: RunStyle = {
  fontKr: FONT_KR,
  size: 10.5,
  color: COLOR_INK,
};

function para(
  text: string,
  runStyle: RunStyle,
  paraStyle?: ParaStyle,
): ParagraphNode {
  return {
    kind: "p",
    style: paraStyle,
    runs: text ? [txt(text, runStyle)] : [],
  };
}

function emptyPara(spaceAfter?: number): ParagraphNode {
  return { kind: "p", style: { spaceAfter }, runs: [] };
}

/**
 * 본문 텍스트의 단락 분리를 보존하면서, 한 단락 안에서는 줄바꿈을 공백으로 정리.
 * 한글 본문은 자동 줄바꿈에 맡기고 빈 줄(\n\n)로만 단락을 나눈다.
 */
function bodyToParagraphs(body: string): ParagraphNode[] {
  if (!body) return [emptyPara()];
  const blocks = body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map<ParagraphNode>((block) => {
    const flat = block.replace(/\s*\n\s*/g, " ").trim();
    return {
      kind: "p",
      style: {
        align: "JUSTIFY",
        indentFirst: pt(11),
        lineSpacingPct: 165,
        spaceAfter: pt(6),
      },
      runs: [txt(flat, bodyStyle)],
    };
  });
}

/**
 * 프로필 메타 카드: 이름 / 지원직무 / 지원기업 / 산업
 * 4 셀짜리 표로 구성.
 */
function metaTable(opts: {
  name: string;
  targetRole: string;
  company: string;
  industry: string;
}): TableNode {
  const contentWidth = A4_WIDTH - mm(28); // marginLR 14mm × 2
  const colCount = 4;
  const colWidth = Math.floor(contentWidth / colCount);
  const colWidthsHpu = Array.from({ length: colCount }, () => colWidth);
  const rowHeight = mm(14);

  const buildCell = (
    label: string,
    value: string,
    isLast: boolean,
  ): TableCellNode => ({
    widthHpu: colWidth,
    heightHpu: rowHeight,
    vAlign: "CENTER",
    margins: { left: mm(3), right: mm(3), top: mm(2), bottom: mm(2) },
    borders: {
      top: { type: "SOLID", widthMm: 0.4, color: COLOR_INK },
      bottom: { type: "SOLID", widthMm: 0.4, color: COLOR_INK },
      left: { type: "SOLID", widthMm: 0.2, color: COLOR_LINE },
      right: isLast
        ? { type: "SOLID", widthMm: 0.2, color: COLOR_LINE }
        : { type: "SOLID", widthMm: 0.2, color: COLOR_LINE },
    },
    blocks: [
      para(label, metaLabelStyle, { spaceAfter: pt(2) }),
      para(value || "—", metaValueStyle),
    ],
  });

  const row: TableRowNode = {
    heightHpu: rowHeight,
    cells: [
      buildCell("성명", opts.name, false),
      buildCell("지원 직무", opts.targetRole, false),
      buildCell("지원 기업", opts.company, false),
      buildCell("산업", opts.industry, true),
    ],
  };

  return {
    kind: "tbl",
    colWidthsHpu,
    rows: [row],
    borders: {
      top: { type: "SOLID", widthMm: 0.4, color: COLOR_INK },
      bottom: { type: "SOLID", widthMm: 0.4, color: COLOR_INK },
      left: { type: "SOLID", widthMm: 0.2, color: COLOR_LINE },
      right: { type: "SOLID", widthMm: 0.2, color: COLOR_LINE },
    },
    cellMargins: { left: mm(2), right: mm(2), top: mm(1), bottom: mm(1) },
  };
}

export type CoverLetterSection = {
  num: string; // "01"
  label: string; // "성장과정"
  target: string; // "500자 내외"
  title: string; // 한줄 소제목
  body: string;
};

export type CoverLetterInput = {
  studentName: string;
  targetRole: string;
  company: string;
  industry: string;
  sections: CoverLetterSection[];
};

export function buildCoverLetterDocument(
  input: CoverLetterInput,
): HwpxDocument {
  const blocks: BlockNode[] = [];

  // ── 1. 헤더 (제목 + 부제) ─────────────────────
  blocks.push(
    para("자 기 소 개 서", titleStyle, {
      align: "CENTER",
      spaceBefore: pt(4),
      spaceAfter: pt(4),
    }),
  );
  blocks.push(
    para(
      "강의 공식·STAR·NCS 직무역량 기반 초안 · AI Cover Letter Lecture",
      subtitleStyle,
      { align: "CENTER", spaceAfter: pt(12) },
    ),
  );

  // ── 2. 프로필 메타 표 ───────────────────────────
  blocks.push(
    metaTable({
      name: input.studentName,
      targetRole: input.targetRole,
      company: input.company,
      industry: input.industry,
    }),
  );
  blocks.push(emptyPara(pt(16)));

  // ── 3. 각 항목 ─────────────────────────────────
  input.sections.forEach((sec, idx) => {
    if (idx > 0) {
      blocks.push(emptyPara(pt(10)));
    }

    // 03.A — 라벨 줄 ("01 · 500자 내외")
    blocks.push(
      para(
        `${sec.num} · ${sec.target}`,
        sectionLabelStyle,
        { spaceAfter: pt(2) },
      ),
    );

    // 03.B — 항목명 ("성장과정")
    blocks.push(
      para(sec.label, sectionTitleStyle, { spaceAfter: pt(4) }),
    );

    // 03.C — 한줄 소제목 (있는 경우)
    if (sec.title) {
      blocks.push(
        para(`[ ${sec.title} ]`, {
          fontKr: FONT_KR_TITLE,
          size: 12,
          bold: true,
          color: COLOR_INK,
        }, { spaceAfter: pt(6) }),
      );
    }

    // 03.D — 본문 (단락별)
    blocks.push(...bodyToParagraphs(sec.body));
  });

  const section: SectionSpec = {
    pageWidthHpu: A4_WIDTH,
    pageHeightHpu: A4_HEIGHT,
    marginLeft: mm(14),
    marginRight: mm(14),
    marginTop: mm(15),
    marginBottom: mm(15),
    marginHeader: mm(8),
    marginFooter: mm(8),
    columns: 1,
    columnGapHpu: 0,
    blocks,
  };

  return {
    title: `${input.studentName || "학생"} 자기소개서`,
    sections: [section],
  };
}
