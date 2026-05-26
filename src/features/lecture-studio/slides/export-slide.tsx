import { Download, Rocket, Send, Sparkles } from "lucide-react";
import { sectionAccent, sectionLabels, sectionOrder, sectionTargets } from "@/lib/lecture-data";
import type {
  DraftSections,
  QualityReport,
  SectionKey,
  StudentProfile,
} from "@/lib/types";
import type { BusyState, GeminiCaller } from "../types";

export function ExportSlide({
  profile,
  sections,
  qualityReport,
  busy,
  downloadDocx,
  callGemini,
}: {
  profile: StudentProfile;
  sections: DraftSections;
  qualityReport: QualityReport | null;
  busy: BusyState;
  downloadDocx: () => Promise<void>;
  callGemini: (mode: "draft" | "polish", sectionKey?: SectionKey) => Promise<void>;
}) {
  const filled = sectionOrder.filter((key) => sections[key].body).length;

  return (
    <div className="export-layout">
      <div className="final-doc">
        <h2>자기소개서</h2>
        <p className="subject">
          [지원분야 : {profile.targetRole || "지원분야"} /{" "}
          {profile.careerType || "신입"}]
        </p>
        {sectionOrder.map((key) => {
          const sec = sections[key];
          return (
            <div
              key={key}
              className={`paper-section ${sec.body ? "" : "empty"}`}
              style={{ ["--accent" as string]: sectionAccent[key] }}
            >
              <div className="head">
                <strong>{sectionLabels[key]}</strong>
                <span className="target">{sectionTargets[key]}</span>
              </div>
              {sec.title && <div className="title">[ {sec.title} ]</div>}
              <div className="body">
                {sec.body
                  ? sec.body.slice(0, 220) + (sec.body.length > 220 ? "…" : "")
                  : "AI 생성 또는 직접 작성한 내용이 여기에 미리 보입니다."}
              </div>
            </div>
          );
        })}
      </div>

      <div className="export-panel">
        <div className="export-ready">
          <div className="pad">
            <Rocket size={20} />
          </div>
          <div>
            <strong>제출 파일 구성</strong>
            <p>{filled} / 5 항목 작성 완료 · DOCX로 즉시 내려받기</p>
          </div>
        </div>

        {qualityReport && (
          <div className="export-quality">
            <h4>{qualityReport.headline}</h4>
            {qualityReport.missingQuestions
              .slice(0, 3)
              .map((q) => (
                <div className="question" key={q}>
                  {q}
                </div>
              ))}
          </div>
        )}

        <div className="export-actions command-row light">
          <button
            className="primary-command"
            onClick={downloadDocx}
            disabled={Boolean(busy)}
          >
            <Download size={15} />
            <span>{busy === "docx" ? "문서 생성 중…" : "DOCX 다운로드"}</span>
          </button>
          <button
            className="ghost-command"
            onClick={() => callGemini("polish")}
            disabled={Boolean(busy)}
          >
            <Sparkles size={15} />
            <span>최종 문장 검수</span>
          </button>
        </div>

        <div className="glass-card tinted" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Send size={14} color="var(--indigo)" />
            <strong style={{ fontSize: 12, color: "var(--indigo)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              제출 직전 점검
            </strong>
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 12, color: "var(--slate)", lineHeight: 1.6 }}>
            <li>붉은색 안내 글이 본문에 남아있지 않은지</li>
            <li>들여쓰기 두 칸, 동일 수준 앞줄 정렬</li>
            <li>접속어 / 피동형 / 번역투 정리 여부</li>
            <li>지원기업·직무 키워드가 자연스럽게 등장하는지</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
