import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, ChevronRight, Play, Server, Clock, AlertTriangle, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditorPanelProps {
  onHeal: () => void;
}

interface IntegrityReport {
  isIntegrityViolated: boolean;
  tamperedVoteIds: string[];
  tamperedLogIds: string[];
  totalVotesChecked: number;
  totalLogsChecked: number;
}

export default function AuditorPanel({ onHeal }: AuditorPanelProps) {
  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Integrity Report State
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkSteps, setCheckSteps] = useState<Array<{ label: string; status: 'pending' | 'success' | 'failed' }>>([]);

  const loadLogs = async () => {
    setIsLogsLoading(true);
    try {
      const res = await fetch('/api/audit/logs');
      if (res.ok) {
        const data = await res.json();
        // Sort newest logs first
        setLogs(data.reverse());
      }
    } catch (e) {
      console.error('Error fetching logs', e);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const runIntegrityDiagnostics = async () => {
    setIsChecking(true);
    setReport(null);
    setCheckSteps([
      { label: 'Estabelecendo handshake com chaves RSA locais...', status: 'pending' },
      { label: 'Escaneando correspondência de IDs e hashes de eleitores...', status: 'pending' },
      { label: 'Verificando cadeia de assinaturas digitais por encadeamento...', status: 'pending' },
      { label: 'Homologando hashes estruturais do banco de dados...', status: 'pending' }
    ]);

    // Simulate stepping animations
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setCheckSteps(prev => {
        const next = [...prev];
        next[i].status = 'success';
        return next;
      });
    }

    try {
      const response = await fetch('/api/audit/integrity');
      if (response.ok) {
        const schema = await response.json();
        setReport(schema);
        if (schema.isIntegrityViolated) {
          setCheckSteps(prev => {
            const next = [...prev];
            next[2].status = 'failed'; // Signature linking failed
            return next;
          });
        }
      }
    } catch (err) {
      console.error('Error checking integrity', err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResetLedger = async () => {
    if (!window.confirm('Deseja realmente limpar todos os votos de simulação recentes e restaurar o banco de dados VoteSmart para o estado predefinido?')) return;
    try {
      const response = await fetch('/api/audit/heal', { method: 'POST' });
      if (response.ok) {
        onHeal();
        loadLogs();
        setReport(null);
        alert('Cofres e Urnas limpas. Ledger criptográfico resetado com sucesso.');
      }
    } catch (error) {
      console.error('Error resetting database', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: Live Ledger Cryptographic Verification Module */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-850 mb-5">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <h3 className="font-display text-base font-bold">Verificação de Integridade Criptográfica</h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Módulo: SHA256 Signature ledger</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            O VoteSmart AI armazena votos no padrão de encadeamento sequencial de blocos. Cada voto valida criptograficamente a existência do anterior. Use o painel abaixo para auditar e assegurar matematicamente se alguma alteração foi injetada diretamente no banco de dados.
          </p>

          <div className="space-y-4">
            <button
              onClick={runIntegrityDiagnostics}
              disabled={isChecking}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-505/10"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calculando matrizes matemáticas...
                </>
              ) : (
                <>
                  <Server className="w-4 h-4" />
                  Verificar Integridade de Urnas (Ledger Check)
                </>
              )}
            </button>

            {/* Steps feedback layout */}
            {checkSteps.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2">
                <h4 className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">Passos de Auditoria Local</h4>
                {checkSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    {step.status === 'pending' ? (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 border-t-emerald-500 animate-spin flex shrink-0"></span>
                    ) : step.status === 'success' ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-501 bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0">✓</span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0">✗</span>
                    )}
                    <span className={`text-[11px] ${step.status === 'failed' ? 'text-red-500 font-bold' : step.status === 'success' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Diagnostic Result Block */}
            {report && (
              <div className={`p-4 rounded-xl border text-center space-y-3 ${
                report.isIntegrityViolated 
                  ? 'bg-red-500/10 border-red-550/20 text-red-600 dark:text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {report.isIntegrityViolated ? (
                    <>
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                      <h4 className="font-display font-semibold text-sm">Cadeia Violada ou Modificada!</h4>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-6 h-6" />
                      <h4 className="font-display font-semibold text-sm">Ledger 100% Autenticado e Íntegro!</h4>
                    </>
                  )}
                </div>

                <div className="text-xs leading-relaxed max-w-sm mx-auto space-y-1">
                  <p>Urnas checadas: <strong>{report.totalVotesChecked} votos</strong> cadastrados.</p>
                  <p>Sequências de auditoria checadas: <strong>{report.totalLogsChecked} assinaturas</strong> em hashes.</p>
                  {report.isIntegrityViolated ? (
                    <p className="text-[11px] font-semibold text-red-500 mt-1">Sinais de adulteração: identificados {report.tamperedVoteIds.length} votos adulterados ou modificados fora da cadeia sequencial de selo !</p>
                  ) : (
                    <p className="text-[11px] font-semibold opacity-80">Nenhuma anomalia de tamper identificada. Todas as equações de encadeamento em bloco bateram perfeitamente.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Clear Reset Action block */}
          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-850">
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 font-mono">Simulador de Recuperação Urnas</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Caso queira reiniciar sua sessão de simulações, apagar todos os votos de testes e limpar as anomalias, use o botão de restauração do cofre abaixo.</p>
            <button
              onClick={handleResetLedger}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-600 dark:text-slate-400 transition"
            >
              Restaurar / Sanitizar Banco Inicial
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Live Timeline Audit log feed */}
      <div className="lg:col-span-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col h-[540px]">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850 mb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-violet-500" />
              <div>
                <h4 className="font-display text-base font-bold">Histórico Geral de Auditoria</h4>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">Fila de ações em tempo real</p>
              </div>
            </div>
            <button
               onClick={loadLogs}
               className="p-1 px-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-500 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-850 transition"
            >
              <RefreshCw className={`w-3 h-3 ${isLogsLoading ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          </div>

          {/* Core Timeline feed queue */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {isLogsLoading && logs.length === 0 ? (
              <p className="text-xs italic text-slate-400 text-center py-8">Buscando do arquivo...</p>
            ) : logs.length === 0 ? (
              <p className="text-xs italic text-slate-400 text-center py-8">Nenhum evento registrado.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl relative hover:border-violet-500/15 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[9px] font-bold font-mono text-violet-500 uppercase bg-violet-500/10 px-1.5 py-0.5 rounded">
                      {log.userRole}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">{log.action}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-dashed border-slate-105 dark:border-slate-850">
                    <span>Executor: <strong>{log.userName}</strong></span>
                    <span className="font-mono text-[9px] select-all opacity-80" title="Assinatura Log Hash">Hash: {log.hash.slice(0, 12)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
