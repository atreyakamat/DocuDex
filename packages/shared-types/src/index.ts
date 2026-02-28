// ─────────────────────────────────────────────
// User types
// ─────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone?: string;
  fullName: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─────────────────────────────────────────────
// Document types
// ─────────────────────────────────────────────
export type DocumentCategory =
  | 'IDENTITY'
  | 'FINANCIAL'
  | 'EDUCATIONAL'
  | 'PROPERTY'
  | 'BUSINESS'
  | 'UTILITY'
  | 'OTHER';

export type DocumentType =
  | 'PAN_CARD'
  | 'AADHAAR_CARD'
  | 'PASSPORT'
  | 'DRIVING_LICENSE'
  | 'VOTER_ID'
  | 'BANK_STATEMENT'
  | 'SALARY_SLIP'
  | 'ITR'
  | 'GST_RETURN'
  | 'DEGREE_CERTIFICATE'
  | 'MARK_SHEET'
  | 'SALE_DEED'
  | 'PROPERTY_TAX_RECEIPT'
  | 'INCORPORATION_CERTIFICATE'
  | 'GST_REGISTRATION'
  | 'ELECTRICITY_BILL'
  | 'WATER_BILL'
  | 'OTHER';

export type DocumentStatus = 'PROCESSING' | 'CURRENT' | 'EXPIRING_SOON' | 'EXPIRED';

export interface DocumentMetadata {
  documentType?: DocumentType;
  category?: DocumentCategory;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  documentNumber?: string;
  holderName?: string;
  tags?: string[];
  extractedFields?: Record<string, string>;
  classificationConfidence?: number;
  summary?: string;
}

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  status: DocumentStatus;
  metadata: DocumentMetadata;
  folderId?: string;
  isStarred: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadResponse {
  document: Document;
  processingJobId: string;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
}

export interface DocumentSearchQuery {
  query?: string;
  category?: DocumentCategory;
  documentType?: DocumentType;
  status?: DocumentStatus;
  fromDate?: string;
  toDate?: string;
  folderId?: string;
  isStarred?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────
// Workflow types
// ─────────────────────────────────────────────
export type WorkflowStatus = 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'FAILED';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredDocuments: DocumentType[];
  optionalDocuments?: DocumentType[];
  estimatedTime: string;
}

export interface WorkflowInstance {
  id: string;
  userId: string;
  templateId: string;
  templateName: string;
  status: WorkflowStatus;
  currentStep: number;
  totalSteps: number;
  referenceNumber?: string;
  submittedAt?: string;
  completedAt?: string;
  documents: string[]; // document IDs
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Notification types
// ─────────────────────────────────────────────
export type NotificationType =
  | 'DOCUMENT_EXPIRING'
  | 'DOCUMENT_EXPIRED'
  | 'WORKFLOW_STATUS_CHANGE'
  | 'DOCUMENT_PROCESSED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  documentId?: string;
  workflowId?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Folder types
// ─────────────────────────────────────────────
export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Document sharing types
// ─────────────────────────────────────────────
export interface DocumentShare {
  id: string;
  documentId: string;
  userId: string;
  token: string;
  expiresAt: string;
  accessCount: number;
  recipientEmail?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// API Response types
// ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// AI Processing types
// ─────────────────────────────────────────────
export interface ClassificationResult {
  documentType: DocumentType;
  category: DocumentCategory;
  confidence: number;
  alternativeTypes?: Array<{ type: DocumentType; confidence: number }>;
}

export interface ExtractionResult {
  fields: Record<string, { value: string; confidence: number }>;
  rawText?: string;
  processingTime: number;
}

export interface SummaryResult {
  text: string;
  generatedAt: string;
}

export interface AIProcessingResult {
  classification: ClassificationResult;
  extraction: ExtractionResult;
  summary?: string;
  validationErrors?: string[];
  processingStatus: 'success' | 'partial' | 'failed';
}
