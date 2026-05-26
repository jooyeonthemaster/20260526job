import { emptySections, sectionOrder } from "@/lib/lecture-data";
import type {
  DraftSections,
  QualityReport,
  SectionKey,
} from "@/lib/types";

export function splitTags(value: string) {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function countKoreanChars(value: string) {
  return value.replace(/\s/g, "").length;
}

export function mergeSections(
  current: DraftSections,
  incoming: Partial<DraftSections>,
) {
  return sectionOrder.reduce<DraftSections>(
    (acc, key) => ({
      ...acc,
      [key]: incoming[key] ? { ...acc[key], ...incoming[key] } : acc[key],
    }),
    { ...current },
  );
}

/**
 * Parses streaming output from /api/gemini-stream into partial sections.
 * Output format from API:
 *   ## SECTION growth
 *   TITLE: [...]
 *   BODY:
 *   ...
 *   KEYWORDS: ...
 *   CHECKLIST:
 *   - ...
 *
 *   ## QUALITY
 *   HEADLINE: ...
 *   SCORE: 87
 *   WARNINGS:
 *   - ...
 *   MISSING:
 *   - ...
 */
export function parseDraftStream(text: string): {
  sections: DraftSections;
  qualityReport: QualityReport | null;
} {
  if (!text) {
    return { sections: emptySections, qualityReport: null };
  }

  const sectionRegex =
    /##\s+SECTION\s+(growth|personality|motivation|competency|ambition)\s*\n?/gi;
  const qualityRegex = /##\s+QUALITY\s*\n?/i;

  const matches: { key: SectionKey; head: number; body: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = sectionRegex.exec(text)) !== null) {
    matches.push({
      key: m[1] as SectionKey,
      head: m.index,
      body: m.index + m[0].length,
    });
  }

  const qm = qualityRegex.exec(text);
  const qualityHead = qm ? qm.index : -1;
  const qualityBody = qm ? qm.index + qm[0].length : -1;

  const next: DraftSections = {
    growth: { ...emptySections.growth },
    personality: { ...emptySections.personality },
    motivation: { ...emptySections.motivation },
    competency: { ...emptySections.competency },
    ambition: { ...emptySections.ambition },
  };

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].body;
    const endCandidates = [
      i + 1 < matches.length ? matches[i + 1].head : Number.POSITIVE_INFINITY,
      qualityHead >= 0 ? qualityHead : Number.POSITIVE_INFINITY,
      text.length,
    ];
    const end = Math.min(...endCandidates);
    const block = text.slice(start, end);

    const titleMatch = /TITLE:\s*\[?\s*([^\n\]]*)\]?\s*(\n|$)/i.exec(block);
    const bodyStart = block.search(/^\s*BODY:\s*\n?/im);
    const keywordsStart = block.search(/^\s*KEYWORDS:\s*/im);
    const checklistStart = block.search(/^\s*CHECKLIST:\s*/im);

    const title = titleMatch ? titleMatch[1].trim() : "";

    let body = "";
    if (bodyStart >= 0) {
      const bodyHeader = /BODY:\s*\n?/i.exec(block.slice(bodyStart));
      const bodyContentStart = bodyHeader
        ? bodyStart + bodyHeader.index + bodyHeader[0].length
        : bodyStart;
      const bodyEndCandidates = [
        keywordsStart >= 0 ? keywordsStart : Number.POSITIVE_INFINITY,
        checklistStart >= 0 ? checklistStart : Number.POSITIVE_INFINITY,
        block.length,
      ];
      const bodyEnd = Math.min(...bodyEndCandidates);
      body = block
        .slice(bodyContentStart, bodyEnd)
        .replace(/^\s*\n/, "")
        .replace(/\s*##.*$/s, "")
        .trim();
    }

    let keywords: string[] = [];
    if (keywordsStart >= 0) {
      const kwHeader = /KEYWORDS:\s*/i.exec(block.slice(keywordsStart));
      const kwContentStart = kwHeader
        ? keywordsStart + kwHeader.index + kwHeader[0].length
        : keywordsStart;
      const kwEnd =
        checklistStart >= 0 && checklistStart > keywordsStart
          ? checklistStart
          : block.length;
      const raw = block.slice(kwContentStart, kwEnd);
      keywords = raw
        .split(/[,\n]/)
        .map((s) => s.replace(/^[-*]\s*/, "").trim())
        .filter((s) => s.length > 0 && !/^##/.test(s));
    }

    let checklist: string[] = [];
    if (checklistStart >= 0) {
      const clHeader = /CHECKLIST:\s*\n?/i.exec(block.slice(checklistStart));
      const clContentStart = clHeader
        ? checklistStart + clHeader.index + clHeader[0].length
        : checklistStart;
      const raw = block.slice(clContentStart);
      checklist = raw
        .split(/\n/)
        .map((line) => line.replace(/^[-*•\u00b7]\s*/, "").trim())
        .filter((line) => line.length > 0 && !/^##/.test(line));
    }

    next[matches[i].key] = { title, body, keywords, checklist };
  }

  let qualityReport: QualityReport | null = null;
  if (qm) {
    const qblock = text.slice(qualityBody);
    const headline =
      /HEADLINE:\s*([^\n]+)/i.exec(qblock)?.[1].trim() || "";
    const scoreText = /SCORE:\s*(\d+)/i.exec(qblock)?.[1];
    const score = scoreText ? Number(scoreText) : 0;

    const warningsHead = qblock.search(/^\s*WARNINGS:/im);
    const missingHead = qblock.search(/^\s*MISSING:/im);

    const styleWarnings: string[] =
      warningsHead >= 0
        ? qblock
            .slice(warningsHead, missingHead >= 0 ? missingHead : qblock.length)
            .split(/\n/)
            .map((l) => l.replace(/^\s*WARNINGS:\s*/i, "").replace(/^[-*]\s*/, "").trim())
            .filter((l) => l.length > 0 && !/^##/.test(l))
        : [];

    const missingQuestions: string[] =
      missingHead >= 0
        ? qblock
            .slice(missingHead)
            .split(/\n/)
            .map((l) => l.replace(/^\s*MISSING:\s*/i, "").replace(/^[-*]\s*/, "").trim())
            .filter((l) => l.length > 0 && !/^##/.test(l))
        : [];

    qualityReport = {
      headline,
      score,
      styleWarnings,
      missingQuestions,
      strengthMapping: [],
    };
  }

  return { sections: next, qualityReport };
}

export function highlightHeadword(line: string) {
  const segments = line.split(/^(現|前|·)/);
  if (segments.length > 1) {
    return (
      <>
        <strong>{segments[1]}</strong>
        {segments[2]}
      </>
    );
  }
  return line;
}
