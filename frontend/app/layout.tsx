import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/organisms/Navbar';
import Footer from '@/components/organisms/Footer';

export const metadata: Metadata = {
  title: 'P.I.T.E.R - Transparencia em Educacao',
  description: 'Plataforma de Integracao e Transparencia em Educacao e Recursos',
  keywords: 'investimentos publicos, transparencia, Goias, educacao, tecnologia',
  icons: {
    icon: '/logo_inv.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
