import React, { useState } from 'react';
import { UserCheck, UserX, UserMinus, Plus, Shield, Search, Check, AlertTriangle } from 'lucide-react';
import { Voter, Election } from '../types';

interface VotersPanelProps {
  voters: Voter[];
  elections: Election[];
  onCreate: (voter: Omit<Voter, 'id' | 'hasVotedElectionIds'>) => void;
  onUpdate: (id: string, voter: Partial<Voter>) => void;
  onDelete: (id: string) => void;
}

export default function VotersPanel({ voters, elections, onCreate, onUpdate, onDelete }: VotersPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idNum, setIdNum] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !idNum || !phone) return;

    onCreate({
      name,
      email: email.toLowerCase(),
      identificationNumber: idNum,
      phone,
      validationStatus: 'validated' // Directly validate custom created ones for seamless demo testing
    });

    // Reset Form
    setName('');
    setEmail('');
    setIdNum('');
    setPhone('');
    setShowAddForm(false);
  };

  const setStatus = (voterId: string, status: Voter['validationStatus']) => {
    onUpdate(voterId, { validationStatus: status });
  };

  // Filter list by search query
  const filteredVoters = voters.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.identificationNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top action and filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-850 rounded-xl shadow-sm gap-4">
        <div>
          <h3 className="font-display text-base font-bold">Validação e Inscrição de Eleitores</h3>
          <p className="text-xs text-slate-400">Verifique identidades (CPF/RG) e aprove credenciais para votação única.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por e-mail ou documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-2 top-2 px-3 pl-9 rounded-lg outline-none focus:border-violet-500"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transitionwhitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Inscrever Eleitor
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
          <h4 className="font-display font-bold text-sm">Inscrever Novo Eleitor Credenciado</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Nome Completo</label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Eduardo de Lima"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Endereço de E-mail</label>
              <input
                type="email"
                required
                placeholder="Ex: carlos@eleitor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Código Único / Registro Eleitor (CPF/RG)</label>
              <input
                type="text"
                required
                placeholder="Somente números (ex: 22233344455)"
                value={idNum}
                onChange={(e) => setIdNum(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono mb-1.5">Telefone para 2FA (Mobile)</label>
              <input
                type="text"
                required
                placeholder="Ex: +55 11 98888-7777"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs border border-slate-200 dark:border-slate-800 py-2.5 px-3 rounded-lg outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 font-semibold text-xs transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition"
            >
              Salvar Matrícula (Validada)
            </button>
          </div>
        </form>
      )}

      {/* Voters List table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">Nome / E-mail</th>
                <th className="py-3 px-4 text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">Documento / CPF</th>
                <th className="py-3 px-4 text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">Contato (SMS)</th>
                <th className="py-3 px-4 text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">Status Auditor</th>
                <th className="py-3 px-4 text-xs font-bold font-mono tracking-wider text-slate-400 text-right uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">Nenhum eleitor localizado.</td>
                </tr>
              ) : (
                filteredVoters.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-500/5 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold block text-slate-800 dark:text-slate-200">{v.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono select-all">{v.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono select-all text-slate-600 dark:text-slate-350">{v.identificationNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{v.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        v.validationStatus === 'validated'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : v.validationStatus === 'pending'
                          ? 'bg-amber-500/10 text-amber-500 animate-pulse'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        <Shield className="w-3 h-3" />
                        {v.validationStatus === 'validated' ? 'Validado (Voto Ativo)' : v.validationStatus === 'pending' ? 'Pendente' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {v.validationStatus !== 'validated' && (
                        <button
                          onClick={() => setStatus(v.id, 'validated')}
                          className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/30 transition-colors"
                          title="Aprovar de Imediato"
                        >
                          Aprovar
                        </button>
                      )}
                      {v.validationStatus !== 'pending' && (
                        <button
                          onClick={() => setStatus(v.id, 'pending')}
                          className="p-1 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-text-amber-500 text-amber-500 rounded border border-amber-500/30 transition-colors"
                          title="Colocar em Análise"
                        >
                          Bloquear
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(v.id)}
                        className="p-1 px-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Remover Cadastro"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
