import type { StudioPayload } from "@/lib/types";

export const jobFitDimensions = [
  "builder",
  "analysis",
  "people",
  "business",
  "craft",
  "operations",
  "depth",
  "breadth",
  "ambiguity",
  "structure",
] as const;

export type JobFitDimension = (typeof jobFitDimensions)[number];

export const jobFitDimensionLabels: Record<JobFitDimension, string> = {
  builder: "만드는 힘",
  analysis: "분석 감각",
  people: "사람/소통",
  business: "사업 감각",
  craft: "표현/디자인",
  operations: "운영/품질",
  depth: "전문성 몰입",
  breadth: "판 조율",
  ambiguity: "불확실성",
  structure: "구조화",
};

export type JobFitRoleKey =
  | "backend"
  | "frontend"
  | "dataAnalyst"
  | "aiEngineer"
  | "cloudDevops"
  | "qaAutomation"
  | "security"
  | "productManager"
  | "servicePlanner"
  | "productDesigner"
  | "growthMarketer"
  | "salesBd"
  | "customerSuccess"
  | "peopleOps"
  | "contentBrand"
  | "operationsManager";

export type JobFitChoice = {
  id: "a" | "b";
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  weights: Partial<Record<JobFitDimension, number>>;
  roleWeights?: Partial<Record<JobFitRoleKey, number>>;
};

export type JobFitQuestion = {
  id: string;
  axis: string;
  prompt: string;
  insight: string;
  choices: [JobFitChoice, JobFitChoice];
};

export type JobFitAnswer = {
  questionId: string;
  choiceId: "a" | "b";
};

export type JobFitRoleDefinition = {
  key: JobFitRoleKey;
  title: string;
  track: string;
  family: string;
  description: string;
  weights: Partial<Record<JobFitDimension, number>>;
  mustHave: string[];
  portfolio: string[];
};

export type JobFitRoleScore = JobFitRoleDefinition & {
  score: number;
  fit: number;
};

export type JobFitReadinessItem = {
  label: string;
  score: number;
  note: string;
};

export type JobFitSummary = {
  dimensionScores: Record<JobFitDimension, number>;
  dimensionPercents: Record<JobFitDimension, number>;
  topDimensions: JobFitDimension[];
  lowDimensions: JobFitDimension[];
  roleScores: JobFitRoleScore[];
  readiness: {
    overall: number;
    label: string;
    items: JobFitReadinessItem[];
  };
  answerNarratives: string[];
};

export type JobFitReport = {
  headline: string;
  primaryRole: string;
  primaryRoleFamily: string;
  primaryReason: string;
  persona: string;
  secondaryRoles: { role: string; reason: string; fit: number }[];
  aptitudeTags: string[];
  visualSummary: {
    radar: { label: string; score: number; note: string }[];
    roleBars: { role: string; family: string; fit: number; reason: string }[];
    keywordCloud: { text: string; weight: number; tone: "strong" | "risk" | "action" }[];
    sectionComparisons: {
      section: string;
      coverLetterEvidence: string;
      answerSignal: string;
      alignment: number;
      gap: string;
      action: string;
    }[];
    preparationBars: { label: string; score: number; evidence: string; next: string }[];
  };
  readiness: {
    overall: number;
    label: string;
    items: JobFitReadinessItem[];
  };
  strengths: string[];
  blindSpots: string[];
  missingEvidence: string[];
  actionPlan: { period: string; title: string; actions: string[] }[];
  roleRoadmap: { role: string; why: string; firstPortfolio: string }[];
  resumeKeywords: string[];
  interviewQuestions: string[];
  realityAdvice: string[];
  model?: string;
};

const asset = (name: string) => `/job-fit/${name}.png`;

export const jobFitQuestions: JobFitQuestion[] = [
  {
    id: "q01",
    axis: "문제 접근",
    prompt: "갑자기 서비스가 멈췄다. 당신의 첫 본능은?",
    insight:
      "장애 상황에서 먼저 보는 지점은 직무의 기본 렌즈다. 시스템 내부를 파는지, 사람과 흐름을 먼저 정리하는지 가른다.",
    choices: [
      {
        id: "a",
        eyebrow: "로그굴 탐험가",
        title: "일단 로그부터 까고 범인을 잡는다",
        body: "재현 조건, 에러 로그, DB 상태를 훑으며 원인을 좁힌다.",
        image: asset("system-detective"),
        weights: { builder: 3, analysis: 2, operations: 2, depth: 2, structure: 2 },
        roleWeights: { backend: 4, cloudDevops: 3, qaAutomation: 2, security: 2 },
      },
      {
        id: "b",
        eyebrow: "회의실 진화론",
        title: "피해 범위와 사람 역할부터 정렬한다",
        body: "누가 막혔고 무엇을 먼저 알려야 하는지 상황판을 만든다.",
        image: asset("team-facilitator"),
        weights: { people: 3, business: 2, breadth: 3, structure: 2, operations: 1 },
        roleWeights: { productManager: 4, customerSuccess: 3, operationsManager: 2 },
      },
    ],
  },
  {
    id: "q02",
    axis: "성과 증거",
    prompt: "포트폴리오에 한 줄만 박을 수 있다면 더 끌리는 문장은?",
    insight:
      "성과를 어떤 언어로 증명하고 싶은지 보면 분석형, 성장형, 세일즈형의 갈림길이 보인다.",
    choices: [
      {
        id: "a",
        eyebrow: "엑셀 청소부",
        title: "흩어진 데이터를 정리해 의사결정 기준을 만들었다",
        body: "수치, 대시보드, 원인분석으로 판단을 가볍게 만든 쪽.",
        image: asset("data-cleaner"),
        weights: { analysis: 3, business: 2, structure: 3, operations: 1 },
        roleWeights: { dataAnalyst: 4, productManager: 2, growthMarketer: 2 },
      },
      {
        id: "b",
        eyebrow: "발표 리모컨 장인",
        title: "사람들이 이해하고 움직이게 만든 캠페인을 했다",
        body: "설득, 메시지, 피치, 반응을 끌어낸 쪽.",
        image: asset("pitch-rocket"),
        weights: { people: 3, business: 3, craft: 2, breadth: 2, ambiguity: 1 },
        roleWeights: { salesBd: 4, growthMarketer: 3, contentBrand: 2 },
      },
    ],
  },
  {
    id: "q03",
    axis: "몰입 방식",
    prompt: "하루를 통째로 맡긴다면 덜 지치는 쪽은?",
    insight:
      "깊은 제작 몰입과 사용자 맥락 탐색은 모두 중요하지만, 에너지 충전 방향이 전혀 다르다.",
    choices: [
      {
        id: "a",
        eyebrow: "코드 동굴 수도승",
        title: "복잡한 기능 하나를 끝까지 파서 작동시킨다",
        body: "문서, 예외 케이스, 구현 디테일 속에서 시간이 잘 간다.",
        image: asset("deep-code"),
        weights: { builder: 3, depth: 3, structure: 2, operations: 1 },
        roleWeights: { backend: 4, frontend: 2, aiEngineer: 2 },
      },
      {
        id: "b",
        eyebrow: "사용자 인터뷰 수집가",
        title: "사람들이 왜 불편한지 묻고 패턴을 뽑는다",
        body: "말, 행동, 맥락을 관찰해 문제 정의를 새로 잡는다.",
        image: asset("user-research"),
        weights: { people: 3, analysis: 2, breadth: 2, ambiguity: 2, craft: 1 },
        roleWeights: { servicePlanner: 4, productDesigner: 3, productManager: 2 },
      },
    ],
  },
  {
    id: "q04",
    axis: "불안 관리",
    prompt: "프로젝트 마감 3일 전, 더 참을 수 없는 것은?",
    insight:
      "품질 리스크와 사용성 리스크 중 어디에 더 예민한지가 QA/운영/디자인 적합도를 가른다.",
    choices: [
      {
        id: "a",
        eyebrow: "체크리스트 방화벽",
        title: "테스트 안 된 기능이 배포 대기 중인 상황",
        body: "누락, 예외, 재현 조건을 잡아야 잠이 온다.",
        image: asset("risk-runbook"),
        weights: { operations: 3, structure: 3, analysis: 2, depth: 1 },
        roleWeights: { qaAutomation: 4, cloudDevops: 2, operationsManager: 2 },
      },
      {
        id: "b",
        eyebrow: "픽셀 신발가게",
        title: "버튼은 있는데 아무도 누르고 싶지 않은 화면",
        body: "흐름, 화면 밀도, 감정적 마찰을 먼저 고치고 싶다.",
        image: asset("design-pixels"),
        weights: { craft: 3, people: 2, ambiguity: 2, builder: 1 },
        roleWeights: { productDesigner: 4, frontend: 3, servicePlanner: 2 },
      },
    ],
  },
  {
    id: "q05",
    axis: "학습 욕망",
    prompt: "새 기술을 배울 때 더 짜릿한 순간은?",
    insight:
      "원리 탐구형과 시장 연결형을 구분한다. 둘 다 성장하지만 포트폴리오 모양이 달라진다.",
    choices: [
      {
        id: "a",
        eyebrow: "AI 실험실 조립공",
        title: "원리를 이해하고 작은 모델/도구로 재현했다",
        body: "개념이 손에 잡히는 순간, 더 깊게 파고 싶어진다.",
        image: asset("ai-lab"),
        weights: { analysis: 3, builder: 2, depth: 3, ambiguity: 1 },
        roleWeights: { aiEngineer: 4, dataAnalyst: 2, backend: 1 },
      },
      {
        id: "b",
        eyebrow: "시장지도 항해사",
        title: "이 기술이 어떤 고객 문제와 돈으로 이어지는지 보였다",
        body: "기능보다 사용처, 산업 구조, 경쟁 포인트가 먼저 궁금하다.",
        image: asset("business-map"),
        weights: { business: 3, breadth: 3, analysis: 1, people: 1, ambiguity: 2 },
        roleWeights: { productManager: 4, salesBd: 3, growthMarketer: 2 },
      },
    ],
  },
  {
    id: "q06",
    axis: "일의 쾌감",
    prompt: "남들이 안 알아줘도 혼자 뿌듯한 장면은?",
    insight:
      "보이지 않는 운영 개선을 좋아하는지, 보이는 메시지와 경험을 만드는지 확인한다.",
    choices: [
      {
        id: "a",
        eyebrow: "공정 밸런스 묘기",
        title: "반복 업무 시간이 조용히 30% 줄었다",
        body: "매뉴얼, 자동화, 동선 개선이 만들어낸 조용한 승리.",
        image: asset("ops-balance"),
        weights: { operations: 3, structure: 3, business: 1, analysis: 1 },
        roleWeights: { operationsManager: 4, cloudDevops: 2, qaAutomation: 2 },
      },
      {
        id: "b",
        eyebrow: "콘텐츠 라면 셰프",
        title: "사람들이 저장하고 공유하는 문장/이미지를 만들었다",
        body: "메시지, 톤, 장면을 조합해 반응을 만든 쪽.",
        image: asset("content-ramen"),
        weights: { craft: 3, business: 2, people: 2, ambiguity: 2 },
        roleWeights: { contentBrand: 4, growthMarketer: 3, productDesigner: 1 },
      },
    ],
  },
  {
    id: "q07",
    axis: "위험 감지",
    prompt: "팀원이 괜찮다고 넘긴 일 중 계속 눈에 밟히는 것은?",
    insight:
      "리스크 민감도가 보안/품질/고객지원 계열에서 강점이 될 수 있는지 본다.",
    choices: [
      {
        id: "a",
        eyebrow: "비밀번호 금고지기",
        title: "권한, 개인정보, 이상 징후가 허술한 부분",
        body: "한 번 터지면 크게 망하는 리스크를 먼저 막고 싶다.",
        image: asset("security-vault"),
        weights: { operations: 3, analysis: 2, depth: 2, structure: 2 },
        roleWeights: { security: 4, cloudDevops: 2, qaAutomation: 2 },
      },
      {
        id: "b",
        eyebrow: "헤드셋 공구상자",
        title: "고객이 계속 같은 곳에서 막히는 부분",
        body: "문제 해결보다 먼저, 사용자가 화난 이유를 복구하고 싶다.",
        image: asset("support-toolbox"),
        weights: { people: 3, operations: 2, breadth: 2, builder: 1 },
        roleWeights: { customerSuccess: 4, servicePlanner: 2, salesBd: 1 },
      },
    ],
  },
  {
    id: "q08",
    axis: "산출물 취향",
    prompt: "내 이름을 걸고 공개하고 싶은 결과물은?",
    insight:
      "기술 산출물과 경험 산출물 중 어느 쪽이 취업 시장에서 더 강한 증거가 될지 본다.",
    choices: [
      {
        id: "a",
        eyebrow: "작동주의자",
        title: "README까지 정리된 배포 가능한 기능",
        body: "코드, 테스트, 배포 링크, 장애 대응 기록까지 묶고 싶다.",
        image: asset("system-detective"),
        weights: { builder: 3, depth: 2, structure: 2, operations: 1 },
        roleWeights: { backend: 3, frontend: 3, cloudDevops: 2 },
      },
      {
        id: "b",
        eyebrow: "경험 설계자",
        title: "Before/After가 보이는 화면과 사용자 흐름",
        body: "문제 정의, 와이어프레임, 사용성 개선 근거가 핵심이다.",
        image: asset("design-pixels"),
        weights: { craft: 3, people: 2, analysis: 1, ambiguity: 2 },
        roleWeights: { productDesigner: 4, servicePlanner: 3, frontend: 1 },
      },
    ],
  },
  {
    id: "q09",
    axis: "갈등 해결",
    prompt: "의견 충돌이 났다. 더 자연스럽게 나오는 행동은?",
    insight:
      "분석으로 합의하는 사람과 관계를 통해 합의하는 사람은 어울리는 협업 포지션이 다르다.",
    choices: [
      {
        id: "a",
        eyebrow: "팩트 정렬반",
        title: "가정과 데이터를 분리해 판단표를 만든다",
        body: "감정은 존중하되, 결론은 기준표로 내리고 싶다.",
        image: asset("data-cleaner"),
        weights: { analysis: 3, structure: 3, business: 1, breadth: 1 },
        roleWeights: { dataAnalyst: 3, productManager: 2, operationsManager: 2 },
      },
      {
        id: "b",
        eyebrow: "분위기 통역가",
        title: "서로의 진짜 걱정을 말로 꺼내게 만든다",
        body: "사람들이 납득해야 일이 굴러간다고 본다.",
        image: asset("team-facilitator"),
        weights: { people: 3, breadth: 3, business: 1, ambiguity: 1 },
        roleWeights: { peopleOps: 4, customerSuccess: 2, salesBd: 2 },
      },
    ],
  },
  {
    id: "q10",
    axis: "커리어 성장",
    prompt: "5년 뒤 더 끌리는 자기소개는?",
    insight:
      "전문가 트랙과 리드/사업 트랙의 선호를 확인한다. 초년생일수록 이 차이를 알아야 준비가 빨라진다.",
    choices: [
      {
        id: "a",
        eyebrow: "전문가 굴착기",
        title: "남들이 못 푸는 복잡한 문제를 맡는 사람",
        body: "깊은 기술/분석 실력으로 난이도 높은 일을 해결한다.",
        image: asset("deep-code"),
        weights: { depth: 3, builder: 2, analysis: 2, structure: 1 },
        roleWeights: { backend: 3, aiEngineer: 3, security: 2 },
      },
      {
        id: "b",
        eyebrow: "판 설계자",
        title: "여러 팀을 움직여 결과가 나게 만드는 사람",
        body: "기획, 우선순위, 설득으로 큰 방향을 잡는다.",
        image: asset("business-map"),
        weights: { breadth: 3, business: 3, people: 2, ambiguity: 2 },
        roleWeights: { productManager: 4, salesBd: 3, operationsManager: 2 },
      },
    ],
  },
  {
    id: "q11",
    axis: "준비 증거",
    prompt: "지금 당장 취업 준비에서 가장 보강하고 싶은 것은?",
    insight:
      "부족을 스스로 어디로 느끼는지 자체가 준비도 진단의 중요한 신호다.",
    choices: [
      {
        id: "a",
        eyebrow: "증거 보관소",
        title: "포트폴리오, GitHub, 결과 수치가 아직 빈약하다",
        body: "말보다 증거를 먼저 쌓아야 마음이 놓인다.",
        image: asset("ops-balance"),
        weights: { structure: 3, operations: 2, depth: 1, builder: 1 },
        roleWeights: { backend: 2, frontend: 2, dataAnalyst: 2, qaAutomation: 2 },
      },
      {
        id: "b",
        eyebrow: "면접 조명 공포증",
        title: "경험은 있는데 말로 설득하는 구조가 약하다",
        body: "STAR, 면접 답변, 직무 언어로 바꾸는 훈련이 필요하다.",
        image: asset("pitch-rocket"),
        weights: { people: 2, business: 2, breadth: 2, craft: 1 },
        roleWeights: { salesBd: 2, productManager: 2, contentBrand: 2, peopleOps: 2 },
      },
    ],
  },
  {
    id: "q12",
    axis: "질문 습관",
    prompt: "새 과제를 받았을 때 더 먼저 묻는 질문은?",
    insight:
      "기술 가능성 중심인지, 사용자 가치 중심인지 판별한다. 직무 추천의 핵심 분기다.",
    choices: [
      {
        id: "a",
        eyebrow: "구현 가능성 수사대",
        title: "어떤 제약과 데이터가 있고 어떻게 만들 수 있나?",
        body: "아키텍처, 데이터, 도구, 구현 순서부터 잡는다.",
        image: asset("ai-lab"),
        weights: { builder: 3, analysis: 2, depth: 2, structure: 2 },
        roleWeights: { aiEngineer: 3, backend: 2, dataAnalyst: 2 },
      },
      {
        id: "b",
        eyebrow: "고객 속마음 탐정",
        title: "누가 왜 필요해 하고 성공 기준은 무엇인가?",
        body: "사용자, 비즈니스 목표, 도입 장벽부터 확인한다.",
        image: asset("support-toolbox"),
        weights: { people: 3, business: 3, breadth: 2, ambiguity: 2 },
        roleWeights: { productManager: 3, customerSuccess: 3, servicePlanner: 2 },
      },
    ],
  },
  {
    id: "q13",
    axis: "표현 방식",
    prompt: "내가 더 잘하는 설명 방식은?",
    insight:
      "문제를 언어로 파는지, 시각/콘텐츠로 설득하는지에 따라 마케팅·브랜딩·기획 적합도가 갈린다.",
    choices: [
      {
        id: "a",
        eyebrow: "근거 압축기",
        title: "복잡한 내용을 구조화해 한 장짜리 논리로 만든다",
        body: "배경, 근거, 결론이 딱 맞아야 마음이 편하다.",
        image: asset("security-vault"),
        weights: { analysis: 2, structure: 3, business: 2, breadth: 1 },
        roleWeights: { productManager: 2, dataAnalyst: 2, operationsManager: 2 },
      },
      {
        id: "b",
        eyebrow: "밈 조리실",
        title: "사람들이 반응할 장면과 문장으로 바꾼다",
        body: "재미, 톤, 메시지의 온도를 맞추는 쪽이 강하다.",
        image: asset("content-ramen"),
        weights: { craft: 3, people: 2, business: 2, ambiguity: 2 },
        roleWeights: { contentBrand: 4, growthMarketer: 3, productDesigner: 1 },
      },
    ],
  },
  {
    id: "q14",
    axis: "일정 압박",
    prompt: "빠듯한 일정에서 더 자신 있는 생존법은?",
    insight:
      "실행의 기준이 실험 속도인지, 안정적 운영인지 구분한다.",
    choices: [
      {
        id: "a",
        eyebrow: "빠른 실험 광부",
        title: "작게 내고 반응을 보며 바로 고친다",
        body: "완벽보다 학습 속도를 우선하고 지표로 다음 수를 정한다.",
        image: asset("team-facilitator"),
        weights: { ambiguity: 3, business: 2, builder: 1, people: 1, breadth: 1 },
        roleWeights: { growthMarketer: 3, productManager: 2, frontend: 1 },
      },
      {
        id: "b",
        eyebrow: "배포 전 문지기",
        title: "범위를 줄여도 기준과 품질선은 지킨다",
        body: "체크리스트, 우선순위, 리스크 컷으로 무너짐을 막는다.",
        image: asset("risk-runbook"),
        weights: { operations: 3, structure: 3, depth: 1, analysis: 1 },
        roleWeights: { qaAutomation: 3, cloudDevops: 2, operationsManager: 2 },
      },
    ],
  },
];

export const jobFitRoles: JobFitRoleDefinition[] = [
  {
    key: "backend",
    title: "백엔드/API 개발자",
    track: "기술 구현",
    family: "Engineering",
    description: "데이터 흐름, 서버 로직, 안정적인 API를 설계하고 구현하는 직무.",
    weights: { builder: 3, depth: 2, structure: 2, operations: 1, analysis: 1 },
    mustHave: ["Java/Spring 또는 Node 기반 API 구현", "DB 설계/쿼리", "배포·로그·예외처리 경험"],
    portfolio: ["로그인/권한/결제/게시판 등 실서비스형 API", "ERD + API 명세 + 테스트 결과"],
  },
  {
    key: "frontend",
    title: "프론트엔드/프로덕트 엔지니어",
    track: "기술 구현",
    family: "Engineering",
    description: "사용자가 직접 만지는 화면과 상태 흐름을 빠르게 구현하고 개선하는 직무.",
    weights: { builder: 2, craft: 2, people: 1, ambiguity: 1, structure: 1 },
    mustHave: ["React/Next.js 화면 구현", "상태 관리와 API 연동", "반응형·접근성 기본"],
    portfolio: ["문제 정의가 있는 웹앱", "Before/After UI 개선 기록"],
  },
  {
    key: "dataAnalyst",
    title: "데이터 분석가/BI",
    track: "분석",
    family: "Data",
    description: "흩어진 데이터를 정리해 의사결정 기준과 실행 인사이트로 바꾸는 직무.",
    weights: { analysis: 3, structure: 2, business: 2, operations: 1 },
    mustHave: ["SQL", "대시보드/리포팅", "가설-분석-제안 구조"],
    portfolio: ["공개 데이터 분석 리포트", "지표 정의서와 의사결정 제안"],
  },
  {
    key: "aiEngineer",
    title: "AI/ML 엔지니어",
    track: "분석+구현",
    family: "Data",
    description: "모델, 데이터, 서비스 적용을 연결해 실험 가능한 AI 기능을 만드는 직무.",
    weights: { analysis: 3, builder: 2, depth: 3, ambiguity: 1 },
    mustHave: ["Python", "모델 실험 기록", "데이터 전처리와 평가 지표"],
    portfolio: ["작은 추천/분류/생성형 AI 데모", "실험 로그와 한계 분석"],
  },
  {
    key: "cloudDevops",
    title: "클라우드/DevOps 엔지니어",
    track: "운영 기술",
    family: "Engineering",
    description: "배포, 모니터링, 인프라 자동화로 서비스가 안정적으로 굴러가게 만드는 직무.",
    weights: { operations: 3, builder: 2, structure: 2, depth: 1 },
    mustHave: ["Linux", "CI/CD", "클라우드 배포", "모니터링 기초"],
    portfolio: ["배포 파이프라인", "장애 대응 Runbook", "비용/성능 개선 기록"],
  },
  {
    key: "qaAutomation",
    title: "QA/테스트 자동화",
    track: "품질",
    family: "Quality",
    description: "사용 시나리오와 예외 케이스를 설계해 출시 리스크를 낮추는 직무.",
    weights: { operations: 3, structure: 3, analysis: 2, depth: 1 },
    mustHave: ["테스트 케이스 설계", "버그 리포트", "자동화 도구 기초"],
    portfolio: ["테스트 시나리오 문서", "E2E 테스트 자동화 샘플"],
  },
  {
    key: "security",
    title: "정보보안/보안관제",
    track: "리스크",
    family: "Security",
    description: "권한, 로그, 취약점, 이상징후를 감지하고 피해를 줄이는 직무.",
    weights: { operations: 3, analysis: 2, depth: 2, structure: 2 },
    mustHave: ["네트워크/OS 기초", "로그 분석", "보안 취약점 기본"],
    portfolio: ["취약점 분석 리포트", "로그 기반 탐지 룰 설계"],
  },
  {
    key: "productManager",
    title: "서비스 기획/프로덕트 매니저",
    track: "기획",
    family: "Product",
    description: "고객 문제, 사업 목표, 개발 우선순위를 연결해 결과를 만드는 직무.",
    weights: { business: 3, people: 2, breadth: 3, ambiguity: 2, analysis: 1 },
    mustHave: ["문제 정의", "우선순위", "요구사항 문서", "지표 설계"],
    portfolio: ["PRD", "사용자 여정", "실험 결과와 개선안"],
  },
  {
    key: "servicePlanner",
    title: "UX 리서치/서비스 기획",
    track: "기획",
    family: "Product",
    description: "사용자 맥락을 관찰해 불편을 정의하고 서비스 흐름으로 푸는 직무.",
    weights: { people: 3, analysis: 2, craft: 1, breadth: 2, ambiguity: 2 },
    mustHave: ["인터뷰/리서치", "페르소나·여정맵", "문제 정의"],
    portfolio: ["사용자 인터뷰 분석", "개선 전후 플로우"],
  },
  {
    key: "productDesigner",
    title: "프로덕트/UXUI 디자이너",
    track: "디자인",
    family: "Design",
    description: "문제 정의를 화면, 인터랙션, 시각 시스템으로 구현하는 직무.",
    weights: { craft: 3, people: 2, ambiguity: 2, builder: 1 },
    mustHave: ["Figma", "UI 시스템", "사용성 개선 근거"],
    portfolio: ["케이스스터디", "와이어프레임-프로토타입-검증 흐름"],
  },
  {
    key: "growthMarketer",
    title: "그로스/퍼포먼스 마케터",
    track: "마케팅",
    family: "Business",
    description: "가설, 콘텐츠, 지표를 빠르게 실험해 전환과 성장을 만드는 직무.",
    weights: { business: 3, craft: 2, analysis: 2, ambiguity: 3 },
    mustHave: ["캠페인 가설", "콘텐츠/광고 운영", "전환 지표 분석"],
    portfolio: ["랜딩페이지 실험", "광고 소재 A/B 테스트 리포트"],
  },
  {
    key: "salesBd",
    title: "B2B 영업/사업개발",
    track: "사업",
    family: "Business",
    description: "고객의 니즈와 회사의 제안을 연결해 계약과 파트너십을 만드는 직무.",
    weights: { people: 3, business: 3, breadth: 2, ambiguity: 1 },
    mustHave: ["고객 이해", "제안서", "협상/팔로업", "시장 조사"],
    portfolio: ["타깃 고객 리스트", "제안서/콜드메일 샘플"],
  },
  {
    key: "customerSuccess",
    title: "CS/CX/기술지원",
    track: "고객",
    family: "Customer",
    description: "사용자가 제품을 제대로 쓰고 계속 남도록 문제를 해결하는 직무.",
    weights: { people: 3, operations: 2, breadth: 2, builder: 1 },
    mustHave: ["고객 응대", "이슈 분류", "제품 이해", "재발 방지 문서화"],
    portfolio: ["FAQ/가이드 개선", "고객 이슈 분류표"],
  },
  {
    key: "peopleOps",
    title: "HR/피플오퍼레이션",
    track: "조직",
    family: "People",
    description: "사람과 조직의 흐름을 설계해 채용, 교육, 몰입을 돕는 직무.",
    weights: { people: 3, operations: 2, breadth: 2, structure: 1 },
    mustHave: ["커뮤니케이션", "일정/문서 관리", "조직문화 이해"],
    portfolio: ["교육 운영안", "채용 후보자 경험 개선안"],
  },
  {
    key: "contentBrand",
    title: "콘텐츠/브랜드 마케터",
    track: "마케팅",
    family: "Creative",
    description: "메시지, 장면, 톤을 설계해 사람들이 기억하고 반응하게 만드는 직무.",
    weights: { craft: 3, business: 2, people: 2, ambiguity: 2 },
    mustHave: ["카피라이팅", "콘텐츠 기획", "브랜드 톤", "성과 분석"],
    portfolio: ["콘텐츠 캘린더", "브랜드 캠페인 기획서"],
  },
  {
    key: "operationsManager",
    title: "운영관리/SCM/서비스 운영",
    track: "운영",
    family: "Operations",
    description: "반복 업무와 현장 흐름을 표준화해 비용, 속도, 품질을 개선하는 직무.",
    weights: { operations: 3, structure: 2, business: 1, analysis: 1, people: 1 },
    mustHave: ["프로세스 개선", "일정/재고/리스크 관리", "지표화"],
    portfolio: ["업무 프로세스 개선안", "작업 시간/오류율 개선 사례"],
  },
];

export function getJobFitChoice(answer: JobFitAnswer) {
  const question = jobFitQuestions.find((item) => item.id === answer.questionId);
  if (!question) return null;
  return question.choices.find((choice) => choice.id === answer.choiceId) || null;
}

export function summarizeJobFit(
  answers: JobFitAnswer[],
  payload: StudioPayload,
): JobFitSummary {
  const dimensionScores = emptyDimensionScores();
  const directRoleScores = emptyRoleScores();

  answers.forEach((answer) => {
    const choice = getJobFitChoice(answer);
    if (!choice) return;

    Object.entries(choice.weights).forEach(([dimension, value]) => {
      dimensionScores[dimension as JobFitDimension] += value || 0;
    });

    Object.entries(choice.roleWeights || {}).forEach(([role, value]) => {
      directRoleScores[role as JobFitRoleKey] += value || 0;
    });
  });

  const maxByDimension = getMaxDimensionScores();
  const dimensionPercents = jobFitDimensions.reduce(
    (acc, dimension) => ({
      ...acc,
      [dimension]: normalizePercent(dimensionScores[dimension], maxByDimension[dimension]),
    }),
    {} as Record<JobFitDimension, number>,
  );

  const roleScores = getRoleScores(dimensionScores, directRoleScores);
  const sortedDimensions = [...jobFitDimensions].sort(
    (a, b) => dimensionPercents[b] - dimensionPercents[a],
  );
  const readiness = getReadiness(payload, answers);

  return {
    dimensionScores,
    dimensionPercents,
    topDimensions: sortedDimensions.slice(0, 4),
    lowDimensions: sortedDimensions.slice(-3).reverse(),
    roleScores,
    readiness,
    answerNarratives: answers
      .map((answer, index) => {
        const question = jobFitQuestions.find((item) => item.id === answer.questionId);
        const choice = getJobFitChoice(answer);
        if (!question || !choice) return "";
        return `${index + 1}. ${question.axis}: ${choice.title} - ${choice.body}`;
      })
      .filter(Boolean),
  };
}

export function buildFallbackJobFitReport(
  summary: JobFitSummary,
  payload: StudioPayload,
): JobFitReport {
  const [top, second, third] = summary.roleScores;
  const topLabels = summary.topDimensions
    .map((dimension) => jobFitDimensionLabels[dimension])
    .join(" · ");

  return {
    headline: `${payload.profile.name || "지원자"}님은 ${top.title} 쪽 적합도가 가장 높고, 핵심 성향은 ${topLabels}입니다.`,
    primaryRole: top.title,
    primaryRoleFamily: top.family,
    primaryReason: `${top.description} 현재 응답은 ${top.mustHave.slice(0, 2).join(", ")} 역량을 증거로 만들 때 가장 설득력이 큽니다.`,
    persona: `${jobFitDimensionLabels[summary.topDimensions[0]]}을 중심으로 결과를 만드는 ${top.track}형 지원자`,
    secondaryRoles: [second, third].filter(Boolean).map((role) => ({
      role: role.title,
      reason: `${role.track} 성향도 함께 보여 보조 지원 직무로 검토할 만합니다.`,
      fit: role.fit,
    })),
    aptitudeTags: summary.topDimensions.map((dimension) => jobFitDimensionLabels[dimension]),
    visualSummary: {
      radar: summary.topDimensions.concat(summary.lowDimensions).slice(0, 6).map((dimension) => ({
        label: jobFitDimensionLabels[dimension],
        score: summary.dimensionPercents[dimension],
        note: `${jobFitDimensionLabels[dimension]} 축에서 ${summary.dimensionPercents[dimension]}점 신호가 나타났습니다.`,
      })),
      roleBars: summary.roleScores.slice(0, 6).map((role) => ({
        role: role.title,
        family: role.family,
        fit: role.fit,
        reason: role.description,
      })),
      keywordCloud: [
        ...summary.topDimensions.map((dimension) => ({
          text: jobFitDimensionLabels[dimension],
          weight: Math.max(48, summary.dimensionPercents[dimension]),
          tone: "strong" as const,
        })),
        ...summary.lowDimensions.map((dimension) => ({
          text: `${jobFitDimensionLabels[dimension]} 보강`,
          weight: 44,
          tone: "action" as const,
        })),
      ],
      sectionComparisons: [
        "성장과정",
        "성격의 장단점",
        "직무 지원동기",
        "보유 직무역량",
        "입사 후 포부",
      ].map((section, index) => ({
        section,
        coverLetterEvidence: "현재 입력된 자소서 원자료를 직무 언어로 다시 연결해야 합니다.",
        answerSignal: summary.answerNarratives[index] || "응답 신호 확인 필요",
        alignment: Math.max(45, summary.readiness.overall - index * 4),
        gap: "구체 수치와 산출물 근거가 더 필요합니다.",
        action: `${top.title} 관점에서 ${section}의 증거 문장을 보강하세요.`,
      })),
      preparationBars: summary.readiness.items.map((item) => ({
        label: item.label,
        score: item.score,
        evidence: item.note,
        next: item.score >= 80 ? "현재 근거를 문서화하세요." : "빈칸을 채울 산출물을 추가하세요.",
      })),
    },
    readiness: summary.readiness,
    strengths: [
      `상위 직무군이 요구하는 ${top.mustHave[0]} 방향과 응답 패턴이 맞습니다.`,
      `현재 프로필의 프로젝트/경험 정보를 ${top.title} 언어로 재정렬하면 설득력이 커집니다.`,
      `강점 키워드와 STAR 경험을 포트폴리오 증거로 연결할 여지가 있습니다.`,
    ],
    blindSpots: [
      `${summary.lowDimensions.map((d) => jobFitDimensionLabels[d]).join(", ")} 축은 답변에서 약하게 나타났습니다.`,
      "지원 직무가 넓으면 자기소개서와 포트폴리오가 산만해질 수 있습니다.",
      "결과 수치가 부족한 경험은 면접에서 깊게 파고들 때 흔들릴 수 있습니다.",
    ],
    missingEvidence: [
      `${top.portfolio[0]}를 실제 산출물로 제시하세요.`,
      "프로젝트에서 본인이 맡은 역할, 판단 기준, 결과 수치를 한 장으로 정리하세요.",
      "지원 기업/산업을 3개 이상 비교해 왜 이 직무인지 근거를 만드세요.",
    ],
    actionPlan: [
      {
        period: "1주차",
        title: "직무 하나로 좁히기",
        actions: [
          `${top.title} 채용공고 10개를 모아 공통 역량을 표시합니다.`,
          `현재 경험을 ${top.mustHave.join(" / ")} 기준으로 재분류합니다.`,
        ],
      },
      {
        period: "2~3주차",
        title: "증거 산출물 만들기",
        actions: [
          `${top.portfolio[0]}를 작게 완성합니다.`,
          "README 또는 기획서에 문제-행동-결과-배운 점을 고정 양식으로 적습니다.",
        ],
      },
      {
        period: "4주차",
        title: "지원 문서와 면접 연결",
        actions: [
          "자소서 5개 항목에서 같은 경험이 반복되지 않게 배치합니다.",
          "면접 답변 5개를 STAR 90초 버전으로 녹음해 점검합니다.",
        ],
      },
    ],
    roleRoadmap: summary.roleScores.slice(0, 5).map((role) => ({
      role: role.title,
      why: role.description,
      firstPortfolio: role.portfolio[0],
    })),
    resumeKeywords: [
      ...top.mustHave,
      ...summary.topDimensions.map((dimension) => jobFitDimensionLabels[dimension]),
    ].slice(0, 10),
    interviewQuestions: [
      `왜 ${top.title}를 1순위로 선택했는지 본인의 경험 1개로 설명해보세요.`,
      `${top.mustHave[0]} 역량을 보여주는 가장 구체적인 결과 수치는 무엇인가요?`,
      "지원 직무와 맞지 않는 경험을 어떻게 직무 언어로 바꿔 설명할 건가요?",
    ],
    realityAdvice: [
      "적성 결과는 방향을 좁히는 도구입니다. 최종 합격은 직무별 증거물의 밀도가 결정합니다.",
      "관심 직무 3개를 동시에 준비하기보다 1순위 직무의 포트폴리오를 먼저 끝내세요.",
      "채용공고 문장과 본인 경험 문장을 나란히 놓고 빈칸을 메우는 방식이 가장 빠릅니다.",
    ],
  };
}

function emptyDimensionScores() {
  return jobFitDimensions.reduce(
    (acc, dimension) => ({ ...acc, [dimension]: 0 }),
    {} as Record<JobFitDimension, number>,
  );
}

function emptyRoleScores() {
  return jobFitRoles.reduce(
    (acc, role) => ({ ...acc, [role.key]: 0 }),
    {} as Record<JobFitRoleKey, number>,
  );
}

function getMaxDimensionScores() {
  const scores = emptyDimensionScores();
  jobFitQuestions.forEach((question) => {
    jobFitDimensions.forEach((dimension) => {
      scores[dimension] += Math.max(
        question.choices[0].weights[dimension] || 0,
        question.choices[1].weights[dimension] || 0,
      );
    });
  });
  return scores;
}

function getRoleScores(
  dimensionScores: Record<JobFitDimension, number>,
  directRoleScores: Record<JobFitRoleKey, number>,
) {
  const raw = jobFitRoles.map((role) => {
    const dimensionScore = Object.entries(role.weights).reduce(
      (sum, [dimension, weight]) =>
        sum + dimensionScores[dimension as JobFitDimension] * (weight || 0),
      0,
    );
    return {
      ...role,
      score: dimensionScore + directRoleScores[role.key] * 7,
      fit: 0,
    };
  });
  const topScore = Math.max(...raw.map((role) => role.score), 0);
  return raw
    .map((role) => ({
      ...role,
      fit: topScore > 0 ? Math.max(1, Math.round((role.score / topScore) * 100)) : 0,
    }))
    .sort((a, b) => b.score - a.score);
}

function getReadiness(
  payload: StudioPayload,
  answers: JobFitAnswer[],
): JobFitSummary["readiness"] {
  const profileFields = [
    payload.profile.targetRole,
    payload.profile.company,
    payload.profile.industry,
    payload.profile.education,
    payload.profile.training,
    payload.profile.project,
    payload.profile.projectDescription,
    payload.profile.careerType,
    payload.profile.value,
    payload.profile.desiredTeam,
  ];
  const profileScore = Math.round(
    (profileFields.filter((value) => Boolean(value?.trim())).length /
      profileFields.length) *
      100,
  );

  const stories = payload.stories || [];
  const storyScore = stories.length
    ? Math.round(
        stories.reduce((sum, story) => {
          const parts = [
            story.title,
            story.situation,
            story.task,
            story.action,
            story.result,
            story.insight,
            story.metric,
          ];
          return (
            sum +
            (parts.filter((value) => Boolean(value?.trim())).length /
              parts.length) *
              100
          );
        }, 0) / stories.length,
      )
    : 0;

  const techEvidence = [
    payload.profile.techLanguages,
    payload.profile.techFramework,
    payload.profile.techTools,
    payload.profile.projectDescription,
    payload.profile.projectPeriod,
    (payload.techStack || []).join(", "),
  ];
  const portfolioScore = Math.min(
    100,
    Math.round(
      (techEvidence.filter((value) => Boolean(value?.trim())).length /
        techEvidence.length) *
        70 +
        (stories.filter((story) => Boolean(story.metric?.trim())).length > 0
          ? 20
          : 0) +
        (payload.profile.awards || payload.profile.activities ? 10 : 0),
    ),
  );

  const directionScore = Math.round(
    (answers.length / jobFitQuestions.length) * 70 +
      (payload.profile.targetRole ? 15 : 0) +
      (payload.profile.industry ? 15 : 0),
  );

  const items: JobFitReadinessItem[] = [
    {
      label: "프로필 선명도",
      score: profileScore,
      note:
        profileScore >= 80
          ? "지원 방향을 설명할 기본 정보가 충분합니다."
          : "지원 기업/산업/직무 선택 이유를 더 채워야 합니다.",
    },
    {
      label: "경험 근거",
      score: storyScore,
      note:
        storyScore >= 80
          ? "STAR 원자료가 비교적 탄탄합니다."
          : "상황-행동-결과-배운 점 중 빈칸이 있어 면접 방어가 약해질 수 있습니다.",
    },
    {
      label: "포트폴리오 증거",
      score: portfolioScore,
      note:
        portfolioScore >= 80
          ? "기술/프로젝트 증거를 문서화하기 좋은 상태입니다."
          : "결과물 링크, 역할, 수치, 회고를 더 모아야 합니다.",
    },
    {
      label: "직무 방향성",
      score: Math.min(100, directionScore),
      note:
        directionScore >= 80
          ? "진단 응답과 현재 지원 방향을 비교할 수 있습니다."
          : "질문 응답을 끝까지 완료하고 1순위 직무를 좁히세요.",
    },
  ];
  const overall = Math.round(
    items.reduce((sum, item) => sum + item.score, 0) / items.length,
  );

  return {
    overall,
    label:
      overall >= 85
        ? "지원 직전 점검 단계"
        : overall >= 70
          ? "포트폴리오 보강 단계"
          : overall >= 50
            ? "직무 좁히기 단계"
            : "원자료 수집 단계",
    items,
  };
}

function normalizePercent(score: number, max: number) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, Math.round((score / max) * 100)));
}
