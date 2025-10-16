"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, AlignEndHorizontal,  ChartCandlestick } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: "Pesquisa", href: "/", icon: Search },
  { label: "Comparação", href: "/compare", icon: AlignEndHorizontal },
  { label: "Ranking", href: "/ranking", icon: ChartCandlestick },
];

export const Navbar_second: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <main className="w-full mt-50 z-50 bg-transparent backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-center py-3 px-6">
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
    </main>
  );
};

export default Navbar_second;
