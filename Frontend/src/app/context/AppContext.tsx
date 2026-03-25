import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../services/api';
import { createTask, getTasks } from '../../services/task';

export type Role = 'worker' | 'employer';

/*Defines the shape of every task in your app.*/
export type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  payment: number;
  due_date: string | null;
  poster_id?: number;
};

export interface ModalConfig {
  type:
    | 'confirm-submit'
    | 'approve'
    | 'approve-application'
    | 'reject'
    | 'reject-application'
    | 'delete'
    | 'upload-success'
    | 'upload-error'
    | 'apply-error'
    | 'add-portfolio'
    | 'create-task'
    | 'error'
    | 'success'
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
  currentUser: { id?: number; username?: string; email?: string; bio?: string; profile_picture?: string } | null;

  login: (roles: Role[], selectedRole: Role, id: number, name: string, email: string) => void;
  logout: () => void;

  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateCurrentUser: (updates: Partial<{ id?: number; username?: string; email?: string; bio?: string; profile_picture?: string }>) => void;

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
  currentUser: null,

  login: () => {},
  logout: () => {},

  updateUserProfile: () => {},
  updateCurrentUser: () => {},

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
  const [currentUser, setCurrentUser] = useState<{ id?: number; username?: string; email?: string; bio?: string; profile_picture?: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Restore session from localStorage on app load
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('[SESSION] No token found in localStorage');
        return;
      }
      
      try {
        console.log('[SESSION] Attempting to restore session from token');
        const response = await api('/me', 'GET', undefined, token);
        
        if (response.status === 'success' && response.data) {
          const { id, username, email, roles: userRoles, bio, profile_picture } = response.data;
          
          // Restore the first available role (or 'worker' as default)
          const selectedRole = userRoles && userRoles.length > 0 ? userRoles[0] : 'worker';
          
          // Call login to restore state
          setRoles(userRoles);
          setRole(selectedRole);
          setUserProfile({ name: username, email });
          setCurrentUser({ id, username, email, bio, profile_picture });
          setIsAuthenticated(true);
          
          console.log('[SESSION] Session restored:', { id, username, role: selectedRole });
        }
      } catch (error) {
        console.error('[SESSION] Failed to restore session:', error);
        // Clear invalid token
        localStorage.removeItem('token');
      }
    };
    
    restoreSession();
  }, []);

    useEffect(() => {
      const fetchTasks = async () => {
        const token = localStorage.getItem('token') ?? undefined;
        try {
          const response = await getTasks(token);
          console.log('[TASKS] Tasks fetched:', response);
          if (response.status === 'success' && response.data) {
            setTasks(response.data);
          } else {
            setTasks([]);
          }
        } catch (error) {
          console.error('[TASKS] Failed to fetch tasks:', error);
          setTasks([]);
        }
      };

      fetchTasks();
    }, [isAuthenticated]);
 

  // ✅ Signature now matches the interface
  const login = (roles: Role[], selectedRole: Role, id: number, name: string, email: string) => {
  setRoles(roles);
  setRole(selectedRole);
  setUserProfile({ name, email });
  setCurrentUser({ id, username: name, email });
  setIsAuthenticated(true);
};

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile({ name: '', email: '' });
    setCurrentUser(null);
    setRoles([]);  // ✅ clear roles on logout
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateCurrentUser = (updates: Partial<{ id?: number; username?: string; email?: string; bio?: string; profile_picture?: string }>) => {
    setCurrentUser((prev) => prev ? { ...prev, ...updates } : null);
  };

  const addTask = async (taskData: {
    title: string;
    description: string;
    payment: number;
    due_date: string;
  }) => {
    const token = localStorage.getItem('token') ?? undefined;

    await createTask(taskData, token);

    const res = await getTasks(token);
    setTasks(res.data);
  };

  /*Makes everything in it  accessible anywhere via useAppContext().*/
  return (
    <AppContext.Provider
      value={{
        role,
        roles,
        setRole,

        isAuthenticated,
        userProfile,
        currentUser,

        login,
        logout,

        updateUserProfile,
        updateCurrentUser,

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