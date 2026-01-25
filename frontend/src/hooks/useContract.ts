import { useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, ServiceStatus } from '../../../smartcontract/contract.config';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface ServiceRequestData {
    requestId: bigint;
    citizen: string;
    serviceCategory: string;
    serviceName: string;
    department: string;
    status: number;
    createdAt: bigint;
    updatedAt: bigint;
}

export const useContract = () => {
    // Get contract instance with signer
    const getContract = useCallback(async (needsSigner = false) => {
        if (!window.ethereum) {
            throw new Error('Please install MetaMask or another Web3 wallet');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        if (needsSigner) {
            const signer = await provider.getSigner();
            return new ethers.Contract(
                CONTRACT_CONFIG.address,
                CONTRACT_CONFIG.abi,
                signer
            );
        }

        return new ethers.Contract(
            CONTRACT_CONFIG.address,
            CONTRACT_CONFIG.abi,
            provider
        );
    }, []);

    // Request a service (creates a new service request on blockchain)
    const requestService = useCallback(async (
        serviceCategory: string,
        serviceName: string
    ): Promise<{ success: boolean; txHash?: string; requestId?: number; error?: string }> => {
        try {
            const contract = await getContract(true);
            const tx = await contract.requestService(serviceCategory, serviceName);

            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Extract requestId from event logs
            let requestId: number | undefined;
            if (receipt && receipt.logs) {
                for (const log of receipt.logs) {
                    try {
                        const parsedLog = contract.interface.parseLog(log);
                        if (parsedLog && parsedLog.name === 'ServiceRequested') {
                            requestId = Number(parsedLog.args.requestId);
                            break;
                        }
                    } catch (e) {
                        // Not our event or parsing failed, skip
                    }
                }
            }

            return { success: true, txHash: tx.hash, requestId };
        } catch (error: any) {
            console.error('Error requesting service:', error);
            return {
                success: false,
                error: error.message || 'Failed to create service request'
            };
        }
    }, [getContract]);

    // Update service status (admin/department only)
    const updateServiceStatus = useCallback(async (
        requestId: number,
        status: ServiceStatus
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
        try {
            const contract = await getContract(true);
            const tx = await contract.updateServiceStatus(requestId, status);

            console.log('Status update transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Status update confirmed:', receipt);

            return { success: true, txHash: tx.hash };
        } catch (error: any) {
            console.error('Error updating service status:', error);
            return {
                success: false,
                error: error.message || 'Failed to update service status'
            };
        }
    }, [getContract]);

    // Accept service request (department only)
    const acceptServiceRequest = useCallback(async (
        requestId: number
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
        try {
            const contract = await getContract(true);
            const tx = await contract.acceptServiceRequest(requestId);

            console.log('Accept request transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Accept request confirmed:', receipt);

            return { success: true, txHash: tx.hash };
        } catch (error: any) {
            console.error('Error accepting service request:', error);
            return {
                success: false,
                error: error.message || 'Failed to accept service request'
            };
        }
    }, [getContract]);

    // Get service request by ID
    const getServiceRequest = useCallback(async (
        requestId: number
    ): Promise<ServiceRequestData | null> => {
        try {
            const contract = await getContract(false);
            const request = await contract.getServiceRequest(requestId);

            return {
                requestId: request.requestId,
                citizen: request.citizen,
                serviceCategory: request.serviceCategory,
                serviceName: request.serviceName,
                department: request.department,
                status: Number(request.status),
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
            };
        } catch (error: any) {
            console.error('Error getting service request:', error);
            return null;
        }
    }, [getContract]);

    // Get total number of requests
    const getTotalRequests = useCallback(async (): Promise<number> => {
        try {
            const contract = await getContract(false);
            const total = await contract.getTotalRequests();
            return Number(total);
        } catch (error: any) {
            console.error('Error getting total requests:', error);
            return 0;
        }
    }, [getContract]);

    // Add department (admin only)
    const addDepartment = useCallback(async (
        departmentAddress: string
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
        try {
            const contract = await getContract(true);
            const tx = await contract.addDepartment(departmentAddress);

            console.log('Add department transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Add department confirmed:', receipt);

            return { success: true, txHash: tx.hash };
        } catch (error: any) {
            console.error('Error adding department:', error);
            return {
                success: false,
                error: error.message || 'Failed to add department'
            };
        }
    }, [getContract]);

    // Remove department (admin only)
    const removeDepartment = useCallback(async (
        departmentAddress: string
    ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
        try {
            const contract = await getContract(true);
            const tx = await contract.removeDepartment(departmentAddress);

            console.log('Remove department transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Remove department confirmed:', receipt);

            return { success: true, txHash: tx.hash };
        } catch (error: any) {
            console.error('Error removing department:', error);
            return {
                success: false,
                error: error.message || 'Failed to remove department'
            };
        }
    }, [getContract]);

    // Get admin address
    const getAdmin = useCallback(async (): Promise<string | null> => {
        try {
            const contract = await getContract(false);
            const admin = await contract.admin();
            return admin;
        } catch (error: any) {
            console.error('Error getting admin:', error);
            return null;
        }
    }, [getContract]);

    // Check if address is a department
    const isDepartment = useCallback(async (address: string): Promise<boolean> => {
        try {
            const contract = await getContract(false);
            const isDept = await contract.departments(address);
            return isDept;
        } catch (error: any) {
            console.error('Error checking department status:', error);
            return false;
        }
    }, [getContract]);

    return {
        requestService,
        updateServiceStatus,
        acceptServiceRequest,
        getServiceRequest,
        getTotalRequests,
        addDepartment,
        removeDepartment,
        getAdmin,
        isDepartment,
    };
};
