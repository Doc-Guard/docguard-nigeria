
export enum LoanStatus {
  DRAFT = 'Drafting',
  NEGOTIATION = 'Negotiation',
  EXECUTION = 'Execution',
  PERFECTION = 'Perfection',
  COMPLETED = 'Completed'
}

export interface Loan {
  id: string;
  borrowerName: string;
  amount: number;
  currency: string;
  status: LoanStatus;
  cacRegistrationStatus: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  deadline: string;
  type: 'Secured' | 'Unsecured';
}

export interface KYCRecord {
  entity: string;
  type: 'CAC' | 'FIRS' | 'NIBSS' | 'Credit Bureau';
  status: 'Verified' | 'Pending' | 'Flagged';
  lastChecked: string;
  details: string;
}

export interface RPAActivity {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}
