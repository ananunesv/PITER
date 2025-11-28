import React from 'react';

function SugestaoPesquisa() {
    return ( 
        <div className="flex justify-center">
            <div className="bg-[#F0EBD8] rounded-xl p-6 w-96 mt-14">
                <div className="text-center">
                    <div className="text-sm font-medium text-[#01161E] mb-2">
                        💡 Dicas de Busca 💡
                    </div>
                    <ul className="text-sm text-[#01161E] list-disc text-left pl-6 space-y-1">
                        <li>Experimente um período de tempo mais amplo</li>
                        <li>Teste outras categorias tecnológicas</li>
                        <li>Verifique se há publicações recentes no município</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default SugestaoPesquisa;