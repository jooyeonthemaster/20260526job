import { AlertCircle, BookOpen, ClipboardCheck, FilePen, Target } from "lucide-react";
import { sectionGuides, sectionLabels, sectionOrder, sectionTargets } from "@/lib/lecture-data";
import type { SectionKey } from "@/lib/types";
import { categoryOutputs } from "../content";

export function PlannerSlide({
  activeSection,
  setActiveSection,
}: {
  activeSection: SectionKey;
  setActiveSection: (key: SectionKey) => void;
}) {
  const guide = sectionGuides[activeSection];

  return (
    <div className="planner-layout">
      <div className="section-rail">
        {sectionOrder.map((key) => (
          <button
            key={key}
            className={activeSection === key ? "active" : ""}
            onClick={() => setActiveSection(key)}
          >
            <span className="label">{sectionLabels[key]}</span>
            <span className="target">{sectionTargets[key]}</span>
            <span className="mode">
              {key === "competency"
                ? "역량 축"
                : key === "personality" || key === "growth"
                  ? "인성·태도"
                  : "선택 문항"}
            </span>
          </button>
        ))}
      </div>
      <div className="planner-detail">
        <div className="intent-card">
          <div className="icon-pad">
            <Target size={20} />
          </div>
          <div>
            <h3>{sectionLabels[activeSection]}</h3>
            <p>{guide.intent}</p>
          </div>
        </div>
        <div className="detail-col">
          <h4>
            <FilePen size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
            문장 공식
          </h4>
          {guide.formula.map((line, idx) => (
            <p key={line}>
              <span>{String(idx + 1).padStart(2, "0")}</span>
              {line}
            </p>
          ))}
        </div>
        <div className="detail-col">
          <h4>
            <BookOpen size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
            근거 자료
          </h4>
          {guide.evidence.map((line, idx) => (
            <p key={line}>
              <span>{String(idx + 1).padStart(2, "0")}</span>
              {line}
            </p>
          ))}
        </div>
        <div className="detail-col cautions" style={{ gridColumn: "1 / -1" }}>
          <h4 style={{ color: "var(--rose)" }}>
            <AlertCircle size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
            피해야 할 함정
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {guide.cautions.map((line, idx) => (
              <p key={line}>
                <span>{String(idx + 1).padStart(2, "0")}</span>
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className="blueprint-card">
          <h4>
            <ClipboardCheck size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
            작성 캔버스
          </h4>
          <div className="blueprint-grid">
            <p>
              <span>한 줄 소제목</span>
              <strong>{sectionLabels[activeSection]}의 핵심 가치를 압축</strong>
            </p>
            <p>
              <span>본문 근거</span>
              <strong>{guide.evidence[0]}</strong>
            </p>
            <p>
              <span>마무리 방향</span>
              <strong>{categoryOutputs[activeSection]}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
