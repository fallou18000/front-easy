import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import FilterDropdown from '../components/FilterDropdown';
import { useFetch } from '../hooks/useFetch';
import { getRapports } from '../api/rapports.api';
import { getEquipe } from '../api/equipe.api';
import { exporterCsv, exporterExcel } from '../utils/export';

const mois = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date());
const PERIODES = [
  { value: 'mois', label: `Ce mois (${mois.charAt(0).toUpperCase()}${mois.slice(1)})` },
  { value: 'semaine', label: 'Cette semaine' },
  { value: 'mois_precedent', label: 'Mois précédent' },
];

const fcfa = (n) => `${Number(n).toLocaleString('fr-FR')} FCFA`;
const nombre = (n) => Number(n).toLocaleString('fr-FR');

function duree(secondes) {
  const minutes = Math.floor(secondes / 60);
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

export default function RapportsPage() {
  const [periode, setPeriode] = useState('mois');
  const [commercialId, setCommercialId] = useState('');
  const [campagne, setCampagne] = useState('');

  const { data: equipe } = useFetch(getEquipe);
  const { data, error, loading } = useFetch(
    () => getRapports({ periode, commercialId, campagne }),
    [periode, commercialId, campagne]
  );

  const k = data?.kpi;
  const periodeLabel = PERIODES.find((p) => p.value === periode).label;

  const optionsCommerciaux = [
    { value: '', label: 'Toute l’équipe' },
    ...(equipe || []).map((c) => ({ value: String(c.id), label: c.nom })),
  ];
  const optionsCampagnes = [
    { value: '', label: 'Toutes les campagnes' },
    ...(data?.campagnes || []).map((c) => ({ value: c, label: c })),
  ];

  const entetes = ['Commercial', 'Appels', 'Durée totale', 'Joignabilité (%)',
                   'RDV', 'Ventes', 'Valeur estimée (FCFA)'];
  const lignes = (data?.commerciaux || []).map((c) => [
    c.nom, c.appels, duree(c.dureeTotaleSec), c.joignabilite, c.rdv, c.ventes, c.valeurEstimee,
  ]);

  const variation = k?.variationAppels;

  return (
    <main className="page rapports-page">
      <header className="rapports-header">
        <div>
          <h1 className="titre">Rapports &amp; Exports d’Activité</h1>
          <p className="sub">Analyses multidimensionnelles et exports pour vos comités de direction commerciale</p>
        </div>
        <div className="rapports-export-actions">
          <button type="button" className="rapport-export csv" disabled={!data}
                  onClick={() => exporterCsv([entetes, ...lignes], 'rapport-activite')}>
            <Download size={15} /> Export CSV
          </button>
          <button type="button" className="rapport-export excel" disabled={!data}
                  onClick={() => exporterExcel([entetes, ...lignes], 'rapport-activite')}>
            <FileSpreadsheet size={15} /> Export Excel
          </button>
        </div>
      </header>

      <section className="rapports-filters" aria-label="Filtres du rapport">
        <label>
          <span>Période</span>
          <FilterDropdown options={PERIODES} value={periode} onChange={setPeriode}
                          ariaLabel="Sélectionner la période" />
        </label>
        <label>
          <span>Commercial</span>
          <FilterDropdown options={optionsCommerciaux} value={commercialId} onChange={setCommercialId}
                          ariaLabel="Filtrer par commercial" />
        </label>
        <label>
          <span>Campagne de prospection</span>
          <FilterDropdown options={optionsCampagnes} value={campagne} onChange={setCampagne}
                          ariaLabel="Filtrer par campagne" />
        </label>
      </section>

      {error && <div className="api-error" role="alert">{error.message}</div>}

      <section className={`rapport-metrics${loading ? ' chargement' : ''}`} aria-label="Indicateurs de la période">
        <article className="rapport-metric">
          <span>Volume total d’appels</span>
          <strong>{k ? nombre(k.appels) : '…'}</strong>
          <small className={variation > 0 ? 'hausse' : variation < 0 ? 'baisse' : ''}>
            {variation == null
              ? 'Aucune période précédente à comparer'
              : `${variation > 0 ? '+' : ''}${variation}% vs période précédente`}
          </small>
        </article>
        <article className="rapport-metric">
          <span>Taux de joignabilité</span>
          <strong className="teal">{k ? `${k.tauxJoignabilite}%` : '…'}</strong>
          <small>{k ? nombre(k.contacts) : 0} contacts qualifiés</small>
        </article>
        <article className="rapport-metric">
          <span>RDV commerciaux</span>
          <strong className="orange">{k ? nombre(k.rdv) : '…'}</strong>
          <small>{k ? k.tauxRdv : 0}% de conversion</small>
        </article>
        <article className="rapport-metric">
          <span>Ventes conclues</span>
          <strong className="green">{k ? nombre(k.ventes) : '…'}</strong>
          <small className="hausse">{k ? fcfa(k.valeurVentes) : ''}</small>
        </article>
      </section>

      <section className="rapport-table-panel" aria-label="Synthèse détaillée par commercial">
        <div className="rapport-table-heading">
          <h2>Synthèse détaillée par commercial</h2>
          <span>{periodeLabel}</span>
        </div>
        {!data ? (
          <p className="rapport-message">{error ? 'Le rapport n’est pas disponible.' : 'Chargement du rapport…'}</p>
        ) : data.commerciaux.length ? (
          <div className="table-scroll">
            <table className="rapports-table">
              <thead>
                <tr>
                  <th>Commercial</th>
                  <th className="num">Appels</th>
                  <th className="num">Durée totale</th>
                  <th className="num">Joignabilité</th>
                  <th className="num">RDV</th>
                  <th className="num">Ventes</th>
                  <th className="num">Valeur estimée</th>
                </tr>
              </thead>
              <tbody>
                {data.commerciaux.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.nom}</strong></td>
                    <td className="num">{c.appels}</td>
                    <td className="num">{duree(c.dureeTotaleSec)}</td>
                    <td className="num">{c.joignabilite}%</td>
                    <td className="num rapport-number-orange">{c.rdv}</td>
                    <td className="num rapport-number-green">{c.ventes}</td>
                    <td className="num mono">{fcfa(c.valeurEstimee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rapport-message">Aucun commercial à afficher pour ces filtres.</p>
        )}
      </section>
    </main>
  );
}