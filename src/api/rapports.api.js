
import { api } from './client';

export function getRapports({ periode, commercialId, campagne }) {
  const p = new URLSearchParams();
  if (periode) p.set('periode', periode);
  if (commercialId) p.set('commercialId', commercialId);
  if (campagne) p.set('campagne', campagne);
  return api(`/rapports?${p}`);
}