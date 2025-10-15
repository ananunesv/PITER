"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BarChart2, Github } from "lucide-react";

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
  { label: "Repositório - GitHub", href: "https://github.com/unb-mds/Projeto-P.I.T.E.R.git", icon: Github, external: true },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white/80 backdrop-blur-xl shadow-md">
      <div className="container mx-auto flex items-center justify-between py-3 px-6">
        {/* Logo */}
        <a
          href="https://unb-mds.github.io/Projeto-P.I.T.E.R/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3"
        >
          <img
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
            className="transition-transform duration-300 hover:scale-110"
          />
        </a>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-2">
            {navItems.map(({ label, href, icon: Icon, external }) => {
              const active = isActive(href);
              const baseStyle =
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium";
              const activeStyle = active
                ? "bg-blue-600/90 text-white shadow"
                : "text-gray-800 hover:bg-blue-50/80 hover:text-blue-600";
              const linkClass = `${baseStyle} ${activeStyle}`;

              return (
                <li key={label}>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      <Icon size={18} />
                      <span className="hidden sm:inline">{label}</span>
                    </a>
                  ) : (
                    <Link href={href} className={linkClass}>
                      <Icon size={18} />
                      <span className="hidden sm:inline">{label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
