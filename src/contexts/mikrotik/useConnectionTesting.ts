
import { toast } from '@/components/ui/sonner';
import logger from '@/services/loggerService';
import { MikrotikConfig } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useConnectionTesting = (
  config: MikrotikConfig, 
  setIsConnected: (value: boolean) => void
) => {
  const testConnection = async (): Promise<boolean> => {
    try {
      // Validate required fields first
      if (!config.address || !config.username || !config.password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return false;
      }
      
      // Construir a URL do router Mikrotik
      const protocol = config.useHttps ? 'https' : 'http';
      const url = `${protocol}://${config.address}${config.port ? `:${config.port}` : ''}/rest/system/resource`;
      
      const authHeader = 'Basic ' + btoa(`${config.username}:${config.password}`);
      
      // Log the request attempt
      logger.request(`Testing connection to Mikrotik router via proxy`, { 
        url, 
        method: 'GET', 
        useHttps: config.useHttps 
      });
      
      try {
        // Usar a edge function como proxy para evitar problemas de CORS e Mixed Content
        const { data, error } = await supabase.functions.invoke('mikrotik-proxy', {
          body: {
            url,
            method: 'GET',
            headers: {
              'Authorization': authHeader,
              'Accept': '*/*',
              'User-Agent': 'wireguard-manager/1.0'
            }
          }
        });

        if (error) {
          logger.request(`Proxy request failed`, { error });
          setIsConnected(false);
          toast.error(`Falha na conexão: ${error.message}`);
          return false;
        }
        
        if (data && data.status === 200) {
          setIsConnected(true);
          logger.request(`Connection test successful via proxy`, { 
            status: data.status, 
            data: data.body 
          });
          toast.success('Conexão estabelecida com sucesso');
          return true;
        } else {
          setIsConnected(false);
          logger.request(`Connection test failed via proxy`, { 
            status: data?.status, 
            statusText: data?.statusText 
          });
          toast.error(`Falha na conexão: Status ${data?.status || 'desconhecido'}`);
          return false;
        }
      } catch (error) {
        logger.request(`Connection test error via proxy`, { 
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

  return { testConnection };
};
