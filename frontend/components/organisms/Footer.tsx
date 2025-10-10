import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white/60 border-t mt-8 py-4">
      <div className="max-w-6xl mx-auto px-6 text-sm text-gray-600 text-center">
        © {new Date().getFullYear()} P.I.T.E.R — Procurador de Investimentos em Tecnologia Educacional e Recursos. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;
