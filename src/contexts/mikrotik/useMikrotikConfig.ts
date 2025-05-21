
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/services/loggerService';
import { MikrotikConfig } from './types';

const defaultConfig: MikrotikConfig = {
  address: '',
  port: '8728',
  username: '',
  password: '',
  useHttps: false,
};

export const useMikrotikConfig = () => {
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

  return {
    config,
    updateConfig,
    saveConfig,
    isConnected,
    isConfigured,
    configId,
    setIsConnected
  };
};
