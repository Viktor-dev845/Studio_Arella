import type { Metadata, Viewport } from 'next';
import { Quicksand, Outfit } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/ToastProvider';
import PublicThemeGuard from '@/components/ui/PublicThemeGuard';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: 'variable',
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
  title: 'Studio Arella — Bems Screens | Advertise in Umuahia',
  description: 'Book ad slots on the Studio Arella LED screen at Bems Junction, Umuahia. Plans from ₦1,000 per minute. Upload your ad, select your slot, pay online — go live from anywhere in the world.',
  keywords: ['outdoor advertising', 'billboard Umuahia', 'ad screen Nigeria', 'Bems Group', 'Studio Arella', 'Abia State advertising'],
};

// Without this, mobile browsers render the page at a fixed desktop-width
// virtual viewport (~980px) and zoom the whole thing out to fit the screen
// instead of actually laying it out at the device's real width — which
// means every responsive breakpoint in the app's CSS never triggers on a
// real phone, regardless of how correct the media queries themselves are.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${quicksand.variable} ${outfit.variable}`}>
      <body>
        <PublicThemeGuard />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
