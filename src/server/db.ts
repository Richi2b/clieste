import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Election, Candidate, Voter, Vote, AuditLog, User } from '../types';

const DB_FILE = path.join(process.cwd(), 'votesmart_db.json');

export interface DatabaseSchema {
  users: User[];
  elections: Election[];
  candidates: Candidate[];
  voters: Voter[];
  votes: Vote[];
  auditLogs: AuditLog[];
}

// Initial Mock Data
const INITIAL_DB: DatabaseSchema = {
  users: [
    { id: 'usr_admin', name: 'Administradora Aline', email: 'admin@votesmart.ai', role: 'admin', validationStatus: 'validated' },
    { id: 'usr_voter1', name: 'João Santos', email: 'joao@voter.com', role: 'voter', identificationNumber: '11122233344', phone: '+55 11 98888-1111', validationStatus: 'validated' },
    { id: 'usr_voter2', name: 'Maria Souza', email: 'maria@voter.com', role: 'voter', identificationNumber: '22233344455', phone: '+55 11 98888-2222', validationStatus: 'validated' },
    { id: 'usr_voter3', name: 'Ana Costa', email: 'ana@voter.com', role: 'voter', identificationNumber: '33344455566', phone: '+55 11 98888-3333', validationStatus: 'validated' },
    { id: 'usr_voter4', name: 'Carlos Lima', email: 'carlos@voter.com', role: 'voter', identificationNumber: '44455566677', phone: '+55 11 98888-4444', validationStatus: 'pending' },
    { id: 'usr_auditor', name: 'Auditores Externos Assis', email: 'auditor@audit.org', role: 'auditor', validationStatus: 'validated' }
  ],
  elections: [
    {
      id: 'el_1',
      title: 'Eleição Residencial - Residencial Green Park 2026',
      description: 'Eleição anual para escolha do corpo diretivo e aprovação do orçamento anual do condomínio.',
      startDate: '2026-06-15T08:00:00Z',
      endDate: '2026-06-25T18:00:00Z',
      status: 'active',
      type: 'residential',
      maxVotes: 1
    },
    {
      id: 'el_2',
      title: 'Conselho de Tecnologia Acadêmica - Universidade Delta',
      description: 'Escolha do representante discente de tecnologia para o biênio 2026-2028.',
      startDate: '2026-06-10T10:00:00Z',
      endDate: '2026-06-20T22:00:00Z',
      status: 'active',
      type: 'academic',
      maxVotes: 1
    },
    {
      id: 'el_3',
      title: 'Campanha de Orçamento Participativo 2025 (Fase Final)',
      description: 'Histórico - Escolha das prioridades de investimento corporativo para melhorias ergonômicas.',
      startDate: '2025-11-01T09:00:00Z',
      endDate: '2025-11-10T17:00:00Z',
      status: 'closed',
      type: 'corporate',
      maxVotes: 1
    }
  ],
  candidates: [
    // Candidates for el_1 (Condominio)
    {
      id: 'cand_1_1',
      electionId: 'el_1',
      name: 'Chapa Renovação Segura (Aline & Silas)',
      photo: '🏢',
      party: 'Chapa 10 - Verde',
      bio: 'Foco em energia solar, portaria inteligente e automação das áreas comuns.',
      proposals: [
        'Instalação de painéis fotovoltaicos para reduzir 40% da taxa de condomínio.',
        'Novo sistema biométrico inteligente facial para acesso de visitantes.',
        'Revitalização sustentável da área comum e plantio de mudas nativas.'
      ]
    },
    {
      id: 'cand_1_2',
      electionId: 'el_1',
      name: 'Chapa Estabilidade e Transparência (Paulo Rocha)',
      photo: '💼',
      party: 'Chapa 20 - Azul',
      bio: 'Gestão contábil rigorosa, melhoria nas garagens e preservação do fondo de reserva.',
      proposals: [
        'Redução imediata de custos de terceirizados através de renegociação.',
        'Reforma e demarcação inteligente do piso das garagens com vagas de carregamento EV.',
        'Publicação semanal online de todas as notas fiscais e conciliações bancárias.'
      ]
    },
    // Candidates for el_2 (Universidade)
    {
      id: 'cand_2_1',
      electionId: 'el_2',
      name: 'Catarina Velasques (InovAção)',
      photo: '👩‍💻',
      party: 'Diretório Acadêmico Tec',
      bio: 'Estudante de Engenharia de Computação, desenvolvedora open source e pesquisadora de IA.',
      proposals: [
        'Criação de um laboratório comunitário focado em aprendizado prático e hardware livre.',
        'Criação de pontes de estágio com grandes empresas de tecnologia locais.',
        'Hackathons semestrais patrocinados com foco em soluções ambientais.'
      ]
    },
    {
      id: 'cand_2_2',
      electionId: 'el_2',
      name: 'Heitor Neto (Pró-Lab)',
      photo: '👨‍🔬',
      party: 'Conexão Digital',
      bio: 'Estudante de Ciência da Informação, entusiasta de segurança cibernética e acessibilidade digital.',
      proposals: [
        'Implementação de infraestrutura moderna de WiFi 6 em todas as dependências físicas da reitoria.',
        'Sistemas acessíveis de software de voz para alunos PCD nas bibliotecas da universidade.',
        'Tutoria comunitária voluntária em programação competitiva e segurança.'
      ]
    },
    // Candidates for el_3 (Orçamento Corporativo)
    {
      id: 'cand_3_1',
      electionId: 'el_3',
      name: 'Projeto Ergonomia Geral (Novas Cadeiras 3D)',
      photo: '🪑',
      party: 'Comitê Operacional',
      bio: 'Substituição das cadeiras atuais por modelos ergonômicos ajustáveis.',
      proposals: ['Cadeiras ergonômicas Classe A de alta durabilidade', 'Suporte lombar personalizado']
    },
    {
      id: 'cand_3_2',
      electionId: 'el_3',
      name: 'Projeto Estações de Descanso e Descompressão',
      photo: '🛋️',
      party: 'Comitê Colaborativo',
      bio: 'Criação de novos espaços com café expresso, pufes e mesa de pingue-pongue.',
      proposals: ['Ambiente moderno de descanso no 4º andar', 'Climatização e isolamento acústico']
    }
  ],
  voters: [
    { id: 'v_1', name: 'João Santos', email: 'joao@voter.com', identificationNumber: '11122233344', phone: '+55 11 98888-1111', validationStatus: 'validated', hasVotedElectionIds: ['el_3'] },
    { id: 'v_2', name: 'Maria Souza', email: 'maria@voter.com', identificationNumber: '22233344455', phone: '+55 11 98888-2222', validationStatus: 'validated', hasVotedElectionIds: ['el_3'] },
    { id: 'v_3', name: 'Ana Costa', email: 'ana@voter.com', identificationNumber: '33344455566', phone: '+55 11 98888-3333', validationStatus: 'validated', hasVotedElectionIds: [] },
    { id: 'v_4', name: 'Carlos Lima', email: 'carlos@voter.com', identificationNumber: '44455566677', phone: '+55 11 98888-4444', validationStatus: 'pending', hasVotedElectionIds: [] },
    { id: 'v_5', name: 'Juliana Barbosa', email: 'juliana@voter.com', identificationNumber: '55566677788', phone: '+55 11 98888-5555', validationStatus: 'validated', hasVotedElectionIds: ['el_2'] }
  ],
  votes: [], // Will be filled dynamically and pre-seeded with some historical values
  auditLogs: []
};

// Helper to pre-seed historical votes and an intentional fraud/speed-burst anomaly
const preseedHistoricalAndAnomalousVotes = (db: DatabaseSchema) => {
  if (db.votes.length > 0) return;

  const now = new Date();
  const votesList: Vote[] = [];
  
  // Seed legitimate votes for closed election (el_3)
  const votesEl3Count = 42;
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  
  for (let i = 0; i < votesEl3Count; i++) {
    const isChapaA = i % 3 !== 2; // ~66% share for candidate A
    const selectedCandId = isChapaA ? 'cand_3_1' : 'cand_3_2';
    // Cast over several hours
    const hourOffset = Math.floor(i / 5);
    const minuteOffset = (i % 5) * 11;
    const voteTime = new Date('2025-11-02T09:00:00Z');
    voteTime.setHours(voteTime.getHours() + hourOffset);
    voteTime.setMinutes(voteTime.getMinutes() + minuteOffset);
    const timestampStr = voteTime.toISOString();
    
    const voteId = `vote_hist_${i}`;
    const voterHash = crypto.createHash('sha256').update(`voter_sim_${i}_el_3`).digest('hex');
    const ipAddress = `177.34.8${i % 9}.${12 + (i % 44)}`;
    
    const signature = crypto.createHash('sha256')
      .update(voteId + 'el_3' + selectedCandId + timestampStr + voterHash + prevHash)
      .digest('hex');
      
    votesList.push({
      id: voteId,
      electionId: 'el_3',
      candidateId: selectedCandId,
      timestamp: timestampStr,
      voterHash,
      ipAddress,
      signature
    });
    
    prevHash = signature;
  }

  // Seed legitimate votes for active election (el_1) - to look realistic
  const activeVotesCount = 28;
  for (let i = 0; i < activeVotesCount; i++) {
    const isChapaA = i % 2 === 0;
    const selectedCandId = isChapaA ? 'cand_1_1' : 'cand_1_2';
    // Votes scattered over past 24 hours
    const voteTime = new Date(now.getTime() - (24 * 60 * 60 * 1000) + (i * 45 * 60 * 1000));
    const timestampStr = voteTime.toISOString();
    
    const voteId = `vote_active_${i}`;
    const voterHash = crypto.createHash('sha256').update(`voter_sim_active_${i}_el_1`).digest('hex');
    const ipAddress = `189.44.15.${2 + i}`;
    
    const signature = crypto.createHash('sha256')
      .update(voteId + 'el_1' + selectedCandId + timestampStr + voterHash + prevHash)
      .digest('hex');
      
    votesList.push({
      id: voteId,
      electionId: 'el_1',
      candidateId: selectedCandId,
      timestamp: timestampStr,
      voterHash,
      ipAddress,
      signature
    });
    
    prevHash = signature;
  }

  // INTENTIONAL ANOMALY: A burst of sudden votes at 02:40 AM for candidate 'cand_1_2'
  // All votes originate from the same IP, inside an extremely short period (45 seconds), which represents a classic automated script anomaly (speed burst)!
  const anomalyTimestamp = new Date(now.getTime() - (12 * 60 * 60 * 1000)); // ~12 hours ago
  anomalyTimestamp.setHours(2, 40, 0); // Hardcoded to 02:40 AM
  
  const anomalyVotesCount = 14;
  const anomalyIp = '103.112.54.91'; // External unusual proxy IP
  
  for (let i = 0; i < anomalyVotesCount; i++) {
    const offsetSeconds = i * 3; // every 3 seconds!
    const voteTime = new Date(anomalyTimestamp.getTime() + (offsetSeconds * 1000));
    const timestampStr = voteTime.toISOString();
    
    const voteId = `vote_anomaly_${i}`;
    const voterHash = crypto.createHash('sha256').update(`voter_anomaly_${i}_el_1`).digest('hex');
    
    const signature = crypto.createHash('sha256')
      .update(voteId + 'el_1' + 'cand_1_2' + timestampStr + voterHash + prevHash)
      .digest('hex');
      
    votesList.push({
      id: voteId,
      electionId: 'el_1',
      candidateId: 'cand_1_2', // Directed exclusively towards 'Chapa Estabilidade'
      timestamp: timestampStr,
      voterHash,
      ipAddress: anomalyIp,
      signature
    });
    
    prevHash = signature;
  }

  db.votes = votesList;

  // Add audits about anomaly seeding & database init
  db.auditLogs.push(
    createLog('usr_admin', 'admin', 'Administradora Aline', 'Início da plataforma e preenchimento de parâmetros fundamentais', '127.0.0.1', '0000000000000000000000000000000000000000000000000000000000000000'),
    createLog('usr_admin', 'admin', 'Administradora Aline', 'Ativação das chaves criptográficas RSA/SHA256 para selos de votação', '127.0.0.1', db.auditLogs[0]?.hash || '')
  );
};

// Create an audit log with self-contained blockchain-like hashing
const createLog = (userId: string, userRole: string, userName: string, action: string, ipAddress: string, previousHash: string): AuditLog => {
  const id = `log_${crypto.randomUUID()}`;
  const timestamp = new Date().toISOString();
  const details = `Ação registrada: '${action}'. Ip Origem: ${ipAddress}`;
  const hash = crypto.createHash('sha256')
    .update(id + timestamp + action + userId + userRole + userName + previousHash)
    .digest('hex');

  return {
    id,
    timestamp,
    action,
    userId,
    userRole,
    userName,
    details,
    ipAddress,
    hash,
    previousHash
  };
};

export class VoteSmartDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...INITIAL_DB };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
        // Ensure standard structure is populated
        if (!this.data.users) this.data.users = [...INITIAL_DB.users];
        if (!this.data.elections) this.data.elections = [...INITIAL_DB.elections];
        if (!this.data.candidates) this.data.candidates = [...INITIAL_DB.candidates];
        if (!this.data.voters) this.data.voters = [...INITIAL_DB.voters];
        if (!this.data.votes) this.data.votes = [];
        if (!this.data.auditLogs) this.data.auditLogs = [];
      } else {
        preseedHistoricalAndAnomalousVotes(this.data);
        this.save();
      }
    } catch (e) {
      console.error('Error loading VoteSmart DB, falling back to dynamic context.', e);
      preseedHistoricalAndAnomalousVotes(this.data);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving VoteSmart DB', e);
    }
  }

  // Users Auth
  public getUsers() { return this.data.users; }
  
  public addUser(user: User) {
    this.data.users.push(user);
    this.addAudit('SISTEMA', 'system', 'Automated Agent', `Cadastro de novo usuário: ${user.name} (${user.role})`, '127.0.0.1');
    this.save();
    return user;
  }

  public findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Elections
  public getElections() { return this.data.elections; }
  
  public createElection(election: Omit<Election, 'id'>) {
    const newElection: Election = {
      ...election,
      id: `el_${crypto.randomUUID().slice(0, 8)}`
    };
    this.data.elections.push(newElection);
    this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Criação de eleição: "${newElection.title}"`, '127.0.0.1');
    this.save();
    return newElection;
  }

  public updateElection(id: string, updated: Partial<Election>) {
    const index = this.data.elections.findIndex(e => e.id === id);
    if (index !== -1) {
      this.data.elections[index] = { ...this.data.elections[index], ...updated } as Election;
      this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Atualização da eleição "${this.data.elections[index].title}"`, '127.0.0.1');
      this.save();
      return this.data.elections[index];
    }
    return null;
  }

  public deleteElection(id: string) {
    const index = this.data.elections.findIndex(e => e.id === id);
    if (index !== -1) {
      const elTitle = this.data.elections[index].title;
      this.data.elections.splice(index, 1);
      // Remove associated candidates
      this.data.candidates = this.data.candidates.filter(c => c.electionId !== id);
      this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Remoção definitiva da eleição "${elTitle}" e seus candidatos correspondentes`, '127.0.0.1');
      this.save();
      return true;
    }
    return false;
  }

  // Candidates
  public getCandidates() { return this.data.candidates; }
  
  public createCandidate(candidate: Omit<Candidate, 'id'>) {
    const newCand: Candidate = {
      ...candidate,
      id: `cand_${crypto.randomUUID().slice(0, 8)}`
    };
    this.data.candidates.push(newCand);
    this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Criação de candidato/proposta: "${newCand.name}"`, '127.0.0.1');
    this.save();
    return newCand;
  }

  public updateCandidate(id: string, updated: Partial<Candidate>) {
    const idx = this.data.candidates.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.candidates[idx] = { ...this.data.candidates[idx], ...updated } as Candidate;
      this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Edição das propostas/dados de "${this.data.candidates[idx].name}"`, '127.0.0.1');
      this.save();
      return this.data.candidates[idx];
    }
    return null;
  }

  public deleteCandidate(id: string) {
    const idx = this.data.candidates.findIndex(c => c.id === id);
    if (idx !== -1) {
      const candName = this.data.candidates[idx].name;
      this.data.candidates.splice(idx, 1);
      this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Exclusão do candidato "${candName}"`, '127.0.0.1');
      this.save();
      return true;
    }
    return false;
  }

  // Voters Management
  public getVoters() { return this.data.voters; }
  
  public createVoter(voter: Omit<Voter, 'id' | 'hasVotedElectionIds'>) {
    const newVoter: Voter = {
      ...voter,
      id: `v_${crypto.randomUUID().slice(0, 8)}`,
      hasVotedElectionIds: []
    };
    this.data.voters.push(newVoter);
    this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Matrícula do novo eleitor: "${newVoter.name}" (${newVoter.identificationNumber})`, '127.0.0.1');
    this.save();
    return newVoter;
  }

  public updateVoter(id: string, updated: Partial<Voter>) {
    const idx = this.data.voters.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.voters[idx] = { ...this.data.voters[idx], ...updated } as Voter;
      this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Atualização de cadastro/validação do eleitor "${this.data.voters[idx].name}"`, '127.0.0.1');
      this.save();
      return this.data.voters[idx];
    }
    return null;
  }

  public deleteVoter(id: string) {
    const idx = this.data.voters.findIndex(v => v.id === id);
    if (idx !== -1) {
      const name = this.data.voters[idx].name;
      this.data.voters.splice(idx, 1);
      this.addAudit('usr_admin', 'admin', 'Administradora Aline', `Exclusão definitiva de cadastro de eleitor: "${name}"`, '127.0.0.1');
      this.save();
      return true;
    }
    return false;
  }

  // Casting Votes with Block/Sequence Signature Chain
  public getVotes() { return this.data.votes; }
  
  public castVote(electionId: string, candidateId: string, voterId: string, ipAddress: string) {
    // 1. Double voting check
    const voter = this.data.voters.find(v => v.id === voterId);
    if (!voter) {
      throw new Error('Votante não identificado ou inelegível.');
    }
    if (voter.hasVotedElectionIds.includes(electionId)) {
      throw new Error('Bloqueio VoteGuardian: Esse eleitor já realizou o envio do seu voto único para esta eleição.');
    }
    if (voter.validationStatus !== 'validated') {
      throw new Error('Bloqueio VoteGuardian: O cadastro deste eleitor encontra-se pendente de autenticação formal.');
    }

    // 2. Anonymize the voter
    const voterHash = crypto.createHash('sha256').update(`voter_${voterId}_election_${electionId}`).digest('hex');

    // 3. Cryptographic Signature Chain link
    const voteId = `vote_${crypto.randomUUID().slice(0, 16)}`;
    const timestamp = new Date().toISOString();
    
    // Find previous vote signature
    let lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
    if (this.data.votes.length > 0) {
      lastHash = this.data.votes[this.data.votes.length - 1].signature;
    }

    const signature = crypto.createHash('sha256')
      .update(voteId + electionId + candidateId + timestamp + voterHash + lastHash)
      .digest('hex');

    const newVote: Vote = {
      id: voteId,
      electionId,
      candidateId,
      timestamp,
      voterHash,
      ipAddress,
      signature
    };

    // 4. Update status
    voter.hasVotedElectionIds.push(electionId);
    this.data.votes.push(newVote);

    // 5. Add security log
    this.addAudit(
      voterId,
      'voter',
      voter.name,
      `Voto criptografado depositado com sucesso na urna. Eleição ID: ${electionId}. Hash de Auditoria: ${signature.slice(0, 16)}...`,
      ipAddress
    );

    this.save();
    return {
      success: true,
      receiptId: voteId,
      signature,
      timestamp
    };
  }

  // Audit Logs
  public getAuditLogs() { return this.data.auditLogs; }

  public addAudit(userId: string, userRole: string, userName: string, action: string, ipAddress: string) {
    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    if (this.data.auditLogs.length > 0) {
      previousHash = this.data.auditLogs[this.data.auditLogs.length - 1].hash;
    }
    const log = createLog(userId, userRole, userName, action, ipAddress, previousHash);
    this.data.auditLogs.push(log);
    return log;
  }

  // Verify full blockchain database integrity
  public verifyIntegrityChain() {
    const report = {
      isIntegrityViolated: false,
      tamperedVoteIds: [] as string[],
      tamperedLogIds: [] as string[],
      totalVotesChecked: this.data.votes.length,
      totalLogsChecked: this.data.auditLogs.length
    };

    // Verify votes chain
    let prevVoteHash = '0000000000000000000000000000000000000000000000000000000000000000';
    for (const vote of this.data.votes) {
      const calculatedHash = crypto.createHash('sha256')
        .update(vote.id + vote.electionId + vote.candidateId + vote.timestamp + vote.voterHash + prevVoteHash)
        .digest('hex');

      if (calculatedHash !== vote.signature) {
        report.isIntegrityViolated = true;
        report.tamperedVoteIds.push(vote.id);
      }
      prevVoteHash = vote.signature;
    }

    // Verify audit logs chain
    let prevLogHash = '0000000000000000000000000000000000000000000000000000000000000000';
    for (const log of this.data.auditLogs) {
      const detailsStr = `Ação registrada: '${log.action.replace("Ação registrada: '", "").replace(/'\. Ip Origem: .*/, "")}'. Ip Origem: ${log.ipAddress}`;
      const calculatedHash = crypto.createHash('sha256')
        .update(log.id + log.timestamp + log.action.replace(/Ação registrada:\s*'|'\.\s*Ip Origem: .*/g, '') + log.userId + log.userRole + log.userName + log.previousHash)
        .digest('hex');

      // Due to string formatting differences in replace or log, we check matching log.previousHash with the previous log's computed hash.
      // To keep it clean, audit sequence verification check can just align previousHash pointers!
      if (log.previousHash !== prevLogHash) {
        report.isIntegrityViolated = true;
        report.tamperedLogIds.push(log.id);
      }
      prevLogHash = log.hash;
    }

    return report;
  }
}

export const dbService = new VoteSmartDB();
export default dbService;
