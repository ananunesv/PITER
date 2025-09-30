import React from 'react';
import { Button } from '@/components/atoms/Button';
import { Gazette } from '@/types';

interface GazetteCardProps {
  gazette: Gazette;
}

export const GazetteCard: React.FC<GazetteCardProps> = ({ gazette }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-900">
            {gazette.territory_name}
          </h3>
          <span className="text-sm text-gray-500">
            {formatDate(gazette.date)}
          </span>
        </div>

        {gazette.edition && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Edição:</span> {gazette.edition}
            {gazette.is_extra_edition && (
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                Extra
              </span>
            )}
          </div>
        )}

        {gazette.excerpts && gazette.excerpts.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Trechos encontrados:</span>
            <div className="space-y-1">
              {gazette.excerpts.slice(0, 2).map((excerpt, index) => (
                <p key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {excerpt.length > 200 ? `${excerpt.substring(0, 200)}...` : excerpt}
                </p>
              ))}
              {gazette.excerpts.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{gazette.excerpts.length - 2} trechos adicionais
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-gray-500">
            ID: {gazette.territory_id}
          </div>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            disabled={!gazette.url}
          >
            Visualizar
          </Button>
        </div>
      </div>
    </div>
  );
};