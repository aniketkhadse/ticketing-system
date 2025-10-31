import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://ticketing-system-production-9023.up.railway.app/';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (userType === 'admin') {
        const adminData = JSON.parse(localStorage.getItem('admin'));
        setAdmin(adminData);
      } else {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userType', 'user');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(user);
    return response.data;
  };

  const adminLogin = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/admin-login`, { email, password });
    const { token, admin } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(admin));
    localStorage.setItem('userType', 'admin');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setAdmin(admin);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    localStorage.removeItem('userType');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAdmin(null);
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    return response.data;
  };

  const verifyOTP = async (userId, otp) => {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { userId, otp });
    return response.data;
  };

  const resendOTP = async (userId) => {
    const response = await axios.post(`${API_URL}/auth/resend-otp`, { userId });
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  };

  const resetPassword = async (token, password) => {
    const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
    return response.data;
  };

  const value = {
    user,
    admin,
    loading,
    login,
    adminLogin,
    logout,
    register,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user || !!admin,
    isAdmin: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};