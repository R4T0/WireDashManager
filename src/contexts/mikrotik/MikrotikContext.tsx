
import React, { createContext, useContext } from 'react';
import { useMikrotikConfig } from './useMikrotikConfig';
import { useConnectionTesting } from './useConnectionTesting';
import { MikrotikContextType } from './types';

const MikrotikContext = createContext<MikrotikContextType | undefined>(undefined);

export const MikrotikProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    config, 
    updateConfig, 
    saveConfig, 
    isConnected, 
    isConfigured, 
    configId,
    setIsConnected
  } = useMikrotikConfig();
  
  const { testConnection } = useConnectionTesting(config, setIsConnected);

  return (
    <MikrotikContext.Provider value={{ 
      config, 
      updateConfig, 
      saveConfig, 
      testConnection, 
      isConfigured,
      isConnected,
      configId
    }}>
      {children}
    </MikrotikContext.Provider>
  );
};

export const useMikrotik = () => {
  const context = useContext(MikrotikContext);
  if (context === undefined) {
    throw new Error('useMikrotik must be used within a MikrotikProvider');
  }
  return context;
};
