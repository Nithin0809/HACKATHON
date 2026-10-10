import { ScriptShot } from '@/types/reelforge';

export const downloadSingleImage = (dataUrl: string, filename: string): void => {
  if (typeof window === 'undefined') return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadAllImagesZip = async (shots: ScriptShot[], projectTitle: string): Promise<void> => {
  if (typeof window === 'undefined') return;

  const validShots = shots.filter(s => s.imageUrl);
  if (validShots.length === 0) {
    alert('No storyboard images available to download.');
    return;
  }

  const slug = (projectTitle || 'reelforge-storyboard')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);

  // Download frames sequentially with brief delays so browser downloads all cleanly
  for (let i = 0; i < validShots.length; i++) {
    const s = validShots[i];
    const shotSlug = (s.title || `shot-${i + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${slug}-shot-${String(i + 1).padStart(2, '0')}-${shotSlug}.png`;
    downloadSingleImage(s.imageUrl!, filename);
    await new Promise(r => setTimeout(r, 250));
  }
};
