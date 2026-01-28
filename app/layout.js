import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'Waadi Kashmir - Tours & Travel',
    template: '%s | Waadi Kashmir Tours',
  },
  description: 'Explore the beauty of Kashmir with Waadi Kashmir Tours & Travels. Curated packages for Srinagar, Gulmarg, Pahalgam, Leh-Ladakh and more.',
  keywords: [
    'Waadi Kashmir',
    'Kashmir tours',
    'Srinagar tour packages',
    'Gulmarg trip',
    'Pahalgam tour',
    'Leh Ladakh tour',
    'Kashmir travel agency',
    'Kashmir tour and travels',
  ],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Waadi Kashmir - Tours & Travel',
    description: 'Licensed Kashmir tour operator offering curated experiences across Srinagar, Gulmarg, Pahalgam and beyond.',
    siteName: 'Waadi Kashmir Tours',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Waadi Kashmir - Tours & Travel',
    description: 'Plan your dream Kashmir holiday with Waadi Kashmir Tours & Travels.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
