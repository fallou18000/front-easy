import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, UsersRound, CalendarDays, FileText, Award,
  AlertTriangle, ChevronRight, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getDashboard } from '../api/stats.api';
import StatCard from '../components/StatCard';
import Funnel from '../components/Funnel';
import FilterDropdown from '../components/FilterDropdown';
import { initiales, prenom } from '../utils/format';

const PERIODES = [
  { value: 'semaine', label: 'Cette semaine', court: 'S-1', quota: 'hebdo' },
  { value: 'mois', label: 'Ce mois', court: 'M-1', quota: 'mensuel' },
];

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

export default function DashboardPage({ user }) {
  const [periode, setPeriode] = useState('semaine');
  const { data, error, loading } = useFetch(() => getDashboard(periode), [periode]);
  const p = PERIODES.find((x) => x.value === periode);

  if (error && !data) return <p className="msg err">Erreur : {error.message}</p>;
  if (!data) return <p className="msg">Chargement...</p>;

  const { kpi: k, insights: ins, commerciaux } = data;
  const v = k.variationAppels;

  const noteAppels = v == null
    ? 'Aucune période précédente'
    : (<>
        {v >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {v > 0 ? '+' : ''}{v}% vs {p.court}
      </>);

  const lignes = [
    { label: 'Appels', value: k.appels, color: '#334155' },
    { label: 'Contacts', value: k.contacts, color: '#0d9488' },
    { label: 'Intéressés', value: k.interesses, color: '#14b8a6' },
    { label: 'RDV', value: k.rdv, color: '#f59e0b' },
    { label: 'Propositions', value: k.propositions, color: '#2563eb' },
    { label: 'Ventes', value: k.ventes, color: '#059669' },
  ];

  const aucuneAlerte = !ins.prospectsSansRelance && !ins.propositionsEnAttente && !ins.performance;
  const actifs = commerciaux.filter((c) => c.appels > 0).length;

  return (
    <main className={`page dash${loading ? ' chargement' : ''}`}>
      <header className="dash-header">
        <div>
          <h1 className="titre">Bonjour {prenom(user.nom)} 👋</h1>
          <p className="sub">Performance commerciale de votre équipe • Easy Suite Volkeno</p>
        </div>
        <div className="dash-period">
          <FilterDropdown options={PERIODES} value={periode} onChange={setPeriode}
                          ariaLabel="Choisir la période" />
        </div>
      </header>

      <section className="stats">
        <StatCard label="Appels" value={k.appels} icon={Phone}
                  note={noteAppels} noteTone={v == null ? '' : v >= 0 ? 'up' : 'down'} />
        <StatCard label="Contacts joints" value={k.contacts} icon={UsersRound} tone="mint"
                  note={`${k.tauxJoignabilite}% de joignabilité`} />
        <StatCard label="Rendez-vous" value={k.rdv} icon={CalendarDays} tone="orange"
                  note={`${k.tauxRdv}% contact → RDV`} />
        <StatCard label="Propositions" value={k.propositions} icon={FileText} tone="blue"
                  note="Devis demandés" />
        <StatCard label="Ventes conclues" value={k.ventes} icon={Award} tone="green" accent
                  note={k.quotaVentes == null
                    ? 'Aucun quota défini'
                    : `${k.quotaVentes}% du quota ${p.quota}`}
                  noteTone="up" />
      </section>

      <section className="dash-grid">
        <div className="card">
          <div className="funnel-title">
            <div>
              <h2>Funnel Commercial d'Équipe</h2>
              <p className="sub">
                {k.appels} appels → {k.contacts} contacts → {k.interesses} intéressés → {k.rdv} RDV
                → {k.propositions} propositions → {k.ventes} ventes
              </p>
            </div>
            <span className="badge">{k.tauxConversion}% conversion globale</span>
          </div>
          <Funnel lignes={lignes} total={k.appels} />
        </div>

        <aside className="card insights">
          <h2 className="insights-titre"><AlertTriangle size={16} /> À surveiller (Insights)</h2>

          {ins.prospectsSansRelance > 0 && (
            <div className="insight jaune">
              <strong>{pluriel(ins.prospectsSansRelance, 'prospect')} sans relance</strong>
              <p>Aucune interaction enregistrée depuis plus de 5 jours.</p>
              <Link to="/prospects">Voir les prospects <ChevronRight size={14} /></Link>
            </div>
          )}

          {ins.propositionsEnAttente > 0 && (
            <div className="insight bleu">
              <strong>{pluriel(ins.propositionsEnAttente, 'proposition')} en attente</strong>
              <p>Aucune activité commerciale depuis plus de 7 jours.</p>
              <Link to="/prospects">Voir les devis en attente <ChevronRight size={14} /></Link>
            </div>
          )}

          {ins.performance && (
            <div className="insight gris">
              <strong>Performance à analyser</strong>
              <p>
                {prenom(ins.performance.nom)} réalise beaucoup d'appels mais son taux appel → RDV
                ({ins.performance.tauxRdv}%) est inférieur à la moyenne de l'équipe
                ({ins.performance.tauxRdvEquipe}%).
              </p>
              <Link to={`/equipe/${ins.performance.id}`}>
                Voir l'analyse de {prenom(ins.performance.nom)} <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {aucuneAlerte && <p className="sub">Rien à signaler pour le moment.</p>}
        </aside>
      </section>

      <section className="card dash-table-card">
        <div className="dash-table-head">
          <div>
            <h2>Activité de l'équipe commerciale</h2>
            <p className="sub">Cliquez sur un commercial pour ouvrir son audit d'activité individuel</p>
          </div>
          <span className="sub">{pluriel(actifs, 'commercial')} {actifs > 1 ? 'actifs' : 'actif'}</span>
        </div>

        <div className="table-scroll">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Commercial</th>
                <th className="num">Appels</th>
                <th className="num">Contacts</th>
                <th className="num">RDV</th>
                <th className="num">Devis</th>
                <th className="num">Ventes</th>
                <th className="num">Objectif</th>
                <th className="num">Action</th>
              </tr>
            </thead>
            <tbody>
              {commerciaux.length === 0 ? (
                <tr><td colSpan="8" className="table-message">Aucun commercial dans votre équipe.</td></tr>
              ) : commerciaux.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/equipe/${c.id}`} className="commercial">
                      <span className="avatar">{initiales(c.nom)}</span>
                      <span>
                        <strong>{c.nom}</strong>
                        <small>{c.poste}</small>
                      </span>
                    </Link>
                  </td>
                  <td className="num"><strong>{c.appels}</strong></td>
                  <td className="num"><strong>{c.contacts}</strong></td>
                  <td className="num c-orange">{c.rdv}</td>
                  <td className="num c-blue">{c.propositions}</td>
                  <td className="num c-green">{c.ventes}</td>
                  <td className="num">
                    {c.objectif == null ? '—' : <span className="obj">{c.objectif}%</span>}
                  </td>
                  <td className="num">
                    <Link to={`/equipe/${c.id}`} className="fiche">Fiche <ChevronRight size={14} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}