import type { SectionKey, ToneMode } from "@/lib/types";

export const toneLabels: Record<ToneMode, string> = {
  professional: "전문적",
  warm: "자연스러움",
  direct: "담백함",
};

export const instructorProofs = [
  {
    title: "창업교육 13년",
    detail: "수강생의 경험을 직무 언어로 바꾸는 현장형 교육",
  },
  {
    title: "대학 강의",
    detail: "학생 수준에서 바로 쓰는 항목별 작성 구조",
  },
  {
    title: "액셀러레이터",
    detail: "심사 관점으로 보는 설득력·근거·차별점",
  },
  {
    title: "벤처창업학회",
    detail: "산업·직무 변화에 맞춘 자기소개서 관점",
  },
] as const;

export const categoryNotes: Record<
  SectionKey,
  { purpose: string; evidence: string; avoid: string }
> = {
  growth: {
    purpose: "가치관이 만들어진 경험을 현재 직무 태도와 연결",
    evidence: "반복 행동, 선택의 이유, 이후 달라진 태도",
    avoid: "출생부터 시간순으로 나열",
  },
  personality: {
    purpose: "장점은 제출 문서에, 단점은 면접 답변으로 분리",
    evidence: "협업·갈등 조율·책임 수행 사례",
    avoid: "장점과 단점을 같은 문단에 섞기",
  },
  motivation: {
    purpose: "회사·직무·나의 준비가 한 문단에서 맞물리게 설계",
    evidence: "직무 선택 계기, 훈련 내용, 산업 이해",
    avoid: "귀사의 비전에 공감 같은 범용 문장",
  },
  competency: {
    purpose: "지식·기술·태도를 나눠 실무 수행 가능성 증명",
    evidence: "프로젝트 역할, 구현 기능, 사용 기술, 결과",
    avoid: "기술명만 나열하고 적용 장면 누락",
  },
  ambition: {
    purpose: "인턴 기간의 적응 방식과 종료 시점 목표를 제시",
    evidence: "조직 태도, 기여 업무, 3개월 KPI",
    avoid: "최선을 다하겠다는 막연한 다짐",
  },
};

export const categoryOutputs: Record<SectionKey, string> = {
  growth: "가치관 선언 → STAR 근거 → 직무 태도",
  personality: "장점 2개 → 협업 사례 → 직무 적합성",
  motivation: "직무 계기 → 훈련 준비 → 회사 업무 연결",
  competency: "기술·역할 → 구현 장면 → 성과",
  ambition: "적응 태도 → 직무 기여 → 3개월 목표",
};

export const categoryDeepDive: Record<
  SectionKey,
  { prompt: string; input: string[]; example: string; aiContext: string }
> = {
  growth: {
    prompt: "가치관이 만들어진 순간을 현재 직무 태도로 연결했는가?",
    input: ["반복 행동", "선택의 이유", "현재 달라진 태도"],
    example: "매일 오류 목록을 정리한 습관 → 끝까지 완성하는 태도",
    aiContext: "성장과정 항목 구조를 강의 공식에 맞게 점검",
  },
  personality: {
    prompt: "장점이 실제 협업 행동으로 증명되는가?",
    input: ["팀 내 역할", "갈등·일정 조율", "결과 또는 피드백"],
    example: "요구사항을 기능 단위로 정리해 팀 공유 속도를 높임",
    aiContext: "성격의 장단점 항목에서 장점 중심 제출 문장 점검",
  },
  motivation: {
    prompt: "직무 선택 이유와 회사 업무가 한 문단에서 맞물리는가?",
    input: ["직무 선택 계기", "훈련 내용", "기업·산업 단서"],
    example: "Spring 기능 구현 경험 → 백엔드 안정성 업무에 기여",
    aiContext: "직무 지원동기 항목의 묻지마 지원 표현 제거",
  },
  competency: {
    prompt: "기술명 나열이 아니라 구현 장면과 역할이 보이는가?",
    input: ["사용 기술", "구현 기능", "본인 역할", "성과"],
    example: "Spring MVC로 회원·게시판 기능 구현, 예외 처리 담당",
    aiContext: "보유 직무역량 항목을 NCS 지식·기술·태도로 분리",
  },
  ambition: {
    prompt: "인턴 기간 행동 목표와 종료 시점 지표가 명확한가?",
    input: ["적응 태도", "기여 업무", "3개월 KPI"],
    example: "운영 이슈 매뉴얼화, 코드 리뷰 피드백 반영, 전환 목표",
    aiContext: "입사 후 포부 항목을 인턴 관점 KPI형 문장으로 점검",
  },
};

export const talentSectionMap = [
  "성격 장점",
  "직무역량",
  "성격 장점",
  "지원동기",
  "성장과정",
  "직무역량",
  "포부",
  "지원동기",
  "직무역량",
] as const;

export const talentProofPrompts = [
  "협업 상황에서 내 행동이 바뀐 장면을 고릅니다.",
  "기술을 익혀 실제 기능으로 만든 장면을 붙입니다.",
  "원칙을 지키기 위해 불편함을 감수한 경험이 필요합니다.",
  "실패 후 다시 시도한 근거가 있으면 지원동기가 살아납니다.",
  "선택의 이유와 이후 달라진 태도를 성장과정에 씁니다.",
  "새로운 아이디어가 기능·프로세스 개선으로 이어진 사례를 씁니다.",
  "긴 호흡으로 버틴 기간과 목표를 포부의 KPI로 바꿉니다.",
  "산업·사용자·팀 관점으로 시야가 넓어진 순간을 찾습니다.",
  "빠른 실행이 결과로 이어진 수치나 피드백을 연결합니다.",
] as const;

export const talentDetailCards = [
  { proof: "회의 기록, 역할 분담표, 갈등 조율 장면", risk: "좋은 사람이라는 평가만 남기면 약합니다.", question: "내가 팀의 속도나 분위기를 바꾼 행동은 무엇인가?" },
  { proof: "기술 학습 기록, 구현 기능, 오류 해결 과정", risk: "기술명만 나열하면 실무 가능성이 보이지 않습니다.", question: "어떤 기능을 어떤 기술로 직접 만들었는가?" },
  { proof: "규칙을 지킨 선택, 품질 기준, 책임 있는 보고", risk: "원칙주의가 융통성 없음처럼 보이지 않게 결과를 붙입니다.", question: "불편해도 기준을 지켜 얻은 결과가 있는가?" },
  { proof: "실패 후 재시도, 낯선 과제 도전, 개선 결과", risk: "무모함보다 준비된 시도와 학습을 보여줘야 합니다.", question: "실패 뒤 무엇을 바꾸어 다시 시도했는가?" },
  { proof: "끝까지 맡은 경험, 자율적 개선, 책임 완수", risk: "책임감은 가장 흔한 단어라 구체 행동이 반드시 필요합니다.", question: "누가 시키지 않았는데 내가 책임진 일은 무엇인가?" },
  { proof: "새 아이디어, 기능 개선, 사용자 관점 전환", risk: "튀는 아이디어보다 실제 가치 창출이 중요합니다.", question: "내 아이디어가 결과물에 어떻게 반영되었는가?" },
  { proof: "긴 기간의 몰입, 반복 훈련, 목표 달성", risk: "열심히 했다는 말만 반복하면 포부가 약해집니다.", question: "버틴 기간과 목표를 수치나 결과로 말할 수 있는가?" },
  { proof: "산업 이해, 사용자 관점, 다양한 협업 경험", risk: "어학 능력만 쓰면 직무 연결이 약합니다.", question: "넓어진 관점이 어떤 선택이나 행동으로 이어졌는가?" },
  { proof: "빠른 의사결정, 실행 계획, 피드백 반영", risk: "리더라는 호칭보다 움직인 방식과 결과가 중요합니다.", question: "내 실행이 팀의 다음 행동을 빠르게 만든 순간은 무엇인가?" },
] as const;

export const writingDiagnostics = [
  {
    why: "가정형 피동 표현은 책임 소재를 흐립니다.",
    method: "주어를 앞으로 가져오고, 내가 할 행동을 동사로 끝냅니다.",
  },
  {
    why: "감정 표현이 반복되어 문장이 길고 흐릿합니다.",
    method: "핵심 감정 하나만 남기고 나머지는 삭제합니다.",
  },
  {
    why: "‘그’가 무엇을 가리키는지 불명확합니다.",
    method: "지시어를 실제 명사로 바꿔 평가자가 바로 읽게 합니다.",
  },
  {
    why: "조사가 겹치면 문장 리듬이 어색해집니다.",
    method: "불필요한 조사를 덜어 자연스러운 구어 문장으로 바꿉니다.",
  },
  {
    why: "명사형 표현이 많으면 문장이 딱딱하고 책임 주체가 흐립니다.",
    method: "‘~적인 것’을 실제 행동 동사로 바꾸면 문장이 짧아집니다.",
  },
  {
    why: "같은 뜻의 단어를 반복하면 평가자가 핵심을 놓칩니다.",
    method: "중복 단어 하나를 지우고 남은 자리에 결과를 넣습니다.",
  },
  {
    why: "번역투는 자기소개서 문장을 보고서처럼 멀게 만듭니다.",
    method: "‘행한다, 갖는다, 시키다’를 한국어 동사로 풀어 씁니다.",
  },
  {
    why: "긴 문장은 좋은 경험도 읽기 어렵게 만듭니다.",
    method: "문장을 둘로 나누고 첫 문장에 핵심 행동을 둡니다.",
  },
] as const;

export const keywordMappingRows = [
  {
    keyword: "책임감",
    episode: "팀 프로젝트 마감 지연을 끝까지 정리",
    section: "성장과정 / 직무역량",
  },
  {
    keyword: "소통",
    episode: "요구사항을 기능 단위로 나눠 팀에 공유",
    section: "성격 장점",
  },
  {
    keyword: "Spring",
    episode: "회원·게시판 기능 구현과 예외 처리",
    section: "보유 직무역량",
  },
  {
    keyword: "자기주도",
    episode: "사이드 프로젝트 운영 기록을 GitHub에 정리",
    section: "지원동기 / 포부",
  },
] as const;

export const reviewExamples: Record<
  SectionKey,
  { issue: string; direction: string; improved: string }
> = {
  growth: {
    issue: "어릴 때부터 성실했습니다.",
    direction: "성실함이 드러난 반복 행동과 현재 직무 태도를 연결",
    improved: "프로젝트 마감 전 매일 오류 목록을 정리하며 맡은 기능을 끝까지 완성했습니다.",
  },
  personality: {
    issue: "저의 장점은 책임감이고 단점은 완벽주의입니다.",
    direction: "장점 하나를 STAR 사례로 증명하고 단점은 제출 문서에서 분리",
    improved: "요구사항을 기능 단위로 나눠 팀원에게 공유하며 일정 지연을 줄였습니다.",
  },
  motivation: {
    issue: "귀사의 비전에 깊이 공감하여 지원했습니다.",
    direction: "직무 선택 계기, 훈련 내용, 기업 업무를 한 문단에서 연결",
    improved: "Spring 기반 기능 구현 경험을 바탕으로 서비스 안정성을 높이는 백엔드 업무에 기여하고자 지원했습니다.",
  },
  competency: {
    issue: "Java, Spring, MySQL을 사용할 수 있습니다.",
    direction: "기술명보다 어떤 기능을 어떤 역할로 구현했는지 제시",
    improved: "Spring MVC 구조로 회원·게시판 기능을 구현하며 DB 설계와 예외 처리를 맡았습니다.",
  },
  ambition: {
    issue: "입사 후 최선을 다해 회사에 기여하겠습니다.",
    direction: "인턴 기간 행동, 직무 기여, 종료 시점 목표를 KPI처럼 명확화",
    improved: "3개월 동안 운영 이슈를 매뉴얼로 정리하고 코드 리뷰 피드백을 반영해 정규직 전환을 목표로 하겠습니다.",
  },
};
