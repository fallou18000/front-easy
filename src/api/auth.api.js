
import { api } from './client';
export const login = (email, password) => api('/auth/login', { method: 'POST', body: { email, password } });
export const me = () => api('/auth/me');

export const logout = () => api('/auth/logout', { method: 'POST' });