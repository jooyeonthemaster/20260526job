import { NextResponse } from "next/server";
import {
  sectionLabels,
  sectionOrder,
  sectionTargets,
} from "@/lib/lecture-data";
import type { StudioPayload } from "@/lib/types";
import {
  buildCoverLetterDocument,
  type CoverLetterSection,
} from "./_lib/cover-letter-renderer";
import { packageHwpx } from "./_lib/package";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as StudioPayload;

    const sections: CoverLetterSection[] = sectionOrder.map((key, i) => {
      const draft = payload.sections[key];
      return {
        num: String(i + 1).padStart(2, "0"),
        label: sectionLabels[key],
        target: sectionTargets[key],
        title: draft?.title || "",
        body: draft?.body || "",
      };
    });

    const doc = buildCoverLetterDocument({
      studentName: payload.profile.name || "학생",
      targetRole: payload.profile.targetRole || "",
      company: payload.profile.company || "",
      industry: payload.profile.industry || "",
      sections,
    });

    const buffer = await packageHwpx(doc);

    const studentName = payload.profile.name || "학생";
    const filename = encodeURIComponent(`${studentName}_AI자기소개서.hwpx`);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.hancom.hwpx",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("HWPX export error:", error);
    return NextResponse.json(
      {
        error: "HWPX 생성 중 오류가 발생했습니다.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
