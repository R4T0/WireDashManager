import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/services/loggerService';

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
  configId: string | null;
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
  const [configId, setConfigId] = useState<string | null>(null);

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
        setConfigId(data.id);
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
      if (configId) {
        // Update existing record
        const { error } = await supabase
          .from('mikrotik_config')
          .update({
            address: config.address,
            port: config.port,
            username: config.username,
            password: config.password,
            use_https: config.useHttps,
          })
          .eq('id', configId);

        if (error) {
          console.error('Error updating config:', error);
          toast.error('Falha ao atualizar configurações');
          return;
        }
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('mikrotik_config')
          .insert({
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
        
        if (data && data.length > 0) {
          setConfigId(data[0].id);
        }
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
      // Validate required fields first
      if (!config.address || !config.username || !config.password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return false;
      }
      
      // Make an actual API call to the system resource endpoint
      const protocol = config.useHttps ? 'https' : 'http';
      const url = `${protocol}://${config.address}${config.port ? `:${config.port}` : ''}/rest/system/resource`;
      
      const authHeader = 'Basic ' + btoa(`${config.username}:${config.password}`);
      
      // Log the request attempt
      logger.request(`Testing connection to Mikrotik router`, { 
        url, 
        method: 'GET', 
        useHttps: config.useHttps 
      });
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Accept': '*/*',
            'User-Agent': 'wireguard-manager/1.0'
          }
        });
        
        if (response.status === 200) {
          setIsConnected(true);
          const responseData = await response.json();
          logger.request(`Connection test successful`, { 
            status: response.status, 
            data: responseData 
          });
          toast.success('Conexão estabelecida com sucesso');
          return true;
        } else {
          setIsConnected(false);
          logger.request(`Connection test failed`, { 
            status: response.status, 
            statusText: response.statusText 
          });
          toast.error(`Falha na conexão: Status ${response.status}`);
          return false;
        }
      } catch (error) {
        logger.request(`Connection test error`, { 
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      logger.error('Connection test failed with exception', { 
        error: error instanceof Error ? error.message : String(error)
      });
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
