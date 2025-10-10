"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const isActive = (p: string) => pathname === p;

  return (
    <aside className="w-64 bg-white h-screen shadow-md fixed left-0 top-0 flex flex-col items-center py-8">
      <div className="flex items-center space-x-3 mb-8">
        <a href="https://unb-mds.github.io/Projeto-P.I.T.E.R/">
        <img
          src="/logo.png"
          alt="logo"
          width={44}
          height={44}
          className="transition-transform duration-300 hover:scale-[1.2]"
        />
        </a>
      </div>

      <nav className="w-full">
        <ul className="flex flex-col gap-3 px-4">
          <li>
            <Link href="/" className={`block py-3 px-4 rounded-full text-center ${isActive('/') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-700 hover:text-white focus:outline-offset-2 focus:outline-[#255929] active:bg-gray-500'}`}>
              Pesquisa
            </Link>
          </li>
          <li>
            <Link href="/compare" className={`block py-3 px-4 rounded-full text-center ${isActive('/compare') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-700 hover:text-white focus:outline-offset-2 focus:outline-[#255929] active:bg-gray-500'}`}>
              Comparação
            </Link>
          </li>
          <li>
            <Link href="/ranking" className={`block py-3 px-4 rounded-full text-center ${isActive('/ranking') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-700 hover:text-white focus:outline-offset-2 focus:outline-[#255929] active:bg-gray-500'}`}>
              Ranking
            </Link>
          </li>

          <li>
            <Link href="https://github.com/unb-mds/Projeto-P.I.T.E.R.git" className={`block py-3 px-4 rounded-full text-center ${isActive('https://github.com/unb-mds/Projeto-P.I.T.E.R.git') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600'}`}>
              Repositório - Github
            </Link>
          </li>

        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
