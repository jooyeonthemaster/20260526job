import { Plus, RotateCcw, X } from "lucide-react";
import { sectionLabels, sectionOrder } from "@/lib/lecture-data";
import type { SectionKey, StoryInput } from "@/lib/types";

const starSteps = [
  {
    letter: "S",
    title: "Situation",
    sub: "상황",
    hint: "경험의 배경을 한두 문장으로 짧게.",
  },
  {
    letter: "T",
    title: "Task",
    sub: "과제",
    hint: "해결해야 했던 문제 또는 부여된 과제.",
  },
  {
    letter: "A",
    title: "Action",
    sub: "행동",
    hint: "본인이 한 구체적 활동·시도에 집중.",
  },
  {
    letter: "R",
    title: "Result",
    sub: "결과",
    hint: "정량·정성 성과 + 배운 점.",
  },
] as const;

export function StorySlide({
  stories,
  updateStory,
  addStory,
  removeStory,
  clearAllStories,
}: {
  stories: StoryInput[];
  updateStory: <K extends keyof StoryInput>(
    id: string,
    key: K,
    value: StoryInput[K],
  ) => void;
  addStory: () => void;
  removeStory: (id: string) => void;
  clearAllStories: () => void;
}) {
  const isPristine =
    stories.length === 1 &&
    !stories[0].title &&
    !stories[0].situation &&
    !stories[0].task &&
    !stories[0].action &&
    !stories[0].result;
  return (
    <div className="sform">
      <div className="sform__topbar">
        <div className="sform__topbar-text">
          <span className="sform__topbar-tag">START</span>
          <p>
            5개 자소서 항목에 매핑된 STAR 예시가 미리 채워져 있습니다. 본인
            경험으로 덮어쓰거나, 오른쪽 버튼으로 모두 비우고 시작하세요.
          </p>
        </div>
        <button
          type="button"
          className="sform__topbar-clear"
          onClick={() => {
            if (isPristine) return;
            if (window.confirm("모든 스토리를 비웁니다. 계속할까요?")) {
              clearAllStories();
            }
          }}
          disabled={isPristine}
        >
          <RotateCcw size={12} strokeWidth={2.2} />
          전체 비우기
        </button>
      </div>

      <div className="sform__listhead">
        <h3 className="sform__listtitle">
          스토리 입력 <span>· {stories.length}개</span>
        </h3>
        <p className="sform__listsub">
          같은 경험을 여러 항목(직무역량 + 성격 장점 등)에 동시 활용해도 됩니다.
        </p>
        <button className="sform__add" type="button" onClick={addStory}>
          <Plus size={13} strokeWidth={2.2} />
          경험 추가
        </button>
      </div>

      <div className="sform__list">
        {stories.map((story, index) => (
          <article className="scard" key={story.id}>
            <header className="scard__head">
              <span className="scard__num">
                {String(index + 1).padStart(2, "0")}
              </span>
              <input
                className="scard__title"
                value={story.title}
                onChange={(e) =>
                  updateStory(story.id, "title", e.target.value)
                }
                placeholder="경험 제목 (예: 팀 프로젝트에서 게시판 기능 구현)"
                spellCheck={false}
              />
              <div className="scard__cat-wrap">
                <span className="scard__cat-label">자소서 항목</span>
                <select
                  className="scard__cat"
                  value={story.category}
                  onChange={(e) =>
                    updateStory(
                      story.id,
                      "category",
                      e.target.value as SectionKey,
                    )
                  }
                >
                  {sectionOrder.map((key) => (
                    <option key={key} value={key}>
                      {sectionLabels[key]}
                    </option>
                  ))}
                </select>
              </div>
            </header>

            <div className="scard__grid">
              {starSteps.map((step) => {
                const key = step.letter.toLowerCase() === "s"
                  ? "situation"
                  : step.letter.toLowerCase() === "t"
                    ? "task"
                    : step.letter.toLowerCase() === "a"
                      ? "action"
                      : "result";
                return (
                  <div className="scard__field" key={step.letter}>
                    <label className="scard__field-label">
                      <span className="scard__field-letter">{step.letter}</span>
                      <span className="scard__field-name">{step.sub}</span>
                    </label>
                    <textarea
                      className="scard__field-area"
                      rows={2}
                      value={story[key as keyof StoryInput] as string}
                      onChange={(e) =>
                        updateStory(
                          story.id,
                          key as keyof StoryInput,
                          e.target.value as never,
                        )
                      }
                      placeholder={step.hint}
                      spellCheck={false}
                    />
                  </div>
                );
              })}
            </div>

            <div className="scard__meta">
              <div className="scard__metafield">
                <label className="scard__field-label">
                  <span className="scard__field-letter scard__field-letter--alt">
                    i
                  </span>
                  <span className="scard__field-name">배운 점 · Insight</span>
                </label>
                <input
                  className="scard__metainput"
                  value={story.insight}
                  onChange={(e) =>
                    updateStory(story.id, "insight", e.target.value)
                  }
                  placeholder="이 경험을 통해 바뀐 태도나 관점 한 줄"
                  spellCheck={false}
                />
              </div>
              <div className="scard__metafield">
                <label className="scard__field-label">
                  <span className="scard__field-letter scard__field-letter--alt">
                    #
                  </span>
                  <span className="scard__field-name">정량 성과 · Metric</span>
                </label>
                <input
                  className="scard__metainput"
                  value={story.metric}
                  onChange={(e) =>
                    updateStory(story.id, "metric", e.target.value)
                  }
                  placeholder="예) 오류 30% 감소, 일정 2일 단축"
                  spellCheck={false}
                />
              </div>
            </div>

            {stories.length > 1 && (
              <button
                className="scard__del"
                type="button"
                onClick={() => removeStory(story.id)}
              >
                <X size={11} strokeWidth={2.2} />
                <span>이 경험 삭제</span>
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
