import { useEffect, useMemo, useState } from 'react';
import { Award, CalendarDays, CheckCircle2, FileText, Phone, UsersRound } from 'lucide-react';
import FilterDropdown from '../components/FilterDropdown';
import { useFetch } from '../hooks/useFetch';
import { getEquipe } from '../api/equipe.api';
import { getObjectifs, saveObjectifs } from '../api/objectifs.api';

const CHAMPS = [
  { type: 'appels', label: "Volume d'appels", icon: Phone, color: 'teal' },
  { type: 'contacts', label: 'Contacts joints', icon: UsersRound, color: 'mint' },
  { type: 'rdv', label: 'RDV obtenus', icon: CalendarDays, color: 'orange' },
  { type: 'propositions', label: 'Devis / Propositions', icon: FileText, color: 'blue' },
  { type: 'ventes', label: 'Ventes conclues', icon: Award, color: 'green' },
];
const PERIODES = [
  { value: 'semaine', label: 'Hebdomadaire (7 jours)' },
  { value: 'mois', label: 'Mensuel (30 jours)' },
];
const VIDE = { appels: 0, contacts: 0, rdv: 0, propositions: 0, ventes: 0 };

export default function ObjectifsPage() {
  const { data: equipe, error: errEquipe, loading } = useFetch(getEquipe);
  const [cible, setCible] = useState('');
  const [periode, setPeriode] = useState('semaine');
  const [valeurs, setValeurs] = useState(VIDE);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  const commerciaux = useMemo(() => equipe || [], [equipe]);
  const options = useMemo(() => [
    ...commerciaux.map((c) => ({
      value: String(c.id),
      label: c.poste ? `${c.nom} (${c.poste})` : c.nom,
    })),
    ...(commerciaux.length > 1
      ? [{ value: 'team', label: 'Toute l’équipe commerciale' }] : []),
  ], [commerciaux]);

  const choix = cible || options[0]?.value || '';
  // Pour "toute l'équipe", on part des valeurs du premier commercial
  const idLecture = choix === 'team' ? commerciaux[0]?.id : Number(choix);

  useEffect(() => {
    if (!idLecture) return;
    let actif = true;
    setMessage('');
    setErreur('');
    getObjectifs(idLecture, periode)
      .then((r) => actif && setValeurs(r.valeurs))
      .catch((e) => actif && setErreur(e.message));
    return () => { actif = false; };
  }, [idLecture, periode]);

  function modifier(type, valeur) {
    setValeurs((v) => ({ ...v, [type]: valeur }));
    setMessage('');
  }

  async function enregistrer(e) {
    e.preventDefault();
    setErreur('');
    setMessage('');
    const userIds = choix === 'team' ? commerciaux.map((c) => c.id) : [Number(choix)];
    const nombres = Object.fromEntries(CHAMPS.map(({ type }) => [type, Number(valeurs[type])]));

    setSaving(true);
    try {
      await saveObjectifs({ userIds, periode, valeurs: nombres });
      setMessage(choix === 'team'
        ? 'Les objectifs ont été enregistrés pour toute l’équipe.'
        : 'Les objectifs du commercial ont été enregistrés.');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page objectifs-page">
      <header className="objectifs-header">
        <h1 className="titre">Définir les Objectifs Commerciaux</h1>
        <p className="sub">Paramétrez les quotas hebdomadaires et mensuels pour piloter l’effort commercial</p>
      </header>

      {(errEquipe || erreur) && (
        <div className="api-error" role="alert">{(errEquipe || { message: erreur }).message}</div>
      )}
      {message && <div className="objectifs-notice success" role="status">{message}</div>}

      <form className="objectifs-form" onSubmit={enregistrer}>
        <div className="objectifs-selectors">
          <div className="objectifs-field">
            <span><UsersRound size={15} />Périmètre de l’objectif</span>
            <FilterDropdown options={options} value={choix} onChange={setCible}
              ariaLabel="Choisir le commercial ou toute l’équipe" disabled={loading} />
          </div>
          <div className="objectifs-field">
            <span><CalendarDays size={15} />Période d’évaluation</span>
            <FilterDropdown options={PERIODES} value={periode} onChange={setPeriode}
              ariaLabel="Choisir la période d’évaluation" disabled={loading} />
          </div>
        </div>

        <section className="objectifs-targets">
          <h2>Objectifs chiffrés attendus ({periode === 'semaine' ? 'hebdomadaire' : 'mensuel'})</h2>
          <div className="objectifs-target-grid">
            {CHAMPS.map(({ type, label, icon: Icon, color }) => (
              <label key={type} className={`objectifs-target ${color}`}>
                <span><Icon size={17} />{label}</span>
                <input
                  type="number" min="0" step="1" required
                  value={valeurs[type]}
                  onChange={(e) => modifier(type, e.target.value)}
                  aria-label={`Objectif ${label}`}
                />
              </label>
            ))}
          </div>
        </section>

        <div className="objectifs-actions">
          <button className="objectifs-save" type="submit" disabled={loading || saving || !choix}>
            <CheckCircle2 size={17} />
            {saving ? 'Enregistrement…' : 'Enregistrer les objectifs'}
          </button>
        </div>
      </form>
    </main>
  );
}