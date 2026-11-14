import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & News',
  description: 'Stay updated with the latest news, business insights, and digital billboard advertising trends from Studio Arella and Bems Screens.',
  openGraph: {
    title: 'Blog & News | Studio Arella',
    description: 'Stay updated with the latest news, business insights, and digital billboard advertising trends from Studio Arella and Bems Screens.',
    url: 'https://studioarella.com/blog',
    siteName: 'Studio Arella',
    images: [
      {
        url: 'https://studioarella.com/billboard.jpg',
        width: 1200,
        height: 630,
        alt: 'Studio Arella News & Insights',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & News | Studio Arella',
    description: 'Stay updated with the latest news, business insights, and digital billboard advertising trends from Studio Arella and Bems Screens.',
    images: ['https://studioarella.com/billboard.jpg'],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

