# CivicChain (Governance Platform)

CivicChain is a Web3-powered governance platform designed to provide secure, decentralized, and transparent access to government services. It allows citizens to connect their Web3 wallets, browse a wide array of government services (such as Umang services), and submit requests that are verifiably tracked on-chain.

## Features

- **Web3 Wallet Integration:** Seamlessly log in and authenticate users securely using RainbowKit and Wagmi.
- **Transparent Processing:** All service requests are tracked on-chain via smart contracts ensuring unalterable records and complete transparency.
- **User Dashboard:** Citizens can easily monitor the real-time status of their service requests (Pending, Processing, Completed, Rejected).
- **Owner/Admin Dashboard:** Comprehensive oversight of the platform, tracking total services, unique users, active admins, and processing metrics.
- **File Uploads:** Secure processing of necessary document uploads for service applications.

## Tech Stack

The architecture is divided into three main components: Frontend, Backend, and Smart Contracts.

### Frontend
- **Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS, Shadcn UI (Radix UI)
- **Web3 Libraries:** Wagmi, Viem, RainbowKit, Ethers.js
- **Routing & State:** React Router DOM, React Query, React Hook Form + Zod for validations.

### Backend
- **Environment:** Node.js, Express.js
- **Database:** MongoDB (using Mongoose)
- **Middleware:** CORS, dotenv, Multer for file upload handling.

### Smart Contract
- **Network:** Deployed on the Ethereum Sepolia Testnet
- **Contract Address:** `0xebADA26Ad64297D9ADcaD288f6f4319c2281C7dB`
- **Functionality:** Manages the transparent state transitions of government service requests.

## Project Structure

```
BW_GovernancePlatfrom/
├── frontend/         # React application interacting with the blockchain and backend
├── backend/          # Express API for off-chain data and file uploads
└── smartcontract/    # Smart contract configurations and ABI for on-chain logic
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance running
- A Web3 Wallet (e.g., MetaMask) configured for the Sepolia Testnet

### Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

### Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on your configuration requirements (PORT, MongoDB URI, etc.).
4. Start the server: `npm start`

