import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, Award, CalendarDays, ChevronRight, Mail, Phone,
  AlertTriangle, TrendingUp, TrendingDown,
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { getEquipe, getAudit } from '../api/equipe.api';
import { initiales, formatDuree } from '../utils/format';

const SEMAINES = ['S-3', 'S-2', 'S-1', 'Cette semaine'];

const sansAccent = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const majuscule = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

function ton(statut) {
  const s = sansAccent(statut);
  if (s.includes('vend') || s.includes('interesse')) return 'green';
  if (s.includes('proposition')) return 'blue';
  if (s.includes('relancer')) return 'orange';
  if (s.includes('rdv')) return 'cyan';
  return 'neutral';
}

/* ---------- Liste : les cartes ---------- */
function Liste() {
  const { data, error } = useFetch(getEquipe);

  if (error) {
    return <main className="page"><p className="api-error" role="alert"><AlertCircle size={17} /> {error.message}</p></main>;
  }
  if (!data) return <p className="msg">Chargement...</p>;

  const n = data.length;

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1 className="titre">Équipe Commerciale</h1>
          <p className="sub">
            {n} commercial{n > 1 ? 'x' : ''} actif{n > 1 ? 's' : ''} sur le terrain et en prospection téléphonique
          </p>
        </div>
        <span className="count-pill">{n} membre{n > 1 ? 's' : ''} affiché{n > 1 ? 's' : ''}</span>
      </header>

      {n === 0 ? (
        <section className="equipe-empty">Aucun commercial n’est rattaché à votre équipe.</section>
      ) : (
        <section className="equipe-cards" aria-label="Équipe commerciale">
          {data.map((c) => (
            <Link key={c.id} className="equipe-member-card" to={`/equipe/${c.id}`}>
              <div className="equipe-member-heading">
                <div className="equipe-avatar" aria-hidden="true">{initiales(c.nom)}</div>
                <div className="equipe-member-name">
                  <h2>{c.nom}</h2>
                  <p>{c.poste || 'Commercial'}</p>
                </div>
                {c.objectif != null && <span className="equipe-progress">{c.objectif}%</span>}
              </div>

              <div className="equipe-card-metrics">
                <div><span><Phone size={15} />Appels</span><strong>{c.appels}</strong></div>
                <div><span><CalendarDays size={15} />RDV obtenus</span><strong className="c-orange">{c.rdv}</strong></div>
                <div><span><Award size={15} />Ventes signées</span><strong className="c-green">{c.ventes}</strong></div>
                <div><span>Temps total</span><strong className="mono">{formatDuree(c.tempsTotalSec)}</strong></div>
              </div>

              <div className="equipe-card-link">
                <span>Consulter l’audit individuel</span>
                <ChevronRight size={17} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}

/* ---------- Détail : l'audit individuel ---------- */
function Detail({ id }) {
  const { data: d, error } = useFetch(() => getAudit(id), [id]);

  if (error) {
    return (
      <main className="page">
        <Link to="/equipe" className="equipe-back"><ArrowLeft size={16} /> Retour à l’équipe</Link>
        <p className="api-error" role="alert"><AlertCircle size={17} /> {error.message}</p>
      </main>
    );
  }
  if (!d) return <p className="msg">Chargement...</p>;

  const { profil: p, activite: a, resultats: r, conversion: c, evolution, prospectsARisque } = d;

  const actifAujourdhui = p.derniereActivite
    && new Date(p.derniereActivite).toDateString() === new Date().toDateString();

  const max = Math.max(1, ...evolution.flatMap((w) => [w.appels, w.rdv, w.ventes]));
  const hauteur = (v) => `${v ? Math.max(6, (v / max) * 100) : 3}%`;

  // Tendance : cette semaine (encore incomplète) comparée à la précédente
  const precedent = evolution[evolution.length - 2]?.appels;
  const actuel = evolution[evolution.length - 1]?.appels;
  const tendance = precedent ? Math.round(((actuel - precedent) / precedent) * 100) : null;

  const conversions = [
    { label: 'Appel → Contact', valeur: c.appelContact, ton: '' },
    { label: 'Contact → RDV', valeur: c.contactRdv, ton: 'green' },
    { label: 'RDV → Proposition', valeur: c.rdvProposition, ton: 'blue' },
    { label: 'Proposition → Vente', valeur: c.propositionVente, ton: 'green' },
  ];

  return (
    <main className="page equipe-detail">
      <Link to="/equipe" className="equipe-back"><ArrowLeft size={16} /> Retour à l’équipe</Link>

      <section className="card equipe-profile">
        <div className="equipe-avatar equipe-avatar-large" aria-hidden="true">{initiales(p.nom)}</div>
        <div className="equipe-profile-info">
          <h1>
            {p.nom}
            {actifAujourdhui && <span className="equipe-actif">Actif aujourd’hui</span>}
          </h1>
          <p>{p.poste || 'Commercial'}</p>
          <div className="equipe-contact-row">
            {p.telephone && <span><Phone size={14} />{p.telephone}</span>}
            {p.email && <span><Mail size={14} />{p.email}</span>}
          </div>
        </div>
        <div className="equipe-profile-goal">
          <span>Objectif global</span>
          <strong>{d.objectif == null ? '—' : `${d.objectif}%`}</strong>
        </div>
      </section>

      <div className="equipe-detail-columns">
        <section className="card equipe-detail-panel">
          <h2><Phone size={16} /> Activité téléphonique</h2>
          <div className="equipe-stat-grid">
            <div><strong>{a.appels}</strong><span>Appels émis</span></div>
            <div><strong>{a.contacts}</strong><span>Contacts joints</span></div>
            <div className="teal"><strong>{formatDuree(a.tempsTotalSec)}</strong><span>Temps d’appel</span></div>
          </div>
        </section>

        <section className="card equipe-detail-panel">
          <h2><Award size={16} /> Résultats commerciaux</h2>
          <div className="equipe-stat-grid">
            <div className="orange"><strong>{r.rdv}</strong><span>RDV fixés</span></div>
            <div className="blue"><strong>{r.propositions}</strong><span>Propositions</span></div>
            <div className="green"><strong>{r.ventes}</strong><span>Ventes signées</span></div>
          </div>
        </section>
      </div>

      <section className="card equipe-detail-panel">
        <h2>Taux de conversion d’étape</h2>
        <div className="equipe-conversion">
          {conversions.map((x) => (
            <div key={x.label} className={x.ton}>
              <span>{x.label}</span>
              <strong>{x.valeur} %</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card equipe-detail-panel">
        <div className="equipe-trend-heading">
          <div>
            <h2>Évolution de l’activité sur 4 semaines</h2>
            <p className="sub">Appels, rendez-vous et ventes par semaine</p>
          </div>
          {tendance != null && (
            <span className={`equipe-tendance ${tendance >= 0 ? 'hausse' : 'baisse'}`}>
              {tendance >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              Tendance {tendance >= 0 ? 'hausse' : 'baisse'} ({tendance > 0 ? '+' : ''}{tendance}%)
            </span>
          )}
        </div>

        <div className="equipe-week-grid">
          {evolution.map((w, i) => (
            <div className="equipe-week" key={w.semaine}>
              <div className="equipe-bars" role="img"
                   aria-label={`${w.appels} appels, ${w.rdv} rendez-vous, ${w.ventes} ventes`}>
                <span className="equipe-bar calls" style={{ height: hauteur(w.appels) }} />
                <span className="equipe-bar rdv" style={{ height: hauteur(w.rdv) }} />
                <span className="equipe-bar ventes" style={{ height: hauteur(w.ventes) }} />
              </div>
              <strong>{SEMAINES[i]}</strong>
              <small>{w.appels} appels • {w.ventes} vente{w.ventes > 1 ? 's' : ''}</small>
            </div>
          ))}
        </div>

        <div className="equipe-chart-legend">
          <span><i className="equipe-bar calls" /> Appels</span>
          <span><i className="equipe-bar rdv" /> RDV</span>
          <span><i className="equipe-bar ventes" /> Ventes</span>
        </div>
      </section>

      <section className="card equipe-detail-panel">
        <h2><AlertTriangle size={16} className="icone-alerte" /> Prospects à risque nécessitant un rappel</h2>
        {prospectsARisque.length === 0 ? (
          <p className="sub">Aucun prospect à risque pour ce commercial.</p>
        ) : (
          <ul className="equipe-risque">
            {prospectsARisque.map((x) => (
              <li key={x.id}>
                <div>
                  <strong>{x.nom}</strong>
                  <small>{[x.entreprise, x.telephone].filter(Boolean).join(' • ')}</small>
                </div>
                <div className="equipe-risque-badges">
                  <span className={`pill ${ton(x.statut)}`}>{majuscule(x.statut)}</span>
                  <span className="pill red">À relancer d’urgence</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function EquipePage() {
  const { memberId } = useParams();
  return memberId ? <Detail id={memberId} /> : <Liste />;
}