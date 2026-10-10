export interface HookOption {
  text: string;
  angle: string;
}

export interface ScriptItem {
  time: string;
  voiceover: string;
  delivery: string;
}

export interface ScriptShot {
  time: string;
  duration?: number;
  title: string;
  voiceover: string;
  visual: string;
  camera: string;
  overlay: string;
  edit: string;
  audio: string;
  imageUrl?: string;
  imageLoading?: boolean;
  imageError?: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export interface CaptionData {
  short: string;
  engaging: string;
  hashtags: string[];
}

export interface ProductionMetadata {
  platform?: string;
  duration?: number;
  niche?: string;
  audience?: string;
  tone?: string;
  mode?: 'ai' | 'demo';
  provider?: string;
  model?: string;
  [key: string]: unknown;
}

export interface ProductionKit {
  id?: string;
  title: string;
  creative_direction: string;
  hooks: HookOption[];
  script: ScriptItem[];
  shots: ScriptShot[];
  captions: CaptionData;
  production_notes: string[];
  metadata?: ProductionMetadata;
}

export interface ReelBriefForm {
  topic: string;
  platform: string;
  duration: string;
  niche: string;
  audience: string;
  tone: string;
  language: string;
  goal: string;
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  formattedDate: string;
  form: ReelBriefForm;
  result: ProductionKit;
}

export interface HealthResponse {
  ok: boolean;
  mode: 'ai' | 'demo';
  provider: string;
}
