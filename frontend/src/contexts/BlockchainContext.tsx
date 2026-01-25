import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from '../../../smartcontract/contract.config';
import { useWallet } from './WalletContext';

interface BlockchainContextType {
    contract: ethers.Contract | null;
    isContractReady: boolean;
    chainId: number | null;
    isCorrectNetwork: boolean;
    switchToSepolia: () => Promise<void>;
    refreshContract: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const BlockchainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isConnected } = useWallet();
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [isContractReady, setIsContractReady] = useState(false);

    const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

    // Initialize contract
    const initializeContract = useCallback(async () => {
        if (!window.ethereum || !isConnected) {
            setContract(null);
            setIsContractReady(false);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            setChainId(Number(network.chainId));

            // Create contract instance with provider (read-only)
            const contractInstance = new ethers.Contract(
                CONTRACT_CONFIG.address,
                CONTRACT_CONFIG.abi,
                provider
            );

            setContract(contractInstance);
            setIsContractReady(true);
            console.log('Contract initialized:', CONTRACT_CONFIG.address);
        } catch (error) {
            console.error('Error initializing contract:', error);
            setContract(null);
            setIsContractReady(false);
        }
    }, [isConnected]);

    // Switch to Sepolia network
    const switchToSepolia = useCallback(async () => {
        if (!window.ethereum) {
            throw new Error('No wallet found');
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
            });
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: SEPOLIA_CHAIN_ID_HEX,
                                chainName: 'Sepolia Testnet',
                                nativeCurrency: {
                                    name: 'SepoliaETH',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                rpcUrls: ['https://rpc.sepolia.org'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io'],
                            },
                        ],
                    });
                } catch (addError) {
                    console.error('Error adding Sepolia network:', addError);
                    throw addError;
                }
            } else {
                throw switchError;
            }
        }
    }, []);

    // Refresh contract (useful after network switch)
    const refreshContract = useCallback(async () => {
        await initializeContract();
    }, [initializeContract]);

    // Initialize on mount and when wallet changes
    useEffect(() => {
        initializeContract();
    }, [initializeContract]);

    // Listen for network changes
    useEffect(() => {
        if (!window.ethereum) return;

        const handleChainChanged = (chainIdHex: string) => {
            const newChainId = parseInt(chainIdHex, 16);
            setChainId(newChainId);
            // Reinitialize contract when network changes
            initializeContract();
        };

        // Add event listener
        if (window.ethereum.on) {
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        return () => {
            // Remove event listener
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [initializeContract]);

    return (
        <BlockchainContext.Provider
            value={{
                contract,
                isContractReady,
                chainId,
                isCorrectNetwork,
                switchToSepolia,
                refreshContract,
            }}
        >
            {children}
        </BlockchainContext.Provider>
    );
};

export const useBlockchain = (): BlockchainContextType => {
    const context = useContext(BlockchainContext);
    if (!context) {
        throw new Error('useBlockchain must be used within a BlockchainProvider');
    }
    return context;
};
