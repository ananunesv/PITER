import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-300 text-white py-4 px-6">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/home_page" className="flex items-center">
                            <img src="/logo.png" alt="P.I.T.E.R logo" width={40} height={40} className="rounded" />
                            <span className="sr-only">P.I.T.E.R - Home</span>
                        </Link>
                    </div>

                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                        <a href="https://github.com/unb-mds/Projeto-P.I.T.E.R">
                            <img src="/github-mark.png" alt="logo_unb" width={50} height={50} className="rounded"/>
                        </a>
                    </div>
                </div>
            </header>
  );
};