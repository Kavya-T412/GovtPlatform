import contractABI from './govtplatfrom.json';

// Contract deployment address on Sepolia network
export const CONTRACT_ADDRESS = '0xebADA26Ad64297D9ADcaD288f6f4319c2281C7dB';

// Contract ABI
export const CONTRACT_ABI = contractABI;

// Service Status enum matching the smart contract
export enum ServiceStatus {
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Rejected = 3
}

// Network configuration
export const SEPOLIA_CHAIN_ID = 11155111;

export const CONTRACT_CONFIG = {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
} as const;
