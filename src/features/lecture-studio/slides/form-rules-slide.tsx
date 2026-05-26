import { AlignLeft, Eraser, FilePen, Type } from "lucide-react";
import type { ComponentType } from "react";
import { formRules } from "@/lib/lecture-data";

const iconMap: Record<string, ComponentType<{ size?: number }>> = {
  FilePen,
  AlignLeft,
  Eraser,
  Type,
};

export function FormRulesSlide() {
  return (
    <div className="form-rules-layout">
      <div className="format-compare">
        <div className="mini-doc bad-doc">
          <strong>감점 위험</strong>
          <p className="red-line">붉은 안내 문구가 남아 있음</p>
          <p>1) 들여쓰기 불일치</p>
          <p>글꼴·크기 혼용</p>
          <p className="thin">형식이 깨지면 내용 신뢰도도 같이 내려갑니다.</p>
        </div>
        <div className="mini-doc good-doc">
          <strong>제출본</strong>
          <p>항목 제목과 본문 정렬</p>
          <p>안내 문구 삭제</p>
          <p>글꼴·크기 통일</p>
          <p className="thin">읽는 사람이 바로 평가할 수 있는 문서입니다.</p>
        </div>
      </div>
      <div className="rule-grid">
        {formRules.map((rule, idx) => {
          const Icon = iconMap[rule.icon] || FilePen;
          return (
            <div className="rule-card" key={rule.title}>
              <span className="num">{String(idx + 1).padStart(2, "0")}</span>
              <div className="pad">
                <Icon size={20} />
              </div>
              <h3>{rule.title}</h3>
              <p>{rule.detail}</p>
              <ul>
                {rule.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
