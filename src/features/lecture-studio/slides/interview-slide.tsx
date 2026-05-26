"use client";

import {
  ArrowRight,
  Loader2,
  MessageSquare,
  Mic,
  RefreshCw,
  Send,
  StopCircle,
  User,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { sectionLabels, sectionOrder } from "@/lib/lecture-data";
import type { StudioPayload } from "@/lib/types";
import { countKoreanChars } from "../utils";

type Role = "ai" | "user";

type ChatTurn = {
  id: string;
  role: Role;
  content: string;
  /** Parsed AI structure (only for role==="ai"). */
  feedback?: string;
  question?: string;
  /** While streaming, raw partial text lives in content. */
  streaming?: boolean;
};

type Phase = "idle" | "awaiting-user" | "ai-streaming";

const initialIntro =
  "AI 면접관이 본인이 방금 완성한 자기소개서를 근거로 1번 질문부터 던집니다. 답변하면 합격 포인트와 감점 위험을 짚고, 자연스럽게 다음 질문으로 이어집니다.";

function parseAiResponse(raw: string) {
  if (!raw) return { feedback: "", question: "" };

  const feedbackHead = raw.search(/\[\s*피드백\s*\]/);
  const questionHead = raw.search(/\[\s*질문\s*\]/);

  let feedback = "";
  let question = "";

  if (feedbackHead >= 0) {
    const end =
      questionHead > feedbackHead ? questionHead : raw.length;
    feedback = raw
      .slice(feedbackHead)
      .replace(/^\[\s*피드백\s*\]\s*/m, "")
      .slice(0, end - feedbackHead)
      .replace(/\[\s*질문\s*\][\s\S]*$/m, "")
      .trim();
  } else if (questionHead < 0) {
    // No labels yet — treat full text as feedback while streaming.
    feedback = raw.trim();
  }

  if (questionHead >= 0) {
    question = raw
      .slice(questionHead)
      .replace(/^\[\s*질문\s*\]\s*/m, "")
      .trim();
  }

  // If both empty, fall back to whole text as question.
  if (!feedback && !question) {
    question = raw.trim();
  }

  return { feedback, question };
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function InterviewSlide({
  payload,
}: {
  payload: StudioPayload;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const filledSections = useMemo(
    () => sectionOrder.filter((k) => Boolean(payload.sections?.[k]?.body)),
    [payload.sections],
  );
  const draftReady = filledSections.length === sectionOrder.length;

  const questionCount = useMemo(
    () => turns.filter((t) => t.role === "ai" && t.question).length,
    [turns],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turns]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [draft]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => () => stopStreaming(), [stopStreaming]);

  const callInterview = useCallback(
    async (
      mode: "start" | "reply" | "next",
      historySnapshot: ChatTurn[],
    ) => {
      if (!draftReady) {
        setError("자소서 5개 항목이 모두 작성되어야 면접을 시작할 수 있습니다.");
        return;
      }
      setError("");
      setPhase("ai-streaming");

      const aiTurnId = makeId("ai");
      const placeholder: ChatTurn = {
        id: aiTurnId,
        role: "ai",
        content: "",
        feedback: "",
        question: "",
        streaming: true,
      };
      setTurns((prev) => [...prev, placeholder]);

      stopStreaming();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/interview-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload,
            mode,
            questionCount: historySnapshot.filter(
              (t) => t.role === "ai" && t.question,
            ).length,
            history: historySnapshot.map((t) => ({
              role: t.role,
              content:
                t.role === "ai"
                  ? [
                      t.feedback ? `[피드백] ${t.feedback}` : "",
                      t.question ? `[질문] ${t.question}` : "",
                    ]
                      .filter(Boolean)
                      .join("\n")
                  : t.content,
            })),
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`면접관 응답 실패 (${response.status})`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseAiResponse(buffer);
          setTurns((prev) =>
            prev.map((t) =>
              t.id === aiTurnId
                ? {
                    ...t,
                    content: buffer,
                    feedback: parsed.feedback,
                    question: parsed.question,
                    streaming: true,
                  }
                : t,
            ),
          );
        }

        const finalParsed = parseAiResponse(buffer);
        setTurns((prev) =>
          prev.map((t) =>
            t.id === aiTurnId
              ? {
                  ...t,
                  content: buffer,
                  feedback: finalParsed.feedback,
                  question: finalParsed.question,
                  streaming: false,
                }
              : t,
          ),
        );
        setPhase("awaiting-user");
      } catch (e) {
        const name = (e as { name?: string })?.name;
        if (name === "AbortError") {
          setTurns((prev) => prev.filter((t) => t.id !== aiTurnId));
          setPhase("awaiting-user");
          return;
        }
        setError(e instanceof Error ? e.message : String(e));
        setTurns((prev) => prev.filter((t) => t.id !== aiTurnId));
        setPhase(historySnapshot.length ? "awaiting-user" : "idle");
      } finally {
        abortRef.current = null;
      }
    },
    [draftReady, payload, stopStreaming],
  );

  const startInterview = useCallback(() => {
    setTurns([]);
    setDraft("");
    setError("");
    callInterview("start", []);
  }, [callInterview]);

  const resetInterview = useCallback(() => {
    stopStreaming();
    setTurns([]);
    setDraft("");
    setError("");
    setPhase("idle");
  }, [stopStreaming]);

  const submitAnswer = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (phase === "ai-streaming") return;

    const userTurn: ChatTurn = {
      id: makeId("user"),
      role: "user",
      content: trimmed,
    };
    const next = [...turns, userTurn];
    setTurns(next);
    setDraft("");
    callInterview("reply", next);
  }, [draft, phase, turns, callInterview]);

  const requestNextQuestion = useCallback(() => {
    if (phase === "ai-streaming") return;
    callInterview("next", turns);
  }, [phase, turns, callInterview]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // PC chat convention: Enter sends, Shift+Enter inserts newline.
    // Ignore IME composition so Korean composition Enter doesn't submit.
    if (e.key !== "Enter" || e.shiftKey) return;
    if (e.nativeEvent.isComposing) return;
    e.preventDefault();
    submitAnswer();
  };

  const showEmpty = turns.length === 0;
  const lastAiTurn = [...turns].reverse().find((t) => t.role === "ai");
  const canSendNext =
    phase === "awaiting-user" &&
    lastAiTurn != null &&
    !lastAiTurn.streaming;

  return (
    <div className="mock-interview">
      {/* LEFT — chat panel */}
      <section className="mi-chat">
        <header className="mi-chat__head">
          <div className="mi-chat__head-left">
            <span className="mi-eyebrow">LIVE INTERVIEW</span>
            <h3 className="mi-chat__title">
              {payload.profile.company || "지원 기업"} ·{" "}
              {payload.profile.targetRole || "지원 직무"} 모의 면접
            </h3>
            <p className="mi-chat__sub">
              면접관은 본인의 자소서 본문을 직접 인용하며 심층 질문을 던집니다.
              답변하면 합격/감점 포인트를 짚고 다음 질문으로 이어집니다.
            </p>
          </div>
          <div className="mi-chat__head-right">
            <span className="mi-stat">
              <em>{questionCount}</em>
              <span>질문 진행</span>
            </span>
            <span className="mi-stat">
              <em>{turns.filter((t) => t.role === "user").length}</em>
              <span>답변 완료</span>
            </span>
          </div>
        </header>

        <div className="mi-chat__scroll" ref={scrollRef}>
          {showEmpty && (
            <div className="mi-empty">
              <span className="mi-empty__icon">
                <MessageSquare size={20} strokeWidth={1.6} />
              </span>
              <h4>아직 면접이 시작되지 않았습니다</h4>
              <p>{initialIntro}</p>
              {!draftReady && (
                <p className="mi-empty__warn">
                  ⚠ 자소서 5개 항목이 모두 작성되어야 면접을 시작할 수 있습니다.
                  현재 {filledSections.length}/5 작성됨.
                </p>
              )}
              <button
                type="button"
                className="mi-empty__cta"
                onClick={startInterview}
                disabled={!draftReady}
              >
                <Mic size={14} strokeWidth={2.2} />
                <span>면접 시작 — 1번 질문 받기</span>
              </button>
            </div>
          )}

          {turns.map((turn) => (
            <article
              key={turn.id}
              className={`mi-msg mi-msg--${turn.role}${
                turn.streaming ? " is-streaming" : ""
              }`}
            >
              <div className="mi-msg__avatar" aria-hidden>
                {turn.role === "ai" ? (
                  <Mic size={14} strokeWidth={2.2} />
                ) : (
                  <User size={14} strokeWidth={2.2} />
                )}
              </div>
              <div className="mi-msg__body">
                <header className="mi-msg__head">
                  <span className="mi-msg__role">
                    {turn.role === "ai" ? "AI 면접관" : "지원자"}
                  </span>
                  {turn.role === "ai" && turn.question && (
                    <span className="mi-msg__chip">
                      Q{
                        turns
                          .slice(0, turns.indexOf(turn) + 1)
                          .filter((t) => t.role === "ai" && t.question).length
                      }
                    </span>
                  )}
                  {turn.role === "user" && (
                    <span className="mi-msg__chip mi-msg__chip--mute">
                      {countKoreanChars(turn.content)}자
                    </span>
                  )}
                </header>
                {turn.role === "ai" ? (
                  <>
                    {turn.feedback && (
                      <div className="mi-msg__feedback">
                        <span className="mi-msg__label">피드백</span>
                        <p>{turn.feedback}</p>
                      </div>
                    )}
                    {turn.question && (
                      <div className="mi-msg__question">
                        <span className="mi-msg__label mi-msg__label--accent">
                          질문
                        </span>
                        <p>{turn.question}</p>
                      </div>
                    )}
                    {!turn.feedback && !turn.question && turn.streaming && (
                      <p className="mi-msg__placeholder">
                        면접관이 답변을 정리하는 중…
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mi-msg__text">{turn.content}</p>
                )}
                {turn.streaming && (
                  <span className="mi-msg__caret" aria-hidden />
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Composer */}
        <div className="mi-composer">
          <div className="mi-composer__row">
            <textarea
              ref={textareaRef}
              className="mi-composer__textarea"
              placeholder={
                phase === "ai-streaming"
                  ? "면접관이 응답 중입니다…"
                  : lastAiTurn?.question
                    ? "방금 받은 질문에 답변을 입력하세요. (Enter 전송 · Shift+Enter 줄바꿈)"
                    : "면접이 시작되면 여기에 답변을 입력합니다."
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKey}
              disabled={
                phase === "idle" || phase === "ai-streaming" || !lastAiTurn
              }
              rows={2}
            />
            <div className="mi-composer__actions">
              <span className="mi-composer__count">
                {countKoreanChars(draft)}자
              </span>
              <button
                type="button"
                className="mi-btn mi-btn--primary"
                onClick={submitAnswer}
                disabled={
                  !draft.trim() ||
                  phase === "ai-streaming" ||
                  phase === "idle" ||
                  !lastAiTurn
                }
              >
                <Send size={13} strokeWidth={2.2} />
                <span>답변 제출</span>
              </button>
            </div>
          </div>
          <div className="mi-composer__bar">
            <div className="mi-composer__hint">
              {phase === "ai-streaming"
                ? "면접관이 응답을 작성 중입니다."
                : draftReady
                  ? "Tip · 답변에 ‘상황/행동/결과’ 중 최소 한 가지 수치를 포함하면 좋습니다."
                  : "자소서 5개 항목을 모두 채워야 면접을 시작할 수 있습니다."}
            </div>
            <div className="mi-composer__extra">
              {phase === "ai-streaming" ? (
                <button
                  type="button"
                  className="mi-btn mi-btn--ghost"
                  onClick={stopStreaming}
                >
                  <StopCircle size={13} strokeWidth={2.2} />
                  <span>응답 중단</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="mi-btn mi-btn--ghost"
                  onClick={requestNextQuestion}
                  disabled={!canSendNext}
                  title="현재 질문을 건너뛰고 다음 질문 받기"
                >
                  <ArrowRight size={13} strokeWidth={2.2} />
                  <span>다음 질문 요청</span>
                </button>
              )}
              <button
                type="button"
                className="mi-btn mi-btn--ghost"
                onClick={resetInterview}
                disabled={phase === "ai-streaming" && !turns.length}
                title="대화 기록을 초기화하고 처음부터 다시"
              >
                <RefreshCw size={13} strokeWidth={2.2} />
                <span>면접 초기화</span>
              </button>
            </div>
          </div>
          {error && (
            <div className="mi-error" role="alert">
              <strong>오류 ·</strong> {error}
            </div>
          )}
        </div>
      </section>

      {/* RIGHT — context panel */}
      <aside className="mi-side">
        <section className="mi-side__hero">
          <div className="mi-side__hero-top">
            <span className="mi-eyebrow mi-eyebrow--ondark">MODEL</span>
            <span className="mi-side__hero-tag">실시간 스트리밍</span>
          </div>
          <h4>AI 면접관</h4>
          <p>
            자소서 본문을 직접 인용하며 압박형 심층 질문을 던집니다. 답변마다
            합격 포인트와 감점 위험을 즉시 진단합니다.
          </p>
          <div className="mi-side__hero-meta">
            <span>
              <em>{phase === "ai-streaming" ? "응답 중" : phase === "idle" ? "대기" : "답변 대기"}</em>
              <span>현재 상태</span>
            </span>
            <span>
              <em>{questionCount}</em>
              <span>지금까지 질문</span>
            </span>
          </div>
          <button
            type="button"
            className="mi-side__hero-cta"
            onClick={startInterview}
            disabled={!draftReady || phase === "ai-streaming"}
          >
            {phase === "ai-streaming" ? (
              <Loader2 size={13} strokeWidth={2.2} className="mi-spin" />
            ) : (
              <Mic size={13} strokeWidth={2.2} />
            )}
            <span>{turns.length === 0 ? "면접 시작" : "처음부터 다시 시작"}</span>
          </button>
        </section>

        <section className="mi-side__card">
          <header className="mi-side__card-head">
            <span className="mi-side__num">01</span>
            <h5>면접 진행 방식</h5>
          </header>
          <ol className="mi-side__steps">
            <li>
              <strong>심층 질문</strong>
              <span>자소서 본문 한 줄을 인용하며 사실/역량을 검증합니다.</span>
            </li>
            <li>
              <strong>답변 제출</strong>
              <span>Enter 로 전송 · Shift+Enter 줄바꿈. 구체 사례·수치를 포함하세요.</span>
            </li>
            <li>
              <strong>실시간 피드백</strong>
              <span>합격 포인트와 감점 위험을 한 문단으로 짚어줍니다.</span>
            </li>
            <li>
              <strong>다음 질문 → 반복</strong>
              <span>주제·관점을 바꿔가며 자연스럽게 다음 질문으로 이어집니다.</span>
            </li>
          </ol>
        </section>

        <section className="mi-side__card">
          <header className="mi-side__card-head">
            <span className="mi-side__num">02</span>
            <h5>자소서 근거 항목</h5>
            <span className="mi-side__meta">
              {filledSections.length}/{sectionOrder.length}
            </span>
          </header>
          <ul className="mi-side__sections">
            {sectionOrder.map((key) => {
              const sec = payload.sections?.[key];
              const ok = Boolean(sec?.body);
              return (
                <li
                  key={key}
                  className={`mi-side__section${ok ? " is-ok" : ""}`}
                >
                  <span className="mi-side__dot" aria-hidden />
                  <div className="mi-side__section-body">
                    <strong>{sectionLabels[key]}</strong>
                    <span>
                      {ok
                        ? `${countKoreanChars(sec?.body || "")}자 · 근거 사용 가능`
                        : "미작성 — 면접 근거에서 제외"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mi-side__card mi-side__card--tip">
          <header className="mi-side__card-head">
            <span className="mi-side__num">03</span>
            <h5>좋은 답변 체크리스트</h5>
          </header>
          <ul className="mi-side__tips">
            <li>두괄식 — 핵심 메시지를 첫 문장에 배치</li>
            <li>STAR — 상황/과제/행동/결과를 짧게 분리</li>
            <li>수치 — 인원·기간·향상폭 중 최소 1개</li>
            <li>직무 연결 — 답변 끝에 지원 직무 한 줄</li>
            <li>11가지 감점 표현(피동형·번역투·접속어 남용) 피하기</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
