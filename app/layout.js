import { FAVICON } from './brand';
import './globals.css';
import './storefront.css';
import './editorial.css';
import './product-detail.css';
import './header-navigation.css';
import './editorial-home.css';
import './wine-carousel.css';
import './compact-layout.css';
import AgeGate from './AgeGate';

export const metadata = {
  title: 'Videira Vinhoteca | Catálogo de Vinhos',
  description: 'Catálogo de vinhos da Videira Vinhoteca.',
  icons: { icon: FAVICON, shortcut: FAVICON, apple: FAVICON }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body><AgeGate/>{children}</body>
    </html>
  );
}
