import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { me, logout } from './api/auth.api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProspectsPage from './pages/ProspectsPage';
import Bientot from './pages/Bientot';
import Layout from './components/Layout';
import EquipePage from './pages/EquipePage';
import ActivityPage from './pages/ActivityPage';
import RelancesPage from './pages/RelancesPage';
import ObjectifsPage from './pages/ObjectifsPage';
import RapportsPage from './pages/RapportsPage';


export default function App() {
  const [user, setUser] = useState(null);
  const [verif, setVerif] = useState(true);

  useEffect(() => {
    me().then(setUser).catch(() => setUser(null)).finally(() => setVerif(false));
  }, []);

  async function deconnecter() {
    await logout().catch(() => {});
    setUser(null);
  }

  if (verif) return <p className="msg">Chargement...</p>;
  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} onLogout={deconnecter} />}>
          <Route path="/" element={<DashboardPage user={user} />} />
          <Route path="/prospects" element={<ProspectsPage />} />
          <Route path="/equipe" element={<EquipePage />} />
          <Route path="/activites" element={<ActivityPage />} />
  
          <Route path="/parametres" element={<Bientot titre="Paramètres" />} />
           <Route path="/relances" element={<RelancesPage />} />
        <Route path="/objectifs" element={<ObjectifsPage />} />
        <Route path="/rapports" element={<RapportsPage />} />
        <Route path="/equipe/:memberId" element={<EquipePage />} />
        <Route path="/equipe" element={<EquipePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}