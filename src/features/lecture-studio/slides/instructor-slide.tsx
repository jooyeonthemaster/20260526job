import type { CSSProperties } from "react";
import Image from "next/image";
import { instructor } from "@/lib/lecture-data";
import { instructorProofs } from "../content";
import { highlightHeadword } from "../utils";

const fx = (delay: number): CSSProperties =>
  ({ ["--fx-delay" as never]: `${delay}ms` } as CSSProperties);

export function InstructorSlide() {
  return (
    <div className="instructor">
      <section className="instructor__hero">
        <figure className="instructor__portrait">
          <Image
            src="/kihong-profile.png"
            alt="김기홍 강사"
            width={520}
            height={650}
            priority
            className="instructor__portrait-img"
          />
          <figcaption className="instructor__plate">
            <span className="instructor__plate-mark">N°01</span>
            <span className="instructor__plate-sep" aria-hidden>·</span>
            <span className="instructor__plate-text">Instructor</span>
          </figcaption>
        </figure>

        <div className="instructor__headline">
          <span className="instructor__eyebrow fx" style={fx(180)}>
            A Lecture by
          </span>
          <h3 className="instructor__name fx" style={fx(260)}>
            {instructor.name}
          </h3>
          <ul className="instructor__titles fx" style={fx(360)}>
            {instructor.titles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <hr className="instructor__rule fx" style={fx(440)} />
          <blockquote className="instructor__quote fx" style={fx(520)}>
            “영혼 없는 자소서”의 문제는 스토리 부재가 아니라{" "}
            <em>배치와 해석의 부재</em>입니다.
            <br />
            경험을 항목별 역할에 맞게 나누고, 인성·태도와 직무역량을 분리해
            설득력 있는 문장으로 정리합니다.
          </blockquote>
        </div>
      </section>

      <section
        className="instructor__ledger fx"
        style={fx(680)}
        aria-label="Practice Domains"
      >
        <header className="instructor__rowhead">
          <span className="instructor__rowhead-rule" aria-hidden />
          <span className="instructor__rowhead-count">
            ·{instructorProofs.length.toString().padStart(2, "0")}
          </span>
        </header>
        <ol className="instructor__ledger-list">
          {instructorProofs.map((item, i) => (
            <li key={item.title} className="instructor__ledger-row">
              <span className="instructor__ledger-num">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <span className="instructor__ledger-title">{item.title}</span>
              <p className="instructor__ledger-detail">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="instructor__career fx"
        style={fx(820)}
        aria-label="Career"
      >
        <header className="instructor__rowhead">
          <span className="instructor__rowhead-label">Career</span>
          <span className="instructor__rowhead-rule" aria-hidden />
          <span className="instructor__rowhead-count">
            ·{instructor.bullets.length.toString().padStart(2, "0")}
          </span>
        </header>
        <ul className="instructor__career-list">
          {instructor.bullets.map((line) => (
            <li key={line}>{highlightHeadword(line)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
