import { api } from './client';

export const getDashboard = (periode = 'semaine') => api(`/stats/dashboard?periode=${periode}`);