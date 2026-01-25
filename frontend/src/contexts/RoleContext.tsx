import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Role-based default routes
const roleRoutes: Record<UserRole, string> = {
  user: '/',
  admin: '/admin/dashboard',
  owner: '/owner/overview',
};

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('civicchain-role');
    return (savedRole as UserRole) || 'user';
  });

  useEffect(() => {
    localStorage.setItem('civicchain-role', role);
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }

  // Override setRole to include navigation
  const setRoleWithNavigation = (newRole: UserRole) => {
    context.setRole(newRole);

    // Navigate to the default route for the new role
    const targetRoute = roleRoutes[newRole];

    // Only navigate if we're not already on a valid route for this role
    if (!location.pathname.startsWith(targetRoute)) {
      navigate(targetRoute);
    }
  };

  return {
    role: context.role,
    setRole: setRoleWithNavigation,
  };
};
