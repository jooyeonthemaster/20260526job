export function IntroSlide() {
  return (
    <div className="intro-hero">
      {/* Spline scene is rendered persistently in lecture-studio.tsx */}
      <div className="intro-hero__veil" aria-hidden />
      <div className="intro-hero__overlay">
        <span className="intro-hero__eyebrow">AI Cover Letter Lecture</span>
        <h3 className="intro-hero__title">
          AI 시대
          <br />
          자기소개서 작성법
        </h3>
        <p className="intro-hero__byline">— 김 기 홍 —</p>
      </div>
    </div>
  );
}
