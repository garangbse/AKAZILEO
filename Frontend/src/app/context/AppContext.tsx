import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../services/api';

export type Role = 'worker' | 'employer';

/*Defines the shape of every task in your app.*/
export type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  payment: number;
  due_date: string | null;
};

export interface ModalConfig {
  type:
    | 'confirm-submit'
    | 'approve'
    | 'reject'
    | 'delete'
    | 'upload-success'
    | 'upload-error'
    | 'add-portfolio'
    | 'create-task'
    | null;
  title?: string;
  message?: string;
  onConfirm?: (data?: any) => void;
}

export interface UserProfile {
  name: string;
  email: string;
}

// ✅ Updated login signature to match implementation
// Tells TypeScript: Any component using this context can access anything, update them, and add new ones.”

interface AppContextType {
  role: Role;
  roles: Role[];
  setRole: (role: Role) => void;

  isAuthenticated: boolean;
  userProfile: UserProfile;

  login: (roles: Role[], selectedRole: Role, name: string, email: string) => void;
  logout: () => void;

  updateUserProfile: (updates: Partial<UserProfile>) => void;

  modal: ModalConfig;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
  
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (taskData: { title: string; description: string; payment: number; due_date:string }) => void;
}

const AppContext = createContext<AppContextType>({
  role: 'worker',
  roles: [],
  setRole: () => {},

  isAuthenticated: false,
  userProfile: { name: '', email: '' },

  login: () => {},
  logout: () => {},

  updateUserProfile: () => {},

  modal: { type: null },
  openModal: () => {},
  closeModal: () => {},

  tasks: [],
  setTasks: () => {},
  addTask: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  /*Creates a global list stored in context.*/
  const [role, setRole] = useState<Role>('worker');
  const [roles, setRoles] = useState<Role[]>([]);           // ✅ starts empty, filled from API
  const [modal, setModal] = useState<ModalConfig>({ type: null });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', email: '' });
  const [tasks, setTasks] = useState<Task[]>([]);
 

  // ✅ Signature now matches the interface
  const login = (roles: Role[], selectedRole: Role, name: string, email: string) => {
  setRoles(roles);
  setRole(selectedRole);
  setUserProfile({ name, email });
  setIsAuthenticated(true);
};

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile({ name: '', email: '' });
    setRoles([]);  // ✅ clear roles on logout
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const addTask = (taskData: { title: string; description: string ;payment: number; due_date: string}) => {
    const newTask: Task = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description,
      status: 'Open',
      payment: taskData.payment,
      due_date:taskData.due_date,
    };

    setTasks((prev) => [...prev, newTask]);
  };

  /*Makes everything in it  accessible anywhere via useAppContext().*/
  return (
    <AppContext.Provider
      value={{
        role,
        roles,        // ✅ was missing before
        setRole,

        isAuthenticated,
        userProfile,

        login,
        logout,

        updateUserProfile,

        modal,
        openModal: setModal,
        closeModal: () => setModal({ type: null }),


        tasks,
        setTasks,
        addTask,

      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}