import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, XCircle } from "lucide-react";
import { talentArchetypes } from "@/lib/lecture-data";
import { talentDetailCards, talentProofPrompts, talentSectionMap } from "../content";
import type { CoachReport, CoachRequest } from "../types";
import { CoachResult } from "../shared/coach-result";

export function TalentSlide({
  clearCoach,
  coachBusy,
  coachReport,
  requestCoach,
}: {
  clearCoach: () => void;
  coachBusy: boolean;
  coachReport: CoachReport | null;
  requestCoach: (context: string, studentInput?: string) => Promise<void>;
}) {
  const [activeTalent, setActiveTalent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [talentNotes, setTalentNotes] = useState<Record<number, string>>({});
  const selectedTalent = talentArchetypes[activeTalent];
  const selectedDetail = talentDetailCards[activeTalent];
  const selectedNote = talentNotes[activeTalent] || "";

  useEffect(() => {
    if (!modalOpen) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [modalOpen]);

  return (
    <div className="talent-slide">
      <div className="talent-layout">
        {talentArchetypes.map((t, index) => (
          <button
            className="talent-card"
            key={t.name}
            onClick={() => {
              setActiveTalent(index);
              setModalOpen(true);
              clearCoach();
            }}
            type="button"
            style={{ ["--accent" as string]: t.accent }}
          >
            <div className="talent-head">
              <div>
                <h4>{t.name}</h4>
                <small>{t.sub}</small>
              </div>
              <span className="talent-dot" />
            </div>
            <div className="talent-section">
              <span>자소서 연결</span>
              <strong>{talentSectionMap[index]}</strong>
            </div>
            <p className="talent-proof">{talentProofPrompts[index]}</p>
            <div className="talent-keywords">
              {t.keywords.map((kw) => (
                <span key={kw}>{kw}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="talent-flow">
        <span>직무공고 요구역량</span>
        <ArrowRight size={16} />
        <span>인재상 키워드 선택</span>
        <ArrowRight size={16} />
        <span>내 STAR 경험으로 증명</span>
      </div>
      {modalOpen && (
        <div
          className="talent-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedTalent.name} 상세 보기`}
          onClick={(event) => {
            if (event.currentTarget === event.target) setModalOpen(false);
          }}
        >
          <div
            className="talent-modal"
            style={{ ["--accent" as string]: selectedTalent.accent }}
          >
            <button
              className="modal-close"
              onClick={() => setModalOpen(false)}
              aria-label="인재상 상세 닫기"
              type="button"
            >
              <XCircle size={14} />
              닫기
            </button>
            <div className="modal-copy">
              <span className="detail-eyebrow">인재상 상세</span>
              <h3>{selectedTalent.name}</h3>
              <p>{talentProofPrompts[activeTalent]}</p>
              <div className="modal-keywords">
                {selectedTalent.keywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </div>
            <div className="modal-grid">
              <div>
                <h4>증명 자료</h4>
                <p>{selectedDetail.proof}</p>
              </div>
              <div>
                <h4>감점 위험</h4>
                <p>{selectedDetail.risk}</p>
              </div>
              <div>
                <h4>학생 질문</h4>
                <p>{selectedDetail.question}</p>
              </div>
            </div>
            <textarea
              className="coach-textarea"
              placeholder="이 인재상과 연결할 내 STAR 경험을 적어보세요."
              value={selectedNote}
              onChange={(event) =>
                setTalentNotes((prev) => ({
                  ...prev,
                  [activeTalent]: event.target.value,
                }))
              }
            />
            <div className="modal-coach-row">
              <button
                className="coach-action"
                disabled={coachBusy}
                onClick={() => {
                  void requestCoach(
                    `인재상 ${selectedTalent.name}을 자기소개서 ${talentSectionMap[activeTalent]} 항목에 연결할 수 있는지 점검`,
                    selectedNote || selectedDetail.question,
                  );
                }}
                type="button"
              >
                <Sparkles size={14} />
                {coachBusy ? "점검 중" : "AI로 경험 점검"}
              </button>
              <CoachResult report={coachReport} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
