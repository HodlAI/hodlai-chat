// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import axios from 'axios';

const API_BASE = 'https://gw.hodlai.fun';

interface UserData {
  key?: string;
  balance?: string;
  dailyQuota?: number;
  remainQuota?: number;
  usedQuota?: number;
  quotaInfo?: {
    status: string;
    releasePercent: number;
    isDiamondHands: boolean;
    hasEverSold: boolean;
  };
}

export const useAuth = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load session from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hodlai_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.address === address) {
        setUserData(parsed.data);
      }
    }
  }, [address]);

  // Save session
  useEffect(() => {
    if (userData && address) {
      localStorage.setItem('hodlai_session', JSON.stringify({
        address,
        data: userData,
        timestamp: Date.now()
      }));
    }
  }, [userData, address]);

  const login = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      // 1. Get nonce/message
      const { data: msgData } = await axios.post(`${API_BASE}/api/auth/message`, { address });
      if (!msgData.success) throw new Error(msgData.error);
      
      // 2. Sign message
      const signature = await signMessageAsync({ message: msgData.data.message });
      
      // 3. Verify & Login
      const { data: authData } = await axios.post(`${API_BASE}/api/auth/verify`, {
        address,
        message: msgData.data.message,
        signature
      });
      
      if (!authData.success) throw new Error(authData.error);
      
      setUserData(authData.data.token);
    } catch (err) {
      console.error('Login failed:', err);
      // Optional: Add toast error here
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync]);

  const refreshUserData = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/refresh`, { 
        address,
        forceRefresh: true 
      });
      
      if (data.success && data.data) {
        setUserData(prev => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // Auto-login if connected but no data
  useEffect(() => {
    if (isConnected && address && !userData && !isLoading) {
      // Check if we have valid cached data first to avoid unnecessary signing
      const saved = localStorage.getItem('hodlai_session');
      let hasValidSession = false;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address === address) {
          hasValidSession = true;
          // Background refresh
          refreshUserData();
        }
      }
      
      if (!hasValidSession) {
        login();
      }
    }
  }, [isConnected, address, userData, isLoading, login, refreshUserData]);

  const regenerateKey = async () => {
     if (!address) return;
     if (!confirm('Are you sure? Old key will be invalid.')) return;
     
     setIsLoading(true);
     try {
       const { data: msgData } = await axios.post(`${API_BASE}/api/auth/message`, { address });
       const signature = await signMessageAsync({ message: msgData.data.message });
       
       const { data } = await axios.post(`${API_BASE}/api/regenerate-key`, {
         address,
         message: msgData.data.message,
         signature
       });
       
       if (data.success) {
         setUserData(prev => prev ? ({ ...prev, key: data.data.key }) : null);
       }
     } catch (err) {
       console.error(err);
     } finally {
       setIsLoading(false);
     }
  };

  return {
    isLoggedIn: !!userData,
    isLoading,
    login,
    regenerateKey,
    refreshUserData,
    apiKey: userData?.key,
    balance: userData?.balance,
    dailyQuota: userData?.dailyQuota,
    remainQuota: userData?.remainQuota,
    usedQuota: userData?.usedQuota,
    quotaInfo: userData?.quotaInfo
  };
};
