import type { CoachReport } from "../types";

export function CoachResult({ report }: { report: CoachReport | null }) {
  if (!report) {
    return (
      <div className="coach-result empty">
        <span>AI 피드백 대기</span>
        <p>학생 메모를 넣고 버튼을 누르면 강의 공식 기준으로 바로 점검합니다.</p>
      </div>
    );
  }

  return (
    <div className="coach-result">
      <span>{report.context}</span>
      <strong>{report.headline}</strong>
      <div className="coach-result-grid">
        <div>
          <h5>강점</h5>
          {report.strengths.slice(0, 2).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <div>
          <h5>보완</h5>
          {report.risks.slice(0, 2).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
      {report.rewrite && (
        <div className="coach-rewrite">
          <h5>예시 문장</h5>
          <p>{report.rewrite}</p>
        </div>
      )}
      {report.questions && report.questions.length > 0 && (
        <div className="coach-rewrite">
          <h5>추가 질문</h5>
          {report.questions.slice(0, 2).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      )}
      <div className="coach-actions-list">
        {report.nextActions.slice(0, 3).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}
