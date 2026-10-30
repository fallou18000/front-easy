import { useMemo, useState } from 'react';
import { Search, UsersRound, AlertCircle } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getProspects } from '../api/prospects.api';
import { formatPasse, formatEcheance, formatInteraction } from '../utils/format';

const sansAccent = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function tone(statut) {
  const s = sansAccent(statut);
  if (s.includes('vend') || s.includes('interesse')) return 'green';
  if (s.includes('proposition')) return 'blue';
  if (s.includes('relancer')) return 'orange';
  if (s.includes('rdv')) return 'cyan';
  if (s.includes('perdu')) return 'red';
  return 'neutral';
}

const majuscule = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

export default function ProspectsPage() {
  const { data, error, loading } = useFetch(getProspects);
  const [search, setSearch] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState('');

  const prospects = data || [];
  const owners = useMemo(() => [...new Set(prospects.map((p) => p.commercialAssigne))], [prospects]);
  const statuses = useMemo(() => [...new Set(prospects.map((p) => p.statut))], [prospects]);

  const rows = useMemo(() => {
    const t = sansAccent(search.trim());
    return prospects.filter((p) =>
      (!t || [p.nom, p.entreprise, p.telephone].some((v) => sansAccent(String(v || '')).includes(t)))
      && (!owner || p.commercialAssigne === owner)
      && (!status || p.statut === status));
  }, [prospects, search, owner, status]);

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="titre">Prospects du Portefeuille</h1>
          <p className="sub">Suivi des comptes et fiches prospects attribuées à l'équipe commerciale</p>
        </div>
        <span className="count-pill">
          {loading ? 'Chargement…' : `${rows.length} prospect${rows.length > 1 ? 's' : ''} affiché${rows.length > 1 ? 's' : ''}`}
        </span>
      </header>

      <section className="filters-card">
        <label className="search-box">
          <Search size={18} />
          <input type="search" placeholder="Rechercher par prospect, entreprise..."
                 value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">Tous les commerciaux</option>
          {owners.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          {statuses.map((s) => <option key={s} value={s}>{majuscule(s)}</option>)}
        </select>
      </section>

      {error && <div className="api-error" role="alert"><AlertCircle size={17} /> {error.message}</div>}

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Contact</th><th>Entreprise &amp; ville</th><th>Statut</th>
              <th>Commercial assigné</th><th>Dernière interaction</th><th>Prochaine action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="table-message" colSpan="6">Chargement des prospects…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="table-message" colSpan="6"><UsersRound size={20} /> Aucun prospect trouvé</td></tr>
            ) : rows.map((p) => {
              const ech = formatEcheance(p.dateProchaineAction);
              return (
                <tr key={p.id}>
                  <td><strong>{p.nom}</strong><small className="mono">{p.telephone}</small></td>
                  <td>{p.entreprise || '—'}<small>{p.ville}</small></td>
                  <td><span className={`pill ${tone(p.statut)}`}>{majuscule(p.statut)}</span></td>
                  <td><span className="owner-pill"><UsersRound size={14} />{p.commercialAssigne}</span></td>
                  <td>
                    {formatPasse(p.derniereInteraction) || '—'}
                    <small>{formatInteraction(p.typeInteraction)}</small>
                  </td>
                  <td>
                    <span className="next-action">{p.prochaineAction || '—'}</span>
                    <small className={ech.retard ? 'retard' : 'next-date'}>{ech.texte}</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}