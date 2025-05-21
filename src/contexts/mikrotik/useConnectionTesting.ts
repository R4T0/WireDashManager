
import { toast } from '@/components/ui/sonner';
import logger from '@/services/loggerService';
import { MikrotikConfig } from './types';

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
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setIsConnected(true);
          logger.request(`Connection test successful`, { 
            status: response.status, 
            data: await response.json() 
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

  return { testConnection };
};
