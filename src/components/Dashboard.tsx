import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Users, Inbox, ShieldAlert, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Election, Candidate, Vote, Voter } from '../types';

interface DashboardProps {
  elections: Election[];
  candidates: Candidate[];
  votes: Vote[];
  voters: Voter[];
  onRefresh: () => void;
}

export default function Dashboard({ elections, candidates, votes, voters, onRefresh }: DashboardProps) {
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [containerWidth, setContainerWidth] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto select first active election
  useEffect(() => {
    if (elections.length > 0 && !selectedElectionId) {
      const active = elections.find(e => e.status === 'active') || elections[0];
      setSelectedElectionId(active.id);
    }
  }, [elections, selectedElectionId]);

  // Handle resizing for fluid responsive SVG charts
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      setContainerWidth(entries[0].contentRect.width || 500);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const activeElection = elections.find(e => e.id === selectedElectionId) || elections[0];
  const electionVotes = votes.filter(v => v.electionId === selectedElectionId);
  const electionCandidates = candidates.filter(c => c.electionId === selectedElectionId);

  // Metrics calculations
  const totalRegisteredVoters = voters.length;
  const totalVotesCast = votes.length;
  const overallActiveTurnout = voters.length > 0 
    ? Math.round((votes.filter(v => {
        const el = elections.find(e => e.id === v.electionId);
        return el?.status === 'active';
      }).length / (voters.length * elections.filter(e => e.status === 'active').length || 1)) * 100)
    : 0;

  // Real-time anomalies scanner (simple frontend helper)
  const speedBurstCandidates = Array.from(new Set(votes.map(v => v.ipAddress))).filter(ip => {
    const ipVotes = votes.filter(v => v.ipAddress === ip);
    return ipVotes.length > 8 && ip !== '127.0.0.1';
  }).length;

  // SVG Chart 1 calculation: Vote counts by candidate
  const chartCandidatesData = electionCandidates.map(c => {
    const count = electionVotes.filter(v => v.candidateId === c.id).length;
    const pct = electionVotes.length > 0 ? Math.round((count / electionVotes.length) * 100) : 0;
    return { name: c.name, party: c.party, count, pct, emoji: c.photo };
  }).sort((a, b) => b.count - a.count);

  // SVG Chart 2 calculation: Distribution of votes by hour (for the line graph)
  // Group votes cast today or in past records into 6 blocks (9h, 11h, 13h, 15h, 17h, 19h)
  const votesByTimeBlock = [
    { block: '09:00', count: votes.filter(v => new Date(v.timestamp).getHours() < 10).length },
    { block: '11:00', count: votes.filter(v => { const h = new Date(v.timestamp).getHours(); return h >= 10 && h < 12; }).length },
    { block: '13:00', count: votes.filter(v => { const h = new Date(v.timestamp).getHours(); return h >= 12 && h < 14; }).length },
    { block: '15:00', count: votes.filter(v => { const h = new Date(v.timestamp).getHours(); return h >= 14 && h < 16; }).length },
    { block: '17:00', count: votes.filter(v => { const h = new Date(v.timestamp).getHours(); return h >= 16 && h < 18; }).length },
    { block: '19:00', count: votes.filter(v => new Date(v.timestamp).getHours() >= 18).length },
  ];

  const maxVotesHour = Math.max(...votesByTimeBlock.map(v => v.count), 5);

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Top Title & Quick Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Painel Estatístico de Votações</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dados consolidados do blockchain e integridades auditadas.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0f172a] dark:hover:bg-[#1e293b] text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-800/80"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar Urnas
          </button>
        </div>
      </div>

      {/* Modern Bento Grid Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Bento Cell 1: Total Eleitores */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:translate-y-[-2px] transition-all duration-300 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[145px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total de Eleitores</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">{totalRegisteredVoters}</span>
              <span className="text-xs font-semibold text-emerald-500">Inscritos</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Status de validação biométrica ativo</p>
          </div>
        </div>

        {/* Bento Cell 2: Votos Computados */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:translate-y-[-2px] transition-all duration-300 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[145px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Votos Computados</span>
            <Inbox className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">{totalVotesCast}</span>
              <span className="text-xs font-semibold text-violet-400">SHA-256 LEDGER</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Assinaturas encadeadas e imutáveis</p>
          </div>
        </div>

        {/* Bento Cell 3: Comparecimento Ativo with Circular Progress Meter */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:translate-y-[-2px] transition-all duration-300 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between h-full gap-4">
            <div className="flex flex-col justify-between h-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Comparecimento</span>
              <div>
                <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">{overallActiveTurnout}%</span>
                <p className="text-[10.5px] text-slate-400 mt-1">Abstenção: {Math.max(0, 100 - overallActiveTurnout)}%</p>
              </div>
            </div>
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="40" cy="40" r="32" stroke="#6366f1" strokeWidth="6" fill="transparent" strokeDasharray="201" strokeDashoffset={201 - (201 * Math.min(100, Math.max(0, overallActiveTurnout))) / 100} className="transition-all duration-1000" />
              </svg>
              <span className="absolute text-xs font-bold font-mono text-slate-800 dark:text-white">{overallActiveTurnout}%</span>
            </div>
          </div>
        </div>

        {/* Bento Cell 4: Segurança AI VoteGuardian Card */}
        <div className={`p-5 lg:col-span-3 border rounded-2xl hover:translate-y-[-2px] transition-all duration-300 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[145px] ${
          speedBurstCandidates > 0 
            ? 'bg-gradient-to-br from-amber-950/20 to-[#0f172a] border-amber-500/40 bento-glow-indigo' 
            : 'bg-gradient-to-br from-indigo-950/20 to-[#0f172a] border-indigo-500/30'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Segurança AI</span>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${
              speedBurstCandidates > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {speedBurstCandidates > 0 ? 'Alerta Ativo' : 'Ledger Seguro'}
            </span>
          </div>
          <div>
            <span className="text-xl font-display font-extrabold text-slate-900 dark:text-white block">
              {speedBurstCandidates > 0 ? 'ALERTA EM URNAS' : 'INTEGRIDADE TOTAL'}
            </span>
            <p className="text-[10.5px] text-slate-400 leading-tight mt-1.5">
              {speedBurstCandidates > 0 
                ? `${speedBurstCandidates} bot(s) identificados com injeção anômala` 
                : 'Modelo com auditoria comportamental live.'}
            </p>
          </div>
        </div>

        {/* Bento Cell 5: Live Election Results Viewer (Unidade Central - Card Largo) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Apuração das Urnas em Tempo Real</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase">SELECIONE A ELEIÇÃO PARA RECALCULAR O RESULTADO</p>
            </div>
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 outline-hidden focus:border-indigo-500"
            >
              {elections.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.title} ({el.status === 'active' ? 'ATIVA' : 'FECHADA'})
                </option>
              ))}
            </select>
          </div>

          {activeElection ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Candidates Leaderboard layout */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-3.5 bg-slate-50 dark:bg-[#020617]/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Eleição Selecionada</span>
                  <span className="font-display text-xs font-bold block mb-1 text-indigo-400">{activeElection.title}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{activeElection.description}</p>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Votos: {electionVotes.length}</span>
                    <span className="text-emerald-500">Término: {new Date(activeElection.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {chartCandidatesData.length === 0 ? (
                    <p className="text-xs italic text-slate-400 text-center py-4">Nenhum candidato matriculado para esta eleição.</p>
                  ) : (
                    chartCandidatesData.map((cand, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#020617]/40 border border-slate-200/60 dark:border-slate-800/60 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cand.emoji || '👤'}</span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{cand.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{cand.party}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{cand.count} votos</span>
                          <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                            {cand.pct}%
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Custom Interactive SVG Horizontal Bar Chart */}
              <div className="lg:col-span-7">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Representação Gráfica Parcial (Urnas)</h4>
                {chartCandidatesData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-[#020617]/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-xs italic text-slate-400">Aguardando dados...</span>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-[#020617]/30 rounded-xl p-4 border border-slate-200/60 dark:border-slate-800/60">
                    <svg width="100%" height={Math.max(160, chartCandidatesData.length * 55)} viewBox={`0 0 ${containerWidth > 320 ? containerWidth - 100 : 320} ${Math.max(160, chartCandidatesData.length * 55)}`}>
                      {chartCandidatesData.map((cand, i) => {
                        const y = 15 + i * 50;
                        const labelWidth = 100;
                        const plotWidth = Math.max(120, (containerWidth > 320 ? containerWidth - 280 : 150));
                        const barWidth = plotWidth * (cand.pct / 100);
                        // Choose beautiful dynamic color
                        const barColor = i === 0 ? '#6366f1' : i === 1 ? '#a855f7' : '#10b981';
                        
                        return (
                          <g key={i}>
                            {/* Label (Name of Candidate) */}
                            <text x="5" y={y + 11} fill="currentColor" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300" textAnchor="start">
                              {cand.name.length > 15 ? `${cand.name.slice(0, 13)}...` : cand.name}
                            </text>

                            {/* Gray background track bar */}
                            <rect x={labelWidth} y={y} width={plotWidth} height="12" rx="3" fill="currentColor" className="text-slate-200 dark:text-slate-805" />

                            {/* Active proportional color bar */}
                            <rect x={labelWidth} y={y} width={Math.max(4, barWidth)} height="12" rx="3" fill={barColor} className="transition-all duration-500 ease-out" />

                            {/* Value % text */}
                            <text x={labelWidth + plotWidth + 10} y={y + 11} fill="currentColor" className="text-[10px] font-mono font-bold fill-slate-800 dark:fill-slate-250" textAnchor="start">
                              {cand.count} ({cand.pct}%)
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400">Nenhuma eleição ativa identificada no momento.</p>
          )}
        </div>

        {/* Bento Cell 6: Hourly turn-out trend (Custom SVG line chart Card lateral) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-1">Comparecimento por Horário</h3>
            <p className="text-[10px] text-slate-400 mb-6 font-mono uppercase">VOTOS DISTRIBUÍDOS POR FAIXA HORÁRIA</p>
          </div>
          
          <div className="p-3 bg-slate-50 dark:bg-[#020617]/30 border border-slate-200/60 dark:border-slate-800/60 rounded-xl">
            <svg width="100%" height="160" viewBox={`0 0 ${containerWidth > 320 ? containerWidth - 200 : 280} 160`}>
              {/* Horizontal helper grid lines */}
              <line x1="30" y1="15" x2={containerWidth > 320 ? containerWidth - 220 : 260} y2="15" stroke="currentColor" className="text-slate-200 dark:text-slate-900" strokeDasharray="3" />
              <line x1="30" y1="65" x2={containerWidth > 320 ? containerWidth - 220 : 260} y2="65" stroke="currentColor" className="text-slate-200 dark:text-slate-900" strokeDasharray="3" />
              <line x1="30" y1="115" x2={containerWidth > 320 ? containerWidth - 220 : 260} y2="115" stroke="currentColor" className="text-slate-200 dark:text-slate-900" strokeDasharray="3" />

              {/* Left Y Axis count trackers */}
              <text x="5" y="19" fill="currentColor" className="text-[8px] font-mono fill-slate-400">MAX</text>
              <text x="5" y="69" fill="currentColor" className="text-[8px] font-mono fill-slate-400">{Math.round(maxVotesHour / 2)}</text>
              <text x="5" y="119" fill="currentColor" className="text-[8px] font-mono fill-slate-400">0</text>

              {/* Compute SVG Path Coordinates for line charts */}
              {(() => {
                const graphWidthTotal = containerWidth > 320 ? containerWidth - 260 : 230;
                const stepX = graphWidthTotal / (votesByTimeBlock.length - 1 || 1);
                const points = votesByTimeBlock.map((d, index) => {
                  const x = 35 + index * stepX;
                  // invert scale for SVG height (from 15 to 115)
                  const y = 115 - (d.count / maxVotesHour) * 100;
                  return { x, y, block: d.block, count: d.count };
                });

                // Construct SVG path string (d)
                const pathD = points.reduce((acc, p, idx) => {
                  return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                }, '');

                return (
                  <g>
                    {/* Neon Glow underlay line */}
                    <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
                    
                    {/* Core trend line */}
                    <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Render circular interactive node points */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="#FFFFFF" strokeWidth="1.5" className="cursor-pointer hover:scale-150 transition-all" />
                        
                        {/* Floating value text above dot */}
                        <text x={p.x} y={p.y - 8} fill="currentColor" className="text-[8px] font-mono font-bold fill-slate-700 dark:fill-slate-300 text-center" textAnchor="middle">
                          {p.count}v
                        </text>

                        {/* X Axis label */}
                        <text x={p.x} y="138" fill="currentColor" className="text-[8px] font-mono fill-slate-400 text-center" textAnchor="middle">
                          {p.block}
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between uppercase mt-2">
            <span>Último Bloco: 19:00</span>
            <span className="text-indigo-400 font-bold">Ledger live</span>
          </div>
        </div>

      </div>
    </div>
  );
}
