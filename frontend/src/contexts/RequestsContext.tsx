import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ServiceRequest, CallRequest, UploadedFile, RequestFormFields, CallRequestFormFields } from '@/types';
import { useContract } from '@/hooks/useContract';
import { ServiceStatus } from '../../../smartcontract/contract.config';
import { toast } from 'sonner';
import { useWallet } from './WalletContext';
import { useBlockchain } from './BlockchainContext';
import { useRole } from './RoleContext';

interface RequestsContextType {
  requests: ServiceRequest[];
  callRequests: CallRequest[];
  addRequest: (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  addCallRequest: (request: Omit<CallRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  updateRequestStatus: (id: string, status: ServiceRequest['status'], adminWallet?: string, remarks?: string) => Promise<void>;
  acceptRequest: (id: string) => Promise<void>;
  updateCallRequestStatus: (id: string, status: CallRequest['status']) => Promise<void>;
  getRequestsByWallet: (walletAddress: string) => ServiceRequest[];
  getCallRequestsByWallet: (walletAddress: string) => CallRequest[];
  getRequestsByService: (serviceId: string) => ServiceRequest[];
  getRequestsByStatus: (status: ServiceRequest['status']) => ServiceRequest[];
  getAllRequests: () => ServiceRequest[];
  getAllCallRequests: () => CallRequest[];
  getUniqueWallets: () => { address: string; requestCount: number }[];
  getAdminWallets: () => { address: string; processedCount: number }[];
  getStats: () => { total: number; pending: number; processing: number; completed: number };
  refreshRequests: () => Promise<void>;
  isSyncing: boolean;
}

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

// Sample demo data
const initialRequests: ServiceRequest[] = [];

const initialCallRequests: CallRequest[] = [];

export const RequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [callRequests, setCallRequests] = useState<CallRequest[]>(initialCallRequests);
  const { requestService, updateServiceStatus: updateContractStatus, acceptServiceRequest: acceptContractRequest, getServiceRequest, addDepartment, isDepartment, getTotalRequests } = useContract();
  const { walletAddress, isConnected } = useWallet();
  const { isCorrectNetwork, switchToSepolia } = useBlockchain();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync blockchain requests

  const fetchBlockchainRequests = useCallback(async () => {
    if (!isConnected || !isCorrectNetwork || !walletAddress) return;

    setIsSyncing(true);
    try {
      const total = await getTotalRequests();
      const blockchainRequests: ServiceRequest[] = [];
      const blockchainCallRequests: CallRequest[] = [];

      // Loop through all requests on blockchain
      for (let i = 1; i <= total; i++) {
        const data = await getServiceRequest(i);
        if (data) {
          const isCallRequest = data.serviceCategory.startsWith('CALL:');
          const cleanCategory = isCallRequest ? data.serviceCategory.replace('CALL:', '') : data.serviceCategory;

          if (isCallRequest) {
            const statusMap: Record<number, CallRequest['status']> = {
              0: 'pending',
              1: 'contacted',
              2: 'completed',
              3: 'pending' // Mapping rejected call to pending for simplicity
            };

            blockchainCallRequests.push({
              id: `CALL-${data.requestId}`,
              walletAddress: data.citizen,
              serviceId: data.serviceName.toLowerCase().replace(/\s+/g, '-'),
              serviceName: data.serviceName,
              categoryName: cleanCategory,
              selectedItem: data.serviceName,
              formFields: { fullName: 'Unknown (Blockchain Sync)', phone: '', preferredTime: 'Anytime' },
              status: statusMap[data.status] || 'pending',
              createdAt: new Date(Number(data.createdAt) * 1000),
              updatedAt: new Date(Number(data.updatedAt) * 1000),
            });
          } else {
            const statusMap: Record<number, ServiceRequest['status']> = {
              0: 'pending',
              1: 'processing',
              2: 'completed',
              3: 'rejected'
            };

            blockchainRequests.push({
              id: `REQ-${data.requestId}`,
              walletAddress: data.citizen,
              role: 'user',
              serviceId: data.serviceName.toLowerCase().replace(/\s+/g, '-'),
              serviceName: data.serviceName,
              categoryName: cleanCategory,
              uploadedFiles: [],
              formFields: { fullName: 'Unknown (Blockchain Sync)', phone: '', address: '' },
              status: statusMap[data.status] || 'pending',
              createdAt: new Date(Number(data.createdAt) * 1000),
              updatedAt: new Date(Number(data.updatedAt) * 1000),
              adminProcessedBy: data.department !== "0x0000000000000000000000000000000000000000" ? data.department : undefined,
              requestType: 'online',
              selectedItem: data.serviceName
            });
          }
        }
      }

      setRequests(prev => {
        const localMap = new Map();
        prev.forEach(req => localMap.set(req.id, req));

        const merged = blockchainRequests.map(bReq => {
          const local = localMap.get(bReq.id);
          if (local) {
            return {
              ...bReq,
              formFields: local.formFields,
              uploadedFiles: local.uploadedFiles,
              adminRemarks: local.adminRemarks
            };
          }
          return bReq;
        });

        const blockchainIdSet = new Set(blockchainRequests.map(r => r.id));
        const localsOnly = prev.filter(r => !blockchainIdSet.has(r.id));

        return [...merged, ...localsOnly].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      });

      setCallRequests(prev => {
        const localMap = new Map();
        prev.forEach(req => localMap.set(req.id, req));

        const merged = blockchainCallRequests.map(bReq => {
          const local = localMap.get(bReq.id);
          if (local) {
            return { ...bReq, formFields: local.formFields };
          }
          return bReq;
        });

        const blockchainIdSet = new Set(blockchainCallRequests.map(r => r.id));
        const localsOnly = prev.filter(r => !blockchainIdSet.has(r.id));

        return [...merged, ...localsOnly].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      });
    } catch (error) {
      console.error("Failed to sync blockchain requests:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected, isCorrectNetwork]);

  const refreshRequests = useCallback(async () => {
    await fetchBlockchainRequests();
  }, [fetchBlockchainRequests]);

  // Initial sync when wallet/network/contract is ready
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      fetchBlockchainRequests();
    }
  }, [isConnected, isCorrectNetwork, fetchBlockchainRequests]);

  const addRequest = useCallback(async (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const id = 'REQ' + Date.now().toString().slice(-6);

    // Create local request object
    const newRequest: ServiceRequest = {
      ...request,
      id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If wallet is connected and on correct network, submit to blockchain
    if (isConnected && walletAddress) {
      if (!isCorrectNetwork) {
        toast.error('Please switch to Sepolia network', {
          action: {
            label: 'Switch Network',
            onClick: async () => {
              try {
                await switchToSepolia();
                toast.success('Switched to Sepolia network');
              } catch (error) {
                toast.error('Failed to switch network');
              }
            },
          },
        });
        // Don't save request if on wrong network
        throw new Error('Wrong network - please switch to Sepolia');
      }

      toast.loading('Submitting request to blockchain...', { id: 'blockchain-tx' });

      try {
        const result = await requestService(request.categoryName, request.serviceName);

        if (result.success) {
          toast.success('Request submitted to blockchain!', {
            id: 'blockchain-tx',
            description: `ID: REQ-${result.requestId} | Transaction: ${result.txHash?.slice(0, 10)}...`,
          });

          // Use the actual requestId from blockchain
          const blockchainId = result.requestId !== undefined ? `REQ-${result.requestId}` : id;
          newRequest.id = blockchainId;
          newRequest.blockchainTxHash = result.txHash;

          // Only save to local state if blockchain transaction succeeded
          setRequests(prev => [newRequest, ...prev]);

          // SYNC WITH MONGODB
          try {
            toast.loading('Syncing documents to MongoDB...', { id: 'mongo-sync' });
            const formData = new FormData();

            // Append form fields
            Object.entries(request.formFields).forEach(([key, value]) => {
              if (value) formData.append(key, value);
            });

            // Append basic application info
            formData.append("serviceId", request.serviceId);
            formData.append("serviceType", request.serviceName);
            formData.append("walletAddress", request.walletAddress);
            formData.append("blockchainTxHash", result.txHash || "");
            formData.append("status", "Submitted");

            // Append actual binary files
            if (request.actualFiles && request.actualFiles.length > 0) {
              request.actualFiles.forEach((file) => {
                // Use a consistent field name prefix for files if needed, or just the file name
                formData.append("documents", file);
              });
            }

            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
            const response = await fetch(`${API_BASE_URL}/api/application/submit`, {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              toast.success('Documents synced to MongoDB!', { id: 'mongo-sync' });
              console.log("Synced with MongoDB successfully (including files)");
            } else {
              const errorText = await response.text();
              let errorData;
              try {
                errorData = JSON.parse(errorText);
              } catch (e) {
                errorData = { message: "Server returned non-JSON response", raw: errorText.slice(0, 100) };
              }

              toast.error('Failed to sync to MongoDB', {
                id: 'mongo-sync',
                description: errorData.message || 'Server error'
              });
              console.error("MongoDB sync failed:", errorData);
            }
          } catch (syncError) {
            toast.error('Network error during MongoDB sync', { id: 'mongo-sync' });
            console.error("Failed to sync with MongoDB:", syncError);
          }

          return blockchainId;
        } else {
          toast.error('Blockchain submission failed', {
            id: 'blockchain-tx',
            description: result.error || 'Please try again',
          });
          // Don't save request if blockchain transaction failed
          throw new Error(result.error || 'Blockchain transaction failed');
        }
      } catch (error: any) {
        console.error('Error submitting to blockchain:', error);
        toast.error('Transaction failed', {
          id: 'blockchain-tx',
          description: error.message || 'Request not saved',
        });
        // Throw error so the UI knows the request failed
        throw error;
      }
    } else {
      // Wallet not connected - save locally only (offline mode)
      toast.info('Request saved locally (wallet not connected)');
      setRequests(prev => [newRequest, ...prev]);
      return id;
    }
  }, [requestService, isConnected, walletAddress, isCorrectNetwork, switchToSepolia]);

  const addCallRequest = useCallback(async (request: Omit<CallRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const id = 'CALL' + Date.now().toString().slice(-6);
    const newCallRequest: CallRequest = {
      ...request,
      id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isConnected && walletAddress) {
      if (!isCorrectNetwork) {
        toast.error('Please switch to Sepolia network');
        throw new Error('Wrong network');
      }

      toast.loading('Submitting call request to blockchain...', { id: 'call-tx' });

      try {
        // Use CALL: prefix to identify call requests on-chain
        const result = await requestService(`CALL:${request.categoryName}`, request.serviceName);

        if (result.success) {
          toast.success('Call request recorded on blockchain!', {
            id: 'call-tx',
            description: `ID: CALL-${result.requestId}`,
          });

          const blockchainId = result.requestId !== undefined ? `CALL-${result.requestId}` : id;
          newCallRequest.id = blockchainId;
          setCallRequests(prev => [newCallRequest, ...prev]);
          return blockchainId;
        } else {
          toast.error('Blockchain submission failed', { id: 'call-tx' });
          throw new Error(result.error);
        }
      } catch (error: any) {
        toast.error('Transaction failed', { id: 'call-tx' });
        throw error;
      }
    } else {
      toast.info('Request saved locally (wallet not connected)');
      setCallRequests(prev => [newCallRequest, ...prev]);
      return id;
    }
  }, [requestService, isConnected, walletAddress, isCorrectNetwork]);

  // Accept request before processing
  const acceptRequest = useCallback(async (id: string) => {
    if (isConnected && walletAddress) {
      // Extract numeric ID from REQ-ID, CALL-ID or REQID/CALLID format
      const isCall = id.startsWith('CALL');
      const requestIdNumber = parseInt(id.split('-')[1] || id.replace('REQ', '').replace('CALL', ''));

      if (!isNaN(requestIdNumber)) {
        toast.loading('Accepting request...', { id: 'accept-req' });
        try {
          const result = await acceptContractRequest(requestIdNumber);
          if (result.success) {
            toast.success('Request accepted! It is now in the Processing tab.', { id: 'accept-req' });

            // Update appropriate local state to transition UI to "processing"/"contacted" status
            if (isCall) {
              setCallRequests(prev => prev.map(req =>
                req.id === id
                  ? { ...req, status: 'contacted', updatedAt: new Date() }
                  : req
              ));
            } else {
              setRequests(prev => prev.map(req =>
                req.id === id
                  ? { ...req, status: 'processing', updatedAt: new Date(), adminProcessedBy: walletAddress || undefined }
                  : req
              ));
            }
          } else {
            toast.error('Failed to accept request', { id: 'accept-req', description: result.error });
            throw new Error(result.error);
          }
        } catch (error: any) {
          toast.error('Transaction failed', { id: 'accept-req', description: error.message });
          throw error;
        }
      }
    }
  }, [acceptContractRequest, isConnected, walletAddress]);

  const updateRequestStatus = useCallback(async (
    id: string,
    status: ServiceRequest['status'],
    adminWallet?: string,
    remarks?: string
  ) => {
    // Map frontend status to blockchain status
    const statusMap: Record<ServiceRequest['status'], ServiceStatus> = {
      'pending': ServiceStatus.Pending,
      'processing': ServiceStatus.Processing,
      'completed': ServiceStatus.Completed,
      'rejected': ServiceStatus.Rejected,
    };

    // If wallet is connected, update on blockchain first
    if (isConnected && walletAddress) {
      if (!isCorrectNetwork) {
        toast.error('Please switch to Sepolia network to update on blockchain');
        throw new Error('Wrong network - please switch to Sepolia');
      }

      // Extract numeric ID from REQ-ID or REQID format
      const requestIdNumber = parseInt(id.split('-')[1] || id.replace('REQ', ''));

      if (!isNaN(requestIdNumber)) {

        // Robust check: Ensure we are assigned to the request
        if (status === 'processing' || status === 'completed' || status === 'rejected') {
          try {
            // Fetch latest blockchain state
            const requestData = await getServiceRequest(requestIdNumber);

            if (requestData) {
              const isAssignedToMe = requestData.department.toLowerCase() === walletAddress.toLowerCase();

              if (!isAssignedToMe) {
                toast.error(`Request is not assigned to you.`);
                throw new Error("This request is locked by another department or not yet accepted.");
              }
              // Case: Already assigned to me - Safe to proceed
            } else {
              toast.error("Request not found on blockchain");
              throw new Error("Request ID does not exist on the current contract.");
            }
          } catch (e: any) {
            console.error("Assignment check failed:", e);
            throw e;
          }
        }

        toast.loading('Updating status on blockchain...', { id: 'status-update' });

        try {
          const result = await updateContractStatus(requestIdNumber, statusMap[status]);

          if (result.success) {
            toast.success(`Status updated to '${status}' on blockchain!`, {
              id: 'status-update',
              description: `Transaction: ${result.txHash?.slice(0, 10)}...`,
            });

            // Only update local state if blockchain transaction succeeded
            setRequests(prev => prev.map(req =>
              req.id === id
                ? {
                  ...req,
                  status,
                  updatedAt: new Date(),
                  adminProcessedBy: adminWallet || req.adminProcessedBy,
                  adminRemarks: remarks || req.adminRemarks,
                }
                : req
            ));
          } else {
            // ... error handling
            toast.error('Blockchain update failed', {
              id: 'status-update',
              description: result.error || 'Status not updated',
            });
            throw new Error(result.error || 'Blockchain transaction failed');
          }
        } catch (error: any) {
          // ... error handling
          console.error('Error updating blockchain:', error);
          toast.error('Transaction failed', {
            id: 'status-update',
            description: error.message || 'Status not updated',
          });
          throw error;
        }
      }
    } else {
      // Wallet not connected
      // ... (offline mode code) ...
      toast.info('Status updated locally (wallet not connected)');
      setRequests(prev => prev.map(req =>
        req.id === id
          ? {
            ...req,
            status,
            updatedAt: new Date(),
            adminProcessedBy: adminWallet || req.adminProcessedBy,
            adminRemarks: remarks || req.adminRemarks,
          }
          : req
      ));
    }
  }, [updateContractStatus, acceptContractRequest, getServiceRequest, isConnected, walletAddress, isCorrectNetwork]);

  const updateCallRequestStatus = useCallback(async (id: string, status: CallRequest['status']) => {
    if (isConnected && walletAddress) {
      const requestIdNumber = parseInt(id.split('-')[1] || id.replace('CALL', ''));
      if (!isNaN(requestIdNumber)) {
        // Map CallRequest status to blockchain ServiceStatus
        const statusMap: Record<CallRequest['status'], ServiceStatus> = {
          'pending': ServiceStatus.Pending,
          'contacted': ServiceStatus.Processing, // Processing = Contacted for calls
          'completed': ServiceStatus.Completed
        };

        toast.loading('Updating call status on blockchain...', { id: 'call-status' });
        try {
          const result = await updateContractStatus(requestIdNumber, statusMap[status]);
          if (result.success) {
            toast.success('Call status updated on blockchain!', { id: 'call-status' });
            setCallRequests(prev => prev.map(req =>
              req.id === id ? { ...req, status, updatedAt: new Date() } : req
            ));
          } else {
            toast.error('Update failed', { id: 'call-status' });
          }
        } catch (error) {
          toast.error('Transaction failed', { id: 'call-status' });
        }
      }
    } else {
      setCallRequests(prev => prev.map(req =>
        req.id === id ? { ...req, status, updatedAt: new Date() } : req
      ));
    }
  }, [updateContractStatus, isConnected, walletAddress]);

  const getRequestsByWallet = useCallback((walletAddress: string) => {
    return requests.filter(req => req.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  }, [requests]);

  const getCallRequestsByWallet = useCallback((walletAddress: string) => {
    return callRequests.filter(req => req.walletAddress.toLowerCase() === walletAddress.toLowerCase());
  }, [callRequests]);

  const getRequestsByService = useCallback((serviceId: string) => {
    return requests.filter(req => req.serviceId === serviceId);
  }, [requests]);

  const getRequestsByStatus = useCallback((status: ServiceRequest['status']) => {
    return requests.filter(req => req.status === status);
  }, [requests]);

  const getAllRequests = useCallback(() => requests, [requests]);

  const getAllCallRequests = useCallback(() => callRequests, [callRequests]);

  const getUniqueWallets = useCallback(() => {
    const walletMap = new Map<string, number>();
    requests.forEach(req => {
      const count = walletMap.get(req.walletAddress) || 0;
      walletMap.set(req.walletAddress, count + 1);
    });
    callRequests.forEach(req => {
      const count = walletMap.get(req.walletAddress) || 0;
      walletMap.set(req.walletAddress, count + 1);
    });
    return Array.from(walletMap.entries()).map(([address, requestCount]) => ({ address, requestCount }));
  }, [requests, callRequests]);

  const getAdminWallets = useCallback(() => {
    const adminMap = new Map<string, number>();
    requests.forEach(req => {
      if (req.adminProcessedBy) {
        const count = adminMap.get(req.adminProcessedBy) || 0;
        adminMap.set(req.adminProcessedBy, count + 1);
      }
    });
    return Array.from(adminMap.entries()).map(([address, processedCount]) => ({ address, processedCount }));
  }, [requests]);

  const getStats = useCallback(() => {
    return {
      total: requests.length + callRequests.length,
      pending: requests.filter(r => r.status === 'pending').length + callRequests.filter(r => r.status === 'pending').length,
      processing: requests.filter(r => r.status === 'processing').length + callRequests.filter(r => r.status === 'contacted').length,
      completed: requests.filter(r => r.status === 'completed').length + callRequests.filter(r => r.status === 'completed').length,
    };
  }, [requests, callRequests]);

  const { isConnected: isWalletConnected, walletAddress: currentWalletAddress } = useWallet();
  const { role } = useRole();
  // Auto-register admin as department when connected
  useEffect(() => {
    const registerAdmin = async () => {
      if (isWalletConnected && currentWalletAddress && role === 'admin') {
        try {
          // Check if already a department
          const isDept = await isDepartment(currentWalletAddress);

          if (!isDept) {
            toast.loading('Registering wallet as department...', { id: 'admin-reg' });

            // Attempt to add self as department
            const result = await addDepartment(currentWalletAddress);

            if (result.success) {
              toast.success('Wallet registered as department!', {
                id: 'admin-reg',
                description: `Transaction: ${result.txHash?.slice(0, 10)}...`
              });
            } else {
              if (result.error?.includes("revert")) {
                toast.error('Registration failed: Only Owner can add admins', { id: 'admin-reg' });
              } else {
                toast.error('Department registration failed', {
                  id: 'admin-reg',
                  description: result.error
                });
              }
            }
          } else {
            // Optional: toast.success('Welcome back, Admin!');
          }
        } catch (error) {
          console.error("Auto-registration error:", error);
          toast.error('Failed to verify admin status', { id: 'admin-reg' });
        }
      }
    };

    registerAdmin();
  }, [isWalletConnected, currentWalletAddress, role, addDepartment, isDepartment]);

  return (
    <RequestsContext.Provider value={{
      requests,
      callRequests,
      addRequest,
      addCallRequest,
      updateRequestStatus,
      acceptRequest,
      updateCallRequestStatus,
      getRequestsByWallet,
      getCallRequestsByWallet,
      getRequestsByService,
      getRequestsByStatus,
      getAllRequests,
      getAllCallRequests,
      getUniqueWallets,
      getAdminWallets,
      getStats,
      refreshRequests,
      isSyncing
    }}>
      {children}
    </RequestsContext.Provider>
  );
};

export const useRequests = (): RequestsContextType => {
  const context = useContext(RequestsContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
};
