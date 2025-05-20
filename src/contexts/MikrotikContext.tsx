
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';

interface MikrotikConfig {
  address: string;
  port: string;
  username: string;
  password: string;
  useHttps: boolean;
}

interface MikrotikContextType {
  config: MikrotikConfig;
  updateConfig: (newConfig: Partial<MikrotikConfig>) => void;
  saveConfig: () => void;
  testConnection: () => Promise<boolean>;
  isConfigured: boolean;
  isConnected: boolean;
}

const defaultConfig: MikrotikConfig = {
  address: '',
  port: '8728',
  username: '',
  password: '',
  useHttps: false,
};

const MikrotikContext = createContext<MikrotikContextType | undefined>(undefined);

export const MikrotikProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MikrotikConfig>(() => {
    const savedConfig = localStorage.getItem('mikrotikConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    setIsConfigured(Boolean(config.address && config.username && config.password));
  }, [config]);

  const updateConfig = (newConfig: Partial<MikrotikConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const saveConfig = () => {
    localStorage.setItem('mikrotikConfig', JSON.stringify(config));
    toast.success('Configurações salvas com sucesso');
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      // In a real application, we would make an actual API call here
      // For this demo, we'll simulate a successful connection if the config is valid
      if (!config.address || !config.username || !config.password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return false;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConnected(true);
      toast.success('Conexão estabelecida com sucesso');
      return true;
    } catch (error) {
      setIsConnected(false);
      toast.error('Falha ao conectar com o roteador Mikrotik');
      return false;
    }
  };

  return (
    <MikrotikContext.Provider value={{ 
      config, 
      updateConfig, 
      saveConfig, 
      testConnection, 
      isConfigured,
      isConnected 
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
