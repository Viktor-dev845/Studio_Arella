import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Quicksand, Outfit } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/ToastProvider';
import PublicThemeGuard from '@/components/ui/PublicThemeGuard';
import GoogleOneTap from '@/components/ui/GoogleOneTap';
import AuthInitializer from '@/components/ui/AuthInitializer';
import RouteTransitionLoader from '@/components/ui/RouteTransitionLoader';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://studioarella.com'),
  title: {
    default: 'Studio Arella — Bems Screens | Advertise in Umuahia',
    template: '%s | Studio Arella',
  },
  description: 'Book ad slots on the Studio Arella LED screen at Bems Junction, Umuahia. Plans from ₦1,000 per minute. Upload your ad, select your slot, pay online — go live from anywhere in the world.',
  keywords: ['outdoor advertising', 'billboard Umuahia', 'ad screen Nigeria', 'Bems Group', 'Studio Arella', 'Abia State advertising'],
  openGraph: {
    title: 'Studio Arella — Bems Screens | Advertise in Umuahia',
    description: 'Book ad slots on the Studio Arella LED screen at Bems Junction, Umuahia. Plans from ₦1,000 per minute. Upload your ad, select your slot, pay online — go live from anywhere in the world.',
    url: 'https://studioarella.com',
    siteName: 'Studio Arella',
    images: [
      {
        url: 'https://studioarella.com/billboard.jpg',
        width: 1200,
        height: 630,
        alt: 'Studio Arella Digital Billboard',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Studio Arella — Bems Screens | Advertise in Umuahia',
    description: 'Book ad slots on the Studio Arella LED screen at Bems Junction, Umuahia.',
    images: ['https://studioarella.com/billboard.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${outfit.variable}`}>
      <body>
        <PublicThemeGuard />
        <AuthInitializer />
        <Suspense fallback={null}>
          <RouteTransitionLoader />
        </Suspense>
        <ToastProvider>
          <GoogleOneTap />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
