import { Loader2, Wand2 } from "lucide-react";
import {
  sectionGuides,
  sectionLabels,
  sectionOrder,
  sectionTargets,
} from "@/lib/lecture-data";
import type {
  DraftSections,
  QualityReport,
  SectionKey,
} from "@/lib/types";
import { reviewExamples } from "../content";
import type { BusyState } from "../types";
import { countKoreanChars } from "../utils";

// Target char counts pulled from sectionTargets (e.g. "500자 내외" → 500)
const targetCharCounts: Record<SectionKey, number> = {
  growth: 500,
  personality: 500,
  motivation: 500,
  competency: 1000,
  ambition: 500,
};

export function ReviewSlide({
  activeSection,
  setActiveSection,
  sections,
  updateSection,
  callGemini,
  busy,
  streaming,
  qualityReport,
}: {
  activeSection: SectionKey;
  setActiveSection: (k: SectionKey) => void;
  sections: DraftSections;
  updateSection: (k: SectionKey, f: "title" | "body", v: string) => void;
  callGemini: (mode: "draft" | "polish", sectionKey?: SectionKey) => Promise<void>;
  busy: BusyState;
  streaming?: boolean;
  qualityReport?: QualityReport | null;
}) {
  const section = sections[activeSection];
  const count = countKoreanChars(section.body);
  const target = targetCharCounts[activeSection];
  const ratio = Math.min(1, count / target);
  const inRange = count >= target * 0.9 && count <= target * 1.1;
  const guide = sectionGuides[activeSection];
  const checklist = section.checklist?.length
    ? section.checklist
    : guide.formula;
  const isSectionStreaming = streaming && !section.body;
  const sectionBusy = busy === activeSection;

  return (
    <div className="rform">
      {/* LEFT — tabs rail */}
      <aside className="rform__tabs" role="tablist">
        <header className="rform__tabs-head">
          <span className="rform__tabs-num">08</span>
          <h4 className="rform__tabs-title">자소서 항목</h4>
          <span
            className={`rform__tabs-status${
              streaming ? " is-on" : ""
            }`}
          >
            {streaming ? "AI 실시간 작성" : "초안 완료"}
          </span>
        </header>
        {sectionOrder.map((key, i) => {
          const c = countKoreanChars(sections[key].body);
          const t = targetCharCounts[key];
          const r = Math.min(1, c / t);
          const ok = c >= t * 0.9 && c <= t * 1.1;
          const isActive = activeSection === key;
          const isStreaming = streaming && !sections[key].body;
          return (
            <button
              key={key}
              className={`rform__tab${isActive ? " is-active" : ""}`}
              onClick={() => setActiveSection(key)}
              type="button"
              role="tab"
              aria-selected={isActive}
            >
              <div className="rform__tab-row">
                <span className="rform__tab-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rform__tab-label">{sectionLabels[key]}</span>
                <span
                  className={`rform__tab-count${
                    !c
                      ? " is-empty"
                      : ok
                        ? " is-ok"
                        : c > t * 1.1
                          ? " is-over"
                          : " is-under"
                  }`}
                >
                  {c ? `${c}자` : isStreaming ? "작성 중" : "작성 전"}
                </span>
              </div>
              <div className="rform__tab-bar">
                <span
                  style={{
                    width: `${r * 100}%`,
                    background: ok
                      ? "#16a34a"
                      : c > t * 1.1
                        ? "#dc2626"
                        : "#0a0a12",
                  }}
                />
              </div>
            </button>
          );
        })}
      </aside>

      {/* CENTER — editor */}
      <section className="rform__editor">
        <header className="rform__editor-head">
          <div className="rform__editor-meta">
            <span className="rform__editor-target">
              {sectionTargets[activeSection]}
            </span>
            <h3 className="rform__editor-title">
              {sectionLabels[activeSection]}
            </h3>
          </div>
          <div className="rform__editor-actions">
            {isSectionStreaming && (
              <span className="rform__streaming-pill">
                <Loader2
                  size={12}
                  className="rform__spin"
                  strokeWidth={2.2}
                />
                AI 작성 중
              </span>
            )}
            <button
              className="rform__rewrite"
              onClick={() => callGemini("draft", activeSection)}
              disabled={Boolean(busy) || streaming}
              type="button"
            >
              {sectionBusy ? (
                <Loader2
                  size={12}
                  className="rform__spin"
                  strokeWidth={2.2}
                />
              ) : (
                <Wand2 size={12} strokeWidth={2.2} />
              )}
              <span>{sectionBusy ? "재작성 중" : "이 섹션 재작성"}</span>
            </button>
          </div>
        </header>

        <div className="rform__field">
          <label className="rform__label" htmlFor="rform-title">
            한줄 소제목
          </label>
          <input
            id="rform-title"
            className="rform__title-input"
            value={section.title}
            onChange={(e) =>
              updateSection(activeSection, "title", e.target.value)
            }
            placeholder="예) 완성을 향한 책임감의 가치"
            spellCheck={false}
          />
        </div>

        <div className="rform__field rform__field--body">
          <label className="rform__label">본문</label>
          <div className="rform__body-stage">
            <HighlightedBody body={section.body} />
            <textarea
              className="rform__body-input"
              value={section.body}
              onChange={(e) =>
                updateSection(activeSection, "body", e.target.value)
              }
              placeholder={
                isSectionStreaming
                  ? "AI가 작성을 시작합니다…"
                  : reviewExamples[activeSection].improved
              }
              spellCheck={false}
            />
            {isSectionStreaming && (
              <div className="rform__body-skeleton" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </div>
            )}
          </div>
          <div className="rform__counter">
            <div className="rform__counter-gauge">
              <span
                style={{
                  width: `${Math.min(120, ratio * 100)}%`,
                  background: inRange
                    ? "#16a34a"
                    : count > target * 1.1
                      ? "#dc2626"
                      : "#0a0a12",
                }}
              />
            </div>
            <div className="rform__counter-text">
              <strong
                className={
                  inRange
                    ? "is-ok"
                    : count > target * 1.1
                      ? "is-over"
                      : "is-under"
                }
              >
                {count}자
              </strong>
              <span>
                / {target}자 · ±10% 권장
              </span>
            </div>
            {(section.keywords || []).slice(0, 6).length > 0 && (
              <div className="rform__counter-tags">
                {(section.keywords || []).slice(0, 6).map((kw) => (
                  <span key={kw}>#{kw}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RIGHT — review panel */}
      <aside className="rform__panel">
        <header className="rform__panel-head">
          <span className="rform__panel-num">09</span>
          <h4 className="rform__panel-title">검수 포인트</h4>
        </header>

        <p className="rform__panel-intent">
          {section.rationale || guide.intent}
        </p>

        <div className="rform__example">
          <div className="rform__example-row">
            <span className="rform__example-label">문제 문장</span>
            <p>{reviewExamples[activeSection].issue}</p>
          </div>
          <div className="rform__example-row">
            <span className="rform__example-label">수정 방향</span>
            <p>{reviewExamples[activeSection].direction}</p>
          </div>
          <div className="rform__example-row rform__example-row--solution">
            <span className="rform__example-label">개선 문장</span>
            <strong>{reviewExamples[activeSection].improved}</strong>
          </div>
        </div>

        <div className="rform__checklist">
          <h5 className="rform__checklist-title">학생 검토 포인트</h5>
          <ol>
            {checklist.map((item, i) => (
              <li key={item}>
                <span className="rform__checklist-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {qualityReport &&
          (qualityReport.styleWarnings.length > 0 ||
            qualityReport.missingQuestions.length > 0) && (
            <div className="rform__quality">
              {qualityReport.headline && (
                <p className="rform__quality-headline">
                  {qualityReport.headline}
                </p>
              )}
              {qualityReport.styleWarnings.length > 0 && (
                <div className="rform__quality-block">
                  <span className="rform__quality-tag rform__quality-tag--warn">
                    문장 경고
                  </span>
                  <ul>
                    {qualityReport.styleWarnings.slice(0, 4).map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {qualityReport.missingQuestions.length > 0 && (
                <div className="rform__quality-block">
                  <span className="rform__quality-tag">학생에게 물을 것</span>
                  <ul>
                    {qualityReport.missingQuestions.slice(0, 3).map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
      </aside>
    </div>
  );
}

/**
 * Splits body text and renders `[수치 확인 필요]`, `[사실 확인 필요]`, and
 * `[한줄 소제목]` style markers as highlighted spans. Sits BEHIND the textarea
 * as a read-only preview layer so user can see highlights while editing.
 */
function HighlightedBody({ body }: { body: string }) {
  if (!body) return null;
  const segments: { text: string; flag: "none" | "fix" | "title" }[] = [];
  const regex = /\[(?:수치\s*확인\s*필요|사실\s*확인\s*필요|확인\s*필요)\]|\[[^\]]+\]/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(body)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ text: body.slice(lastIndex, m.index), flag: "none" });
    }
    const matched = m[0];
    const isFix = /확인\s*필요/.test(matched);
    segments.push({
      text: matched,
      flag: isFix ? "fix" : "title",
    });
    lastIndex = m.index + matched.length;
  }
  if (lastIndex < body.length) {
    segments.push({ text: body.slice(lastIndex), flag: "none" });
  }

  return (
    <div className="rform__body-overlay" aria-hidden>
      {segments.map((seg, i) =>
        seg.flag === "none" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <mark
            key={i}
            className={`rform__mark rform__mark--${seg.flag}`}
          >
            {seg.text}
          </mark>
        ),
      )}
    </div>
  );
}
