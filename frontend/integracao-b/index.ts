/**
 * Ponto central de exportação para integração-b
 * Facilita importações em toda aplicação
 */

// Tipos
export * from './types';

// Configuração
export { API_CONFIG, buildApiUrl, getDefaultHeaders } from './config/api-config';

// Serviços
export { BackendIntegrationService, default } from './services/backend-integration';
