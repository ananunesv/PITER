import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/organisms/Sidebar';
import Footer from '@/components/organisms/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'P.I.T.E.R - Painel de Investimentos em Transparência e Eficiência de Recursos',
  description: 'Análise de investimentos públicos em pesquisa e eletrônicos para Goiás e Goiânia',
  keywords: 'investimentos públicos, transparência, Goiás, Goiânia, pesquisa, eletrônicos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div id="root" className="min-h-screen bg-piter-100">
          <Sidebar />
          <div className="ml-60 min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}