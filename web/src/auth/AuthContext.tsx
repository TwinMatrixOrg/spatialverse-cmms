import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type UserRole = 'fm_manager' | 'supervisor' | 'technician' | 'space_manager';

interface SessionState {
  loggedIn: boolean;
  role: UserRole;
}

interface AuthContextType {
  loggedIn: boolean;
  role: UserRole;
  roleLabel: string;
  roleOptions: { id: UserRole; label: string }[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const SESSION_KEY = 'sv_pulse_session';
const CREDS = { u: atob('c2FuZGJveA=='), p: atob('c2FuZGJveA==') };

export const ROLE_LABELS: Record<UserRole, string> = {
  fm_manager: 'Ahmad Rizal — FM Manager',
  supervisor: 'Siti Norzahra — Supervisor',
  technician: 'Ravi Kumar — Technician',
  space_manager: 'Jennifer Lim — Space Manager',
};

const DEFAULT_SESSION: SessionState = {
  loggedIn: false,
  role: 'fm_manager',
};

const AuthContext = createContext<AuthContextType>({
  loggedIn: false,
  role: 'fm_manager',
  roleLabel: ROLE_LABELS.fm_manager,
  roleOptions: [
    { id: 'fm_manager', label: ROLE_LABELS.fm_manager },
    { id: 'supervisor', label: ROLE_LABELS.supervisor },
    { id: 'technician', label: ROLE_LABELS.technician },
    { id: 'space_manager', label: ROLE_LABELS.space_manager },
  ],
  login: () => false,
  logout: () => {},
  setRole: () => {},
});

const parseSession = (raw: string | null): SessionState => {
  if (!raw) {
    return DEFAULT_SESSION;
  }

  try {
    const parsed = JSON.parse(raw) as SessionState;
    if (
      typeof parsed.loggedIn === 'boolean' &&
      typeof parsed.role === 'string' &&
      Object.prototype.hasOwnProperty.call(ROLE_LABELS, parsed.role)
    ) {
      return parsed;
    }
  } catch {
    return DEFAULT_SESSION;
  }

  return DEFAULT_SESSION;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(() => parseSession(localStorage.getItem(SESSION_KEY)));

  const login = (username: string, password: string) => {
    if (username === CREDS.u && password === CREDS.p) {
      const nextSession: SessionState = { loggedIn: true, role: 'fm_manager' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(DEFAULT_SESSION);
  };

  const setRole = (role: UserRole) => {
    setSession((current) => {
      const nextSession = { ...current, role };
      if (nextSession.loggedIn) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      }
      return nextSession;
    });
  };

  const value = useMemo<AuthContextType>(
    () => ({
      loggedIn: session.loggedIn,
      role: session.role,
      roleLabel: ROLE_LABELS[session.role],
      roleOptions: [
        { id: 'fm_manager', label: ROLE_LABELS.fm_manager },
        { id: 'supervisor', label: ROLE_LABELS.supervisor },
        { id: 'technician', label: ROLE_LABELS.technician },
        { id: 'space_manager', label: ROLE_LABELS.space_manager },
      ],
      login,
      logout,
      setRole,
    }),
    [session.loggedIn, session.role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
