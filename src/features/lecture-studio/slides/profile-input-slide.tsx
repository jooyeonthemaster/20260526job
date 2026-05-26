import { RotateCcw } from "lucide-react";
import type { StudentProfile } from "@/lib/types";

type Updater = <K extends keyof StudentProfile>(
  key: K,
  value: StudentProfile[K],
) => void;

type TechPreset = {
  key: string;
  label: string;
  sub: string;
  techOSDB: string;
  techTools: string;
  techLanguages: string;
  techWeb: string;
  techFramework: string;
  techApp: string;
};

const techPresets: TechPreset[] = [
  {
    key: "dev",
    label: "개발",
    sub: "백엔드 · 프론트",
    techOSDB: "Windows 10, Linux, Oracle, MySQL",
    techTools: "IntelliJ, VSCode, Git, Postman",
    techLanguages: "Java, Python, JavaScript",
    techWeb: "HTML, CSS, REST API, 웹 접근성",
    techFramework: "Spring, React, Node.js, MyBatis",
    techApp: "정보처리기사, AWS SAA",
  },
  {
    key: "design",
    label: "디자인",
    sub: "UI/UX · 그래픽",
    techOSDB: "macOS, Windows, Figma 공유 라이브러리",
    techTools: "Figma, Adobe Photoshop, Illustrator, After Effects",
    techLanguages: "디자인 시스템, 타이포그래피, 컬러 이론",
    techWeb: "UX 원칙, 웹 접근성(WCAG), 반응형 그리드",
    techFramework: "디자인 씽킹, 더블 다이아몬드, 8-Point Grid",
    techApp: "GTQ, 컬러리스트 산업기사, ACA",
  },
  {
    key: "marketing",
    label: "마케팅",
    sub: "퍼포먼스 · 콘텐츠",
    techOSDB: "GA4, GTM, Meta Pixel, BigQuery",
    techTools: "Google Ads, Meta Ads Manager, Naver SA, Slack",
    techLanguages: "SEO, 퍼포먼스 광고, 콘텐츠 마케팅",
    techWeb: "데이터 기반 의사결정, 디지털 마케팅 기초",
    techFramework: "STP, 4P, 그로스 해킹(AARRR)",
    techApp: "Google Analytics Cert., Meta Blueprint",
  },
  {
    key: "sales",
    label: "영업",
    sub: "B2B · 솔루션",
    techOSDB: "Salesforce, HubSpot, MS Office",
    techTools: "Salesforce, HubSpot, Excel, Zoom",
    techLanguages: "B2B 영업 프로세스, 협상 스킬",
    techWeb: "고객 가치 제안(CVP), CRM 운영",
    techFramework: "SPIN Selling, MEDDIC, BANT",
    techApp: "토익 900+, 영업 관련 자격",
  },
  {
    key: "finance",
    label: "회계 · 재무",
    sub: "회계 · 세무",
    techOSDB: "Windows, SAP, Oracle ERP",
    techTools: "Excel(고급 함수·VBA), 더존, Hyperion",
    techLanguages: "재무회계, 관리회계, 세무",
    techWeb: "K-IFRS, 세법, 내부통제(SOX)",
    techFramework: "재무비율 분석, DCF, 손익분기점 분석",
    techApp: "전산회계 1급, 재경관리사, AICPA",
  },
  {
    key: "hr",
    label: "HR",
    sub: "채용 · 운영",
    techOSDB: "Windows, ATS(사람인·잡코리아)",
    techTools: "Notion, Slack, MS Teams, Greenhouse",
    techLanguages: "인사 운영, 채용·온보딩, 노무 기본",
    techWeb: "노동법, 인사평가 체계, 조직문화",
    techFramework: "OKR, 성과관리, 9-Box, 직무분석",
    techApp: "공인노무사, HRM/HRD 자격",
  },
  {
    key: "consulting",
    label: "컨설팅",
    sub: "전략 · 기획",
    techOSDB: "Windows, macOS",
    techTools: "PowerPoint(고급), Excel(피벗·VBA), Tableau",
    techLanguages: "전략 분석, 시장조사, 정성·정량 분석",
    techWeb: "산업 분석, 경쟁사 벤치마킹",
    techFramework: "MECE, 3C, 5 Forces, BCG Matrix, SCQA",
    techApp: "토익 900+, MBA, 컨설턴트 자격",
  },
  {
    key: "data",
    label: "데이터",
    sub: "분석 · 사이언스",
    techOSDB: "Linux, MySQL, PostgreSQL, BigQuery",
    techTools: "Python(Jupyter), R, Tableau, Power BI",
    techLanguages: "SQL, Python, R, 통계 기초",
    techWeb: "데이터 시각화, A/B 테스트, ML 기초",
    techFramework: "Pandas, scikit-learn, dbt, Airflow",
    techApp: "ADsP, SQLD, Google Data Analytics Cert.",
  },
  {
    key: "pm",
    label: "기획 · PM",
    sub: "프로덕트 · 서비스",
    techOSDB: "Notion, Confluence, Jira",
    techTools: "Figma, Miro, Notion, Slack, Jira",
    techLanguages: "사용자 리서치, 요구사항 정의, 데이터 분석 기초",
    techWeb: "UX 리서치, KPI 설계, 서비스 기획",
    techFramework: "Lean Startup, Agile/Scrum, JTBD, Kano",
    techApp: "정보처리기사, Google UX Cert.",
  },
];

export function ProfileInputSlide({
  profile,
  updateProfile,
  clearProfile,
}: {
  profile: StudentProfile;
  updateProfile: Updater;
  clearProfile: () => void;
}) {
  const Bind = (key: keyof StudentProfile) =>
    ({
      value: (profile[key] as string) || "",
      onChange: (v: string) =>
        updateProfile(key as keyof StudentProfile, v as never),
    }) as const;

  const techFields: (keyof StudentProfile)[] = [
    "techOSDB",
    "techTools",
    "techLanguages",
    "techWeb",
    "techFramework",
    "techApp",
  ];

  const activePresetKey = techPresets.find((p) =>
    techFields.every((f) => (profile[f] as string) === (p as never)[f]),
  )?.key;

  const applyPreset = (preset: TechPreset) => {
    techFields.forEach((field) => {
      updateProfile(field, (preset as never)[field]);
    });
  };

  const clearPreset = () => {
    techFields.forEach((field) => updateProfile(field, "" as never));
  };

  const isPristine = (Object.keys(profile) as (keyof StudentProfile)[])
    .filter((k) => k !== "tone")
    .every((k) => (profile[k] as string) === "");

  return (
    <div className="pform">
      <div className="pform__topbar">
        <div className="pform__topbar-text">
          <span className="pform__topbar-tag">START</span>
          <p>
            기본 우수 사례가 미리 채워져 있습니다. 본인 정보로 덮어쓰거나,
            오른쪽 버튼으로 모두 비우고 처음부터 입력하세요.
          </p>
        </div>
        <button
          type="button"
          className="pform__topbar-clear"
          onClick={() => {
            if (isPristine) return;
            if (
              window.confirm(
                "모든 프로필 입력을 비웁니다. 계속할까요?",
              )
            ) {
              clearProfile();
            }
          }}
          disabled={isPristine}
        >
          <RotateCcw size={12} strokeWidth={2.2} />
          전체 비우기
        </button>
      </div>

      <Section num="01" title="개인 신상" meta="7 fields">
        <Field label="성명 (한글)" {...Bind("name")} />
        <Field label="한자" {...Bind("nameHanja")} />
        <Field label="영문" {...Bind("nameEng")} />
        <Field label="생년월일" placeholder="YYYY.MM.DD" {...Bind("birth")} />
        <Field
          label="연락처"
          placeholder="010-0000-0000"
          {...Bind("phone")}
        />
        <Field
          label="이메일"
          placeholder="example@email.com"
          {...Bind("email")}
        />
        <Field
          label="주소"
          span="full"
          placeholder="시·구·동, 상세주소"
          {...Bind("address")}
        />
      </Section>

      <Section num="02" title="지원 정보" meta="4 fields">
        <Field
          label="지원 직무"
          placeholder="예) 웹 백엔드 개발자"
          {...Bind("targetRole")}
        />
        <Field
          label="지원 기업"
          placeholder="기업명"
          {...Bind("company")}
        />
        <Field
          label="산업 / 분야"
          placeholder="예) IT 서비스"
          {...Bind("industry")}
        />
        <Field
          label="신입 / 경력"
          placeholder="신입 / 3년차"
          {...Bind("careerType")}
        />
      </Section>

      <Section num="03" title="학력 사항" meta="4 fields">
        <Field
          label="대학교 / 전공"
          placeholder="OOO 대학교 OOO 학과 졸업"
          {...Bind("university")}
        />
        <Field
          label="대학 재학 기간"
          placeholder="YYYY.MM ~ YYYY.MM"
          {...Bind("universityPeriod")}
        />
        <Field
          label="고등학교"
          placeholder="OOO 고등학교 졸업"
          {...Bind("highschool")}
        />
        <Field
          label="고등학교 기간"
          placeholder="YYYY.MM ~ YYYY.MM"
          {...Bind("highschoolPeriod")}
        />
      </Section>

      <Section num="04" title="자격 · 어학 · 병역" meta="optional">
        <Area
          label="자격사항"
          span="full"
          rows={2}
          placeholder="정보처리기사 [한국산업인력공단] YYYY.MM"
          {...Bind("certificates")}
        />
        <Field
          label="어학"
          placeholder="자격명 · 등급"
          {...Bind("language")}
        />
        <Field
          label="병역사항"
          placeholder="OO 병장 만기 전역 · YYYY.MM"
          {...Bind("military")}
        />
      </Section>

      <Section num="05" title="교육 및 연수" meta="훈련 과정">
        <Field
          label="교육 과정명 / 기관"
          span="full"
          {...Bind("education")}
        />
        <Field
          label="교육 기간"
          placeholder="YYYY.MM ~ YYYY.MM (0개월)"
          {...Bind("trainingPeriod")}
        />
        <Field
          label="교육 시간"
          placeholder="0,000 시간"
          {...Bind("trainingHours")}
        />
        <Area
          label="훈련 내용 (Java / Spring / DB 등)"
          span="full"
          rows={2}
          {...Bind("training")}
        />
      </Section>

      <Section
        num="06"
        title="사용 가능 기술 · 도구"
        meta="직군 무관 · 6 항목"
        extra={
          <div className="pform__presets" role="group" aria-label="직군 프리셋">
            <div className="pform__presets-head">
              <span className="pform__presets-label">직군 프리셋</span>
              <span className="pform__presets-hint">
                클릭 한 번으로 6개 칸을 직군 표준 예시로 채웁니다 · 이후 자유롭게
                수정
              </span>
              {activePresetKey && (
                <button
                  type="button"
                  className="pform__presets-clear"
                  onClick={clearPreset}
                >
                  비우기
                </button>
              )}
            </div>
            <div className="pform__presets-row">
              {techPresets.map((p) => {
                const isActive = p.key === activePresetKey;
                return (
                  <button
                    key={p.key}
                    type="button"
                    className={`pform__preset${
                      isActive ? " is-active" : ""
                    }`}
                    onClick={() => applyPreset(p)}
                    title={p.sub}
                  >
                    <span className="pform__preset-label">{p.label}</span>
                    <span className="pform__preset-sub">{p.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        }
      >
        <Field
          label="주요 환경 / 플랫폼"
          placeholder="개발 예) Windows · Oracle · AWS / 디자인 예) macOS · Figma / 마케팅 예) GA4 · GTM"
          {...Bind("techOSDB")}
        />
        <Field
          label="사용 도구 (Tool)"
          placeholder="개발 예) IntelliJ · VSCode / 디자인 예) Figma · Adobe CC / 영업 예) Salesforce · HubSpot"
          {...Bind("techTools")}
        />
        <Field
          label="전문 언어 · 기술"
          placeholder="개발 예) Java · Python / 회계 예) IFRS · K-IFRS / 마케팅 예) SEO · 퍼포먼스 광고"
          {...Bind("techLanguages")}
        />
        <Field
          label="분야 표준 · 지식"
          placeholder="개발 예) HTML/CSS · 웹접근성 / HR 예) 노동법 / 회계 예) GAAP / 디자인 예) UX 원칙"
          {...Bind("techWeb")}
        />
        <Field
          label="프레임워크 · 방법론"
          placeholder="개발 예) Spring · MyBatis / 운영 예) Scrum · OKR / 마케팅 예) STP · 4P / 컨설팅 예) MECE"
          {...Bind("techFramework")}
        />
        <Field
          label="추가 기술 · 역량"
          placeholder="자격증, 어학, 부가 도구 · 예) 정보처리기사 / 토익 900 / Android · GA4 인증"
          {...Bind("techApp")}
        />
      </Section>

      <Section num="07" title="대표 프로젝트" meta="업무 관련">
        <Field
          label="프로젝트 제목"
          span="full"
          {...Bind("project")}
        />
        <Field
          label="수행 기간 / 소속"
          placeholder="중앙정보기술인재개발원 · YYYY.MM ~ YYYY.MM"
          span="full"
          {...Bind("projectPeriod")}
        />
        <Area
          label="간단 설명 (1~2줄, 본인 역할 포함)"
          span="full"
          rows={2}
          {...Bind("projectDescription")}
        />
      </Section>

      <Section num="08" title="경력 · 활동" meta="optional">
        <Area
          label="경력사항 (인턴·아르바이트 포함)"
          span="full"
          rows={3}
          placeholder={"OOO 강사 · OOOO입시학원 · YYYY.MM ~ YYYY.MM\n- 업무 내용 및 성과"}
          {...Bind("career")}
        />
        <Area
          label="수상 경력"
          rows={2}
          placeholder="성적장학금 1회 수여 · OOO 대학교 · YYYY.MM"
          {...Bind("awards")}
        />
        <Area
          label="대내외 활동"
          rows={2}
          placeholder="교내 컴퓨터 동아리 활동 · OOO 대학교"
          {...Bind("activities")}
        />
        <Area
          label="봉사활동"
          span="full"
          rows={2}
          placeholder="OOO 동행봉사 참여 · YYYY.MM ~ YYYY.MM"
          {...Bind("volunteer")}
        />
        <Area
          label="추천 사항"
          span="full"
          rows={2}
          placeholder="기관명 · 추천인 · 추천 내용"
          {...Bind("recommendation")}
        />
      </Section>

      <Section num="09" title="자기소개서 핵심 단서" meta="해석을 위한 입력">
        <Area
          label="가치관 한 문장 (성장과정 항목 핵심)"
          span="full"
          rows={2}
          {...Bind("value")}
        />
        <Area
          label="함께하고 싶은 팀 (입사 후 포부 활용)"
          span="full"
          rows={2}
          {...Bind("desiredTeam")}
        />
      </Section>
    </div>
  );
}

function Section({
  num,
  title,
  meta,
  children,
  extra,
}: {
  num: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <section className="pform__section">
      <header className="pform__sect-head">
        <span className="pform__sect-num">{num}</span>
        <h4 className="pform__sect-title">{title}</h4>
        {meta && <span className="pform__sect-meta">{meta}</span>}
      </header>
      {extra}
      <div className="pform__grid">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  span,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  span?: "full";
}) {
  return (
    <div
      className={`pinput${span === "full" ? " pinput--full" : ""}`}
    >
      <label className="pinput__label">{label}</label>
      <input
        className="pinput__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 2,
  placeholder,
  span,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  span?: "full";
}) {
  return (
    <div className={`pinput${span === "full" ? " pinput--full" : ""}`}>
      <label className="pinput__label">{label}</label>
      <textarea
        className="pinput__area"
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}
