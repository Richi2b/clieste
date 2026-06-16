import React, { useState } from 'react';
import { Vote, Shield, Cpu, Layers, HelpCircle, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';
import { User, UserRole } from '../types';

interface LandingPageProps {
  onLogin: (email: string, role: UserRole) => void;
  isLoading: boolean;
  error: string | null;
}

export default function LandingPage({ onLogin, isLoading, error }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('voter');
  const [input2FA, setInput2FA] = useState('');
  const [show2FASim, setShow2FASim] = useState(false);
  const [justCode, setJustCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (selectedRole === 'voter' && !show2FASim) {
      // Simulate 2FA code dispatch for Voter
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setJustCode(code);
      setShow2FASim(true);
      return;
    }

    onLogin(email, selectedRole);
  };

  const handleDemoLogin = (demoEmail: string, role: UserRole) => {
    onLogin(demoEmail, role);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-16">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 rounded-full text-xs font-semibold mb-6">
          <Cpu className="w-3.5 h-3.5" />
          VoteGuardian AI Ativado
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 dark:from-blue-400 dark:via-violet-400 dark:to-emerald-400 bg-clip-text text-transparent">
          VoteSmart AI
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          O primeiro ecossistema inteligente de votação digital de alta segurança. Integrado com <span className="font-semibold text-violet-500">Gemini AI</span> para proteção criptográfica ativa, análise comportamental e auditorias transparentes.
        </p>
      </div>

      {/* Grid of Key Innovations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl glow-blue transition-all">
          <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center rounded-xl mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold mb-2">Confiança e Segurança</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Encadeamento criptográfico de assinaturas (blockchain-ledger) impedindo manipulações unilaterais ou injeções forjadas de votos.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl glow-green transition-all">
          <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-xl mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold mb-2">Transparência Geral</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Comprovante digital assinado individualmente por eleitores. Auditabilidade aberta live para conferência matemática imediata.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl glow-purple transition-all">
          <div className="w-12 h-12 bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center rounded-xl mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold mb-2">Módulo VoteGuardian AI</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Integração avançada com o Gemini para auditoria comportamental de IPs, detecção analítica de speed bursts e previsão preditiva de comparecimento.
          </p>
        </div>
      </div>

      {/* Main Authentication Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-4xl mx-auto">
        {/* Sign In form container */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xl font-bold mb-2">Acesso ao Simulador</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono">
              DIGITE QUALQUER E-MAIL PARA CRIAR OU ENTRAR NO SEU PERFIL
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Escolha o Perfil de Teste
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('voter'); setShow2FASim(false); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      selectedRole === 'voter'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Votante (Eleitor)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('admin'); setShow2FASim(false); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Gestor (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('auditor'); setShow2FASim(false); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      selectedRole === 'auditor'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Auditor (Legado)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: voce@provedor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm py-2.5 px-4 rounded-xl outline-none"
                />
              </div>

              {show2FASim && (
                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Autenticação de Duplo Fator (2FA)</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Simulação SMS/E-mail de verificação concluída. Use o código abaixo:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono text-slate-400">SEU CÓDIGO DE ACESSO:</span>
                    <span className="text-sm font-mono font-bold tracking-widest text-emerald-500">{justCode}</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="DIgite o código de 6 dígitos"
                      required
                      value={input2FA}
                      onChange={(e) => setInput2FA(e.target.value)}
                      className="w-full text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm tracking-widest font-mono py-2 rounded-lg outline-none"
                    />
                  </div>
                  {input2FA && input2FA !== justCode && (
                    <p className="text-[10px] text-red-500 text-center font-semibold">Código incorreto fornecido.</p>
                  )}
                </div>
              )}

              {error && (
                <p className="text-xs font-semibold text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || (show2FASim && input2FA !== justCode)}
                className={`w-full py-3 px-4 font-semibold text-xs uppercase tracking-wide rounded-xl text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                  show2FASim && input2FA !== justCode
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                    : selectedRole === 'admin'
                    ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20 hover:shadow-violet-500/40'
                    : selectedRole === 'auditor'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/40'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 hover:shadow-blue-500/40'
                }`}
              >
                {isLoading ? 'Conectando...' : show2FASim ? 'Autenticar 2FA' : 'Continuar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Quick Demo Access Panels */}
        <div className="lg:col-span-5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h4 className="font-display text-sm font-bold tracking-tight mb-4 uppercase text-slate-400">Atalhos de Simulação</h4>
            <div className="space-y-3">
              {/* Voter Demo */}
              <button
                onClick={() => handleDemoLogin('joao@voter.com', 'voter')}
                className="w-full text-left p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 rounded-xl transition-all shadow-sm block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Entrar como Eleitor</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-blue-500 transition-colors">João Santos (CPF Validado)</p>
              </button>

              {/* Admin Demo */}
              <button
                onClick={() => handleDemoLogin('admin@votesmart.ai', 'admin')}
                className="w-full text-left p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-violet-500/40 dark:hover:border-violet-500/40 rounded-xl transition-all shadow-sm block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Entrar como Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-violet-500 transition-colors">Aline (Configurar Urnas e Eleitores)</p>
              </button>

              {/* Auditor Demo */}
              <button
                onClick={() => handleDemoLogin('auditor@audit.org', 'auditor')}
                className="w-full text-left p-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 rounded-xl transition-all shadow-sm block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Entrar como Auditor</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-emerald-500 transition-colors">Conselho (Logs Criptográficos e Assinatura)</p>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold block mb-1">💡 Dica de Integração</span>
            A base de demonstração já vem preenchida com votos reais e um ataque de speed burst simulado para auditoria imediata de IA!
          </div>
        </div>
      </div>
    </div>
  );
}
