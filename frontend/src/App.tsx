import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { RequestsProvider } from "@/contexts/RequestsContext";
import { BlockchainProvider } from "@/contexts/BlockchainContext";

import UserHome from "./pages/UserHome";
import UserServices from "./pages/UserServices";
import UserDashboard from "./pages/UserDashboard";
import AdminServices from "./pages/AdminServices";
import AdminRequests from "./pages/AdminRequests";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerOverview from "./pages/OwnerOverview";
import OwnerUsers from "./pages/OwnerUsers";
import OwnerAdmins from "./pages/OwnerAdmins";
import OwnerRequests from "./pages/OwnerRequests";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <WalletProvider>
        <BlockchainProvider>
          <RoleProvider>
            <RequestsProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* User Routes */}
                <Route path="/" element={<UserHome />} />
                <Route path="/services" element={<UserServices />} />
                <Route path="/dashboard" element={<UserDashboard />} />

                {/* Admin Routes */}
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/requests" element={<AdminRequests />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Owner Routes */}
                <Route path="/owner/overview" element={<OwnerOverview />} />
                <Route path="/owner/users" element={<OwnerUsers />} />
                <Route path="/owner/admins" element={<OwnerAdmins />} />
                <Route path="/owner/requests" element={<OwnerRequests />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </RequestsProvider>
          </RoleProvider>
        </BlockchainProvider>
      </WalletProvider>
    </TooltipProvider>
  </BrowserRouter>
);

export default App;

