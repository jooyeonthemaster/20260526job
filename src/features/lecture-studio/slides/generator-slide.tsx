import { CheckCircle2, Loader2, RefreshCcw, Sparkles, Wand2 } from "lucide-react";
import { sectionLabels, sectionOrder } from "@/lib/lecture-data";
import type {
  QualityReport,
  SectionKey,
  StoryInput,
  StudentProfile,
} from "@/lib/types";
import { categoryNotes } from "../content";
import type { BusyState } from "../types";

export function GeneratorSlide({
  busy,
  callGemini,
  callGeminiStream,
  resetDrafts,
  qualityReport,
  profile,
  stories,
  strengths,
}: {
  busy: BusyState;
  callGemini: (mode: "draft" | "polish", sectionKey?: SectionKey) => Promise<void>;
  callGeminiStream: () => Promise<void>;
  resetDrafts: () => void;
  qualityReport: QualityReport | null;
  profile: StudentProfile;
  stories: StoryInput[];
  strengths: string[];
}) {
  const usableStories = stories.filter((s) => s.situation && s.action);
  const checks = [
    { label: "지원 직무 입력", done: Boolean(profile.targetRole) },
    { label: "교육 / 훈련 입력", done: Boolean(profile.training) },
    {
      label: "STAR 경험 2개 이상",
      done: usableStories.length >= 2,
    },
    { label: "강점 키워드 3개 이상", done: strengths.length >= 3 },
    { label: "가치관 입력", done: Boolean(profile.value) },
  ];
  const completed = checks.filter((c) => c.done).length;
  const readyForDraft = completed >= 4;
  const polishBusy = busy === "polish";

  return (
    <div className="genform">
      <section className="genform__stage">
        <div className="genform__copy">
          <span className="genform__eyebrow">AI STUDIO · DRAFT 0</span>
          <h3 className="genform__title">
            앞에서 입력한 프로필 · 경험 · 키워드로
            <br />5개 항목 자소서 초안을 한 번에 완성합니다.
          </h3>
          <p className="genform__sub">
            슬라이드 05 프로필 (사실) · 06 스토리 (STAR) · 07 키워드와 톤을
            결합해 강의 공식에 맞춘 초안을 작성합니다. 항목별 재생성과 문장
            검수는 별도로 호출 가능합니다.
          </p>

          <div className="genform__actions">
            <button
              className="genform__cta"
              type="button"
              onClick={() => callGeminiStream()}
              disabled={Boolean(busy)}
            >
              <Wand2 size={15} strokeWidth={2.2} />
              <span>자소서 초안 생성하기</span>
            </button>
            <button
              className="genform__ghost"
              type="button"
              onClick={() => callGemini("polish")}
              disabled={Boolean(busy)}
            >
              {polishBusy ? (
                <Loader2 size={13} className="genform__spin" strokeWidth={2.2} />
              ) : (
                <Sparkles size={13} strokeWidth={2.2} />
              )}
              <span>{polishBusy ? "검수 중" : "전체 문장 검수"}</span>
            </button>
            <button
              className="genform__ghost"
              type="button"
              onClick={resetDrafts}
              disabled={Boolean(busy)}
            >
              <RefreshCcw size={13} strokeWidth={2.2} />
              <span>초기화</span>
            </button>
          </div>

          {!readyForDraft && (
            <p className="genform__warn">
              체크리스트가 4개 이상 충족되면 초안 품질이 안정적으로 나옵니다.
              현재 <strong>{completed} / 5</strong>.
            </p>
          )}
        </div>
      </section>

      <aside className="genform__panel">
        <header className="genform__panel-head">
          <span className="genform__panel-num">01</span>
          <h4 className="genform__panel-title">생성 전 입력 요약</h4>
        </header>
        <div className="genform__summary">
          <div className="genform__sumcell">
            <span>지원 직무</span>
            <strong>{profile.targetRole || "미입력"}</strong>
          </div>
          <div className="genform__sumcell">
            <span>지원 기업</span>
            <strong>{profile.company || "미입력"}</strong>
          </div>
          <div className="genform__sumcell">
            <span>대표 경험</span>
            <strong>{usableStories.length}개</strong>
          </div>
          <div className="genform__sumcell">
            <span>강점 키워드</span>
            <strong>
              {strengths.slice(0, 3).join(", ") || "미입력"}
            </strong>
          </div>
        </div>

        <header className="genform__panel-head">
          <span className="genform__panel-num">02</span>
          <h4 className="genform__panel-title">생성될 5개 항목</h4>
        </header>
        {qualityReport ? (
          <div className="genform__quality">
            <strong>{qualityReport.headline}</strong>
            <p>품질 점수 {qualityReport.score}점 / 100</p>
            {qualityReport.styleWarnings.length > 0 && (
              <div className="genform__chips">
                {qualityReport.styleWarnings.slice(0, 4).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="genform__sections">
            {sectionOrder.map((key, i) => (
              <div className="genform__sec" key={key}>
                <span className="genform__sec-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="genform__sec-body">
                  <strong>{sectionLabels[key]}</strong>
                  <span>{categoryNotes[key].purpose}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <header className="genform__panel-head">
          <span className="genform__panel-num">03</span>
          <h4 className="genform__panel-title">생성 전 체크리스트</h4>
          <span className="genform__panel-meta">
            {completed} / {checks.length}
          </span>
        </header>
        <ul className="genform__checks">
          {checks.map((c) => (
            <li
              className={`genform__check${c.done ? " is-done" : ""}`}
              key={c.label}
            >
              <span className="genform__check-dot" aria-hidden />
              <span className="genform__check-label">{c.label}</span>
              {c.done && (
                <CheckCircle2
                  size={13}
                  className="genform__check-icon"
                  strokeWidth={2.2}
                />
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
