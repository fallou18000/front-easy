import { useState } from 'react';
import { Eye, EyeOff, Phone, BarChart3, Target, LogIn, AlertCircle } from 'lucide-react';
import { login } from '../api/auth.api';

const ATOUTS = [
  { icon: Phone, titre: 'Chaque appel compte', texte: 'Suivez l’activité téléphonique de toute votre équipe.' },
  { icon: BarChart3, titre: 'Pilotez par les chiffres', texte: 'Funnel, conversion et rapports prêts pour vos comités.' },
  { icon: Target, titre: 'Des objectifs clairs', texte: 'Fixez les quotas et suivez leur progression.' },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  async function envoyer(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      const { user } = await login(email, password);
      onLogin(user);
    } catch (err) {
      setErreur(err.status ? err.message : 'Impossible de joindre le serveur. Vérifiez votre connexion.');
      setChargement(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="auth-brand">
          <span className="brand-logo">EC</span>
          <div>
            <strong>Easy Call</strong>
            <small>Easy Suite by Volkeno</small>
          </div>
        </div>

        <div className="auth-pitch">
          <h2>Le pilotage commercial téléphonique, simplement.</h2>
          <ul>
            {ATOUTS.map(({ icon: Icon, titre, texte }) => (
              <li key={titre}>
                <span className="auth-puce"><Icon size={18} /></span>
                <div>
                  <strong>{titre}</strong>
                  <p>{texte}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-pied">Chaque appel compte • B2B Sénégal</p>
      </aside>

      <main className="auth-panel">
        <form className="auth-card" onSubmit={envoyer} noValidate>
          <div className="auth-mobile-brand">
            <span className="brand-logo">EC</span>
            <strong>Easy Call</strong>
          </div>

          <h1>Connexion</h1>
          <p className="auth-sous-titre">Accédez à l’espace Manager &amp; Direction.</p>

          {erreur && (
            <div className="auth-erreur" role="alert">
              <AlertCircle size={16} /> {erreur}
            </div>
          )}

          <label className="auth-champ" htmlFor="email">
            <span>Adresse email</span>
            <input
              id="email" type="email" autoComplete="username" autoFocus required
              placeholder="vous@entreprise.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-champ" htmlFor="password">
            <span>Mot de passe</span>
            <div className="auth-mdp">
              <input
                id="password" type={voir ? 'text' : 'password'}
                autoComplete="current-password" required
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button" className="auth-oeil"
                onClick={() => setVoir((v) => !v)}
                aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {voir ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button type="submit" className="auth-bouton" disabled={chargement || !email || !password}>
            <LogIn size={18} />
            {chargement ? 'Connexion…' : 'Se connecter'}
          </button>

          <p className="auth-note">Aucun enregistrement de conversation n’est collecté.</p>
        </form>
      </main>
    </div>
  );
}