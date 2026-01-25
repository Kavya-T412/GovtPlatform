import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const config = getDefaultConfig({
    appName: 'BW Governance Platform',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '6e8cdec996f31d6e5a7c3a2fd8a95189',
    chains: [sepolia],
    ssr: false,
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider modalSize="compact">
                <App />
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
);
