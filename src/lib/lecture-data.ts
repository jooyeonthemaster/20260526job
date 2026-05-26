import type {
  BeforeAfterExample,
  DiamondStep,
  DraftSections,
  FormRule,
  SectionGuide,
  SectionKey,
  SlideMeta,
  StoryInput,
  StudentProfile,
  TalentArchetype,
} from "@/lib/types";

export const sectionOrder: SectionKey[] = [
  "growth",
  "personality",
  "motivation",
  "competency",
  "ambition",
];

export const sectionLabels: Record<SectionKey, string> = {
  growth: "성장과정",
  personality: "성격의 장단점",
  motivation: "직무 지원동기",
  competency: "보유 직무역량",
  ambition: "입사 후 포부",
};

export const sectionTargets: Record<SectionKey, string> = {
  growth: "500자 내외",
  personality: "500자 내외",
  motivation: "500자 내외",
  competency: "1000자 내외",
  ambition: "500자 내외",
};

export const sectionAccent: Record<SectionKey, string> = {
  growth: "#6366f1",
  personality: "#8b5cf6",
  motivation: "#ec4899",
  competency: "#06b6d4",
  ambition: "#10b981",
};

export const sectionGuides: Record<SectionKey, SectionGuide> = {
  growth: {
    intent:
      "성장 배경을 시간순으로 나열하지 않는다. 지금의 직무 태도로 이어진 가치관의 근거를 두괄식으로 보여준다.",
    formula: [
      "한줄 소제목 — 핵심 가치 압축",
      "S1. 가치관 두괄식 선언",
      "S2. 가치관이 형성된 계기 (S-T-A-R 구조)",
      "S3. 지원 직무에서 가치관이 발휘되는 방식",
    ],
    evidence: [
      "가정·학교·훈련 과정에서 반복된 행동 패턴",
      "문제를 해결한 구체적 장면 1개",
      "현재 지원 직무와 연결되는 태도 키워드",
    ],
    cautions: [
      "출생부터 시작하는 연대기 금지",
      "감성적 추억담 대신 직무로 이어지는 행동의 단서",
      "가족 자랑은 본인의 강점이 아니다",
    ],
  },
  personality: {
    intent:
      "제출 문서에서는 장점만 쓴다. 단점은 면접용 답변으로 따로 정리한다. 직무 수행에 유리한 성격 장점을 사례로 설득한다.",
    formula: [
      "한줄 소제목 — 장점 키워드 명시",
      "S1. 장점 1: 선언 + STAR 사례",
      "S2. 장점 2: 선언 + STAR 사례",
      "S3. 직무 적합성으로 마무리",
    ],
    evidence: [
      "팀 프로젝트에서 맡았던 역할",
      "갈등 조율 또는 일정 사수 경험",
      "스스로 일을 찾아 수행한 사례",
    ],
    cautions: [
      "장점 단점을 한 문단에 같이 쓰지 않는다",
      "두루뭉술한 형용사 대신 행동 결과",
      "‘성실합니다’ 같은 폐쇄적 단어는 사례 없이는 금지",
    ],
  },
  motivation: {
    intent:
      "영혼 없는 지원동기는 묻지마 지원자를 가려내기 위한 함정이다. 직무·기업·나의 준비가 한 문단에서 맞물리게 만든다.",
    formula: [
      "한줄 소제목 — 회사·직무 연결 메시지",
      "S1. 왜 이 직무인가 (개인 동기)",
      "S2. 지식·기술·태도 준비 요약",
      "S3. 기업/산업 맥락 (사업 구조, 시장 동향)",
      "S4. 입사 후 맡고 싶은 일",
    ],
    evidence: [
      "지원 기업의 사업 구조와 최근 이슈",
      "산업의 글로벌 동향과 발전 방향",
      "학교·개인 학습으로 축적한 노력",
    ],
    cautions: [
      "기업 IR 자료 복사 금지 — 나의 해석을 넣는다",
      "‘귀사의 비전에 공감하여’ 같은 빈말 금지",
      "지원기업이 미정이면 직무 선택 이유에 집중",
    ],
  },
  competency: {
    intent:
      "NCS 직무기술서 관점으로 지식, 기술, 태도를 분리해서 실무 수행 가능성을 증명한다. 자기소개서의 가장 긴 항목이므로 구조가 생명이다.",
    formula: [
      "한줄 소제목 — 직무 핵심 역량 선언",
      "S1. 지식 — 직무에 필요한 학습 결과",
      "S2. 기술 — 구현 가능한 기술과 프로젝트 적용",
      "S3. 태도 — 직무에 맞는 2가지 태도 + 사례",
    ],
    evidence: [
      "Java/Spring/DB/웹표준 등 실제 훈련 내역",
      "프로젝트에서 구현한 기능과 역할",
      "치밀함·요구사항 파악·협업 태도 사례",
    ],
    cautions: [
      "기술 나열만 하지 않는다 — 어디에 어떻게 썼는지",
      "지식·기술·태도가 섞이지 않게 분리",
      "한 가지 태도에 사례 2개씩 짝지어 설득",
    ],
  },
  ambition: {
    intent:
      "정규직 입사가 아닌 인턴 시작 관점의 포부로 작성한다. 적응 태도, 직무 기여, 인턴 종료 후 목표가 KPI처럼 명확해야 한다.",
    formula: [
      "한줄 소제목 — 인턴 기간의 목표",
      "S1. 인성·태도로 회사 생활 적응 방식",
      "S2. 직무역량으로 회사 기여 방식",
      "S3. 인턴 종료 시점 목표 (정규직 전환·전문가 성장)",
    ],
    evidence: [
      "인턴 기간 동안 달성할 업무 성과 지표",
      "동료에게 도움 줄 수 있는 보조 역량",
      "회사를 성장시키는 구체적 기여 방식",
    ],
    cautions: [
      "‘열정을 다하겠습니다’만 반복하지 않는다",
      "정규직 가정 포부는 인턴 자소서에 부적합",
      "막연한 비전보다 측정 가능한 목표",
    ],
  },
};

export const badWritingRules: { rule: string; example?: string }[] = [
  { rule: "접속어 남용", example: "그러나, 그리고, 또한이 한 문단에 반복" },
  { rule: "~적, ~것, ~의 남용", example: "효율적인 것의 의미적 가치" },
  { rule: "중복되는 표현", example: "다시 한 번 재확인" },
  { rule: "애매한 지시어", example: "그 어느 때보다 중요하다" },
  { rule: "겹치는 조사", example: "고양이는 눈이 동그랗다" },
  { rule: "군더더기 문장", example: "감사해 하고 있습니다" },
  { rule: "피동형 문장", example: "권한이 주어진다면" },
  { rule: "멋없이 긴 문장", example: "쉼표만 찍힌 두 줄짜리 문장" },
  { rule: "표현이 애매한 문장", example: "필요한 부분을 잘 처리하였다" },
  { rule: "번역투 문장", example: "~를 행한다, ~를 갖는다, ~을 시키다" },
  { rule: "~화, ~성, 수, 것 남용", example: "효율화의 가능성을 갖는 것" },
];

export const goodWritingRules = [
  "한 문장에는 한 가지 생각만 담는다.",
  "쉬운 어휘와 자연스러운 표현을 쓴다. 문법·맞춤법·띄어쓰기를 지킨다.",
  "중요한 내용을 문장 앞에 둔다.",
  "부정문보다 긍정문, 이중부정은 긍정으로 표현한다.",
  "주어와 서술어를 분명하게 맞춘다.",
  "수식어는 피수식어 바로 앞에 둔다.",
];

export const beforeAfter: BeforeAfterExample[] = [
  {
    label: "피동형 → 능동형",
    before: "권한이 주어진다면 저는 업무를 잘 수행할 수 있을 것이라 생각합니다.",
    after: "업무를 맡으면 요구사항을 먼저 확인하고 일정 안에 결과를 완성하겠습니다.",
  },
  {
    label: "군더더기 제거",
    before: "고객님께 깊은 감사의 마음을 가지고 항상 감사해 하고 있습니다.",
    after: "고객에게 감사합니다.",
  },
  {
    label: "애매한 지시어 정리",
    before: "그 어느 때 보다 디지털 역량이 중요하다.",
    after: "지금은 디지털 역량이 어느 때보다 중요하다.",
  },
  {
    label: "겹치는 조사 정돈",
    before: "고양이는 눈이 동그랗다.",
    after: "고양이 눈이 동그랗다.",
  },
  {
    label: "~적·것·의 덜기",
    before: "효율적인 것의 의미적 가치를 높이는 것이 중요하다고 생각합니다.",
    after: "업무 효율을 높이려면 반복 작업을 줄이는 기준부터 정해야 합니다.",
  },
  {
    label: "중복 표현 제거",
    before: "문제를 다시 한 번 재확인하고 개선 방향을 새롭게 다시 정리했습니다.",
    after: "문제를 재확인하고 개선 방향을 새로 정리했습니다.",
  },
  {
    label: "번역투 정리",
    before: "고객 응대 업무를 행하며 신뢰를 갖는 태도를 가지게 되었습니다.",
    after: "고객을 응대하며 신뢰를 지키는 태도를 배웠습니다.",
  },
  {
    label: "긴 문장 나누기",
    before: "프로젝트에서 요구사항을 정리하고 오류를 수정하며 팀원과 계속 소통한 결과 일정 안에 기능을 완성할 수 있었습니다.",
    after: "프로젝트에서 요구사항을 먼저 정리하고 오류를 수정했습니다. 팀원과 진행 상황을 공유해 일정 안에 기능을 완성했습니다.",
  },
];

export const formRules: FormRule[] = [
  {
    icon: "FilePen",
    title: "양식을 바꾸지 마세요",
    detail:
      "중앙에서 동일한 양식으로 서류가 발송됩니다. 임의로 표·여백을 바꾸면 일괄 편집이 어려워집니다.",
    bullets: [
      "표 셀 구조 유지",
      "기본 폰트 / 행간 유지",
      "개인 지원은 학원 양식 사용 권장",
    ],
  },
  {
    icon: "AlignLeft",
    title: "들여쓰기와 정렬",
    detail:
      "들여쓰기는 두 칸이 기본입니다. 같은 수준의 항목은 앞줄을 정확히 맞춥니다.",
    bullets: [
      "1단계 ‘1.’ 2단계 ‘가)’ 3단계 ‘(1)’",
      "공문서처럼 과도하게 들여쓰지 않기",
      "앞줄을 항상 시각적으로 정렬",
    ],
  },
  {
    icon: "Eraser",
    title: "붉은색 안내 글 정리",
    detail:
      "양식 속 붉은색 글씨는 작성 가이드입니다. 본인 내용으로 교체하거나 삭제하세요.",
    bullets: [
      "예시 텍스트를 그대로 두면 즉시 탈락",
      "본문에 안내 문구가 남지 않게 검수",
      "수정 후 색상은 본문 색으로 통일",
    ],
  },
  {
    icon: "Type",
    title: "글자체·글자 크기 통일",
    detail:
      "한 문서에서 글꼴과 크기를 통일합니다. 강조는 굵게만 사용하고 색은 절제합니다.",
    bullets: [
      "본문 한 가지 글꼴",
      "본문/제목 두 단계 글자 크기",
      "강조는 굵게 또는 동일 색 한 톤",
    ],
  },
];

export const resumeDataMap = [
  "지원분야, 교육 과정, 사용 가능 기술",
  "프로젝트명, 개발환경, 본인 역할",
  "경력·아르바이트의 구체 업무와 정량 성과",
  "수상·대외활동·봉사활동의 직무 연결점",
  "정량 성과: 시간 단축, 오류 감소, 개선 비율",
];

export const talentArchetypes: TalentArchetype[] = [
  {
    name: "소통·협력",
    sub: "팀워크",
    keywords: ["팀워크", "동료애", "공동체의식", "배려"],
    accent: "#6366f1",
  },
  {
    name: "전문성",
    sub: "직무 깊이",
    keywords: ["IT 활용", "자기계발", "탁월", "실력", "역량"],
    accent: "#0ea5e9",
  },
  {
    name: "원칙·신뢰",
    sub: "도덕성",
    keywords: ["도덕성", "인간미", "정직", "신뢰", "원칙주의"],
    accent: "#8b5cf6",
  },
  {
    name: "도전정신",
    sub: "변화 시도",
    keywords: ["개척", "모험", "도전", "과감한 시도", "위험 감수"],
    accent: "#ec4899",
  },
  {
    name: "주인의식",
    sub: "오너십",
    keywords: ["책임의식", "주인의식", "자율", "성실", "사명감"],
    accent: "#f97316",
  },
  {
    name: "창의성",
    sub: "가치 창출",
    keywords: ["상상", "창의", "인식 전환", "독창", "가치 창출"],
    accent: "#a855f7",
  },
  {
    name: "열정",
    sub: "에너지",
    keywords: ["승부 근성", "체력", "건강", "자신감"],
    accent: "#ef4444",
  },
  {
    name: "글로벌 역량",
    sub: "열린 사고",
    keywords: ["글로벌 마인드", "열린 사고", "국제 소양", "어학 능력"],
    accent: "#14b8a6",
  },
  {
    name: "실행력",
    sub: "리더십",
    keywords: ["신속한 의사결정", "리더십", "추진력", "실천"],
    accent: "#10b981",
  },
];

export const motivationDiamond: DiamondStep[] = [
  {
    number: "01",
    title: "직무를 선택한 계기",
    detail:
      "어린 시절·전공 선택 시점부터 어떤 흥미가 직무로 이어졌는지 한 문장으로.",
    example:
      "고등학교 때 우연히 코딩 동아리에 참여하면서 IT가 사회 문제를 해결하는 방식에 매료되었다.",
    accent: "#6366f1",
  },
  {
    number: "02",
    title: "학교·훈련에서 느낀 점",
    detail:
      "전공·훈련 과정에서 무엇을 배우며 직무에 대한 관점이 달라졌는지.",
    example:
      "교육 과정에서 다양한 프로젝트를 수행하며 백엔드 설계의 매력을 알게 되었다.",
    accent: "#0ea5e9",
  },
  {
    number: "03",
    title: "졸업·수료 시점의 확신",
    detail:
      "산업 동향을 보면서 왜 지금 이 직무여야 하는지 확신을 갖게 된 이유.",
    example:
      "클라우드·AI 시장 성장을 보며 데이터 기반 백엔드 개발자를 목표로 정했다.",
    accent: "#8b5cf6",
  },
  {
    number: "04",
    title: "학교에서 배운 Skill",
    detail:
      "교육 과정에서 익힌 기술·도구·방법론과 프로젝트 적용 사례.",
    example:
      "Spring·MyBatis로 게시판·회원관리를 구현했고, MVC 패턴을 익혔다.",
    accent: "#ec4899",
  },
  {
    number: "05",
    title: "학교 외 자기주도 노력",
    detail:
      "학습에서 끝나지 않고 스스로 채운 역량 — 사이드 프로젝트·강의·자격증.",
    example:
      "사이드 프로젝트로 토이 API 서버를 만들고 GitHub에 운영 사례를 정리했다.",
    accent: "#f97316",
  },
];

export const ambitionDiamond: DiamondStep[] = [
  {
    number: "01",
    title: "인성·태도로 적응",
    detail:
      "회사 생활에 잘 적응하기 위한 인성·태도. 협업과 의사소통 자세를 사례로.",
    example:
      "밝은 인상과 적극적인 소통으로 조직에 긍정 에너지를 더하는 인턴이 되겠다.",
    accent: "#6366f1",
  },
  {
    number: "02",
    title: "직무역량으로 기여",
    detail:
      "기본 업무 외에 본인이 보유한 역량으로 회사에 도움을 줄 부분.",
    example:
      "편집 역량을 살려 영상 콘텐츠 제작 지원도 함께 수행하겠다.",
    accent: "#0ea5e9",
  },
  {
    number: "03",
    title: "인턴 종료 시점 목표",
    detail:
      "3~6개월 안에 이루고 싶은 KPI형 목표 — 정규직 전환·전문가 성장·실무 학습.",
    example:
      "인턴 기간 동안 인정받는 결과를 만들어 정규직 전환을 목표로 하겠다.",
    accent: "#10b981",
  },
];

export const motivationCautions = [
  "기업이 지원동기를 묻는 이유는 묻지마 지원자를 가려내기 위함입니다.",
  "지원 기업·산업의 동향과 발전 방향을 작성 전에 모읍니다.",
  "조사한 정보 그대로 옮기지 말고 ‘나의 해석’을 담아 작성합니다.",
  "지원기업이 정해져 있지 않다면 ‘해당 직무’를 선택한 이유에 집중합니다.",
  "학교에서 배운 것 + 스스로 노력한 점으로 나누어 서술합니다.",
];

export const ambitionCautions = [
  "정규직원 입사가 아닌 인턴 활동을 가정한 포부로 작성합니다.",
  "포부는 ‘인성·태도’ + ‘직무역량’ 두 축으로 분리합니다.",
  "인턴 종료 후 목표를 분명히: 정규직 전환·전문가 성장·실무 학습.",
  "막연한 열정 대신 측정 가능한 목표를 KPI처럼 제시합니다.",
];

export const defaultProfile: StudentProfile = {
  name: "박지원",
  nameHanja: "朴智元",
  nameEng: "Jiwon Park",
  birth: "1999.04.12",
  address: "서울특별시 동작구 사당동 12-3",
  phone: "010-2345-6789",
  email: "jiwon.park@example.com",
  targetRole: "웹 백엔드 개발자",
  company: "네이버 클라우드 플랫폼",
  industry: "IT 서비스 · 클라우드 인프라",
  careerType: "신입",
  university: "중앙대학교 컴퓨터공학과 졸업",
  universityPeriod: "2018.03 ~ 2024.02",
  highschool: "서울 대성고등학교 졸업",
  highschoolPeriod: "2015.03 ~ 2018.02",
  certificates:
    "정보처리기사 [한국산업인력공단] 2024.05\n리눅스 마스터 2급 [한국정보통신진흥협회] 2023.09",
  military: "육군 병장 만기 전역 · 2020.06 ~ 2022.01",
  language: "TOEIC 880 [2023.11]",
  education: "중앙정보기술인재개발원 · 백엔드 개발자 전문과정",
  trainingPeriod: "2024.03 ~ 2024.08 (6개월)",
  trainingHours: "1,200 시간",
  training:
    "Java 기반 OOP, JDBC/JPA, Spring MVC·Boot, MyBatis, Oracle/MySQL, 웹표준(HTML/CSS/JS), Git/GitHub, AWS 배포까지 학습. 팀 프로젝트로 회원·게시판·결제 모듈 직접 구현.",
  techOSDB: "Windows 10, Linux(Ubuntu 20.04), Oracle 11g, MySQL 8",
  techTools: "IntelliJ IDEA, VSCode, Git/GitHub, Postman, Notion, Slack",
  techLanguages: "Java, Python, JavaScript, SQL",
  techWeb: "HTML5, CSS3, JavaScript ES6, REST API, JSON",
  techFramework: "Spring Boot, Spring MVC, JPA, MyBatis",
  techApp: "AWS SAA-Associate, 정보처리기사",
  project: "Spring 기반 회원·게시판·결제 통합 팀 프로젝트",
  projectPeriod:
    "중앙정보기술인재개발원 · 2024.06 ~ 2024.08 · 4인 팀 (백엔드 2명)",
  projectDescription:
    "Spring Boot + JPA + MySQL 로 회원가입/로그인/게시판 CRUD/결제 API 를 구현. 본인은 결제 모듈과 예외 처리·로그 표준화 담당.",
  career:
    "OOO 입시학원 수학 강사 · 2022.03 ~ 2023.12\n- 고2·고3 정규반 30명 담임, 진도표·오답노트 시스템 운영\n- 학생 평균 등급 1.8 → 1.2 향상\n물류센터 분류 아르바이트 · 2021.07 ~ 2021.08\n- 동선 최적화 제안으로 작업 시간 20분 단축",
  awards:
    "캡스톤 디자인 우수상 · 중앙대학교 · 2023.12\n2학년 성적우수 장학금 1회 수여 · 한국장학재단 · 2020.09",
  activities:
    "중앙대 알고리즘 동아리 NEXON 부장 · 2022.03 ~ 2023.02 · 주 1회 스터디 운영\n2023 우아한테크코스 프리코스 참여 (4주, 백엔드 트랙)",
  volunteer:
    "서울시 동행봉사 IT 멘토링 · 2023.07 ~ 2023.12 (24시간) · 초중등 학생 코딩 교육",
  recommendation: "중앙대 컴퓨터공학과 김OO 교수 · 캡스톤 디자인 지도교수",
  value: "맡은 일은 끝까지 결과로 증명한다는 책임감",
  desiredTeam:
    "요구사항을 명확히 공유하고 코드 리뷰로 함께 성장하는 백엔드 팀",
  tone: "professional",
};

// 모든 문자열 필드를 비우는 helper. tone 만 기본값 유지.
export const emptyProfile: StudentProfile = {
  ...defaultProfile,
  ...(Object.fromEntries(
    Object.entries(defaultProfile)
      .filter(([k]) => k !== "tone")
      .map(([k]) => [k, ""]),
  ) as Partial<StudentProfile>),
};

export const defaultStories: StoryInput[] = [
  {
    id: "story-1",
    title: "캡스톤 — 사용자 피드백 12건을 0건으로 줄인 경험",
    category: "growth",
    situation:
      "캡스톤에서 학생 30명이 사용하는 출석 체크 웹앱을 4인 팀으로 개발했다.",
    task:
      "출시 첫 주에 ‘QR 인식 실패’ 피드백이 12건 들어왔다. 다음 주까지 0건을 만들어야 했다.",
    action:
      "에러 로그를 직접 모아 5개 케이스로 분류하고, 카메라 권한 처리와 수동 입력 fallback UI 를 추가했다.",
    result: "다음 주 피드백이 0건으로 줄었고, 캡스톤 발표에서 우수상을 받았다.",
    insight: "‘내 코드는 결과로 증명한다’는 기준이 이때 만들어졌다.",
    metric: "피드백 12건 → 0건 · 캡스톤 우수상 수상",
  },
  {
    id: "story-2",
    title: "물류 아르바이트에서 동선 개선",
    category: "personality",
    situation:
      "물품 분류 아르바이트에서 4명이 같은 동선을 사용해 작업이 매일 1시간 지연됐다.",
    task: "이동 순서와 분류 기준을 다시 짜서 반복 시간을 줄여야 했다.",
    action:
      "물품을 구역별로 묶고 이동 순서를 메모로 만들어 동료와 공유, 매일 끝나고 1줄 회고를 적었다.",
    result:
      "작업 시간이 평균 20분 단축됐고, 동료들이 메모를 출력해 함께 쓰기 시작했다.",
    insight: "작은 업무도 구조를 만들면 팀 전체 시간이 줄어든다.",
    metric: "작업 시간 -20분/일 · 누락 사건 0건",
  },
  {
    id: "story-3",
    title: "스스로 운영한 Spring Boot 사이드 프로젝트",
    category: "motivation",
    situation:
      "교육 과정에서 배운 기술만으로는 실무 감각이 부족하다고 느꼈다.",
    task: "혼자 운영까지 책임지는 토이 서비스로 백엔드 흐름을 체화하기로 했다.",
    action:
      "Spring Boot 로 일정 공유 API 서버를 만들고 AWS EC2 에 배포해 30일간 운영 로그를 분석했다.",
    result:
      "장애 3건을 직접 수정했고, 로그 패턴을 매뉴얼화해 GitHub README 에 정리했다.",
    insight: "개발자는 학습 환경을 스스로 설계할 수 있어야 한다는 것을 체감했다.",
    metric: "커밋 120회 · 운영 30일 · 장애 평균 복구 12분",
  },
  {
    id: "story-4",
    title: "팀 프로젝트에서 회원·게시판·결제 모듈 완성",
    category: "competency",
    situation:
      "훈련 과정 막바지 팀 프로젝트에서 회원가입·게시판·결제 API 를 담당했다.",
    task:
      "요구사항이 발표 1주 전 변경되어 DB 스키마와 예외 흐름을 다시 정리해야 했다.",
    action:
      "기능을 단위로 쪼개 GitHub Issue 로 분배하고, 유효성 검증·예외 처리를 체크리스트로 매일 점검했다.",
    result: "발표 일정 안에 모든 기능을 마감했고 시연 중 오류 0건을 유지했다.",
    insight: "코드만큼 요구사항을 끝까지 확인하는 태도가 결과를 만든다.",
    metric: "오류 0건 · 일정 사수 · GitHub 커밋 240회",
  },
  {
    id: "story-5",
    title: "입시학원 강사로 30명 학생 평균 등급 향상",
    category: "ambition",
    situation:
      "수학 강사로 고2·고3 정규반 30명을 담임하며 학기 초 평균 등급은 1.8 이었다.",
    task:
      "남은 한 학기 안에 학생별 약점을 진단하고 평균 등급을 1.5 이내로 끌어올려야 했다.",
    action:
      "주간 오답 노트와 진도표를 학생별로 운영하고, 매주 1:1 피드백을 15분씩 진행했다.",
    result:
      "기말 평균 등급이 1.2 로 향상되었고 학원 운영진이 시스템을 정규반 전체에 도입했다.",
    insight: "1대 다수 환경에서도 데이터로 개인을 챙기면 결과가 바뀐다.",
    metric: "평균 등급 1.8 → 1.2 · 시스템 정규반 도입",
  },
];

export const emptyStory: StoryInput = {
  id: "story-empty",
  title: "",
  category: "growth",
  situation: "",
  task: "",
  action: "",
  result: "",
  insight: "",
  metric: "",
};

export const emptySections: DraftSections = {
  growth: { title: "", body: "", keywords: [], checklist: [] },
  personality: { title: "", body: "", keywords: [], checklist: [] },
  motivation: { title: "", body: "", keywords: [], checklist: [] },
  competency: { title: "", body: "", keywords: [], checklist: [] },
  ambition: { title: "", body: "", keywords: [], checklist: [] },
};

export const lectureSlides: SlideMeta[] = [
  {
    id: "intro",
    kicker: "00",
    chapter: "Opening",
    title: "가독성 있는 자기소개서 작성법",
    subtitle:
      "한 줄의 경험이 합격을 만드는 문장으로 바뀌는 순간",
  },
  {
    id: "profile",
    kicker: "01",
    chapter: "Instructor",
    title: "강사 프로필",
    subtitle:
      "링크드코리아 김기홍 대표 · 창업교육 13년 · 중앙대 겸임교수 · 액셀러레이터 투자심사역",
  },
  {
    id: "why",
    kicker: "02",
    chapter: "Why now",
    title: "영혼 없는 자소서, 이제 그만",
    subtitle:
      "묻지마 지원서를 가려내는 시대. 합격은 인성·태도 + 직무역량의 의도된 문장에서 만들어집니다.",
  },
  {
    id: "map",
    kicker: "03",
    chapter: "Framework",
    title: "5개 카테고리 항목 지도",
    subtitle:
      "성장과정 / 성격의 장단점 / 직무 지원동기 / 보유 직무역량 / 입사 후 포부 — 회사 양식에 맞춰 선택하고 인성·태도 + 역량을 분리합니다.",
  },
  {
    id: "writing",
    kicker: "04",
    chapter: "Writing",
    title: "나쁜 글의 11가지 / 좋은 문장 6원칙",
    subtitle:
      "접속어 남용·피동형·번역투를 걷어내고 한 문장 한 생각의 원칙을 적용합니다.",
  },
  {
    id: "profile-input",
    kicker: "05",
    chapter: "[실습] Profile",
    title: "학생 프로필 입력",
    subtitle:
      "지원 직무·기업·교육 과정·프로젝트 등 자기소개서의 사실 정보를 채웁니다.",
  },
  {
    id: "story",
    kicker: "06",
    chapter: "[실습] STAR",
    title: "스토리(경험) 입력 — STAR",
    subtitle:
      "상황 · 과제 · 행동 · 결과 + 배운 점 + 정량 성과. 자기소개서의 모든 항목은 이 경험에서 출발합니다.",
  },
  {
    id: "generator",
    kicker: "07",
    chapter: "AI Studio",
    title: "AI가 5개 항목을 한 번에 완성합니다",
    subtitle:
      "강의 원칙 · STAR 구조 · NCS 관점이 결합된 프롬프트로 초안을 생성합니다.",
  },
  {
    id: "review",
    kicker: "08",
    chapter: "Review",
    title: "섹션 첨삭 & 재작성",
    subtitle:
      "AI 초안을 그대로 두지 않습니다. 항목별 재호출 + 본문 직접 편집 + 검수 포인트.",
  },
  {
    id: "export",
    kicker: "09",
    chapter: "Export",
    title: "DOCX 실무 산출",
    subtitle:
      "학원 양식 흐름에 맞춰 Word 문서로 내려받습니다. 즉시 편집·제출 가능한 형태.",
  },
];

export const instructor = {
  name: "김기홍",
  role: "링크드코리아 대표이사",
  titles: [
    "사단법인 기술벤처스타트업 협회 협회장",
    "링크드코리아 대표이사",
  ],
  email: "hiseoulceo@naver.com",
  badges: ["창업교육 13년", "중앙대학교 겸임교수", "투자심사역"],
  bullets: [
    "現 ㈜링크드코리아 대표이사 (창업교육 경력 13년)",
    "現 중앙대학교 겸임교수",
    "現 중기부 등록 액셀러레이터 투자심사역",
    "現 (사)한국벤처창업학회 이사",
    "前 서울창업포럼 교육분과장",
    "창업학 석사 · 기술창업학 박사 수료",
  ],
};

export const heroPoints = [
  "스토리는 있지만 정리가 안 되는 자기소개서를 끝낸다",
  "5개 카테고리 + 직무역량을 한 시간 안에 정렬한다",
  "AI가 초안을, 학생이 첨삭을, 시스템이 DOCX를 만든다",
];
