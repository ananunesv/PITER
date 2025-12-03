"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Book, Github } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Sobre Nos", href: "https://unb-mds.github.io/Projeto-P.I.T.E.R/", icon: Book, external: true },
  { label: "GitHub", href: "https://github.com/unb-mds/Projeto-P.I.T.E.R.git", icon: Github, external: true },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-neutral-100">
      <div className="container mx-auto flex items-center justify-between py-3 px-6">
        {/* Logo */}
        <a
          href="https://unb-mds.github.io/Projeto-P.I.T.E.R/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <img
            src="/logo.png"
            alt="P.I.T.E.R Logo"
            width={40}
            height={40}
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-semibold text-neutral-800 hidden sm:block">P.I.T.E.R</span>
        </a>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-1">
            {navItems.map(({ label, href, icon: Icon, external }) => {
              const active = !external && isActive(href);
              
              const linkClass = `
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${active 
                  ? "bg-indigo-100 text-indigo-700" 
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }
              `;

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
