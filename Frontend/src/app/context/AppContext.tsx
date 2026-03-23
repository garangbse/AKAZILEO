import React, { createContext, useContext, useState } from 'react';

export type Role = 'worker' | 'employer';

export interface ModalConfig {
  type:
    | 'confirm-submit'
    | 'approve'
    | 'reject'
    | 'delete'
    | 'upload-success'
    | 'upload-error'
    | 'add-portfolio'
    | null;
  title?: string;
  message?: string;
  onConfirm?: () => void;
}

export interface UserProfile {
  name: string;
  email: string;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;

  isAuthenticated: boolean;
  userProfile: UserProfile;

  login: (role: Role, name: string, email: string) => void;
  logout: () => void;

  updateUserProfile: (updates: Partial<UserProfile>) => void;

  modal: ModalConfig;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextType>({
  role: 'worker',
  setRole: () => {},

  isAuthenticated: false,
  userProfile: { name: '', email: '' },

  login: () => {},
  logout: () => {},

  updateUserProfile: () => {},

  modal: { type: null },
  openModal: () => {},
  closeModal: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('worker');
  const [modal, setModal] = useState<ModalConfig>({ type: null });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
  });

  const login = (selectedRole: Role, name: string, email: string) => {
    setRole(selectedRole);
    setUserProfile({ name, email });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile({ name: '', email: '' });
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,

        isAuthenticated,
        userProfile,

        login,
        logout,

        updateUserProfile,

        modal,
        openModal: setModal,
        closeModal: () => setModal({ type: null }),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}