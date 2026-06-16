import React, { useState, useEffect } from 'react';
import { 
  Vote as VoteIcon, Shield, Cpu, Layers, HelpCircle, LogOut, Sun, Moon, 
  LayoutDashboard, FolderKanban, Users, Award, ShieldAlert, Sparkles, Smartphone, Menu, X 
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import VoteGuardianAI from './components/VoteGuardianAI';
import ElectionsPanel from './components/ElectionsPanel';
import CandidatesPanel from './components/CandidatesPanel';
import VotersPanel from './components/VotersPanel';
import VoteScreen from './components/VoteScreen';
import AuditorPanel from './components/AuditorPanel';

import { User, Election, Candidate, Voter, Vote, UserRole } from './types';

export default function App() {
  // Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Database synchronizations
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  // Telemetry status
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync DB contents from the central rest server
  const syncDatabase = async () => {
    try {
      const [resEl, resCand, resVoter, resVote] = await Promise.all([
        fetch('/api/elections'),
        fetch('/api/candidates'),
        fetch('/api/voters'),
        fetch('/api/votes')
      ]);

      if (resEl.ok) setElections(await resEl.json());
      if (resCand.ok) setCandidates(await resCand.json());
      if (resVoter.ok) setVoters(await resVoter.json());
      if (resVote.ok) setVotes(await resVote.json());
    } catch (err) {
      console.error('Error syncing VoteSmart active state with Express server', err);
    }
  };

  // Sync general lists on startup
  useEffect(() => {
    syncDatabase();
    
    // Auto restore session if cache is set
    const cachedUser = localStorage.getItem('vts_user');
    const cachedToken = localStorage.getItem('vts_token');
    const cachedTheme = localStorage.getItem('vts_theme') as 'light' | 'dark' | null;
    
    if (cachedUser && cachedToken) {
      setCurrentUser(JSON.parse(cachedUser));
      setToken(cachedToken);
    }
    if (cachedTheme) {
      setTheme(cachedTheme);
    }
  }, []);

  // Update theme tag list
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vts_theme', theme);
  }, [theme]);

  // Auth Handlers
  const handleLogin = async (email: string, role: UserRole) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.toLowerCase(), role })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha na autenticação.');
      }

      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('vts_user', JSON.stringify(data.user));
      localStorage.setItem('vts_token', data.token);

      // Auto route based on profile
      if (data.user.role === 'voter') {
        setActiveTab('vote');
      } else if (data.user.role === 'auditor') {
        setActiveTab('auditor');
      } else {
        setActiveTab('dashboard');
      }
      
      // Seed fresh lists
      syncDatabase();
    } catch (err: any) {
      setAuthError(err.message || 'Erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('vts_user');
    localStorage.removeItem('vts_token');
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
  };

  // Sync Voter state on actions to make hasVoted checks instant
  const handleBallotReload = async () => {
    await syncDatabase();
    if (currentUser) {
      // Find updated user validation info in voters DB
      const updatedVoter = voters.find(v => v.email.toLowerCase() === currentUser.email.toLowerCase());
      if (updatedVoter) {
        setCurrentUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            validationStatus: updatedVoter.validationStatus,
            hasVotedElectionIds: updatedVoter.hasVotedElectionIds
          } as any;
        });
      }
    }
  };

  // REST API Handlers mapping to database controls
  const handleCreateElection = async (el: Omit<Election, 'id'>) => {
    const response = await fetch('/api/elections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(el)
    });
    if (response.ok) syncDatabase();
  };

  const handleUpdateElection = async (id: string, el: Partial<Election>) => {
    const response = await fetch(`/api/elections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(el)
    });
    if (response.ok) syncDatabase();
  };

  const handleDeleteElection = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja deletar permanentemente esta eleição e todas as suas chapas de voto correspondentes?')) return;
    const response = await fetch(`/api/elections/${id}`, { method: 'DELETE' });
    if (response.ok) syncDatabase();
  };

  const handleCreateCandidate = async (cand: Omit<Candidate, 'id'>) => {
    const response = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cand)
    });
    if (response.ok) syncDatabase();
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!window.confirm('Excluir este candidato permanentemente?')) return;
    const response = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
    if (response.ok) syncDatabase();
  };

  const handleCreateVoter = async (voter: Omit<Voter, 'id' | 'hasVotedElectionIds'>) => {
    const response = await fetch('/api/voters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voter)
    });
    if (response.ok) syncDatabase();
  };

  const handleUpdateVoter = async (id: string, voter: Partial<Voter>) => {
    const response = await fetch(`/api/voters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voter)
    });
    if (response.ok) syncDatabase();
  };

  const handleDeleteVoter = async (id: string) => {
    if (!window.confirm('Excluir este eleitor permanentemente das bases de dados?')) return;
    const response = await fetch(`/api/voters/${id}`, { method: 'DELETE' });
    if (response.ok) syncDatabase();
  };

  // Nav Item Selector tailored by role
  const getNavItems = () => {
    if (!currentUser) return [];

    const voterItems = [
      { id: 'vote', label: 'Urna Eletrônica', icon: VoteIcon },
      { id: 'dashboard', label: 'Apuração Parcial', icon: LayoutDashboard },
      { id: 'guardian', label: 'VoteGuardian AI', icon: Cpu }
    ];

    const adminItems = [
      { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
      { id: 'elections', label: 'Gerir Eleições', icon: FolderKanban },
      { id: 'candidates', label: 'Gerir Candidatos', icon: Award },
      { id: 'voters', label: 'Inscrições Eleitores', icon: Users },
      { id: 'guardian', label: 'VoteGuardian AI', icon: Cpu },
      { id: 'auditor', label: 'Fila de Auditoria', icon: Shield }
    ];

    const auditorItems = [
      { id: 'dashboard', label: 'Métricas Urnas', icon: LayoutDashboard },
      { id: 'guardian', label: 'Análise de Riscos AI', icon: Cpu },
      { id: 'auditor', label: 'Assinaturas Ledger', icon: Shield }
    ];

    switch (currentUser.role) {
      case 'admin': return adminItems;
      case 'auditor': return auditorItems;
      default: return voterItems;
    }
  };

  const navItems = getNavItems();

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Active Component Router
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            elections={elections}
            candidates={candidates}
            votes={votes}
            voters={voters}
            onRefresh={syncDatabase}
          />
        );
      case 'guardian':
        return <VoteGuardianAI apiToken={token} />;
      case 'elections':
        return (
          <ElectionsPanel 
            elections={elections}
            onCreate={handleCreateElection}
            onUpdate={handleUpdateElection}
            onDelete={handleDeleteElection}
          />
        );
      case 'candidates':
        return (
          <CandidatesPanel
            candidates={candidates}
            elections={elections}
            onCreate={handleCreateCandidate}
            onDelete={handleDeleteCandidate}
          />
        );
      case 'voters':
        return (
          <VotersPanel
            voters={voters}
            elections={elections}
            onCreate={handleCreateVoter}
            onUpdate={handleUpdateVoter}
            onDelete={handleDeleteVoter}
          />
        );
      case 'vote':
        return (
          <VoteScreen
            currentUser={currentUser}
            elections={elections}
            candidates={candidates}
            onRefresh={handleBallotReload}
          />
        );
      case 'auditor':
        return <AuditorPanel onHeal={syncDatabase} />;
      default:
        return <div className="text-center italic py-20 text-slate-400">Página em reconstrução.</div>;
    }
  };

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#020617]/85 backdrop-blur-md border-b border-slate-255 dark:border-slate-800/80 px-4 sm:px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-550"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Core Brand title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold leading-none select-none shadow shadow-indigo-500/20">
              VS
            </div>
            <span className="font-display font-extrabold text-base tracking-tight select-none text-slate-900 dark:text-white">
              VoteSmart <span className="text-indigo-400">AI</span>
            </span>
          </div>
        </div>

        {/* User profile tags and dark mode buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0f172a] dark:hover:bg-[#1e293b] border border-slate-200 dark:border-slate-800 transition text-slate-500 dark:text-slate-400"
            title="Alternar Tema Visual"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {currentUser && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentUser.name}</span>
              <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded">
                [{currentUser.role}]
              </span>
            </div>
          )}

          {currentUser && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/25 transition-all font-semibold text-xs flex items-center gap-1"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Desconectar</span>
            </button>
          )}
        </div>
      </header>

      {/* DETAILED LAYOUT AND PAGES ROUTER */}
      {!currentUser ? (
        <LandingPage 
          onLogin={handleLogin}
          isLoading={isLoading}
          error={authError}
        />
      ) : (
        <div className="flex">
          
          {/* STATIC SIDEBAR (DESKTOP) */}
          <aside className="hidden lg:block w-64 h-[calc(100vh-73px)] sticky top-[73px] bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800/80 p-4 space-y-2 select-none overflow-y-auto">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block px-3 mb-2">Painéis de Acesso</span>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 py-2.5 px-3.5 text-xs font-semibold rounded-xl text-left border transition-all ${
                      active
                        ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold shadow-xs'
                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1e293b]/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-indigo-400' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6 px-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold mb-2">Status Sistema</span>
              <div className="p-3 bg-slate-50 dark:bg-[#020617]/60 border border-slate-200 dark:border-slate-800/60 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-200">Seguro / Ativo</span>
                </div>
                <p className="text-[9.5px] font-mono text-slate-400 truncate mt-1.5">{currentUser.email}</p>
              </div>
            </div>
          </aside>

          {/* MOBILE NAVIGATION OVERLAY DRAWER */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
              <div className="w-64 bg-white dark:bg-slate-950 h-full p-5 space-y-3 z-50 relative animate-slide-right flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest">Opções</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 py-2.5 px-3.5 text-xs font-semibold rounded-xl text-left border ${
                            active
                              ? 'bg-violet-500/10 border-violet-500/20 text-violet-500 font-bold'
                              : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold block mb-1 text-slate-400">Logado como:</span>
                  <p className="text-xs font-bold truncate">{currentUser.name}</p>
                  <span className="text-[9.5px] font-mono text-slate-400">[{currentUser.role.toUpperCase()}]</span>
                </div>
              </div>
            </div>
          )}

          {/* CENTRAL WORKSPACE STAGE */}
          <main className="flex-1 min-h-[calc(100vh-73px)] p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {renderTabContent()}
          </main>
        </div>
      )}
    </div>
  );
}
