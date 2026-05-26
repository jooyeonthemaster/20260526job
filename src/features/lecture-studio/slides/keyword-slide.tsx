import type { StudentProfile, ToneMode } from "@/lib/types";
import { keywordMappingRows, toneLabels } from "../content";

export function KeywordSlide({
  profile,
  strengthsText,
  strengths,
  techStack,
  setStrengthsText,
  updateProfile,
}: {
  profile: StudentProfile;
  strengthsText: string;
  techStack: string[];
  strengths: string[];
  setStrengthsText: (v: string) => void;
  updateProfile: <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K],
  ) => void;
}) {
  return (
    <div className="kform">
      <header className="kform__guide">
        <div className="kform__guide-head">
          <span className="kform__guide-num">07</span>
          <h4 className="kform__guide-title">
            여기서 입력하는 것 — AI가 자소서에 쓸 ‘압축어 + 분위기’
          </h4>
          <span className="kform__guide-meta">
            05 프로필(사실) · 06 스토리(STAR 경험) 와 겹치지 않음
          </span>
        </div>
        <div className="kform__guide-cmp">
          <div className="kform__guide-cmp-col kform__guide-cmp-col--was">
            <span className="kform__guide-cmp-tag">앞에서 입력함</span>
            <ul>
              <li>이력서 사실 정보 · 슬라이드 05</li>
              <li>STAR 경험 4단계 · 슬라이드 06</li>
            </ul>
          </div>
          <div className="kform__guide-cmp-arrow" aria-hidden>
            →
          </div>
          <div className="kform__guide-cmp-col kform__guide-cmp-col--now">
            <span className="kform__guide-cmp-tag">이 페이지에서 입력함</span>
            <ul>
              <li>
                <strong>강점 키워드</strong> — 5~7개의 압축어
              </li>
              <li>
                <strong>문장 톤</strong> — AI 초안 분위기
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* LEFT — compose */}
      <section className="kform__compose">
        <div className="kform__field">
          <header className="kform__field-head">
            <span className="kform__field-num">01</span>
            <label className="kform__field-label" htmlFor="kw-strengths">
              강점 키워드
            </label>
            <span className="kform__field-meta">5~7개 권장</span>
          </header>
          <p className="kform__field-hint">
            장점 단어를 쉼표·줄바꿈으로 구분해 적습니다. 9가지 인재상의 어느
            칸에 본인 강점이 들어갈지 정하고 그 칸을 채우는 단어를 씁니다.
          </p>
          <textarea
            id="kw-strengths"
            className="kform__textarea"
            rows={3}
            value={strengthsText}
            onChange={(e) => setStrengthsText(e.target.value)}
            placeholder="예) 책임감, 소통, 끈기, 치밀함, 주인의식"
            spellCheck={false}
          />
        </div>

        <div className="kform__field">
          <header className="kform__field-head">
            <span className="kform__field-num">02</span>
            <label className="kform__field-label" htmlFor="kw-tone">
              문장 톤
            </label>
            <span className="kform__field-meta">초안 분위기</span>
          </header>
          <p className="kform__field-hint">
            지원 산업·직무·기업 분위기에 맞춰 AI 초안 톤을 정합니다.
          </p>
          <div className="kform__select-wrap">
            <select
              id="kw-tone"
              className="kform__select"
              value={profile.tone}
              onChange={(e) =>
                updateProfile("tone", e.target.value as ToneMode)
              }
            >
              {Object.entries(toneLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <aside className="kform__note">
          <span className="kform__note-tag">WHY KEYWORDS</span>
          <p>
            키워드는 장식이 아니라 경험을 묶는 압축어입니다. 강점 키워드 → STAR
            경험 → 자소서 항목으로 이어지도록 설계합니다.
          </p>
        </aside>
      </section>

      {/* RIGHT — insights / read-only visualizations */}
      <section className="kform__insights">
        <article className="kchips">
          <header className="kchips__head">
            <span className="kchips__num">A</span>
            <h4 className="kchips__title">강점</h4>
            <span className="kchips__count">
              {strengths.length}
              <em>개</em>
            </span>
          </header>
          <div className="kchips__flow">
            {strengths.length === 0 ? (
              <span className="kchips__empty">
                왼쪽 키워드 입력칸을 채우면 여기에 칩으로 나타납니다.
              </span>
            ) : (
              strengths.map((kw) => (
                <span className="kchip" key={kw}>
                  {kw}
                </span>
              ))
            )}
          </div>
        </article>

        <article className="kchips kchips--tech">
          <header className="kchips__head">
            <span className="kchips__num">B</span>
            <h4 className="kchips__title">기술 스택</h4>
            <span className="kchips__count">
              {techStack.length}
              <em>개</em> · 프로필 05에서 자동
            </span>
          </header>
          <div className="kchips__flow">
            {techStack.length === 0 ? (
              <span className="kchips__empty">
                슬라이드 05 프로필의 기술 6칸을 채우면 여기에 칩으로 표시됩니다.
              </span>
            ) : (
              techStack.map((tech) => (
                <span className="kchip kchip--tech" key={tech}>
                  {tech}
                </span>
              ))
            )}
          </div>
        </article>

        <article className="kmap">
          <header className="kmap__head">
            <span className="kmap__num">C</span>
            <h4 className="kmap__title">키워드 매핑 예시</h4>
            <span className="kmap__sub">키워드 → 에피소드 → 항목</span>
          </header>
          <div className="kmap__rows">
            {keywordMappingRows.map((row) => (
              <div className="kmap__row" key={row.keyword}>
                <strong className="kmap__keyword">{row.keyword}</strong>
                <span className="kmap__episode">{row.episode}</span>
                <em className="kmap__section">{row.section}</em>
              </div>
            ))}
          </div>
        </article>

      </section>
    </div>
  );
}
