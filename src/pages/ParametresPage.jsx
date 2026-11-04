import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import FilterDropdown from '../components/FilterDropdown';
import { useFetch } from '../hooks/useFetch';
import { getParametres, saveParametres } from '../api/parametres.api';

const DEVISES = [
  { value: 'XOF', label: 'FCFA (Franc CFA - XOF)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar américain (USD)' },
];

const garder = (p) => ({
  nom: p.nom, devise: p.devise, exclusionContactsPrives: p.exclusionContactsPrives,
});

export default function ParametresPage() {
  const { data, error } = useFetch(getParametres);
  const [reference, setReference] = useState(null);   // dernière valeur enregistrée
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (data) {
      setReference(garder(data));
      setForm(garder(data));
    }
  }, [data]);

  const modifier = (champ, valeur) => {
    setForm((f) => ({ ...f, [champ]: valeur }));
    setMessage('');
    setErreur('');
  };

  const modifie = form && reference && JSON.stringify(form) !== JSON.stringify(reference);

  async function sauvegarder(e) {
    e.preventDefault();
    setSaving(true);
    setErreur('');
    setMessage('');
    try {
      const enregistre = garder(await saveParametres(form));
      setReference(enregistre);
      setForm(enregistre);
      setMessage('Préférences enregistrées.');
    } catch (err) {
      setErreur(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page param-page">
      <header>
        <h1 className="titre">Paramètres &amp; Confidentialité</h1>
        <p className="sub">Configuration de votre espace Easy Call Manager et respect de la vie privée des commerciaux</p>
      </header>

      {(error || erreur) && (
        <div className="api-error" role="alert">
          <AlertCircle size={17} /> {(error || { message: erreur }).message}
        </div>
      )}
      {message && <div className="param-succes" role="status"><CheckCircle2 size={16} /> {message}</div>}

      <form className="param-carte" onSubmit={sauvegarder}>
        <h2 className="param-titre">Profil entreprise</h2>
        <div className="param-grille">
          <div className="param-champ">
            <label htmlFor="nom">Nom de l’entreprise</label>
            <input
              id="nom" type="text" maxLength={150}
              value={form?.nom ?? ''} disabled={!form}
              onChange={(e) => modifier('nom', e.target.value)}
            />
          </div>
          <div className="param-champ">
            <label id="devise-label">Devise commerciale</label>
            <FilterDropdown
              options={DEVISES} value={form?.devise ?? 'XOF'} disabled={!form}
              onChange={(v) => modifier('devise', v)}
              ariaLabel="Devise commerciale"
            />
          </div>
        </div>

        <h2 className="param-titre vert"><ShieldCheck size={16} /> Charte de respect de la vie privée</h2>
        <div className="param-charte">
          <strong>Principe directeur Easy Call : Mesurer l’effort sans intrusion.</strong>
          <ul>
            <li>Aucun enregistrement audio ou écoute des communications.</li>
            <li>Filtrage et exclusion stricte des appels privés ou marqués comme personnels.</li>
            <li>Aucun traçage de géolocalisation permanente en arrière-plan.</li>
          </ul>
        </div>

        <label className="param-option">
          <span>
            <strong>Exclusion automatique des contacts privés</strong>
            <small>Permet aux commerciaux de masquer les appels personnels de leurs rapports.</small>
          </span>
          <input
            type="checkbox"
            checked={form?.exclusionContactsPrives ?? false} disabled={!form}
            onChange={(e) => modifier('exclusionContactsPrives', e.target.checked)}
          />
        </label>

        <h2 className="param-titre">Connexion Easy Suite (Volkeno)</h2>
        <div className="param-grille">
          <div className="param-integ">
            <span><strong>Easy CRM</strong><small>Bientôt disponible</small></span>
            <i className="point" aria-hidden="true" />
          </div>
          <div className="param-integ">
            <span><strong>Easy Invoice</strong><small>Bientôt disponible</small></span>
            <i className="point" aria-hidden="true" />
          </div>
        </div>

        <div className="param-actions">
          <button type="submit" className="param-bouton" disabled={!modifie || saving}>
            {saving ? 'Enregistrement…' : 'Sauvegarder les préférences'}
          </button>
        </div>
      </form>
    </main>
  );
}