import { useState } from "react";
import {
  sectionGuides,
  sectionLabels,
  sectionOrder,
  sectionTargets,
} from "@/lib/lecture-data";
import type { SectionKey } from "@/lib/types";
import { categoryNotes } from "../content";

type CategoryLesson = {
  focus: string;
  materials: string[];
  structure: string[];
  caseTitle: string;
  caseLines: string[];
  avoid: string[];
};

const categoryLessons: Record<SectionKey, CategoryLesson> = {
  growth: {
    focus: "성장 배경 전체가 아니라 현재 직무 태도의 뿌리가 된 한 장면을 고른다.",
    materials: [
      "반복해서 보였던 행동 습관",
      "선택의 이유가 드러나는 구체적 사건",
      "그 이후 달라진 태도나 일 처리 방식",
    ],
    structure: [
      "가치관을 한 문장으로 먼저 선언",
      "가치관이 생긴 경험을 STAR로 압축",
      "결과보다 행동 기준이 어떻게 생겼는지 설명",
      "지원 직무에서 같은 태도가 어떻게 쓰이는지 연결",
    ],
    caseTitle: "책임감 사례",
    caseLines: [
      "저는 맡은 일은 끝까지 완성해야 한다는 기준을 가지고 있습니다.",
      "훈련 과정 팀 프로젝트에서 오류가 반복되자 매일 오류 목록을 정리하고 담당자를 나누어 확인했습니다.",
      "이 경험 이후 요구사항을 끝까지 확인하는 태도가 생겼고, 백엔드 개발 업무에서도 안정적인 기능 구현으로 이어질 수 있습니다.",
    ],
    avoid: [
      "출생부터 학교생활까지 시간순으로 길게 나열",
      "부모님 영향만 말하고 본인의 행동이 없는 문장",
      "감동적인 추억으로 끝나고 직무 태도로 연결하지 않는 방식",
    ],
  },
  personality: {
    focus: "제출 문서에서는 단점보다 직무 수행에 도움이 되는 장점 1~2개를 사례로 증명한다.",
    materials: [
      "팀 프로젝트에서 맡았던 역할",
      "갈등·일정·요구사항을 조율한 장면",
      "주변 피드백이나 결과로 확인된 성격 장점",
    ],
    structure: [
      "직무에 유리한 성격 장점 제시",
      "그 장점이 드러난 행동 사례 설명",
      "결과와 주변 반응을 짧게 제시",
      "해당 장점이 지원 직무에 주는 이점으로 마무리",
    ],
    caseTitle: "소통·정리력 사례",
    caseLines: [
      "저의 장점은 요구사항을 정리해 팀이 같은 기준으로 움직이게 만드는 점입니다.",
      "프로젝트 중 기능 범위가 자주 바뀌자 회의 내용을 기능 단위로 정리해 팀원과 공유했습니다.",
      "그 결과 중복 작업을 줄였고, 개발 일정 안에 핵심 기능을 완성할 수 있었습니다.",
    ],
    avoid: [
      "장점과 단점을 같은 비중으로 길게 쓰기",
      "성실함, 책임감 같은 단어만 반복",
      "단점을 장점처럼 포장하는 형식적인 문장",
    ],
  },
  motivation: {
    focus: "왜 이 직무인지, 무엇을 준비했는지, 회사에서 어떤 일로 이어질지를 한 흐름으로 묶는다.",
    materials: [
      "직무를 선택하게 된 계기",
      "교육·프로젝트·자기주도 학습에서 쌓은 준비",
      "지원 회사나 산업에 대한 나의 해석",
    ],
    structure: [
      "직무 선택 계기 제시",
      "그 계기를 강화한 학습·프로젝트 경험 설명",
      "회사·산업 맥락과 연결",
      "입사 후 맡고 싶은 업무로 마무리",
    ],
    caseTitle: "백엔드 개발 지원동기 사례",
    caseLines: [
      "사용자의 요청이 안정적으로 처리되는 구조를 만드는 일에 흥미를 느껴 백엔드 개발을 선택했습니다.",
      "Spring 기반 프로젝트에서 회원·게시판 기능을 구현하며 데이터 흐름과 예외 처리의 중요성을 배웠습니다.",
      "입사 후에는 서비스 안정성과 유지보수성을 높이는 개발자로 기여하고 싶습니다.",
    ],
    avoid: [
      "귀사의 비전에 공감했다는 빈말",
      "회사 정보 복사 후 나의 준비가 없는 문장",
      "직무 지원동기와 회사 지원동기를 따로따로 나열",
    ],
  },
  competency: {
    focus: "기술명 나열이 아니라 지식·기술·태도를 분리해 실제 수행 가능성을 보여준다.",
    materials: [
      "배운 지식과 사용 가능한 기술",
      "프로젝트에서 구현한 기능과 본인 역할",
      "오류 해결, 협업, 요구사항 확인 태도",
    ],
    structure: [
      "직무 핵심 역량을 한 문장으로 선언",
      "지식: 배운 내용과 이해한 범위",
      "기술: 구현한 기능과 사용 도구",
      "태도: 실무 수행 방식과 협업 태도",
    ],
    caseTitle: "Spring 프로젝트 역량 사례",
    caseLines: [
      "Java와 Spring MVC를 활용해 회원가입, 게시판 CRUD, DB 연동 기능을 구현했습니다.",
      "저는 유효성 검증과 예외 처리 부분을 맡아 오류 상황을 체크리스트로 관리했습니다.",
      "이 과정에서 기능 구현뿐 아니라 요구사항을 정확히 확인하는 태도가 실무 역량의 일부임을 배웠습니다.",
    ],
    avoid: [
      "Java, Spring, MySQL처럼 기술명만 나열",
      "팀 프로젝트라고만 쓰고 본인 역할이 없는 문장",
      "성과 없이 열심히 배웠다는 표현으로 마무리",
    ],
  },
  ambition: {
    focus: "막연한 포부가 아니라 인턴 기간 동안의 적응 방식, 기여 방식, 종료 시점 목표를 제시한다.",
    materials: [
      "회사 생활에 적응하는 인성·태도",
      "직무역량으로 도울 수 있는 업무",
      "3개월 또는 인턴 종료 시점의 목표",
    ],
    structure: [
      "인턴 기간의 목표를 구체적으로 제시",
      "인성·태도로 조직에 적응하는 방식 설명",
      "직무역량으로 기여할 업무 제시",
      "종료 시점 KPI나 성장 목표로 마무리",
    ],
    caseTitle: "인턴 포부 사례",
    caseLines: [
      "입사 후 3개월 안에 팀의 개발 규칙과 업무 흐름을 빠르게 익히겠습니다.",
      "처음에는 문서 정리, 테스트, 오류 재현처럼 팀에 필요한 기본 업무를 정확히 수행하겠습니다.",
      "인턴 종료 시점에는 맡은 기능을 독립적으로 처리하고 코드 리뷰 피드백을 반영할 수 있는 개발자가 되겠습니다.",
    ],
    avoid: [
      "최선을 다하겠습니다, 열심히 하겠습니다만 반복",
      "정규직 이후의 거창한 비전만 쓰기",
      "기간·업무·성과 기준이 없는 추상적 포부",
    ],
  },
};

export function MapSlide({
  clearCoach,
}: {
  clearCoach: () => void;
  coachBusy: boolean;
  coachReport: unknown;
  requestCoach: (context: string, studentInput?: string) => Promise<void>;
}) {
  const [activeCategory, setActiveCategory] = useState<SectionKey>("growth");
  const activeGuide = sectionGuides[activeCategory];
  const activeLesson = categoryLessons[activeCategory];

  return (
    <div className="fwk">
      {/* Card grid — 5 categories */}
      <div className="fwk__deck" role="tablist" aria-label="카테고리 선택">
        {sectionOrder.map((key, index) => {
          const isActive = activeCategory === key;
          return (
            <button
              className={`fwk-card${isActive ? " is-active" : ""}`}
              key={key}
              onClick={() => {
                setActiveCategory(key);
                clearCoach();
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`fwk-panel-${key}`}
              id={`fwk-tab-${key}`}
            >
              <div className="fwk-card__head">
                <span className="fwk-card__num">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="fwk-card__title">{sectionLabels[key]}</h3>
                <span className="fwk-card__target">{sectionTargets[key]}</span>
              </div>
              <div className="fwk-card__body">
                <p>
                  <span className="fwk-card__label">목적</span>
                  {categoryNotes[key].purpose}
                </p>
                <p>
                  <span className="fwk-card__label">근거</span>
                  {categoryNotes[key].evidence}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel — editorial 4-column */}
      <article
        className="fwk-panel"
        id={`fwk-panel-${activeCategory}`}
        role="tabpanel"
        aria-labelledby={`fwk-tab-${activeCategory}`}
        key={activeCategory}
      >
        <header className="fwk-panel__head">
          <h3 className="fwk-panel__title">
            <span className="fwk-panel__title-num">
              N°{(sectionOrder.indexOf(activeCategory) + 1)
                .toString()
                .padStart(2, "0")}
            </span>
            {sectionLabels[activeCategory]}
          </h3>
          <blockquote className="fwk-panel__focus">
            <span className="fwk-panel__focus-label">CORE</span>
            <em>{activeGuide.intent}</em>
          </blockquote>
        </header>

        <div className="fwk-panel__columns">
          <section className="fwk-col">
            <header className="fwk-col__head">
              <span className="fwk-col__num">01</span>
              <span className="fwk-col__title">무엇을 써야 하나</span>
            </header>
            <ul className="fwk-col__list">
              {activeLesson.materials.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="fwk-col">
            <header className="fwk-col__head">
              <span className="fwk-col__num">02</span>
              <span className="fwk-col__title">문장 구조</span>
            </header>
            <ol className="fwk-col__steps">
              {activeLesson.structure.map((line, i) => (
                <li key={line}>
                  <span className="fwk-col__step-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="fwk-col fwk-col--example">
            <header className="fwk-col__head">
              <span className="fwk-col__num">03</span>
              <span className="fwk-col__title">실제 사례</span>
            </header>
            <strong className="fwk-col__case-title">
              {activeLesson.caseTitle}
            </strong>
            <div className="fwk-col__case">
              {activeLesson.caseLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section className="fwk-col fwk-col--avoid">
            <header className="fwk-col__head">
              <span className="fwk-col__num">04</span>
              <span className="fwk-col__title">피해야 할 방식</span>
            </header>
            <ul className="fwk-col__avoid">
              <li>{categoryNotes[activeCategory].avoid}</li>
              {activeLesson.avoid.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
