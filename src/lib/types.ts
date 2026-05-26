export type SectionKey =
  | "growth"
  | "personality"
  | "motivation"
  | "competency"
  | "ambition";

export type ToneMode = "professional" | "warm" | "direct";

export type StoryInput = {
  id: string;
  title: string;
  category: SectionKey;
  situation: string;
  task: string;
  action: string;
  result: string;
  insight: string;
  metric: string;
};

export type StudentProfile = {
  name: string;
  targetRole: string;
  company: string;
  industry: string;
  education: string;
  training: string;
  project: string;
  careerType: string;
  value: string;
  desiredTeam: string;
  tone: ToneMode;
  // Resume fields (optional, default "")
  nameHanja: string;
  nameEng: string;
  birth: string;
  address: string;
  phone: string;
  email: string;
  university: string;
  universityPeriod: string;
  highschool: string;
  highschoolPeriod: string;
  certificates: string;
  military: string;
  trainingPeriod: string;
  trainingHours: string;
  techOSDB: string;
  techTools: string;
  techLanguages: string;
  techWeb: string;
  techFramework: string;
  techApp: string;
  projectPeriod: string;
  projectDescription: string;
  career: string;
  awards: string;
  activities: string;
  volunteer: string;
  language: string;
  recommendation: string;
};

export type DraftSection = {
  title: string;
  body: string;
  rationale?: string;
  keywords?: string[];
  checklist?: string[];
};

export type DraftSections = Record<SectionKey, DraftSection>;

export type StudioPayload = {
  profile: StudentProfile;
  strengths: string[];
  techStack: string[];
  stories: StoryInput[];
  sections: DraftSections;
};

export type GeminiMode = "draft" | "section" | "polish";

export type QualityReport = {
  headline: string;
  score: number;
  styleWarnings: string[];
  missingQuestions: string[];
  strengthMapping: string[];
};

export type SectionGuide = {
  intent: string;
  formula: string[];
  evidence: string[];
  cautions: string[];
};

export type SlideMeta = {
  id: string;
  kicker: string;
  chapter: string;
  title: string;
  subtitle: string;
};

export type TalentArchetype = {
  name: string;
  sub: string;
  keywords: string[];
  accent: string;
};

export type DiamondStep = {
  number: string;
  title: string;
  detail: string;
  example: string;
  accent: string;
};

export type BeforeAfterExample = {
  label: string;
  before: string;
  after: string;
};

export type FormRule = {
  icon: string;
  title: string;
  detail: string;
  bullets: string[];
};
