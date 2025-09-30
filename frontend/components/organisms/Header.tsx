import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-800 text-white py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold">
            P.I.T.E.R
          </div>
          <div className="text-sm">
            Procurador de Investimentos em Tecnologia na Educação e Recursos
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">UnB</div>
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-blue-800 font-bold text-xs">UnB</span>
          </div>
        </div>
      </div>
    </header>
  );
};