export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  requiredDocuments: string[];
  onlinePossibleItems: string[];
  offlineRequiredItems: string[];
}

export interface ServiceRequest {
  id: string;
  walletAddress: string;
  role: 'user';
  serviceId: string;
  serviceName: string;
  categoryName: string;
  uploadedFiles: UploadedFile[];
  formFields: RequestFormFields;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  adminProcessedBy?: string;
  adminRemarks?: string;
  requestType: 'online' | 'call';
  selectedItem: string;
  blockchainTxHash?: string;
}

export interface CallRequest {
  id: string;
  walletAddress: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  selectedItem: string;
  formFields: CallRequestFormFields;
  status: 'pending' | 'contacted' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CallRequestFormFields {
  fullName: string;
  phone: string;
  email?: string;
  preferredTime: string;
  notes?: string;
}

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface RequestFormFields {
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
  [key: string]: string | undefined;
}

export type UserRole = 'user' | 'admin' | 'owner';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: string | null;
}
