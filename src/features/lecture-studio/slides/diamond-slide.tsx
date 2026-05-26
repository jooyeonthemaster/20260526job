import type { DiamondStep } from "@/lib/types";

export function DiamondSlide({
  steps,
  cautions,
  tone,
}: {
  steps: DiamondStep[];
  cautions: string[];
  tone: "motivation" | "ambition";
}) {
  const template =
    tone === "motivation"
      ? "저는 ___ 경험으로 직무에 관심을 갖고, ___ 훈련에서 ___ 기술을 익혔으며, ___ 업무에 기여하고자 지원했습니다."
      : "저는 ___ 태도로 팀에 적응하고, ___ 역량으로 ___ 업무에 기여하며, 3개월 후 ___ 지표를 만들겠습니다.";

  return (
    <div className="diamond-layout">
      <div className={`formula-hero ${tone}`}>
        <span>{tone === "motivation" ? "지원동기 문장 템플릿" : "입사 후 포부 문장 템플릿"}</span>
        <strong>{template}</strong>
      </div>
      <div className={`diamond-rail ${steps.length === 5 ? "five" : "three"}`}>
        {steps.map((step) => (
          <div
            className="diamond-step"
            key={step.number}
            style={{ ["--accent" as string]: step.accent }}
          >
            <div className="diamond-mark">
              <span>{step.number}</span>
            </div>
            <h3>{step.title}</h3>
            <p className="detail">{step.detail}</p>
            <div className="example">ex) {step.example}</div>
          </div>
        ))}
      </div>
      <div className="cautions-strip">
        <h4>
          {tone === "motivation"
            ? "지원동기 작성 시 유의사항"
            : "입사 후 포부 작성 시 유의사항"}
        </h4>
        <ul>
          {cautions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
