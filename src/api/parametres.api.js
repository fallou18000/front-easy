import { api } from './client';

export const getParametres = () => api('/parametres');
export const saveParametres = (body) => api('/parametres', { method: 'PUT', body });