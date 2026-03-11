import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = {
  admin: { password: 'admin123', role: 'admin' },
  customer: { password: 'customer123', role: 'customer' },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  const login = (username, password, role) => {
    if (!username || !password || !role) {
      return { success: false, error: 'Please fill all fields' };
    }
    const user = DEMO_USERS[username];
    if (!user || user.password !== password || user.role !== role) {
      return { success: false, error: 'Invalid credentials' };
    }
    setCurrentUser(username);
    setCurrentRole(role);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, login, logout, isLoggedIn: !!currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
