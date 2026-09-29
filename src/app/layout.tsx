import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MoES India | Disaster Management Dashboard | IMD Nowcasting Portal',
  description:
    'Real-time spatiotemporal lightning and severe thunderstorm nowcasting dashboard built for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD). AI-powered 0–6 hour weather prediction system.',
  keywords: [
    'IMD', 'MoES', 'nowcasting', 'lightning prediction', 'thunderstorm',
    'disaster management', 'India weather', 'Doppler radar', 'INSAT-3D', 'CAPE',
  ],
  authors: [{ name: 'MoES AI Team' }],
  openGraph: {
    title: 'MoES India | IMD Nowcasting Portal',
    description: 'AI-powered lightning nowcasting & severe weather dashboard for disaster management.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
