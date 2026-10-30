const debutDuJour = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const heure = (d) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const jours = (d) => Math.round((debutDuJour(d) - debutDuJour(new Date())) / 86400000);

// Passé : "Il y a 28 min", "Aujourd'hui — 14:35", "Hier", "Il y a 4 jours"
export function formatPasse(v) {
  if (!v) return '';
  const d = new Date(v);
  const min = Math.floor((Date.now() - d) / 60000);
  if (min < 60) return `Il y a ${Math.max(min, 1)} min`;
  const j = jours(d);
  if (j >= 0) return `Aujourd'hui — ${heure(d)}`;
  if (j === -1) return 'Hier';
  if (j === -2) return 'Avant-hier';
  return `Il y a ${-j} jours`;
}

// Futur ou retard : "Hier", "Aujourd'hui à 14:30", "Demain à 10:00", "Dans 3 jours à 11:00"
export function formatEcheance(v) {
  if (!v) return { texte: '', retard: false };
  const d = new Date(v);
  const j = jours(d);
  if (j < 0) return { texte: j === -1 ? 'Hier' : `Il y a ${-j} jours`, retard: true };
  if (j === 0) return { texte: `Aujourd'hui à ${heure(d)}`, retard: false };
  if (j === 1) return { texte: `Demain à ${heure(d)}`, retard: false };
  return { texte: `Dans ${j} jours à ${heure(d)}`, retard: false };
}

export const formatInteraction = (sens) =>
  sens === 'entrant' ? 'Appel entrant'
  : sens === 'sortant' ? 'Appel sortant'
  : sens === 'manque' ? 'Appel manqué'
  : '';

// 13680 secondes -> "3h48"
export function formatDuree(secondes = 0) {
  const minutes = Math.floor(secondes / 60);
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

// "Fatou Ndiaye" -> "FA" (deux premières lettres du prénom, comme le prototype)
export const initiales = (nom = '') => (nom.split(' ')[0] || '').slice(0, 2).toUpperCase();

export const prenom = (nom = '') => nom.split(' ')[0];