import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Tag, Edit, AlertCircle, FileText, Settings, User } from 'lucide-react';
import { Election } from '../types';

interface ElectionsPanelProps {
  elections: Election[];
  onCreate: (election: Omit<Election, 'id'>) => void;
  onUpdate: (id: string, election: Partial<Election>) => void;
  onDelete: (id: string) => void;
}

export default function ElectionsPanel({ elections, onCreate, onUpdate, onDelete }: ElectionsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<Election['type']>('residential');
  const [maxVotes, setMaxVotes] = useState(1);
  const [errorObj, setErrorObj] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) {
      setErrorObj('Todos os campos são obrigatórios.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setErrorObj('A data de término precisa ser posterior à data de início.');
      return;
    }

    onCreate({
      title,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: 'active',
      type,
      maxVotes
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setType('residential');
    setMaxVotes(1);
    setErrorObj(null);
    setShowAddForm(false);
  };

  const toggleStatus = (el: Election) => {
    const nextStatus = el.status === 'active' ? 'inactive' : el.status === 'inactive' ? 'closed' : 'active';
    onUpdate(el.id, { status: nextStatus });
  };

  const getStatusBadge = (status: Election['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'closed':
        return 'bg-slate-500/15 text-slate-500 border border-slate-300 dark:border-slate-800';
      default:
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    }
  };

  const getStatusText = (status: Election['status']) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'closed': return 'Encerrada';
      default: return 'Inativa / Precedente';
    }
  };

  const getTypeLabel = (type: Election['type']) => {
    switch (type) {
      case 'academic': return 'Acadêmico';
      case 'corporate': return 'Corporativo';
      case 'residential': return 'Residencial';
      default: return 'Associação';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-805 rounded-xl shadow-sm">
        <div>
          <h3 className="font-display text-base font-bold">Gestão de Processos Eleitorais</h3>
          <p className="text-xs text-slate-400">Configure urna de votação eletrônica, status e regras locais.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 py-2 px-4 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Eleição
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
          <h4 className="font-display font-bold text-sm">Criar Urna Eleitoral Integrada</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Título da Eleição</label>
              <input
                type="text"
                required
                placeholder="Ex: Direção Discente Delta 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Classificação / Categoria</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Election['type'])}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              >
                <option value="residential">Residencial / Condomínio</option>
                <option value="academic">Acadêmico / Escolar</option>
                <option value="corporate">Corporativo / Diretoria</option>
                <option value="association">Associação / Sindicato</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Descrição Executiva</label>
            <textarea
              required
              rows={3}
              placeholder="Digite o regulamento e detalhes para os eleitores..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Data de Início</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Data de Término</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Número Máx. Votos por Eleitor</label>
              <input
                type="number"
                min={1}
                max={5}
                required
                value={maxVotes}
                onChange={(e) => setMaxVotes(parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {errorObj && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/15 rounded-lg text-red-500 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorObj}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md transition-colors"
            >
              Salvar Urna
            </button>
          </div>
        </form>
      )}

      {/* Elections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {elections.map((el) => (
          <div key={el.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            {/* Top info and tag */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 text-[10px] font-bold">
                  <Tag className="w-3 h-3" />
                  {getTypeLabel(el.type)}
                </span>
                <span className={`text-[10px] font-bold px-2 px-2.5 py-0.5 rounded-full ${getStatusBadge(el.status)}`}>
                  {getStatusText(el.status)}
                </span>
              </div>

              <h4 className="font-display font-bold text-base mb-1.5 group-hover:text-violet-500 transition-colors">{el.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{el.description}</p>
            </div>

            {/* Date statistics */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Calendar className="w-4 h-4 text-violet-500" />
                <span>
                  {new Date(el.startDate).toLocaleDateString()} ás {new Date(el.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>
                  Até {new Date(el.endDate).toLocaleDateString()}
                </span>
              </div>

              {/* Action Operations */}
              <div className="flex justify-between items-center gap-2 pt-1">
                <button
                  onClick={() => toggleStatus(el)}
                  className="flex items-center gap-1.5 py-1 px-2.5 text-[10px] font-bold text-slate-500 hover:text-violet-500 bg-slate-50 hover:bg-violet-500/5 dark:bg-slate-950 dark:hover:bg-violet-500/10 rounded border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  Ciclo Urna
                </button>
                <button
                  onClick={() => onDelete(el.id)}
                  className="p-1 px-2.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded border border-slate-200 dark:border-slate-800 transition-colors"
                  title="Apagar Eleição"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
