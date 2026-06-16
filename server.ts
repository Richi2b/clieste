import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dbService from './src/server/db';
import { generateAIAnalysisReport, askVoteGuardianAI } from './src/server/ai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares to parse JSON and static payloads securely
  app.use(express.json());

  // ==========================================
  // 1. AUTHENTICATION & PROFILE CONFIGURATION
  // ==========================================
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, role } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'O endereço de e-mail é obrigatório.' });
      }

      // Find if email exists
      let user = dbService.findUserByEmail(email);
      
      if (!user) {
        // Automatically register to ensure high friction-less demo usability
        const defaultName = email.split('@')[0];
        const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        user = dbService.addUser({
          id: `usr_${Math.random().toString(36).slice(2, 10)}`,
          name: formattedName,
          email: email.toLowerCase(),
          role: role || 'voter',
          identificationNumber: role === 'voter' ? Math.floor(10000000000 + Math.random() * 900000000).toString() : undefined,
          phone: role === 'voter' ? `+55 11 9${Math.floor(10000000 + Math.random() * 90000000)}` : undefined,
          validationStatus: role === 'voter' ? 'pending' : 'validated'
        });

        // Also add to voter register if they are a voter role
        if (role === 'voter') {
          dbService.createVoter({
            name: formattedName,
            email: email.toLowerCase(),
            identificationNumber: user.identificationNumber || '00000000000',
            phone: user.phone || '+55 11 90000-0000',
            validationStatus: 'pending'
          });
        }
      }

      // Check if user role matches the request or adjust to help developers inspect roles easily
      if (role && user.role !== role) {
        user.role = role;
        dbService.save();
      }

      // Record audit logging
      dbService.addAudit(user.id, user.role, user.name, `Acesso de usuário ao sistema (Login: ${user.email})`, req.ip || '127.0.0.1');

      res.json({
        success: true,
        user,
        token: `vts_${Math.random().toString(36).slice(2, 20)}` // Simulated secure JWT Token
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Erro no login' });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, role, identificationNumber, phone } = req.body;
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Nome, E-mail e Perfil são obrigatórios.' });
      }

      const existing = dbService.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'Este e-mail já encontra-se matriculado no sistema.' });
      }

      const user = dbService.addUser({
        id: `usr_${Math.random().toString(36).slice(2, 10)}`,
        name,
        email: email.toLowerCase(),
        role,
        identificationNumber,
        phone,
        validationStatus: role === 'voter' ? 'pending' : 'validated'
      });

      if (role === 'voter') {
        dbService.createVoter({
          name,
          email: email.toLowerCase(),
          identificationNumber: identificationNumber || '00000000000',
          phone: phone || '+55 11 90000-0000',
          validationStatus: 'pending'
        });
      }

      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro no cadastro' });
    }
  });

  app.put('/api/auth/update-2fa', (req, res) => {
    const { userId, enable } = req.body;
    const users = dbService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.twoFactorSecret = enable ? 'VOTESMART-SECRET-HOTP-2FA' : undefined;
      dbService.save();
      dbService.addAudit(user.id, user.role, user.name, `${enable ? 'Habilitação' : 'Desativação'} de segurança 2FA no perfil`, req.ip || '127.0.0.1');
      return res.json({ success: true, user });
    }
    res.status(404).json({ error: 'Usuário não localizado' });
  });

  // ==========================================
  // 2. ELECTIONS CRUD
  // ==========================================
  app.get('/api/elections', (req, res) => {
    res.json(dbService.getElections());
  });

  app.post('/api/elections', (req, res) => {
    try {
      const election = dbService.createElection(req.body);
      res.status(201).json(election);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/elections/:id', (req, res) => {
    const updated = dbService.updateElection(req.params.id, req.body);
    if (updated) return res.json(updated);
    res.status(404).json({ error: 'Eleição não encontrada.' });
  });

  app.delete('/api/elections/:id', (req, res) => {
    const success = dbService.deleteElection(req.params.id);
    if (success) return res.json({ success: true });
    res.status(444).json({ error: 'Falha ao remover a eleição.' });
  });

  // ==========================================
  // 3. CANDIDATES CRUD
  // ==========================================
  app.get('/api/candidates', (req, res) => {
    res.json(dbService.getCandidates());
  });

  app.post('/api/candidates', (req, res) => {
    try {
      const candidate = dbService.createCandidate(req.body);
      res.status(201).json(candidate);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/candidates/:id', (req, res) => {
    const updated = dbService.updateCandidate(req.params.id, req.body);
    if (updated) return res.json(updated);
    res.status(404).json({ error: 'Candidato não localizado.' });
  });

  app.delete('/api/candidates/:id', (req, res) => {
    const success = dbService.deleteCandidate(req.params.id);
    if (success) return res.json({ success: true });
    res.status(404).json({ error: 'Falha ao excluir candidato.' });
  });

  // ==========================================
  // 4. VOTERS CRUD
  // ==========================================
  app.get('/api/voters', (req, res) => {
    res.json(dbService.getVoters());
  });

  app.post('/api/voters', (req, res) => {
    try {
      const voter = dbService.createVoter(req.body);
      res.status(201).json(voter);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/voters/:id', (req, res) => {
    const voterId = req.params.id;
    const previous = dbService.getVoters().find(v => v.id === voterId);
    const updated = dbService.updateVoter(voterId, req.body);
    if (updated) {
      // If validation status updated, mirror this in user list if user profile exists
      const emailObj = updated.email;
      const connectedUser = dbService.getUsers().find(u => u.email === emailObj);
      if (connectedUser) {
        connectedUser.validationStatus = updated.validationStatus;
        dbService.save();
      }

      if (previous?.validationStatus !== updated.validationStatus) {
        dbService.addAudit(
          'usr_admin',
          'admin',
          'Administradora Aline',
          `Alteração do status cadastral de "${updated.name}" para [${updated.validationStatus.toUpperCase()}]`,
          req.ip || '127.0.0.1'
        );
      }
      return res.json(updated);
    }
    res.status(404).json({ error: 'Eleitor não cadastrado.' });
  });

  app.delete('/api/voters/:id', (req, res) => {
    const success = dbService.deleteVoter(req.params.id);
    if (success) return res.json({ success: true });
    res.status(404).json({ error: 'Falha ao remover o eleitor.' });
  });

  // ==========================================
  // 5. VOTES & TELEMETRY
  // ==========================================
  app.get('/api/votes', (req, res) => {
    res.json(dbService.getVotes());
  });

  app.post('/api/votes/cast', (req, res) => {
    try {
      const { electionId, candidateId, userId } = req.body;
      if (!electionId || !candidateId || !userId) {
        return res.status(400).json({ error: 'Parâmetros insuficientes: Eleição, Candidato e ID de Usuário são requeridos.' });
      }

      // Convert login user ID to voter ID if mismatch
      const users = dbService.getUsers();
      const connectedUser = users.find(u => u.id === userId);
      
      let voterId = userId;
      // Search by email match
      if (connectedUser) {
        const voterInfo = dbService.getVoters().find(v => v.email.toLowerCase() === connectedUser.email.toLowerCase());
        if (voterInfo) {
          voterId = voterInfo.id;
        }
      }

      const voteReceipt = dbService.castVote(electionId, candidateId, voterId, req.ip || '189.24.45.101');
      res.status(200).json(voteReceipt);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Erro ao depositar o voto.' });
    }
  });

  // ==========================================
  // 6. CRYPTOGRAPHIC AUDIT & LEDGER INTEGRITY
  // ==========================================
  app.get('/api/audit/logs', (req, res) => {
    res.json(dbService.getAuditLogs());
  });

  app.get('/api/audit/integrity', (req, res) => {
    try {
      const integrityCheck = dbService.verifyIntegrityChain();
      res.json(integrityCheck);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Falha ao rodar auditoria.' });
    }
  });

  // Reset/Clear Simulation Data
  app.post('/api/audit/heal', (req, res) => {
    try {
      const votes = dbService.getVotes();
      const initialCount = votes.length;
      // Remove votes with anomalous ids
      dbService.getVotes().splice(0, votes.length);
      // Clean voter voting record as well
      for (const voter of dbService.getVoters()) {
        voter.hasVotedElectionIds = [];
      }
      dbService.addAudit('usr_admin', 'admin', 'Administradora Aline', 'Conserto Integral de Integridades e Urnas redefinidas com sucesso.', req.ip || '127.0.0.1');
      dbService.save();
      res.json({ success: true, message: `Redefinição concluída. ${initialCount} registros arquivados com sucesso.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao restaurar ledger' });
    }
  });

  // ==========================================
  // 7. GEMINI AI: VoteGuardian ANALYTICS & CHAT
  // ==========================================
  app.get('/api/ai/report', async (req, res) => {
    try {
      const report = await generateAIAnalysisReport();
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Falha ao processar relatório AI.' });
    }
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { userQuestion, chatHistory } = req.body;
      if (!userQuestion) {
        return res.status(400).json({ error: 'A pergunta não pode estar vazia.' });
      }

      const answer = await askVoteGuardianAI(chatHistory || [], userQuestion);
      res.json({ answer });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro no chat inteligente.' });
    }
  });

  // ==========================================
  // 8. VITE / STATIC FILE SERVER CONFIG
  // ==========================================
  // If we are in development, integrate active Vite bundle server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve absolute path of dist folder
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VOTESMART BACKEND REST] Servidor online executando na porta ${PORT}`);
  });
}

startServer().catch((e) => {
  console.error('Falha crítica ao inicializar o servidor VoteSmart AI:', e);
});
