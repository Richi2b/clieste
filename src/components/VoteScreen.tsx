import React, { useState, useEffect } from 'react';
import { Vote as VoteIcon, Shield, CheckCircle, Smartphone, Key, Award, Clock, FileText, ChevronRight } from 'lucide-react';
import { Election, Candidate, User, Vote } from '../types';

interface VoteScreenProps {
  currentUser: User | null;
  elections: Election[];
  candidates: Candidate[];
  onRefresh: () => void;
}

export interface VoteReceipt {
  receiptId: string;
  signature: string;
  timestamp: string;
  candidateName: string;
  electionTitle: string;
  party: string;
}

export default function VoteScreen({ currentUser, elections, candidates, onRefresh }: VoteScreenProps) {
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [securityTerms, setSecurityTerms] = useState(false);
  
  // 2FA Verification code simulator for casting validation (safety first!)
  const [authCode, setAuthCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [showSmsBlock, setShowSmsBlock] = useState(false);

  const [receipt, setReceipt] = useState<VoteReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  // Initialize selected election
  useEffect(() => {
    const active = elections.filter(e => e.status === 'active');
    if (active.length > 0 && !selectedElectionId) {
      setSelectedElectionId(active[0].id);
    }
  }, [elections, selectedElectionId]);

  const activeElection = elections.find(e => e.id === selectedElectionId);
  const activeCandidates = candidates.filter(c => c.electionId === selectedElectionId);
  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  // Check if voter already casted vote in chosen election
  const currentVoterHasVoted = currentUser?.validationStatus === 'validated' && 
    (currentUser as any).hasVotedElectionIds?.includes(selectedElectionId);

  // Trigger dispatch of SMS vote authorization code
  const triggerSmsVoteCode = () => {
    if (!currentUser) return;
    const smsVal = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(smsVal);
    setShowSmsBlock(true);
    setErrorMsg(null);
  };

  const handleConfSubmit = async () => {
    if (!selectedElectionId || !selectedCandidateId || !currentUser) return;
    if (authCode !== sentCode) {
      setErrorMsg('Token SMS incorreto ou expirado. Por favor, digite o código fornecido abaixo.');
      return;
    }

    setIsCasting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/votes/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId: selectedElectionId,
          candidateId: selectedCandidateId,
          userId: currentUser.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro desconhecido ao computar o voto.');
      }

      // Success - populate receipt!
      setReceipt({
        receiptId: data.receiptId,
        signature: data.signature,
        timestamp: data.timestamp,
        candidateName: selectedCandidate?.name || '',
        electionTitle: activeElection?.title || '',
        party: selectedCandidate?.party || ''
      });

      // Update parent states
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão nas urnas.');
    } finally {
      setIsCasting(false);
      setShowConfirm(false);
    }
  };

  const resetBallot = () => {
    setSelectedCandidateId('');
    setShowConfirm(false);
    setSecurityTerms(false);
    setAuthCode('');
    setSentCode('');
    setShowSmsBlock(false);
    setReceipt(null);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title section */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Cabine Eletrônica Secreta</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Existem normas rigorosas para garantir seu voto livre, único e selado.</p>
      </div>

      {/* Profile validation prompt */}
      {currentUser && currentUser.validationStatus !== 'validated' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 rounded-xl flex items-start gap-3">
          <Smartphone className="w-5 h-5 shrink-0 animate-bounce" />
          <div>
            <h4 className="font-bold mb-1">Acesso Bloqueado pelo VoteGuardian AI</h4>
            <p className="leading-relaxed">Seu cadastro ({currentUser.email}) de eleitor está como **"{currentUser.validationStatus || 'pendente'}"**. Para ter o direito de voto liberado, seu ID deve ser aprovado pelo Administrador do pleito na aba Inscrições.</p>
          </div>
        </div>
      )}

      {/* RECEIPT VIEW COMPONENT (VOUCHER BALLOT) */}
      {receipt ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xl max-w-lg mx-auto glow-green">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100">Comprovante de Votação Digital</h3>
            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-max mx-auto mt-2">
              Voto Registrado e Assinado
            </span>
          </div>

          {/* Structured detailed list of crypto ballot */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl space-y-3.5 text-left text-xs font-sans">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Eleição Executada</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{receipt.electionTitle}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Opção Registrada</span>
                <p className="font-bold text-slate-700 dark:text-slate-300">{receipt.candidateName}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Legenda / Partido</span>
                <p className="font-bold text-slate-700 dark:text-slate-300">{receipt.party}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Identificador de Comprovante (UUID)</span>
              <p className="font-mono text-[11px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded block select-all break-all">{receipt.receiptId}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Selo Criptográfico de Integridade (SHA-256 Chain)</span>
              <p className="font-mono text-[9px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded block select-all break-all text-violet-500 dark:text-violet-400 font-bold">{receipt.signature}</p>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-violet-500" />
              <span>Timestamp: {new Date(receipt.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 leading-relaxed max-w-sm mx-auto">
            🛡️ O VoteSmart AI protege o sigilo do seu voto. O selo acima confirma sua participação de forma blindada no ledger público sem expor sua identidade pessoal.
          </div>

          <button
            onClick={resetBallot}
            className="w-full py-2.5 px-4 font-semibold text-xs rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 transition"
          >
            Sair da Urna Secreta
          </button>
        </div>
      ) : (
        /* BALLOT SUBMIT SELECTIONS SCREEN */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Active Elecitons list / Rules */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-400 font-mono">Selecione o Pleito Ativo</h4>
              <div className="space-y-2">
                {elections.filter(e => e.status === 'active').map((el) => (
                  <button
                    key={el.id}
                    onClick={() => { setSelectedElectionId(el.id); setSelectedCandidateId(''); }}
                    className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition flex items-center justify-between group ${
                      selectedElectionId === el.id
                        ? 'bg-blue-600/5 border-blue-600 text-blue-600 font-bold'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span>{el.title.split('-')[0].trim()}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Verification card details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <h5 className="font-bold uppercase font-mono text-slate-400 text-[10px]">Criptografia e Sigilo</h5>
              <div className="space-y-2 leading-relaxed">
                <p>🗳️ <strong>Hash de Anonimização</strong>: Seu ID é convertido em uma assinatura unidirecional. A relação voto-votante é fisicamente rompida.</p>
                <p>⛓️ <strong>Dossiê Encadeado</strong>: Cada voto inserido serve de base para gerar a assinatura digital do próximo voto. Se o banco de dados for modificado pelo admin, a cadeia de assinaturas quebrará imediatamente.</p>
              </div>
            </div>
          </div>

          {/* Candidates and ballot confirmation box */}
          <div className="md:col-span-8 space-y-5">
            {/* Show error of validate / hasvoted blocks */}
            {currentVoterHasVoted ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 mb-1">Seu Voto Foi Depositado!</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Nosso sistema auditor **VoteGuardian AI** confirma que você já enviou seu voto individual para a eleição "{activeElection?.title}". Obrigado por exercer seu dever cívico de forma totalmente transparente e segura.
                </p>
                <button
                  onClick={onRefresh}
                  className="mt-6 text-xs text-blue-500 font-bold underline hover:text-blue-600"
                >
                  Consultar Urnas Estatísticas
                </button>
              </div>
            ) : currentUser?.validationStatus !== 'validated' ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
                <Shield className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                <p className="text-xs italic text-slate-400">Por favor, faça a validação da sua identidade para ter acesso à tela de voto secreta.</p>
              </div>
            ) : activeCandidates.length === 0 ? (
              <p className="text-xs italic text-slate-400 text-center py-6 bg-white dark:bg-slate-900 border rounded-2xl border-slate-200 dark:border-slate-800">
                Aguardando cadastramento de chapas discentes ou presidenciais nesta eleição pelo Administrador.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Urna Selecionada Ativa</span>
                  <h4 className="font-display font-bold text-sm text-blue-500 mt-0.5">{activeElection?.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 font-sans">{activeElection?.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCandidates.map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className={`w-full text-left p-5 bg-white dark:bg-slate-900 border rounded-2xl transition-all shadow-sm flex flex-col justify-between hover:scale-[1.01] ${
                        selectedCandidateId === cand.id
                          ? 'border-violet-600 ring-1 ring-violet-600'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-xl">
                            {cand.photo || '👤'}
                          </span>
                          {selectedCandidateId === cand.id && (
                            <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                          )}
                        </div>

                        <h5 className="font-display font-bold text-sm mb-0.5">{cand.name}</h5>
                        <span className="text-[9px] font-bold uppercase text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded tracking-wider w-max block mb-2">
                          {cand.party}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 italic mb-3">"{cand.bio}"</p>
                      </div>

                      <div className="w-full text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-850 space-y-1">
                        <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">Proposta Destacada</span>
                        <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">• {cand.proposals[0]}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Vote confirm button */}
                {selectedCandidate && (
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Lançar Intenção de Voto Em</span>
                      <h5 className="text-xs font-bold font-display text-slate-800 dark:text-slate-100">{selectedCandidate.name}</h5>
                    </div>

                    <button
                      onClick={() => { setShowConfirm(true); triggerSmsVoteCode(); }}
                      className="py-2.5 px-5 font-semibold text-xs rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                    >
                      Depositar Voto Único
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2FA SMS MODAL VERIFICATION POPUP */}
      {showConfirm && selectedCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">Autenticação de Segurança Digital</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase">2FA REQUERIDO PELO VOTEGUARDIAN AI</p>
              </div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed font-sans space-y-2">
              <p>Você escolheu depositar seu voto único na opção <strong>{selectedCandidate.name} ({selectedCandidate.party})</strong>.</p>
              <p>O VoteGuardian AI disparou uma simulação de autenticação celular de 6 dígitos via SMS para o seu número <strong>{currentUser?.phone || '+55 11 98888-1111'}</strong>.</p>
            </div>

            {showSmsBlock && (
              <div className="p-3 bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/15 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>DISPOSITIVO AUDITADO CONECTADO:</span>
                  <span className="font-bold text-violet-500">token ativo</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-2 border border-slate-100 dark:border-slate-850 rounded">
                  <span className="text-[10px] text-slate-400 font-mono">SMS DO SEU CELULAR:</span>
                  <span className="font-mono text-sm font-bold tracking-widest text-violet-500">{sentCode}</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="DIGITE O CÓDIGO SMS ACIMA"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="w-full text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm py-2 rounded-lg font-mono tracking-widest outline-none"
                />
              </div>
            )}

            {/* Check validation terms */}
            <label className="flex items-start gap-2.5 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={securityTerms}
                onChange={(e) => setSecurityTerms(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Declaro estar ciente de que meu voto será computado em segredo, assinado com selos matemáticos e que esta ação é irreversível após homologação.
              </span>
            </label>

            {errorMsg && (
              <p className="text-[11px] font-semibold text-red-500">{errorMsg}</p>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Retornar
              </button>
              <button
                type="button"
                disabled={isCasting || !securityTerms || authCode !== sentCode}
                onClick={handleConfSubmit}
                className={`flex-1 py-2 rounded-lg font-semibold text-xs text-white shadow-md ${
                  isCasting || !securityTerms || authCode !== sentCode
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                    : 'bg-violet-605 bg-violet-600 hover:bg-violet-750'
                }`}
              >
                {isCasting ? 'Computando...' : 'Homologar Voto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
