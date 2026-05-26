"use client";

import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { SplineRobot } from "./shared/spline-robot";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  defaultProfile,
  defaultStories,
  emptySections,
  lectureSlides,
  sectionLabels,
  sectionOrder,
} from "@/lib/lecture-data";
import type {
  DraftSections,
  QualityReport,
  SectionKey,
  StoryInput,
  StudentProfile,
  StudioPayload,
} from "@/lib/types";
import {
  ExportSlide,
  GeneratorSlide,
  InstructorSlide,
  IntroSlide,
  MapSlide,
  ProfileInputSlide,
  ReviewSlide,
  StorySlide,
  WhySlide,
  WritingSlide,
} from "./slides";
import type { BusyState, CoachReport } from "./types";
import { mergeSections, parseDraftStream, splitTags } from "./utils";

const storageKey = "cover-letter-lecture-studio-v4";

export function LectureStudio() {
  const shellRef = useRef<HTMLElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionKey>("growth");
  const [activeBA, setActiveBA] = useState(0);
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [stories, setStories] = useState<StoryInput[]>(defaultStories);
  const [strengthsText, setStrengthsText] = useState(
    "책임감, 소통, 끈기, 치밀함, 주인의식",
  );
  const [techText, setTechText] = useState(
    "Java, Spring, MyBatis, Oracle, MySQL, HTML, CSS, JavaScript, jQuery, JSP/Servlet",
  );
  const [sections, setSections] = useState<DraftSections>(emptySections);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [coachReport, setCoachReport] = useState<CoachReport | null>(null);
  const [coachBusy, setCoachBusy] = useState(false);
  const [busy, setBusy] = useState<BusyState>(null);
  const [status, setStatus] = useState("자동 저장 준비 완료");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as {
        profile?: StudentProfile;
        stories?: StoryInput[];
        strengthsText?: string;
        techText?: string;
        sections?: DraftSections;
      };
      if (parsed.profile) setProfile({ ...defaultProfile, ...parsed.profile });
      if (parsed.stories?.length) setStories(parsed.stories);
      if (parsed.strengthsText) setStrengthsText(parsed.strengthsText);
      if (parsed.techText) setTechText(parsed.techText);
      if (parsed.sections) setSections({ ...emptySections, ...parsed.sections });
      setStatus("이전 작성 내용 복원");
    } catch {
      setStatus("저장 데이터 복원 실패");
    }
  }, []);

  useEffect(() => {
    const snapshot = JSON.stringify({
      profile,
      stories,
      strengthsText,
      techText,
      sections,
    });
    window.localStorage.setItem(storageKey, snapshot);
  }, [profile, stories, strengthsText, techText, sections]);

  // Ref so nav callbacks can read latest draft state without stale closures.
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  const draftReady = useMemo(
    () => sectionOrder.some((k) => Boolean(sections[k]?.body)),
    [sections],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;

      if (event.key === "ArrowRight") {
        setActiveSlide((s) => {
          const current = lectureSlides[s];
          if (current?.id === "generator") {
            const ready = sectionOrder.some(
              (k) => Boolean(sectionsRef.current[k]?.body),
            );
            if (!ready) return s;
          }
          return Math.min(s + 1, lectureSlides.length - 1);
        });
      }
      if (event.key === "ArrowLeft")
        setActiveSlide((s) => Math.max(s - 1, 0));
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const strengths = useMemo(() => splitTags(strengthsText), [strengthsText]);
  // techStack auto-derives from profile's 6 tech category fields (slide 05).
  // Legacy techText state is preserved as fallback for previously saved data only.
  const techStack = useMemo(() => {
    const fromProfile = [
      profile.techOSDB,
      profile.techTools,
      profile.techLanguages,
      profile.techWeb,
      profile.techFramework,
      profile.techApp,
    ]
      .filter(Boolean)
      .join(", ");
    return splitTags(fromProfile || techText);
  }, [
    profile.techOSDB,
    profile.techTools,
    profile.techLanguages,
    profile.techWeb,
    profile.techFramework,
    profile.techApp,
    techText,
  ]);

  const payload = useMemo<StudioPayload>(
    () => ({ profile, strengths, techStack, stories, sections }),
    [profile, strengths, techStack, stories, sections],
  );

  const nextSlide = useCallback(() => {
    setActiveSlide((s) => {
      const current = lectureSlides[s];
      if (current?.id === "generator") {
        const ready = sectionOrder.some(
          (k) => Boolean(sectionsRef.current[k]?.body),
        );
        if (!ready) return s;
      }
      return Math.min(s + 1, lectureSlides.length - 1);
    });
  }, []);
  const prevSlide = useCallback(
    () => setActiveSlide((s) => Math.max(s - 1, 0)),
    [],
  );

  const updateProfile = <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K],
  ) => setProfile((prev) => ({ ...prev, [key]: value }));

  const updateStory = <K extends keyof StoryInput>(
    id: string,
    key: K,
    value: StoryInput[K],
  ) =>
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)),
    );

  const addStory = () => {
    setStories((prev) => [
      ...prev,
      {
        id: `story-${Date.now()}`,
        title: "",
        category: "growth",
        situation: "",
        task: "",
        action: "",
        result: "",
        insight: "",
        metric: "",
      },
    ]);
  };

  const removeStory = (id: string) => {
    setStories((prev) =>
      prev.length > 1 ? prev.filter((s) => s.id !== id) : prev,
    );
  };

  const clearProfile = () => {
    setProfile((prev) => {
      const next: StudentProfile = { ...prev };
      (Object.keys(next) as (keyof StudentProfile)[]).forEach((key) => {
        if (key === "tone") return;
        (next as Record<string, unknown>)[key] = "";
      });
      return next;
    });
  };

  const clearAllStories = () => {
    setStories([
      {
        id: `story-${Date.now()}`,
        title: "",
        category: "growth",
        situation: "",
        task: "",
        action: "",
        result: "",
        insight: "",
        metric: "",
      },
    ]);
  };

  const updateSection = (
    key: SectionKey,
    field: "title" | "body",
    value: string,
  ) =>
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));

  const [draftStreaming, setDraftStreaming] = useState(false);
  const draftAbortRef = useRef<AbortController | null>(null);

  const callGeminiStream = useCallback(async () => {
    // Navigate to review slide immediately — let the user see streaming
    const reviewIdx = lectureSlides.findIndex((s) => s.id === "review");
    if (reviewIdx >= 0) setActiveSlide(reviewIdx);

    setSections(emptySections);
    setQualityReport(null);
    setError("");
    setStatus("AI 초안 실시간 생성 중");
    setDraftStreaming(true);

    draftAbortRef.current?.abort();
    const controller = new AbortController();
    draftAbortRef.current = controller;

    try {
      const response = await fetch("/api/gemini-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(`요청 실패 (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parsed = parseDraftStream(buffer);
        setSections(parsed.sections);
        if (parsed.qualityReport) setQualityReport(parsed.qualityReport);
      }
      setStatus("AI 초안 생성 완료");
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") {
        setStatus("초안 생성 중단");
      } else {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("AI 생성 중 오류");
      }
    } finally {
      setDraftStreaming(false);
      draftAbortRef.current = null;
    }
  }, [payload]);

  const callGemini = async (
    mode: "draft" | "polish",
    sectionKey?: SectionKey,
  ) => {
    const busyKey: BusyState = sectionKey || mode;
    setBusy(busyKey);
    setError("");
    setStatus(
      sectionKey
        ? `${sectionLabels[sectionKey]} 재작성 중`
        : "AI가 강의 원칙으로 초안을 구성 중",
    );

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: sectionKey ? "section" : mode,
          sectionKey,
          payload,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || data?.error || "AI 호출 실패");
      }

      if (data.sections) {
        setSections((prev) => mergeSections(prev, data.sections));
      }
      if (data.qualityReport) {
        setQualityReport(data.qualityReport);
      }
      setStatus(
        sectionKey
          ? `${sectionLabels[sectionKey]} 재작성 완료`
          : "AI 초안 생성 완료",
      );
      if (!sectionKey && mode === "draft") {
        const reviewSlideIndex = lectureSlides.findIndex(
          (item) => item.id === "review",
        );
        if (reviewSlideIndex >= 0) setActiveSlide(reviewSlideIndex);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("AI 생성 중 오류");
    } finally {
      setBusy(null);
    }
  };

  const callCoach = async (context: string, studentInput = "") => {
    setCoachBusy(true);
    setCoachReport(null);
    setError("");
    setStatus("AI가 현재 슬라이드 입력을 점검 중");

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, studentInput, payload }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || data?.error || "AI 코치 호출 실패");
      }

      setCoachReport(data as CoachReport);
      setStatus("슬라이드 코치 피드백 완료");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("AI 코치 호출 오류");
    } finally {
      setCoachBusy(false);
    }
  };

  const clearCoach = () => setCoachReport(null);

  const downloadDocx = async () => {
    setBusy("docx");
    setError("");
    setStatus("DOCX 문서 생성 중");

    try {
      const response = await fetch("/api/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.detail || data?.error || "DOCX 생성 실패");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${profile.name || "학생"}_AI자기소개서.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setStatus("DOCX 다운로드 완료");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("DOCX 생성 오류");
    } finally {
      setBusy(null);
    }
  };

  const resetDrafts = () => {
    setSections(emptySections);
    setQualityReport(null);
    setStatus("AI 초안 초기화");
  };

  const slide = lectureSlides[activeSlide];

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    if (slide.id !== "profile") {
      shell.style.removeProperty("--spline-companion-cut");
      return;
    }

    let frame = 0;
    const measureCompanionCut = () => {
      const rule =
        shell.querySelector<HTMLElement>(
          ".instructor__ledger .instructor__rowhead-rule",
        ) ??
        shell.querySelector<HTMLElement>(
          ".instructor__ledger .instructor__rowhead",
        );
      if (!rule) return;

      let top = 0;
      let node: HTMLElement | null = rule;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }

      shell.style.setProperty(
        "--spline-companion-cut",
        `${Math.max(0, Math.round(top + rule.offsetHeight / 2))}px`,
      );
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measureCompanionCut);
    };

    measureCompanionCut();
    scheduleMeasure();

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(shell);

    const rule = shell.querySelector<HTMLElement>(
      ".instructor__ledger .instructor__rowhead-rule",
    );
    if (rule) observer.observe(rule);

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleMeasure);
      observer.disconnect();
    };
  }, [slide.id]);

  const isRobotInteractiveSlide =
    slide.id === "intro" ||
    slide.id === "profile" ||
    slide.id === "why" ||
    slide.id === "writing" ||
    slide.id === "profile-input" ||
    slide.id === "story";

  return (
    <main className="studio-shell" ref={shellRef}>
      <div className="aurora" />
      <div className="aurora-blob b1" />
      <div className="aurora-blob b2" />
      <div className="grid-veil" />

      {/* Persistent Spline robot — loads once, repositions per slide */}
      {(() => {
        const splineMode =
          slide.id === "intro"
            ? "cover"
            : slide.id === "profile"
              ? "companion"
              : slide.id === "why"
                ? "presenter"
                : slide.id === "map"
                  ? "map-mini"
                  : slide.id === "writing"
                    ? "writing-mini"
                    : slide.id === "profile-input"
                      ? "profile-input-mini"
                    : slide.id === "story"
                      ? "story-mini"
                : "hidden";
        return (
          <div
            className={`spline-layer spline-layer--${splineMode}`}
            aria-hidden={splineMode === "hidden"}
          >
            <div className="spline-layer__stage">
              <SplineRobot />
            </div>
          </div>
        );
      })()}

      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <span className="brand-mono">N°{slide.kicker}</span>
            <span className="brand-wordmark">AI Cover Letter Lecture</span>
          </div>
        </div>

        <div className="topbar-center">
          <span className="topbar-progress__num">{slide.kicker}</span>
          <div className="topbar-progress__bar" role="progressbar" aria-valuenow={Math.round(((activeSlide + 1) / lectureSlides.length) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${((activeSlide + 1) / lectureSlides.length) * 100}%` }} />
          </div>
          <span className="topbar-progress__num topbar-progress__num--mute">
            {String(lectureSlides.length - 1).padStart(2, "0")}
          </span>
          <span className="topbar-progress__sep" aria-hidden>·</span>
          <span className="topbar-progress__pct">{Math.round(((activeSlide + 1) / lectureSlides.length) * 100)}%</span>
        </div>

        <div className="topbar-right">
          <span className="topbar-chapter">{slide.chapter}</span>
          <button
            className="icon-command"
            onClick={downloadDocx}
            disabled={busy === "docx"}
          >
            <Download size={13} strokeWidth={2.2} />
            <span>{busy === "docx" ? "생성 중" : "DOCX"}</span>
          </button>
        </div>
      </header>

      <section
        className={`deck-layout${
          isRobotInteractiveSlide ? " deck-layout--passthrough" : ""
        }${
          slide.id === "writing" ||
          slide.id === "profile-input" ||
          slide.id === "story"
            ? " deck-layout--form-robot"
            : ""
        }`}
      >
        <div className="slide-frame">
          <div className={`slide-surface slide-surface--${slide.id}`} key={activeSlide}>
            <div className="slide-head">
              <div className="head-meta">
                <span className="chapter-line">
                  <span className="kicker">{slide.kicker}</span>
                  <span>{slide.chapter}</span>
                </span>
                <h2>{slide.title}</h2>
                <p className="head-sub">{slide.subtitle}</p>
              </div>
              <div className="head-counter">
                <span className="current">
                  {slide.kicker}
                </span>
                <span className="total">
                  / {String(lectureSlides.length - 1).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="slide-body">{renderSlide()}</div>

            <div className="slide-foot">
              <span>Pretendard × Instrument Serif</span>
              <div className="progress-track">
                <span
                  style={{
                    width: `${
                      ((activeSlide + 1) / lectureSlides.length) * 100
                    }%`,
                  }}
                />
              </div>
              <span>← → 키로 이동</span>
            </div>
          </div>
        </div>
      </section>

      <button
        className="side-nav left"
        onClick={prevSlide}
        aria-label="이전 슬라이드"
        disabled={activeSlide === 0}
      >
        <ArrowLeft size={20} />
      </button>
      <button
        className="side-nav right"
        onClick={nextSlide}
        aria-label={
          slide.id === "generator" && !draftReady
            ? "AI 초안을 먼저 생성해야 다음 슬라이드로 이동할 수 있습니다"
            : "다음 슬라이드"
        }
        title={
          slide.id === "generator" && !draftReady
            ? "‘자소서 초안 생성하기’를 먼저 눌러주세요"
            : undefined
        }
        disabled={
          activeSlide === lectureSlides.length - 1 ||
          (slide.id === "generator" && !draftReady)
        }
      >
        <ArrowRight size={20} />
      </button>


      {error && (
        <div className="error-toast" role="alert">
          <strong>오류:</strong> {error}
        </div>
      )}
    </main>
  );

  function renderSlide() {
    switch (lectureSlides[activeSlide].id) {
      case "intro":
        return <IntroSlide />;
      case "profile":
        return <InstructorSlide />;
      case "why":
        return <WhySlide />;
      case "map":
        return (
          <MapSlide
            clearCoach={clearCoach}
            coachBusy={coachBusy}
            coachReport={coachReport}
            requestCoach={callCoach}
          />
        );
      case "writing":
        return (
          <WritingSlide
            activeBA={activeBA}
            clearCoach={clearCoach}
            coachBusy={coachBusy}
            coachReport={coachReport}
            requestCoach={callCoach}
            setActiveBA={setActiveBA}
          />
        );
      case "profile-input":
        return (
          <ProfileInputSlide
            profile={profile}
            updateProfile={updateProfile}
            clearProfile={clearProfile}
          />
        );
      case "story":
        return (
          <StorySlide
            stories={stories}
            updateStory={updateStory}
            addStory={addStory}
            removeStory={removeStory}
            clearAllStories={clearAllStories}
          />
        );
      case "generator":
        return (
          <GeneratorSlide
            busy={busy}
            callGemini={callGemini}
            callGeminiStream={callGeminiStream}
            resetDrafts={resetDrafts}
            qualityReport={qualityReport}
            profile={profile}
            stories={stories}
            strengths={strengths}
          />
        );
      case "review":
        return (
          <ReviewSlide
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            sections={sections}
            updateSection={updateSection}
            callGemini={callGemini}
            busy={busy}
            streaming={draftStreaming}
            qualityReport={qualityReport}
          />
        );
      case "export":
        return (
          <ExportSlide
            profile={profile}
            sections={sections}
            qualityReport={qualityReport}
            busy={busy}
            downloadDocx={downloadDocx}
            callGemini={callGemini}
          />
        );
      default:
        return null;
    }
  }
}
