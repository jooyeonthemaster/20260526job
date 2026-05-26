"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Download,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  jobFitQuestions,
  summarizeJobFit,
  type JobFitAnswer,
  type JobFitReport,
} from "@/lib/job-fit";
import type { StudioPayload } from "@/lib/types";

type Phase = "question" | "report";

export function JobFitSlide({ payload }: { payload: StudioPayload }) {
  const [phase, setPhase] = useState<Phase>("question");
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<JobFitAnswer[]>([]);
  const [report, setReport] = useState<JobFitReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const total = jobFitQuestions.length;
  const question = jobFitQuestions[activeIndex];
  const summary = useMemo(
    () => summarizeJobFit(answers, payload),
    [answers, payload],
  );
  const answeredCount = answers.length;
  const progress = Math.round((answeredCount / total) * 100);
  const selectedChoiceId = answers.find(
    (answer) => answer.questionId === question.id,
  )?.choiceId;

  const choose = (choiceId: "a" | "b") => {
    setError("");
    setAnswers((prev) => {
      const exists = prev.some((answer) => answer.questionId === question.id);
      const next = exists
        ? prev.map((answer) =>
            answer.questionId === question.id
              ? { ...answer, choiceId }
              : answer,
          )
        : [...prev, { questionId: question.id, choiceId }];
      return next;
    });

    if (activeIndex < total - 1) {
      window.setTimeout(() => setActiveIndex((index) => index + 1), 160);
    } else {
      window.setTimeout(() => setPhase("report"), 160);
    }
  };

  const generateReport = useCallback(async () => {
    if (answers.length < total) return;
    setReport(null);
    setLoading(true);
    setError("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 78000);

    try {
      const response = await fetch("/api/job-fit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, answers, summary }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail || data?.error || "직무 분석 실패");
      }
      setReport(data as JobFitReport);
    } catch (e) {
      setError(
        (e as { name?: string })?.name === "AbortError"
          ? "AI 분석 응답 시간이 초과되었습니다. 질문 응답과 자소서 데이터는 유지되어 있으니 다시 분석을 실행해주세요."
          : e instanceof Error
            ? e.message
            : "AI 분석 호출에 실패했습니다.",
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [answers, payload, summary, total]);

  useEffect(() => {
    if (phase !== "report") return;
    if (answers.length !== total) return;
    if (report || loading || error) return;
    void generateReport();
  }, [answers.length, error, generateReport, loading, phase, report, total]);

  const previous = () => {
    setPhase("question");
    setActiveIndex((index) => Math.max(0, index - 1));
  };

  const next = () => {
    if (!selectedChoiceId) return;
    if (activeIndex >= total - 1) {
      setPhase("report");
      return;
    }
    setActiveIndex((index) => Math.min(total - 1, index + 1));
  };

  const reset = () => {
    setPhase("question");
    setActiveIndex(0);
    setAnswers([]);
    setReport(null);
    setLoading(false);
    setError("");
  };

  const downloadReport = async () => {
    if (!report) return;
    setDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/job-fit-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, answers, summary, report }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.detail || data?.error || "DOCX 생성 실패");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${payload.profile.name || "지원자"}_직무유형_진단리포트.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="job-fit">
      <section className="job-fit__main">
        {phase === "question" ? (
          <>
            <header className="job-fit__stage-head">
              <div>
                <span className="job-fit__eyebrow">AI JOB TYPE TEST</span>
                <h3>{question.prompt}</h3>
                <p>{question.insight}</p>
              </div>
              <div className="job-fit__question-meta">
                <span>{String(activeIndex + 1).padStart(2, "0")}</span>
                <em>/ {String(total).padStart(2, "0")}</em>
              </div>
            </header>

            <div className="job-fit__axis-row">
              <span>{question.axis}</span>
              <div className="job-fit__progress" aria-hidden>
                <i style={{ width: `${((activeIndex + 1) / total) * 100}%` }} />
              </div>
              <strong>{progress}% 응답</strong>
            </div>

            <div className="job-fit__choices">
              {question.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={`job-fit__choice${
                    selectedChoiceId === choice.id ? " is-selected" : ""
                  }`}
                  onClick={() => choose(choice.id)}
                >
                  <span className="job-fit__choice-image">
                    <Image
                      src={choice.image}
                      alt=""
                      width={820}
                      height={512}
                      sizes="(max-width: 1100px) 80vw, 32vw"
                    />
                  </span>
                  <span className="job-fit__choice-copy">
                    <span className="job-fit__choice-mark">
                      {choice.id.toUpperCase()}
                    </span>
                    <span className="job-fit__choice-eyebrow">
                      {choice.eyebrow}
                    </span>
                    <strong>{choice.title}</strong>
                    <span>{choice.body}</span>
                  </span>
                </button>
              ))}
            </div>

            <footer className="job-fit__nav">
              <button
                type="button"
                className="job-fit__icon-btn"
                onClick={previous}
                disabled={activeIndex === 0}
                title="이전 질문"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="job-fit__dots" aria-hidden>
                {jobFitQuestions.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${index === activeIndex ? "is-active" : ""}${
                      answers.some((answer) => answer.questionId === item.id)
                        ? " is-done"
                        : ""
                    }`}
                    onClick={() => setActiveIndex(index)}
                    tabIndex={-1}
                  />
                ))}
              </div>
              <button
                type="button"
                className="job-fit__icon-btn"
                onClick={next}
                disabled={!selectedChoiceId}
                title="다음 질문"
              >
                <ArrowRight size={16} />
              </button>
            </footer>
          </>
        ) : (
          <ReportView
            loading={loading}
            report={report}
            summary={summary}
            onBack={() => setPhase("question")}
            onDownload={downloadReport}
            onRegenerate={generateReport}
            downloading={downloading}
            error={error}
          />
        )}
      </section>

      {error && (
        <div className="job-fit__toast" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

function ReportView({
  loading,
  report,
  summary,
  onBack,
  onDownload,
  onRegenerate,
  downloading,
  error,
}: {
  loading: boolean;
  report: JobFitReport | null;
  summary: ReturnType<typeof summarizeJobFit>;
  onBack: () => void;
  onDownload: () => void;
  onRegenerate: () => void;
  downloading: boolean;
  error: string;
}) {
  if (!report) {
    return (
      <div className="job-fit__loading">
        {loading ? (
          <>
            <Loader2 size={28} className="job-fit__spin" />
            <h3>AI가 리포트를 분석 중입니다</h3>
            <p>
              자소서 5개 섹션과 14개 응답을 비교해 직무 적합도, 준비도,
              부족한 증거, 액션 플랜 시각화 데이터를 생성하고 있습니다.
            </p>
          </>
        ) : (
          <>
            <BrainCircuit size={30} />
            <h3>AI 분석을 완료하지 못했습니다</h3>
            <p>{error || "잠시 후 다시 분석을 실행해주세요."}</p>
            <div className="job-fit__loading-actions">
              <button type="button" className="job-fit__icon-btn" onClick={onBack}>
                <ArrowLeft size={16} />
                <span>응답 수정</span>
              </button>
              <button
                type="button"
                className="job-fit__icon-btn job-fit__icon-btn--solid"
                onClick={onRegenerate}
              >
                <Sparkles size={15} />
                <span>AI 재분석</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="job-fit-report">
      <header className="job-fit-report__hero">
        <div>
          <span className="job-fit__eyebrow">ANALYSIS REPORT</span>
          <h3>{report.primaryRole}</h3>
          <p>{report.headline}</p>
        </div>
        <div className="job-fit-report__badge">
          <Target size={20} />
          <span>{report.readiness.overall}</span>
          <em>{report.readiness.label}</em>
        </div>
      </header>
      {loading && (
        <div className="job-fit-report__refining" role="status">
          <Loader2 size={14} className="job-fit__spin" />
          <span>AI 정밀 분석 갱신 중</span>
        </div>
      )}

      <div className="job-fit-report__grid">
        <section className="job-fit-report__panel job-fit-report__panel--wide job-fit-report__panel--visual">
          <header>
            <BrainCircuit size={16} />
            <h4>AI 시각화 요약</h4>
          </header>
          <div className="job-fit-report__visual-grid">
            <RadarChart data={report.visualSummary.radar} />
            <div className="job-fit-report__bars">
              <h5>직무 적합도 매트릭스</h5>
              {report.visualSummary.roleBars.slice(0, 6).map((role, index) => (
                <div key={`${role.role}-${role.family}-${index}`}>
                  <span>
                    <strong>{role.role}</strong>
                    <em>{role.fit}</em>
                  </span>
                  <i>
                    <b style={{ width: `${role.fit}%` }} />
                  </i>
                  <p>{role.reason}</p>
                </div>
              ))}
            </div>
            <KeywordCloud words={report.visualSummary.keywordCloud} />
          </div>
        </section>

        <section className="job-fit-report__panel job-fit-report__panel--wide">
          <header>
            <BrainCircuit size={16} />
            <h4>왜 이 직무인가</h4>
          </header>
          <p className="job-fit-report__reason">{report.primaryReason}</p>
          <div className="job-fit-report__tags">
            {report.aptitudeTags.map((tag, index) => (
              <span key={`${tag}-${index}`}>{tag}</span>
            ))}
          </div>
        </section>

        <section className="job-fit-report__panel job-fit-report__panel--wide">
          <header>
            <Target size={16} />
            <h4>자소서 섹션 × 검사 응답 교차 분석</h4>
          </header>
          <div className="job-fit-report__section-map">
            {report.visualSummary.sectionComparisons.map((item, index) => (
              <article key={`${item.section}-${index}`}>
                <div>
                  <strong>{item.section}</strong>
                  <span>{item.alignment}</span>
                </div>
                <i>
                  <b style={{ width: `${item.alignment}%` }} />
                </i>
                <dl>
                  <dt>자소서 근거</dt>
                  <dd>{item.coverLetterEvidence}</dd>
                  <dt>응답 신호</dt>
                  <dd>{item.answerSignal}</dd>
                  <dt>보강 지점</dt>
                  <dd>{item.gap}</dd>
                  <dt>수정 액션</dt>
                  <dd>{item.action}</dd>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="job-fit-report__panel">
          <header>
            <Sparkles size={16} />
            <h4>보조 후보</h4>
          </header>
          <ul className="job-fit-report__mini-list">
            {report.secondaryRoles.map((role, index) => (
              <li key={`${role.role}-${index}`}>
                <strong>{role.role}</strong>
                <span>{role.reason}</span>
                <em>{role.fit}</em>
              </li>
            ))}
          </ul>
        </section>

        <section className="job-fit-report__panel">
          <header>
            <Target size={16} />
            <h4>준비도</h4>
          </header>
          <div className="job-fit-report__readiness">
            {report.visualSummary.preparationBars.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <span>{item.label}</span>
                <i>
                  <b style={{ width: `${item.score}%` }} />
                </i>
                <strong>{item.score}</strong>
                <em>{item.evidence}</em>
                <em>{item.next}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="job-fit-report__panel">
          <header>
            <Sparkles size={16} />
            <h4>강점</h4>
          </header>
          <ul className="job-fit-report__bullets">
            {report.strengths.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="job-fit-report__panel">
          <header>
            <BrainCircuit size={16} />
            <h4>부족한 증거</h4>
          </header>
          <ul className="job-fit-report__bullets">
            {report.missingEvidence.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="job-fit-report__panel job-fit-report__panel--wide">
          <header>
            <Target size={16} />
            <h4>현실 액션 플랜</h4>
          </header>
          <div className="job-fit-report__plan">
            {report.actionPlan.map((step, index) => (
              <article key={`${step.period}-${index}`}>
                <span>{step.period}</span>
                <strong>{step.title}</strong>
                <ul>
                  {step.actions.map((action, actionIndex) => (
                    <li key={`${action}-${actionIndex}`}>{action}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="job-fit-report__panel job-fit-report__panel--wide">
          <header>
            <BrainCircuit size={16} />
            <h4>직무군 로드맵</h4>
          </header>
          <div className="job-fit-report__roadmap">
            {report.roleRoadmap.slice(0, 5).map((role, index) => (
              <article key={`${role.role}-${index}`}>
                <strong>{role.role}</strong>
                <span>{role.why}</span>
                <em>{role.firstPortfolio}</em>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="job-fit-report__footer">
        <button type="button" className="job-fit__icon-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>질문으로</span>
        </button>
        <button
          type="button"
          className="job-fit__icon-btn"
          onClick={onRegenerate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={15} className="job-fit__spin" />
          ) : (
            <Sparkles size={15} />
          )}
          <span>{loading ? "AI 갱신 중" : "AI 재분석"}</span>
        </button>
        <button
          type="button"
          className="job-fit__icon-btn job-fit__icon-btn--solid"
          onClick={onDownload}
          disabled={downloading}
        >
          {downloading ? (
            <Loader2 size={15} className="job-fit__spin" />
          ) : (
            <Download size={15} />
          )}
          <span>DOCX</span>
        </button>
        <span className="job-fit-report__model">
          Top {summary.roleScores[0]?.fit || 0} · {report.model || "local"}
        </span>
      </footer>
    </div>
  );
}

function RadarChart({
  data,
}: {
  data: JobFitReport["visualSummary"]["radar"];
}) {
  const size = 260;
  const center = size / 2;
  const radius = 92;
  const items = data.slice(0, 6);
  const points = items
    .map((item, index) => {
      const angle = (Math.PI * 2 * index) / items.length - Math.PI / 2;
      const r = radius * (item.score / 100);
      return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
    })
    .join(" ");
  const rings = [25, 50, 75, 100];

  return (
    <div className="job-fit-radar">
      <h5>성향 방사형 그래프</h5>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label="성향 방사형 그래프">
        {rings.map((ring) => {
          const r = radius * (ring / 100);
          return (
            <circle
              key={ring}
              cx={center}
              cy={center}
              r={r}
              className="job-fit-radar__ring"
            />
          );
        })}
        {items.map((item, index) => {
          const angle = (Math.PI * 2 * index) / items.length - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          const lx = center + Math.cos(angle) * (radius + 28);
          const ly = center + Math.sin(angle) * (radius + 28);
          return (
            <g key={`${item.label}-${index}`}>
              <line x1={center} y1={center} x2={x} y2={y} />
              <text x={lx} y={ly} textAnchor={lx < center ? "end" : lx > center ? "start" : "middle"}>
                {item.label}
              </text>
            </g>
          );
        })}
        <polygon points={points} />
      </svg>
    </div>
  );
}

function KeywordCloud({
  words,
}: {
  words: JobFitReport["visualSummary"]["keywordCloud"];
}) {
  return (
    <div className="job-fit-keywords">
      <h5>키워드 클라우드</h5>
      <div>
        {words.slice(0, 18).map((word, index) => (
          <span
            key={`${word.text}-${word.tone}-${index}`}
            className={`is-${word.tone}`}
            style={{ fontSize: `${11 + word.weight / 7}px` }}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
}
