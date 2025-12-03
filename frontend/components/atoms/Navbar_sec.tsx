"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, GitCompare, Trophy } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Pesquisar", href: "/", icon: Search },
  { label: "Comparar", href: "/compare", icon: GitCompare },
  { label: "Ranking", href: "/ranking", icon: Trophy },
];

const Navbar_sec = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <nav className="flex justify-center">
      <div className="glass-card px-2 py-2 inline-flex gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          
          return (
            <Link
              key={label}
              href={href}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-300 ease-out
                ${active 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30" 
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }
              `}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar_sec;
