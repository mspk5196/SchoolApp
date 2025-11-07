import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './ApiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await ApiService.isAuthenticated();
      if (isAuth) {
        // Try to get user profile
        const response = await ApiService.getProfile();
        if (response.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token might be invalid, clear it
          await ApiService.clearTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await ApiService.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Save user details to AsyncStorage (for backward compatibility)
        await AsyncStorage.setItem('userName', response.data.user.name);
        await AsyncStorage.setItem('userPhone', response.data.user.phone);
        await AsyncStorage.setItem('userEmail', response.data.user.email || '');
        await AsyncStorage.setItem('userRoles', JSON.stringify(response.data.user.role.split(', ')));
        await AsyncStorage.setItem('userLoginMethod', 'jwt');
        
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      throw error;
    }
  };


  const logout = async () => {
    try {
      await ApiService.logout();
      
      // Clear user data from AsyncStorage
      await AsyncStorage.clear();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
