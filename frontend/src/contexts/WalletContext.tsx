import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { WalletState } from '@/types';

interface WalletContextType {
  wallet: WalletState;
  walletAddress: string | null;
  isConnected: boolean;
  connect: (providerType: string) => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const initialState: WalletState = {
  isConnected: false,
  address: null,
  provider: null,
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected: wagmiIsConnected, isConnecting } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletState>(initialState);

  // Update wallet state when wagmi connection changes
  useEffect(() => {
    if (wagmiIsConnected && address) {
      setWallet({
        isConnected: true,
        address: address,
        provider: 'Web3',
      });
    } else {
      setWallet(initialState);
    }
  }, [wagmiIsConnected, address]);

  // This function is kept for backward compatibility but RainbowKit handles connection
  const connect = async (providerType: string) => {
    setError(null);
    // Connection is handled by RainbowKit's ConnectButton
    // This function is here for interface compatibility
    console.log('Please use the Connect Wallet button to connect');
  };

  const disconnect = () => {
    setError(null);
    wagmiDisconnect();
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        walletAddress: address || null,
        isConnected: wagmiIsConnected,
        connect,
        disconnect,
        isConnecting,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
