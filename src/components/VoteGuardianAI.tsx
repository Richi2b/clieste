import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Send, ShieldAlert, Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Play, User, RefreshCw, BarChart } from 'lucide-react';
import { VoteGuardianReport } from '../types';

interface VoteGuardianAIProps {
  apiToken: string | null;
}

export default function VoteGuardianAI({ apiToken }: VoteGuardianAIProps) {
  // Chatbot State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: 'Olá! Sou o auditor automatizado **VoteGuardian AI**. Analisei as urnas criptográficas recentes e o ledger de segurança. Como posso lhe ajudar nas investigações ou esclarecimentos hoje?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Security Report State
  const [report, setReport] = useState<VoteGuardianReport | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Load Initial Security Report
  const fetchReport = async () => {
    setIsReportLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/report');
      if (!response.ok) throw new Error('Falha ao comunicar com o agente de análise VoiceGuardian.');
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setIsReportLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isChatLoading) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      // Map structures correctly for history sending
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [m.text]
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiToken ? `Bearer ${apiToken}` : ''
        },
        body: JSON.stringify({
          userQuestion: userMsg,
          chatHistory
        })
      });

      if (!res.ok) throw new Error('Erro na conexão com Gemini AI.');
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'model', text: data.answer }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: `⚠️ **Erro na conexão**: Falha ao processar solicitações no modelo de inteligência. Por favor, tente novamente.` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'high': return 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400';
      case 'medium': return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
      default: return 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT HAND PANEL: Real-time Telemetry & Security Audit Report */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-violet-500 animate-pulse" />
              <div>
                <h3 className="font-display text-base font-bold">Relatório Executivo VoteGuardian AI</h3>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Motor: gemini-3.5-flash com Heurísticas</p>
              </div>
            </div>
            <button
              onClick={fetchReport}
              disabled={isReportLoading}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800"
              title="Recalcular Parecer Técnico"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReportLoading ? 'animate-spin text-violet-500' : ''}`} />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-500 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading Skeletons */}
          {isReportLoading ? (
            <div className="space-y-4 py-4 animate-pulse">
              <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Executive Narrative */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 font-mono mb-2">Resumo de Auditoria Ativa</h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans">{report.summary}</p>
                </div>
              </div>

              {/* Dynamic Calculated Predictions Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Projeção Final</span>
                    <span className="text-sm font-display font-bold">{report.predictions.turnoutForecastPercentage}%</span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Alertas Finais</span>
                    <span className={`text-sm font-display font-bold ${report.metrics.anomaliesCount > 0 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      {report.metrics.anomaliesCount} Registrados
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Alvo Previsto</span>
                    <span className="text-sm font-display font-bold">{report.metrics.totalExpectedVoters} Eleitores</span>
                  </div>
                </div>
              </div>

              {/* Anomalies List */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 font-mono mb-3">Registros de Comportamento Anômalos</h4>
                {report.anomalies.length === 0 ? (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Zero anomalias computadas nas urnas recentes. Ledger totalmente íntegro.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {report.anomalies.map((an, i) => (
                      <div key={i} className={`p-4 border rounded-xl flex gap-3 transition-all ${getSeverityColor(an.severity)}`}>
                        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold leading-none">{an.description}</span>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10">
                              Grau {an.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-1.5">{an.details}</p>
                          <span className="text-[9px] font-mono opacity-60">Registrado às: {new Date(an.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Predictions & Peak Hours Forecast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2.5">
                  <h5 className="text-[11px] font-bold uppercase text-slate-400 font-mono flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Horários de Pico Previstos
                  </h5>
                  <div className="space-y-1.5">
                    {report.predictions.peakHours.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2.5">
                  <h5 className="text-[11px] font-bold uppercase text-slate-400 font-mono flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-500" /> Diretrizes e Recomendações
                  </h5>
                  <div className="space-y-1.5">
                    {report.predictions.recommendations.slice(0, 2).map((rec, i) => (
                      <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-1.5">
                        <span className="text-yellow-500 font-bold">•</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">Nenhum relatório compilado na ativa.</p>
          )}
        </div>
      </div>

      {/* RIGHT HAND PANEL: Grounded Real-Time IA Chatbot Container */}
      <div className="lg:col-span-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[520px]">
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/15 text-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-display">Assistente Auditor VoteGuardian</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[9px] font-mono uppercase text-slate-400 font-semibold">Grounded em tempo real</span>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isUser ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-violet-500'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : 'Aud'}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none font-sans'
                  }`}>
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>
                </div>
              );
            })}
            
            {isChatLoading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-violet-500 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl rounded-tl-none text-xs">
                  Analisando base do ledger criptográfico...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-850 flex gap-2">
            <input
              type="text"
              required
              disabled={isChatLoading}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua dúvida: 'Quem está liderando?' ou 'Anomalias?'"
              className="flex-1 bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 py-2.5 px-4 rounded-xl outline-none"
            />
            <button
              type="submit"
              disabled={isChatLoading || !inputValue.trim()}
              className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
