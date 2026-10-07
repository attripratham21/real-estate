import { Bodoni_Moda, Instrument_Sans } from 'next/font/google';
import './globals.css';

const display = Bodoni_Moda({ subsets: ['latin'], variable: '--display', style: ['normal', 'italic'] });
const body = Instrument_Sans({ subsets: ['latin'], variable: '--body' });

export const metadata = {
  title: 'Aurelian Estates | Architect-designed homes',
  description: 'Private collection of architect-designed residences, penthouses and land.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
