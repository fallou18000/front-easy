
import { api } from './client';
export const getRelances = (filtre) => api('/relances' + (filtre ? `?filtre=${filtre}` : ''));