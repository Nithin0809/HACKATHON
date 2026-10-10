import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReelForge AI — Short-Form Video Workflow Studio',
  description: 'Turn a rough idea into a complete short-form video plan — hooks, script, shot list, captions, and edit notes in one place.',
  keywords: ['Reels', 'TikTok', 'Shorts', 'AI Video Script', 'Storyboard Generator', 'Content Creator Tools'],
  authors: [{ name: 'ReelForge AI Team' }],
  openGraph: {
    title: 'ReelForge AI — Video Workflow Studio',
    description: 'AI-powered scriptwriter, storyboarder, and content strategist for Instagram Reels, YouTube Shorts, and TikTok.',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#09090e',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        {children}
      </body>
    </html>
  );
}
