/**
 * Shared Type Definitions for VoteSmart AI
 */

export type UserRole = 'admin' | 'voter' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  identificationNumber?: string;
  phone?: string;
  validationStatus?: 'pending' | 'validated' | 'rejected';
  twoFactorSecret?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'closed';
  type: 'residential' | 'corporate' | 'academic' | 'association';
  maxVotes: number;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  photo: string;
  party: string;
  bio: string;
  proposals: string[];
}

export interface Voter {
  id: string;
  name: string;
  email: string;
  identificationNumber: string;
  phone: string;
  validationStatus: 'pending' | 'validated' | 'rejected';
  hasVotedElectionIds: string[]; // election IDs where voter has already voted
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  timestamp: string;
  voterHash: string; // obfuscated election ID + voter ID hash
  ipAddress: string;
  signature: string; // SHA256-like integrity hash of this vote combined with previous vote's hash
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userRole: string;
  userName: string;
  details: string;
  ipAddress: string;
  hash: string;
  previousHash: string;
}

export interface TurnoutPrediction {
  hour: string;
  expectedTurnout: number;
  actualTurnout?: number;
  confidenceInterval: [number, number];
}

export interface VoteGuardianReport {
  timestamp: string;
  summary: string;
  metrics: {
    totalExpectedVoters: number;
    currentTurnoutRate: number;
    estimatedFinalTurnout: number;
    anomaliesCount: number;
  };
  anomalies: Array<{
    type: 'speed_burst' | 'ip_reuse' | 'off_hours' | 'unvalidated_voter' | 'integrity_breach';
    severity: 'low' | 'medium' | 'high';
    description: string;
    details: string;
    timestamp: string;
  }>;
  predictions: {
    peakHours: string[];
    turnoutForecastPercentage: number;
    recommendations: string[];
  };
}
