import { useEffect, useState } from 'react';
import { AlertCircle, Building2, PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react';
import FilterDropdown from '../components/FilterDropdown';
import { useFetch } from '../hooks/useFetch';
import { getActivites } from '../api/activites.api';
import { formatPasse, initiales } from '../utils/format';

const TYPES = [
  { value: '', label: 'Tous les types d’appels' },
  { value: 'entrant', label: 'Appels entrants' },
  { value: 'sortant', label: 'Appels sortants' },
  { value: 'manque', label: 'Appels manqués' },
];

const ICONES = {
  sortant: { Icone: PhoneOutgoing, classe: 'sortant', titre: 'Appel sortant' },
  entrant: { Icone: PhoneIncoming, classe: 'entrant', titre: 'Appel entrant' },
  manque: { Icone: PhoneMissed, classe: 'manque', titre: 'Appel manqué' },
};

// Les valeurs de la base sont techniques : on affiche un libellé lisible
const RESULTATS = {
  'pas de reponse': { label: 'Pas de réponse', ton: 'rouge' },
  'A rappeler': { label: 'À rappeler', ton: 'orange' },
  'interesse': { label: 'Intéressé', ton: 'vert' },
  'tres interesse': { label: 'Très intéressé', ton: 'vert' },
  'rdv obtenu': { label: 'RDV obtenu', ton: 'orange' },
  'pas interesse': { label: 'Pas intéressé', ton: 'neutre' },
  'vente': { label: 'Vente', ton: 'vert' },
  'devis demande': { label: 'Devis demandé', ton: 'bleu' },
};

function duree(secondes) {
  if (!secondes) return '';
  return secondes < 60 ? `${secondes} s` : `${Math.round(secondes / 60)} min`;
}

export default function ActivitesPage() {
  const [type, setType] = useState('');
  const [tick, setTick] = useState(0);

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const { data, error } = useFetch(() => getActivites(type), [type, tick]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="titre">Flux des Activités Commerciales</h1>
          <p className="sub">Journal consolidé en temps réel des interactions téléphoniques qualifiées</p>
        </div>
        <div className="activites-filtre">
          <FilterDropdown options={TYPES} value={type} onChange={setType}
                          ariaLabel="Filtrer par type d’appel" />
        </div>
      </header>

      {error && (
        <div className="api-error" role="alert"><AlertCircle size={17} /> {error.message}</div>
      )}

      <section className="activites-liste" aria-label="Journal des appels">
        {!data ? (
          <p className="activites-message">{error ? 'Le journal n’est pas disponible.' : 'Chargement…'}</p>
        ) : data.length === 0 ? (
          <p className="activites-message">Aucun appel correspondant à ce filtre.</p>
        ) : (
          data.map((a) => {
            const { Icone, classe, titre } = ICONES[a.sens] || ICONES.sortant;
            const res = RESULTATS[a.resultat];
            return (
              <article className="activite" key={a.id}>
                <span className={`activite-icone ${classe}`} title={titre}><Icone size={18} /></span>

                <div className="activite-corps">
                  <div className="activite-titre">
                    <strong>{a.contact}</strong>
                    {a.entreprise && (
                      <span className="relance-company"><Building2 size={13} />{a.entreprise}</span>
                    )}
                  </div>
                  <p>{a.note || 'Interaction enregistrée'}</p>
                  <small>
                    {formatPasse(a.dateHeure)}
                    {a.duree > 0 && ` • ${duree(a.duree)}`}
                  </small>
                </div>

                {res && <span className={`activite-resultat ${res.ton}`}>{res.label}</span>}
                <span className="avatar" title={a.commercial.nom}>{initiales(a.commercial.nom)}</span>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}