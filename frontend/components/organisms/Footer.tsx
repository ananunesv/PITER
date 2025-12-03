import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-neutral-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="P.I.T.E.R" width={32} height={32} className="opacity-80" />
            <div className="text-sm">
              <span className="font-semibold text-neutral-700">P.I.T.E.R</span>
              <span className="text-neutral-400 ml-2">|</span>
              <span className="text-neutral-500 ml-2">Transparencia em Educacao</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/unb-mds/Projeto-P.I.T.E.R" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <Github size={16} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a 
              href="https://unb-mds.github.io/Projeto-P.I.T.E.R/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Documentacao</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-neutral-400 text-center md:text-right">
            © {new Date().getFullYear()} P.I.T.E.R — UnB/MDS
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
