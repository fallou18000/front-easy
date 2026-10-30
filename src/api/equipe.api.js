import { api } from './client';

export const getEquipe = () => api('/equipe');
export const getAudit = (id) => api(`/equipe/${id}`);