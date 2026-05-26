import type { SectionKey, StudentProfile, StoryInput } from "@/lib/types";

export type BusyState = null | "draft" | "polish" | "docx" | SectionKey;

export type CoachReport = {
  context: string;
  headline: string;
  strengths: string[];
  risks: string[];
  nextActions: string[];
  rewrite?: string;
  questions?: string[];
};

export type CoachRequest = (
  context: string,
  studentInput?: string,
) => Promise<void>;

export type GeminiCaller = (
  mode: "draft" | "polish",
  sectionKey?: SectionKey,
) => Promise<void>;

export type ProfileUpdater = <K extends keyof StudentProfile>(
  key: K,
  value: StudentProfile[K],
) => void;

export type StoryUpdater = <K extends keyof StoryInput>(
  id: string,
  key: K,
  value: StoryInput[K],
) => void;

export type SectionUpdater = (
  key: SectionKey,
  field: "title" | "body",
  value: string,
) => void;
