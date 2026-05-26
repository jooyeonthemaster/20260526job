import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Loader2,
  RotateCcw,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { beforeAfter } from "@/lib/lecture-data";
import { writingDiagnostics } from "../content";

type ParsedReview = {
  verdict: string;
  strengths: string[];
  risks: string[];
  rewrite: string;
  next: string[];
  questions: string[];
};

const EMPTY_REVIEW: ParsedReview = {
  verdict: "",
  strengths: [],
  risks: [],
  rewrite: "",
  next: [],
  questions: [],
};

type WritingTopic = {
  key: string;
  label: string;
  prompt: string;
  hint: string;
  placeholder: string;
  sample: string;
};

const writingTopics: WritingTopic[] = [
  {
    key: "motivation",
    label: "지원동기",
    prompt: "지원동기를 한 문장으로 써보세요.",
    hint: "직무 선택 계기와 회사·업무가 한 문장에서 맞물리게.",
    placeholder:
      "예) 사용자의 요청이 안정적으로 처리되는 구조를 만드는 일에 흥미를 느껴 백엔드 개발자로 지원합니다.",
    sample:
      "귀사의 비전에 깊이 공감하여 백엔드 개발자로 지원하게 되었습니다.",
  },
  {
    key: "growth",
    label: "성장과정",
    prompt: "지금의 일하는 태도를 만든 경험을 한 문장으로 써보세요.",
    hint: "반복 행동·선택의 이유·이후 달라진 태도가 보이게.",
    placeholder:
      "예) 팀 프로젝트에서 매일 오류 목록을 정리한 경험이 끝까지 완성하는 태도를 만들었습니다.",
    sample: "어릴 때부터 부모님의 영향으로 성실하게 살아왔습니다.",
  },
  {
    key: "personality",
    label: "성격 장점",
    prompt: "직무에 도움이 되는 장점을 행동 사례로 한 문장으로 써보세요.",
    hint: "장점 단어 대신 그 장점이 드러난 행동 장면 1개를.",
    placeholder:
      "예) 회의 내용을 기능 단위로 정리해 팀과 공유하며 일정 지연을 줄였습니다.",
    sample:
      "저의 장점은 책임감과 소통 능력이며 어떤 일이든 최선을 다해 수행합니다.",
  },
  {
    key: "competency",
    label: "직무역량",
    prompt: "직무 핵심 역량을 어떤 프로젝트에서 어떻게 발휘했는지 써보세요.",
    hint: "기술명 나열이 아니라 구현 장면과 본인 역할이 보이게.",
    placeholder:
      "예) Spring MVC로 회원·게시판 기능을 구현하며 유효성 검증과 예외 처리를 맡았습니다.",
    sample:
      "Java, Spring, MySQL을 사용할 수 있고 다양한 프로젝트 경험을 가지고 있습니다.",
  },
  {
    key: "ambition",
    label: "포부",
    prompt: "입사 후 인턴 기간에 무엇을 해내고 싶은지 써보세요.",
    hint: "기간·업무·결과 지표가 있는 KPI형 한 문장.",
    placeholder:
      "예) 3개월 안에 팀의 개발 규칙을 익히고 운영 이슈를 매뉴얼로 정리하겠습니다.",
    sample: "입사하면 최선을 다해 회사 발전에 기여하겠습니다.",
  },
];

export function WritingSlide({
  activeBA,
  clearCoach,
  setActiveBA,
}: {
  activeBA: number;
  clearCoach: () => void;
  coachBusy: boolean;
  coachReport: unknown;
  requestCoach: (context: string, studentInput?: string) => Promise<void>;
  setActiveBA: (i: number) => void;
}) {
  const activeExample = beforeAfter[activeBA];
  const activeDiagnostic =
    writingDiagnostics[activeBA] || writingDiagnostics[0];

  const [topicKey, setTopicKey] = useState<string>(writingTopics[0].key);
  const topic =
    writingTopics.find((t) => t.key === topicKey) ?? writingTopics[0];

  const [practiceText, setPracticeText] = useState("");
  const [rawStream, setRawStream] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const parsed = useMemo(() => parseStream(rawStream), [rawStream]);
  const hasResult = rawStream.trim().length > 0;

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!examplesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExamplesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [examplesOpen]);

  const runReview = async () => {
    if (streaming) {
      abortRef.current?.abort();
      return;
    }
    if (!practiceText.trim()) {
      setError("문장을 먼저 입력해주세요.");
      return;
    }
    setRawStream("");
    setError(null);
    setStreaming(true);
    clearCoach();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/coach-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: `${topic.label} 문장 첨삭 — ${topic.prompt}`,
          studentInput: practiceText,
          payload: {},
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`요청 실패 (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setRawStream((prev) => prev + chunk);
      }
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") {
        // user canceled
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const selectTopic = (key: string) => {
    setTopicKey(key);
    setPracticeText("");
    setRawStream("");
    setError(null);
    clearCoach();
    abortRef.current?.abort();
  };

  const loadSample = () => {
    setPracticeText(topic.sample);
    setRawStream("");
    setError(null);
    clearCoach();
    abortRef.current?.abort();
    requestAnimationFrame(() => {
      document.getElementById("wcoach-input")?.focus();
    });
  };

  const resetReview = () => {
    abortRef.current?.abort();
    setRawStream("");
    setError(null);
  };

  return (
    <div className="wlab">
      <section className="wcoach">
        <header className="wcoach__head">
          <div className="wcoach__title">
            <h3>{topic.prompt}</h3>
            <p className="wcoach__sub">
              <strong>한 문장</strong>만 핵심을 담아 적으세요 · 강의의 11가지
              감점 표현·6원칙으로 AI가 즉시 첨삭합니다.
            </p>
            <button
              className="wcoach__examples"
              type="button"
              onClick={() => setExamplesOpen(true)}
            >
              <BookOpen size={12} strokeWidth={2} />
              <span className="wcoach__examples-title">
                사례로 보는 교정 패턴
              </span>
              <span className="wcoach__examples-count">8</span>
              <span className="wcoach__examples-arrow" aria-hidden>
                →
              </span>
            </button>
          </div>
          <div className="wcoach__status">
            <span
              className={`wcoach__dot${streaming ? " is-on" : ""}`}
              aria-hidden
            />
            <span>
              {streaming
                ? "응답 생성 중"
                : hasResult
                  ? "응답 완료"
                  : "대기 중"}
            </span>
          </div>
        </header>

        <div className="wcoach__topics" role="tablist" aria-label="자소서 항목">
          {writingTopics.map((t, i) => {
            const isActive = t.key === topicKey;
            return (
              <button
                key={t.key}
                className={`wcoach__topic${isActive ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectTopic(t.key)}
              >
                <span className="wcoach__topic-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="wcoach__topic-label">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="wcoach__split">
          <div className="wcoach__compose">
            <div className="wcoach__field">
              <textarea
                id="wcoach-input"
                className="wcoach__textarea"
                value={practiceText}
                onChange={(e) => setPracticeText(e.target.value)}
                placeholder={`${topic.hint}  ⏎  ${topic.placeholder}`}
                spellCheck={false}
                rows={2}
              />
              <div className="wcoach__meta">
                <span
                  className={`wcoach__count${
                    practiceText.length > 140 ? " is-over" : ""
                  }`}
                >
                  {practiceText.length.toLocaleString()}자
                </span>
                <span aria-hidden>·</span>
                <span>한 문장 · 80~120자 권장</span>
              </div>
            </div>

            <div className="wcoach__actions">
              <button
                className="wcoach__ghost"
                type="button"
                onClick={loadSample}
              >
                <Sparkles size={12} strokeWidth={2.2} />
                약한 예시 문장 채우기
              </button>
              <button
                className="wcoach__ghost"
                type="button"
                onClick={resetReview}
                disabled={!hasResult && !streaming}
              >
                <RotateCcw size={12} strokeWidth={2.2} />
                초기화
              </button>
              <button
                className={`wcoach__cta${streaming ? " is-busy" : ""}`}
                type="button"
                onClick={runReview}
              >
                {streaming ? (
                  <Loader2 size={14} className="wcoach__spin" strokeWidth={2.2} />
                ) : (
                  <Wand2 size={14} strokeWidth={2.2} />
                )}
                <span>{streaming ? "중단" : "AI 첨삭 시작"}</span>
              </button>
            </div>
          </div>

          <div className="wcoach__output" aria-live="polite">
          {!hasResult && !streaming && (
            <div className="wcoach__empty">
              <Sparkles size={14} strokeWidth={1.6} />
              <p>
                <strong>실시간 첨삭 대기</strong>
                <span>
                  위 입력칸에 <em>{topic.label}</em> 문장을 한 줄로 적고,
                  <em> AI 첨삭 시작</em>을 누르면 총평·강점·위험·고친 예시가
                  순서대로 흘러나옵니다.
                </span>
              </p>
            </div>
          )}

          {(hasResult || streaming) && (
            <div className="wcoach__report">
              <ReviewBlock
                num="01"
                label="VERDICT"
                title="총평"
                streaming={streaming && !parsed.strengths.length && !parsed.verdict}
              >
                {parsed.verdict ? (
                  <p className="wcoach__verdict">{parsed.verdict}</p>
                ) : (
                  <Skeleton />
                )}
              </ReviewBlock>

              <div className="wcoach__grid">
                <ReviewBlock
                  num="02"
                  label="STRENGTHS"
                  title="살릴 점"
                  variant="ok"
                >
                  {parsed.strengths.length ? (
                    <ul className="wcoach__bullets">
                      {parsed.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <Skeleton />
                  )}
                </ReviewBlock>

                <ReviewBlock
                  num="03"
                  label="RISKS"
                  title="감점 위험"
                  variant="risk"
                >
                  {parsed.risks.length ? (
                    <ul className="wcoach__bullets">
                      {parsed.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <Skeleton />
                  )}
                </ReviewBlock>
              </div>

              <ReviewBlock
                num="04"
                label="REWRITE"
                title="고친 문장 예시"
                variant="rewrite"
              >
                {parsed.rewrite ? (
                  <p className="wcoach__rewrite">{parsed.rewrite}</p>
                ) : (
                  <Skeleton />
                )}
              </ReviewBlock>

              <div className="wcoach__grid">
                <ReviewBlock num="05" label="NEXT" title="다음 행동">
                  {parsed.next.length ? (
                    <ol className="wcoach__steps">
                      {parsed.next.map((n, i) => (
                        <li key={i}>
                          <span className="wcoach__step-num">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span>{n}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <Skeleton />
                  )}
                </ReviewBlock>

                <ReviewBlock num="06" label="QUESTIONS" title="추가로 물을 것">
                  {parsed.questions.length ? (
                    <ul className="wcoach__bullets wcoach__bullets--q">
                      {parsed.questions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  ) : (
                    <Skeleton />
                  )}
                </ReviewBlock>
              </div>
            </div>
          )}

            {error && (
              <div className="wcoach__error" role="alert">
                <strong>오류</strong>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {examplesOpen && (
        <ExamplesModal
          activeBA={activeBA}
          activeExample={activeExample}
          activeDiagnostic={activeDiagnostic}
          setActiveBA={setActiveBA}
          onClose={() => setExamplesOpen(false)}
        />
      )}
    </div>
  );
}

function ExamplesModal({
  activeBA,
  activeExample,
  activeDiagnostic,
  setActiveBA,
  onClose,
}: {
  activeBA: number;
  activeExample: { label: string; before: string; after: string };
  activeDiagnostic: { why: string; method: string };
  setActiveBA: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="wmodal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wmodal-title"
      onClick={onClose}
    >
      <div className="wmodal__panel" onClick={(e) => e.stopPropagation()}>
        <header className="wmodal__head">
          <div className="wmodal__title">
            <span className="wmodal__eyebrow">REFERENCE · 8 PATTERNS</span>
            <h3 id="wmodal-title">사례로 보는 교정 패턴</h3>
            <p className="wmodal__sub">
              강의에서 다룬 8가지 BEFORE → AFTER 패턴. 탭을 눌러 바꾸는 이유까지 확인하세요.
            </p>
          </div>
          <button
            className="wmodal__close"
            type="button"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </header>

        <ol className="wmodal__tabs" role="tablist">
          {beforeAfter.map((ex, idx) => (
            <li key={ex.label}>
              <button
                className={`wmodal__tab${
                  idx === activeBA ? " is-active" : ""
                }`}
                type="button"
                role="tab"
                aria-selected={idx === activeBA}
                onClick={() => setActiveBA(idx)}
              >
                <span className="wmodal__tab-num">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="wmodal__tab-label">{ex.label}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="wmodal__compare">
          <div className="wmodal__block wmodal__block--before">
            <span className="wmodal__block-label">BEFORE</span>
            <p>{activeExample.before}</p>
          </div>
          <div className="wmodal__arrow" aria-hidden>
            →
          </div>
          <div className="wmodal__block wmodal__block--after">
            <span className="wmodal__block-label">AFTER</span>
            <p>{activeExample.after}</p>
          </div>
        </div>

        <div className="wmodal__why">
          <div className="wmodal__why-col">
            <span className="wmodal__why-label">왜 바꾸는가</span>
            <p>{activeDiagnostic.why}</p>
          </div>
          <div className="wmodal__why-col wmodal__why-col--method">
            <span className="wmodal__why-label">어떻게</span>
            <strong>{activeDiagnostic.method}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewBlock({
  num,
  label,
  title,
  children,
  variant,
  streaming,
}: {
  num: string;
  label: string;
  title: string;
  children: React.ReactNode;
  variant?: "ok" | "risk" | "rewrite";
  streaming?: boolean;
}) {
  return (
    <article
      className={`wcoach__block${variant ? ` wcoach__block--${variant}` : ""}${
        streaming ? " is-streaming" : ""
      }`}
    >
      <header className="wcoach__block-head">
        <span className="wcoach__block-num">{num}</span>
        <span className="wcoach__block-label">{label}</span>
        <span className="wcoach__block-title">{title}</span>
      </header>
      <div className="wcoach__block-body">{children}</div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="wcoach__skeleton" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

function parseStream(text: string): ParsedReview {
  if (!text) return EMPTY_REVIEW;
  const sections: Record<string, string> = {};
  const regex = /##\s+(VERDICT|STRENGTHS|RISKS|REWRITE|NEXT|QUESTIONS)\s*\n?/gi;

  const matches: { key: string; head: number; body: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    matches.push({
      key: m[1].toUpperCase(),
      head: m.index,
      body: m.index + m[0].length,
    });
  }
  for (let i = 0; i < matches.length; i++) {
    const end =
      i + 1 < matches.length ? matches[i + 1].head : text.length;
    sections[matches[i].key] = text
      .slice(matches[i].body, end)
      .replace(/#+\s*$/g, "")
      .trim();
  }

  // Strip a trailing partial section header (e.g. "## STR" mid-stream)
  // and any leftover hash artifacts.
  const stripTrailingHash = (s: string) =>
    s
      .replace(/\s*#{1,2}\s*[A-Z]{0,12}\s*$/g, "")
      .replace(/\s*#+\s*$/g, "")
      .trim();

  const toList = (raw?: string): string[] => {
    if (!raw) return [];
    return raw
      .split(/\n/)
      .map((line) =>
        stripTrailingHash(line.replace(/^[-*•\u00b7]\s*/, "").trim()),
      )
      .filter((line) => line.length > 0 && !/^##/.test(line) && line !== "#");
  };
  const toLine = (raw?: string): string => {
    if (!raw) return "";
    return stripTrailingHash(
      raw
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" "),
    );
  };

  return {
    verdict: toLine(sections.VERDICT),
    strengths: toList(sections.STRENGTHS),
    risks: toList(sections.RISKS),
    rewrite: toLine(sections.REWRITE),
    next: toList(sections.NEXT),
    questions: toList(sections.QUESTIONS),
  };
}
