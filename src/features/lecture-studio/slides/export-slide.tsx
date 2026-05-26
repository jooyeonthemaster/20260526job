import {
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import {
  sectionLabels,
  sectionOrder,
  sectionTargets,
} from "@/lib/lecture-data";
import type {
  DraftSections,
  QualityReport,
  SectionKey,
  StudentProfile,
} from "@/lib/types";
import type { BusyState } from "../types";
import { countKoreanChars } from "../utils";

const targetCharCounts: Record<SectionKey, number> = {
  growth: 500,
  personality: 500,
  motivation: 500,
  competency: 1000,
  ambition: 500,
};

const submissionChecks = [
  "붉은색 안내 글이 본문에 남아 있지 않은지",
  "들여쓰기 두 칸 · 동일 수준 앞줄 정렬",
  "접속어 / 피동형 / 번역투가 정리되었는지",
  "지원기업·직무 키워드가 자연스럽게 등장하는지",
  "[수치 확인 필요] 마커가 실제 숫자로 교체되었는지",
];

export function ExportSlide({
  profile,
  sections,
  qualityReport,
  busy,
  downloadDocx,
  downloadHwpx,
  callGemini,
}: {
  profile: StudentProfile;
  sections: DraftSections;
  qualityReport: QualityReport | null;
  busy: BusyState;
  downloadDocx: () => Promise<void>;
  downloadHwpx: () => Promise<void>;
  callGemini: (mode: "draft" | "polish", sectionKey?: SectionKey) => Promise<void>;
}) {
  const filled = sectionOrder.filter((key) => sections[key].body).length;
  const allFilled = filled === sectionOrder.length;
  const totalChars = sectionOrder.reduce(
    (sum, key) => sum + countKoreanChars(sections[key].body),
    0,
  );
  const totalTarget = sectionOrder.reduce(
    (sum, key) => sum + targetCharCounts[key],
    0,
  );

  const docxBusy = busy === "docx";
  const hwpxBusy = busy === "hwpx";
  const polishBusy = busy === "polish";

  return (
    <div className="xform">
      {/* LEFT — paper preview */}
      <section className="xform__paper">
        <header className="xform__paper-head">
          <span className="xform__paper-eyebrow">FINAL DRAFT</span>
          <h2 className="xform__paper-title">자 기 소 개 서</h2>
          <p className="xform__paper-sub">
            [지원분야 :{" "}
            <strong>{profile.targetRole || "지원분야"}</strong> ·{" "}
            <strong>{profile.careerType || "신입"}</strong>
            {profile.company ? (
              <>
                {" "}
                · <strong>{profile.company}</strong>
              </>
            ) : null}
            ]
          </p>
        </header>

        <div className="xform__paper-body">
          {sectionOrder.map((key, i) => {
            const sec = sections[key];
            const target = targetCharCounts[key];
            const c = countKoreanChars(sec.body);
            const inRange = c >= target * 0.9 && c <= target * 1.1;
            return (
              <article
                key={key}
                className={`xpaper__sec${
                  sec.body ? "" : " xpaper__sec--empty"
                }`}
              >
                <header className="xpaper__sec-head">
                  <span className="xpaper__sec-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <strong className="xpaper__sec-label">
                    {sectionLabels[key]}
                  </strong>
                  <span className="xpaper__sec-target">
                    {sectionTargets[key]}
                  </span>
                  {sec.body && (
                    <span
                      className={`xpaper__sec-count${
                        inRange
                          ? " is-ok"
                          : c > target * 1.1
                            ? " is-over"
                            : " is-under"
                      }`}
                    >
                      {c}자
                    </span>
                  )}
                </header>
                {sec.title && (
                  <div className="xpaper__sec-title">[ {sec.title} ]</div>
                )}
                <p className="xpaper__sec-body">
                  {sec.body
                    ? sec.body
                    : "AI 생성 또는 직접 작성한 내용이 여기에 미리 보입니다."}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* RIGHT — export actions */}
      <aside className="xform__panel">
        {/* status hero */}
        <section
          className={`xform__hero${allFilled ? " is-ready" : ""}`}
        >
          <div className="xform__hero-top">
            <span className="xform__hero-eyebrow">
              {allFilled ? "READY TO SUBMIT" : "IN PROGRESS"}
            </span>
            <span className="xform__hero-progress">
              {filled} <em>/ 5</em>
            </span>
          </div>
          <h3 className="xform__hero-title">
            {allFilled
              ? "5개 항목이 모두 작성되었습니다"
              : `${5 - filled}개 항목이 더 필요합니다`}
          </h3>
          <p className="xform__hero-sub">
            총 {totalChars.toLocaleString()}자 · 목표{" "}
            {totalTarget.toLocaleString()}자
          </p>
          <div className="xform__hero-bar" aria-hidden>
            <span
              style={{
                width: `${Math.min(100, (totalChars / totalTarget) * 100)}%`,
              }}
            />
          </div>
        </section>

        {/* download actions */}
        <section className="xform__downloads">
          <header className="xform__panel-head">
            <span className="xform__panel-num">01</span>
            <h4 className="xform__panel-title">파일 다운로드</h4>
            <span className="xform__panel-meta">2 포맷</span>
          </header>

          <button
            className={`xform__cta xform__cta--primary${
              hwpxBusy ? " is-busy" : ""
            }`}
            type="button"
            onClick={downloadHwpx}
            disabled={Boolean(busy)}
          >
            <span className="xform__cta-icon">
              {hwpxBusy ? (
                <Loader2 size={16} className="xform__spin" strokeWidth={2.2} />
              ) : (
                <Download size={16} strokeWidth={2.2} />
              )}
            </span>
            <div className="xform__cta-body">
              <strong>HWPX 다운로드</strong>
              <span>한컴오피스(.hwpx) · 학원·기관 제출용</span>
            </div>
            <span className="xform__cta-tag">한글</span>
          </button>

          <button
            className={`xform__cta${docxBusy ? " is-busy" : ""}`}
            type="button"
            onClick={downloadDocx}
            disabled={Boolean(busy)}
          >
            <span className="xform__cta-icon">
              {docxBusy ? (
                <Loader2 size={16} className="xform__spin" strokeWidth={2.2} />
              ) : (
                <FileText size={16} strokeWidth={2.2} />
              )}
            </span>
            <div className="xform__cta-body">
              <strong>DOCX 다운로드</strong>
              <span>MS Word(.docx) · 일반 기업 제출용</span>
            </div>
            <span className="xform__cta-tag xform__cta-tag--muted">
              Word
            </span>
          </button>

          <button
            className="xform__ghost"
            type="button"
            onClick={() => callGemini("polish")}
            disabled={Boolean(busy)}
          >
            {polishBusy ? (
              <Loader2 size={12} className="xform__spin" strokeWidth={2.2} />
            ) : (
              <Sparkles size={12} strokeWidth={2.2} />
            )}
            <span>{polishBusy ? "검수 중" : "최종 문장 검수"}</span>
          </button>
        </section>

        {/* AI quality */}
        {qualityReport && qualityReport.headline && (
          <section className="xform__quality">
            <header className="xform__panel-head">
              <span className="xform__panel-num">02</span>
              <h4 className="xform__panel-title">AI 총평</h4>
              {qualityReport.score > 0 && (
                <span className="xform__quality-score">
                  {qualityReport.score}
                  <em>/100</em>
                </span>
              )}
            </header>
            <p className="xform__quality-headline">
              {qualityReport.headline}
            </p>
            {qualityReport.missingQuestions.length > 0 && (
              <div className="xform__quality-questions">
                <span className="xform__quality-tag">학생에게 물을 것</span>
                <ul>
                  {qualityReport.missingQuestions
                    .slice(0, 3)
                    .map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* submission checklist */}
        <section className="xform__checks">
          <header className="xform__panel-head">
            <span className="xform__panel-num">
              {qualityReport && qualityReport.headline ? "03" : "02"}
            </span>
            <h4 className="xform__panel-title">제출 직전 점검</h4>
            <Send size={11} className="xform__panel-icon" strokeWidth={2.2} />
          </header>
          <ul>
            {submissionChecks.map((item, i) => (
              <li key={item}>
                <CheckCircle2
                  size={12}
                  strokeWidth={2.2}
                  className="xform__check-icon"
                />
                <span>
                  <em className="xform__check-num">
                    {String(i + 1).padStart(2, "0")}
                  </em>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
