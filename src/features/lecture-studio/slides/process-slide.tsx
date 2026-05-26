import { Compass, Filter, Layers3, Lightbulb, Sparkles, Target } from "lucide-react";

export function ProcessSlide() {
  const steps = [
    { num: "01", title: "문항 요구 파악", desc: "필수·선택 항목과 분량 확인", accent: "#6366f1", icon: Layers3 },
    { num: "02", title: "인성 + 역량 분리", desc: "태도 문장과 기술 문장 구분", accent: "#8b5cf6", icon: Filter },
    { num: "03", title: "Key word 선정", desc: "직무공고에서 증명할 단어 선택", accent: "#ec4899", icon: Target },
    { num: "04", title: "STAR 매칭", desc: "경험을 상황·행동·결과로 압축", accent: "#06b6d4", icon: Lightbulb },
    { num: "05", title: "시점 정렬", desc: "훈련 전·중·후 변화가 보이게", accent: "#10b981", icon: Compass },
  ] as const;

  return (
    <div className="process-layout">
      <div className="process-rail">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              className="process-node"
              key={s.num}
              style={{ ["--accent" as string]: s.accent }}
            >
              <div className="ring">
                <Icon size={20} />
              </div>
              <h4>
                <span style={{ fontFamily: "var(--mono)", color: s.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>
                  {s.num}
                </span>
                <br />
                {s.title}
              </h4>
              <p>{s.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="process-detail">
        <div className="transform-card input">
          <h3>입력 데이터</h3>
          <ol className="numbered-list">
            <li>지원분야, 교육 과정, 사용 가능 기술</li>
            <li>프로젝트명, 개발환경, 본인 역할</li>
            <li>경력·아르바이트·대외활동의 구체 행동</li>
            <li>시간 단축, 오류 감소, 개선 비율 같은 정량 성과</li>
          </ol>
          <div className="process-example">
            <span>입력 원칙</span>
            <strong>기술명만 쓰지 말고 기능·역할·결과를 함께 적습니다.</strong>
          </div>
        </div>
        <div className="transform-card judge">
          <h3>판단 기준</h3>
          <ol className="numbered-list">
            <li>이 경험이 인성·태도인지 직무역량인지 먼저 분류</li>
            <li>문항에서 요구한 분량과 시점에 맞는 경험만 선택</li>
            <li>키워드가 문장 안에서 증명되는지 검수</li>
            <li>막연한 다짐보다 행동과 결과가 보이는지 확인</li>
          </ol>
          <div className="process-example">
            <span>검수 원칙</span>
            <strong>좋은 말보다 평가자가 확인할 수 있는 단서를 남깁니다.</strong>
          </div>
        </div>
        <div className="transform-card output">
          <h3>
            <Sparkles size={14} style={{ verticalAlign: "middle", marginRight: 6, color: "var(--indigo)" }} />
            산출 문장
          </h3>
          <ol className="numbered-list">
            <li>성장과정: 가치관이 만들어진 사건과 현재 태도</li>
            <li>직무역량: 기술을 적용한 기능·역할·결과</li>
            <li>지원동기: 직무 선택 계기와 회사 업무의 연결</li>
            <li>입사 후 포부: 인턴 기간의 행동 목표와 KPI</li>
          </ol>
          <div className="process-example">
            <span>출력 원칙</span>
            <strong>첫 문장만 읽어도 항목의 답이 보이게 만듭니다.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
