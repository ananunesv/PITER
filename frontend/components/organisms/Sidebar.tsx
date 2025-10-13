"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BarChart2, GitBranch } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "https://unb-mds.github.io/Projeto-P.I.T.E.R/", icon: Home, external: true },
  { label: "Pesquisa", href: "/", icon: Search },
  { label: "Comparação", href: "/compare", icon: BarChart2 },
  { label: "Ranking", href: "/ranking", icon: BarChart2 },
  { label: "Repositório - GitHub", href: "https://github.com/unb-mds/Projeto-P.I.T.E.R.git", icon: GitBranch, external: true },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-gradient-to-b from-white to-gray-100 shadow-lg flex flex-col items-center py-8 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <a
          href="https://unb-mds.github.io/Projeto-P.I.T.E.R/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/logo.png"
            alt="logo"
            width={48}
            height={48}
            className="transition-transform duration-300 hover:scale-110"
          />
        </a>
      </div>

      {/* Navigation */}
      <nav className="w-full px-4">
        <ul className="flex flex-col gap-2">
          {navItems.map(({ label, href, icon: Icon, external }) => {
            const active = isActive(href);
            const baseStyle =
              "flex items-center gap-3 py-3 px-5 rounded-full transition-all duration-200 text-sm font-medium";
            const activeStyle = active
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600";
            const linkClass = `${baseStyle} ${activeStyle}`;

            return (
              <li key={label}>
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <Icon size={18} />
                    <span>{label}</span>
                  </a>
                ) : (
                  <Link href={href} className={linkClass}>
                    <Icon size={18} />
                    <span>{label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
