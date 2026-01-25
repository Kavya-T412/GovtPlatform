import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/types';
import WalletConnectButton from './WalletConnectButton';

const roleNavLinks: Record<UserRole, { name: string; path: string }[]> = {
  user: [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Dashboard', path: '/dashboard' },
  ],
  admin: [
    { name: 'Services', path: '/admin/services' },
    { name: 'Requests', path: '/admin/requests' },
    { name: 'Dashboard', path: '/admin/dashboard' },
  ],
  owner: [
    { name: 'Overview', path: '/owner/overview' },
    { name: 'Users', path: '/owner/users' },
    { name: 'Admins', path: '/owner/admins' },
    { name: 'All Requests', path: '/owner/requests' },
  ],
};

const roleLabels: Record<UserRole, string> = {
  user: 'User',
  admin: 'Admin',
  owner: 'Owner',
};

const defaultRolePaths: Record<UserRole, string> = {
  user: '/',
  admin: '/admin/dashboard',
  owner: '/owner/overview',
};

import { useWallet } from '@/contexts/WalletContext';

// ... (existing constants)

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const { disconnect, isConnected } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = roleNavLinks[role];

  const handleRoleChange = (newRole: UserRole) => {
    if (isConnected) {
      disconnect();
    }
    setRole(newRole);
    setIsMobileMenuOpen(false);
    navigate(defaultRolePaths[newRole]);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-semibold text-foreground">
              Pastel<span className="text-gradient">Gov</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Role Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                  {roleLabels[role]}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(['user', 'admin', 'owner'] as UserRole[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={role === r ? 'bg-primary/10' : ''}
                  >
                    {roleLabels[r]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wallet Button */}
            <WalletConnectButton />

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Select Role</p>
                    <div className="flex gap-2">
                      {(['user', 'admin', 'owner'] as UserRole[]).map((r) => (
                        <Button
                          key={r}
                          variant={role === r ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleRoleChange(r)}
                        >
                          {roleLabels[r]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
