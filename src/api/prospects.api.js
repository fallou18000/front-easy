
import { api } from './client';

export function getProspects() {
  return api('/prospects');
}
