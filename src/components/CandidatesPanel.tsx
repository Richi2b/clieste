import React, { useState } from 'react';
import { UserPlus, Trash2, Plus, Sparkles, FileText, CheckCircle, Award } from 'lucide-react';
import { Candidate, Election } from '../types';

interface CandidatesPanelProps {
  candidates: Candidate[];
  elections: Election[];
  onCreate: (cand: Omit<Candidate, 'id'>) => void;
  onDelete: (id: string) => void;
}

export default function CandidatesPanel({ candidates, elections, onCreate, onDelete }: CandidatesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [name, setName] = useState('');
  const [party, setParty] = useState('');
  const [photo, setPhoto] = useState('👤');
  const [bio, setBio] = useState('');
  const [proposalsText, setProposalsText] = useState('');

  // Auto pick first election
  React.useEffect(() => {
    if (elections.length > 0 && !selectedElectionId) {
      setSelectedElectionId(elections[0].id);
    }
  }, [elections, selectedElectionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !party || !bio || !selectedElectionId) return;

    // Split proposals by lines
    const proposals = proposalsText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    onCreate({
      electionId: selectedElectionId,
      name,
      party,
      photo,
      bio,
      proposals: proposals.length > 0 ? proposals : ['Trabalhar pelo bem comum de toda a instituição.']
    });

    // Reset Form
    setName('');
    setParty('');
    setPhoto('👤');
    setBio('');
    setProposalsText('');
    setShowForm(false);
  };

  const activeElection = elections.find(e => e.id === selectedElectionId) || elections[0];
  const filteredCandidates = candidates.filter(c => c.electionId === selectedElectionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-sm gap-4">
        <div>
          <h3 className="font-display text-base font-bold">Gerenciamento de Candidatos & Chapas</h3>
          <p className="text-xs text-slate-400">Inscreva candidatos e vincule propostas detalhadas em urnas ativas.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 outline-none focus:border-violet-500 flex-1 sm:flex-initial"
          >
            {elections.map(el => (
              <option key={el.id} value={el.id}>{el.title.slice(0, 30)}...</option>
            ))}
          </select>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 py-2 px-3 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Vincular Chapa
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
          <h4 className="font-display font-bold text-sm">Cadastrar Nova Opção / Candidatado</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Nome de Exibição</label>
              <input
                type="text"
                required
                placeholder="Ex: Dra. Juliana Barbosa ou Chapa Renova Jovem"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Ícone Visual / Emoticon</label>
              <select
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              >
                <option value="👤">👤 Perfil Genérico</option>
                <option value="🏢">🏢 Infraestrutura / Condomínio</option>
                <option value="💼">💼 Executivo / Chapa Corporativa</option>
                <option value="👩‍💻">👩‍💻 Desenvolvedora / Acadêmico</option>
                <option value="👨‍🔬">👨‍🔬 Pesquisador / Ciência</option>
                <option value="🌱">🌱 Sustentabilidade / Ecológico</option>
                <option value="⚖️">⚖️ Jurídico / Transparência</option>
                <option value="🎓">🎓 Conselheiro Acadêmico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Legenda / Partido / Chapa ID</label>
              <input
                type="text"
                required
                placeholder="Ex: Chapa 12 - Frente Universitária Disdis"
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Vincular Seletivamente à Urna</label>
              <select
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              >
                {elections.map(el => (
                  <option key={el.id} value={el.id}>{el.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Biografia Resumida</label>
            <textarea
              required
              rows={2}
              placeholder="Descreva a formação, histórico comunitário ou ementa da chapa..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Propostas Chave (Uma por linha)</label>
            <textarea
              rows={4}
              placeholder="Digite as propostas separadas por parágrafo (Enter)..."
              value={proposalsText}
              onChange={(e) => setProposalsText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500 font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 font-semibold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition"
            >
              Matricular Chapa
            </button>
          </div>
        </form>
      )}

      {/* Candidates List sorted by election context */}
      <div>
        <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 font-mono">
          Chapas Registradas na Urna: {activeElection?.title || 'Selecione uma urna'}
        </h4>

        {filteredCandidates.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Award className="w-8 h-8 text-slate-350 mx-auto mb-2" />
            <span className="text-xs italic text-slate-400">Nenhum candidato vinculado à urna "{activeElection?.title}" ainda.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((cand) => (
              <div key={cand.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-violet-500/25 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-xl shadow-sm">
                      {cand.photo || '👤'}
                    </span>
                    <button
                      onClick={() => onDelete(cand.id)}
                      className="p-1 px-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded border border-slate-200 dark:border-slate-800 transition"
                      title="Remover Chapa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h5 className="font-display font-bold text-sm mb-0.5">{cand.name}</h5>
                  <span className="text-[10px] font-semibold text-violet-500 uppercase bg-violet-500/10 dark:bg-violet-500/20 px-1.5 py-0.5 rounded block w-max mb-3">
                    {cand.party}
                  </span>
                  
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 italic">
                    "{cand.bio}"
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Propostas Técnicas:</span>
                    {cand.proposals.map((prop, index) => (
                      <div key={index} className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed flex items-start gap-1.5">
                        <span className="text-violet-500 font-bold">•</span>
                        <span>{prop}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2.5 text-[9px] font-mono opacity-50 block text-right uppercase">
                  Registro: {cand.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
