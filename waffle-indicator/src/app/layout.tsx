import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SYRUP METER — $ASTS Satellite Alignment Tracker',
  description:
    'Track AST SpaceMobile satellite constellation alignment over 55 global AOIs in real-time. SGP4 propagation. Polygon-accurate coverage. The Pizza Index is dead.',
  openGraph: {
    title: 'SYRUP METER',
    description:
      'LEO geometry is deterministic. Pizza is lagging. Syrup is leading. 55 AOIs. Real SGP4. Polygon coverage.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SYRUP METER — $ASTS',
    description:
      'Track satellite syrup levels over Iran, Taiwan, Ukraine + 52 more hotspots.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
