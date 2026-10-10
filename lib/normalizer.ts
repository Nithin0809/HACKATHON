import { ProductionKit, HookOption, ScriptItem, ScriptShot, CaptionData } from '@/types/reelforge';

export const ensureString = (val: unknown, fallback = ''): string => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (!val) return fallback;
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    return String(obj.text || obj.note || obj.description || obj.value || obj.title || JSON.stringify(val));
  }
  return String(val);
};

export const ensureArray = <T = unknown>(val: unknown): T[] => {
  if (Array.isArray(val)) return val as T[];
  if (!val) return [];
  if (typeof val === 'string') {
    return val.split('\n').map(s => s.trim()).filter(Boolean) as unknown as T[];
  }
  if (typeof val === 'object') {
    return Object.values(val) as T[];
  }
  return [val as T];
};

export const normalizeResult = (raw: unknown): ProductionKit | null => {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  const title = ensureString(record.title, 'Production Kit');
  const creative_direction = ensureString(record.creative_direction, 'Creator video plan');

  const rawHooks = ensureArray(record.hooks);
  const hooks: HookOption[] = rawHooks.map((h, i) => {
    if (typeof h === 'string') return { text: h, angle: `Angle ${i + 1}` };
    const hookObj = (h && typeof h === 'object' ? h : {}) as Record<string, unknown>;
    return {
      text: ensureString(hookObj.text || hookObj.hook, `Hook angle ${i + 1}`),
      angle: ensureString(hookObj.angle, `Angle ${i + 1}`)
    };
  });

  const rawScript = ensureArray(record.script);
  const script: ScriptItem[] = rawScript.map((s, i) => {
    if (typeof s === 'string') return { time: `00:0${i * 5}`, voiceover: s, delivery: '' };
    const scriptObj = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
    return {
      time: ensureString(scriptObj.time, `Scene ${i + 1}`),
      voiceover: ensureString(scriptObj.voiceover || scriptObj.text || scriptObj.script, ''),
      delivery: ensureString(scriptObj.delivery, '')
    };
  });

  const rawShots = ensureArray(record.shots);
  const shots: ScriptShot[] = rawShots.map((s, i) => {
    const shotObj = (s && typeof s === 'object' ? s : {}) as Record<string, unknown>;
    return {
      time: ensureString(shotObj.time, `${i * 5}s`),
      duration: typeof shotObj.duration === 'number' ? shotObj.duration : undefined,
      title: ensureString(shotObj.title, `Shot ${i + 1}`),
      voiceover: ensureString(shotObj.voiceover, ''),
      visual: ensureString(shotObj.visual || shotObj.scene || shotObj.video, 'Visual description'),
      camera: ensureString(shotObj.camera || shotObj.framing, 'Medium shot'),
      overlay: ensureString(shotObj.overlay || shotObj.onScreenText || shotObj.text, ''),
      edit: ensureString(shotObj.edit || shotObj.pacing, 'Cut on beat'),
      audio: ensureString(shotObj.audio || shotObj.sound || shotObj.sfx, 'Background audio')
    };
  });

  const captions: CaptionData = { short: '', engaging: '', hashtags: [] };
  if (typeof record.captions === 'string') {
    captions.engaging = record.captions;
    captions.short = record.captions.slice(0, 100);
  } else if (record.captions && typeof record.captions === 'object') {
    const capObj = record.captions as Record<string, unknown>;
    captions.short = ensureString(capObj.short, '');
    captions.engaging = ensureString(capObj.engaging || capObj.long || capObj.caption, captions.short);

    if (Array.isArray(capObj.hashtags)) {
      captions.hashtags = capObj.hashtags.map(t => ensureString(t)).filter(Boolean);
    } else if (typeof capObj.hashtags === 'string') {
      captions.hashtags = capObj.hashtags.split(/\s+/).filter(Boolean);
    }
  }

  const rawNotes = ensureArray(record.production_notes);
  const production_notes = rawNotes.map(n => ensureString(n)).filter(Boolean);

  const planId = (record.id && typeof record.id === 'string' && record.id.trim())
    ? record.id.trim()
    : `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: planId,
    title,
    creative_direction,
    hooks,
    script,
    shots,
    captions,
    production_notes,
    metadata: record.metadata as ProductionKit['metadata']
  };
};
