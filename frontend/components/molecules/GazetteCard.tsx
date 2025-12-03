import React from 'react';
import { Gazette } from '@/types';
import { Calendar, MapPin, FileText, ExternalLink, Tag } from 'lucide-react';

interface GazetteCardProps {
  gazette: Gazette;
}

export const GazetteCard: React.FC<GazetteCardProps> = ({ gazette }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleDownload = () => {
    if (gazette.url) {
      window.open(gazette.url, '_blank');
    }
  };

  return (
    <div className="result-card group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <FileText className="text-indigo-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 group-hover:text-indigo-600 transition-colors">
              {gazette.territory_name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <MapPin size={12} />
              <span>{gazette.state_code}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-sm text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-lg">
          <Calendar size={14} />
          <span>{formatDate(gazette.date)}</span>
        </div>
      </div>

      {/* Edition Badge */}
      {gazette.edition && (
        <div className="flex items-center gap-2 mb-4">
          <span className="badge badge-primary">
            <Tag size={12} />
            Edicao {gazette.edition}
          </span>
          {gazette.is_extra_edition && (
            <span className="badge badge-warning">
              Extra
            </span>
          )}
        </div>
      )}

      {/* Excerpts */}
      {gazette.excerpts && gazette.excerpts.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Trechos encontrados
          </p>
          <div className="space-y-2">
            {gazette.excerpts.slice(0, 2).map((excerpt, index) => (
              <p 
                key={index} 
                className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-xl leading-relaxed border-l-3 border-indigo-400"
                style={{ borderLeftWidth: '3px' }}
              >
                {excerpt.length > 180 ? `${excerpt.substring(0, 180)}...` : excerpt}
              </p>
            ))}
            {gazette.excerpts.length > 2 && (
              <p className="text-xs text-indigo-500 font-medium">
                +{gazette.excerpts.length - 2} trechos adicionais
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
        <span className="text-xs text-neutral-400">
          ID: {gazette.territory_id}
        </span>
        <button
          onClick={handleDownload}
          disabled={!gazette.url}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-200
            ${gazette.url 
              ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-md' 
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }
          `}
        >
          <ExternalLink size={16} />
          Abrir PDF
        </button>
      </div>
    </div>
  );
};
