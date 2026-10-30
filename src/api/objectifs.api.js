
import { api } from './client';
export const getObjectifs = (userId, periode) => api(`/objectifs?userId=${userId}&periode=${periode}`);
export const saveObjectifs = (body) => api('/objectifs', { method: 'PUT', body });