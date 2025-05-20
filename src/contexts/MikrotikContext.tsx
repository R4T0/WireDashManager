
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

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
  saveConfig: () => Promise<void>;
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
  const [config, setConfig] = useState<MikrotikConfig>(defaultConfig);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Load config from Supabase on component mount
    loadConfigFromSupabase();
  }, []);

  useEffect(() => {
    setIsConfigured(Boolean(config.address && config.username && config.password));
  }, [config]);

  const loadConfigFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('mikrotik_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading config:', error);
        return;
      }

      if (data) {
        setConfig({
          address: data.address,
          port: data.port,
          username: data.username,
          password: data.password,
          useHttps: data.use_https || false,
        });
      }
    } catch (error) {
      console.error('Failed to load config from Supabase:', error);
    }
  };

  const updateConfig = (newConfig: Partial<MikrotikConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const saveConfig = async () => {
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('mikrotik_config')
        .upsert({
          address: config.address,
          port: config.port,
          username: config.username,
          password: config.password,
          use_https: config.useHttps,
        })
        .select();

      if (error) {
        console.error('Error saving config:', error);
        toast.error('Falha ao salvar configurações');
        return;
      }

      // Also save to localStorage as backup
      localStorage.setItem('mikrotikConfig', JSON.stringify(config));
      toast.success('Configurações salvas com sucesso');
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('Falha ao salvar configurações');
    }
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
