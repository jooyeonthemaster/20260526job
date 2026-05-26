"use client";

import type { CSSProperties } from "react";

const fx = (delay: number): CSSProperties =>
  ({ ["--fx-delay" as never]: `${delay}ms` } as CSSProperties);

export function WhySlide() {
  return (
    <div className="why-section">
      <article className="why-bubble fx" style={fx(120)}>
        {/* Top strip: live indicator + counter */}
        <header className="why-bubble__head">
          <span className="why-bubble__live">
            <span className="why-bubble__pulse" aria-hidden />
            <span>Now Speaking</span>
          </span>
          <span className="why-bubble__counter">N°02 · 01/02</span>
        </header>

        <span className="why-bubble__divider" aria-hidden />

        {/* Body */}
        <div className="why-bubble__body">
          <p className="why-bubble__lead fx" style={fx(280)}>
            스토리는 있지만 정리가 안 되는,
          </p>

          <h3 className="why-bubble__headline fx" style={fx(440)}>
            <em>항목별 자기소개서</em>
            <br />
            <em>작성 방법.</em>
          </h3>
        </div>

        {/* Footer */}
        <footer className="why-bubble__foot fx" style={fx(640)}>
          <span className="why-bubble__rule" aria-hidden />
          <span className="why-bubble__byline">지금부터 알려드릴게요</span>
          <span className="why-bubble__arrow" aria-hidden>
            <svg viewBox="0 0 18 12" fill="none">
              <path
                d="M 0 6 L 16 6 M 11 1 L 16 6 L 11 11"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </footer>
      </article>
    </div>
  );
}
