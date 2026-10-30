import { useState } from 'react';
import { AlertCircle, Building2, Clock, UserRound } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getRelances } from '../api/relances.api';
import { formatEcheance } from '../utils/format';

const ONGLETS = [
  { value: '', cle: 'toutes', label: 'Toutes' },
  { value: 'retard', cle: 'retard', label: 'En retard' },
  { value: 'aujourdhui', cle: 'aujourdhui', label: 'Aujourd’hui' },
  { value: 'avenir', cle: 'avenir', label: 'À venir' },
];

function Ligne({ r }) {
  const ech = formatEcheance(r.datePrevue);
  return (
    <article className="relance-row">
      <div className={`relance-icon${r.enRetard ? ' overdue' : ''}`} aria-hidden="true">
        <Clock size={18} />
      </div>
      <div className="relance-content">
        <div className="relance-heading">
          <strong>{r.prospect}</strong>
          {r.entreprise && (
            <span className="relance-company"><Building2 size={13} />{r.entreprise}</span>
          )}
        </div>
        <p>{r.libelle}</p>
        <p className="relance-due">Échéance : <strong>{ech.texte}</strong></p>
      </div>
      <div className="relance-meta">
        {r.enRetard && (
          <span className="relance-status overdue"><AlertCircle size={13} />En retard</span>
        )}
        <div className="relance-assignee">
          <span>Assigné à :</span>
          <strong>{r.commercial.nom}</strong>
        </div>
      </div>
    </article>
  );
}

export default function RelancesPage() {
  const [filtre, setFiltre] = useState('');
  const { data, error, loading } = useFetch(() => getRelances(filtre), [filtre]);
  const c = data?.compteurs;

  return (
    <main className="page relances-page">
      <header className="relances-header">
        <div>
          <h1 className="titre">Supervision des Relances Commerciales</h1>
          <p className="sub">Suivi des engagements et rappels programmés par les commerciaux</p>
        </div>
        <div className="relances-filters" role="group" aria-label="Filtrer les relances">
          {ONGLETS.map((o) => (
            <button
              key={o.cle}
              type="button"
              className={`relances-filter ${o.cle}${filtre === o.value ? ' active' : ''}`}
              aria-pressed={filtre === o.value}
              onClick={() => setFiltre(o.value)}
            >
              {o.label}
              <span>{c ? c[o.cle] : 0}</span>
            </button>
          ))}
        </div>
      </header>

      <section className="relances-list" aria-label="Liste des relances commerciales">
        {error ? (
          <p className="relances-message" role="alert">{error.message}</p>
        ) : !data ? (
          <p className="relances-message">Chargement des relances…</p>
        ) : data.items.length ? (
          data.items.map((r) => <Ligne key={r.id} r={r} />)
        ) : (
          <p className="relances-message">Aucune relance ne correspond à ce filtre.</p>
        )}
      </section>
    </main>
  );
}