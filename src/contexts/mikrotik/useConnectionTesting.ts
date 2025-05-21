import { toast } from '@/components/ui/sonner';
import logger from '@/services/loggerService';
import { MikrotikConfig } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useConnectionTesting = (
  config: MikrotikConfig, 
  setIsConnected: (value: boolean) => void
) => {
  const testConnection = async (useProxy: boolean = true): Promise<boolean> => {
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
        useHttps: config.useHttps,
        useProxy
      });
      
      let responseStatus: number;
      let responseData: any;
      
      if (useProxy) {
        // Use the Edge Function proxy
        const { data, error } = await supabase.functions.invoke('mikrotik-proxy', {
          body: {
            url,
            method: 'GET',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            }
          }
        });
        
        if (error) {
          throw new Error(`Proxy request failed: ${error.message}`);
        }
        
        responseStatus = data.status;
        responseData = data.data;
        
        // Log successful proxy response
        logger.info('Proxy connection test result', { status: responseStatus });
      } else {
        // Direct connection
        try {
          const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
          
          responseStatus = response.status;
          responseData = await response.json();
          
          // Log successful direct response
          logger.info('Direct connection test result', { status: responseStatus });
        } catch (error) {
          // Check if the error is related to CORS
          if (error instanceof TypeError && error.message.includes('NetworkError') || 
              error instanceof DOMException && error.message.includes('CORS')) {
            logger.request(`CORS error detected`, { 
              error: error instanceof Error ? error.message : String(error)
            });
            
            toast.error('Erro de CORS: O servidor não permite requisições do navegador. Tente usar o modo proxy.');
            console.error('CORS error:', error);
          } else {
            logger.request(`Connection test error`, { 
              error: error instanceof Error ? error.message : String(error)
            });
          }
          throw error;
        }
      }
      
      // Process the response
      if (responseStatus >= 200 && responseStatus < 300) {
        setIsConnected(true);
        logger.request(`Connection test successful`, { 
          status: responseStatus, 
          data: responseData 
        });
        toast.success('Conexão estabelecida com sucesso');
        return true;
      } else {
        setIsConnected(false);
        logger.request(`Connection test failed`, { 
          status: responseStatus
        });
        toast.error(`Falha na conexão: Status ${responseStatus}`);
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      logger.error('Connection test failed with exception', { 
        error: error instanceof Error ? error.message : String(error)
      });
      setIsConnected(false);
      
      // Provide more specific error message based on what failed
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        toast.error('Erro de CORS: Verifique se o servidor permite requisições externas ou use o modo proxy');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Não foi possível conectar ao roteador. Verifique o endereço e a porta');
      } else if (error instanceof TypeError && error.message.includes('Mixed Content')) {
        toast.error('Erro de conteúdo misto: Tentando acessar HTTP a partir de HTTPS. Use o modo proxy');
      } else {
        toast.error('Falha ao conectar com o roteador Mikrotik');
      }
      
      // Add a debug tab to the settings page to show the actual error
      logger.debug('Connection error details', { 
        url: `${config.useHttps ? 'https' : 'http'}://${config.address}${config.port ? `:${config.port}` : ''}/rest/system/resource`,
        error: error instanceof Error ? error.message : String(error),
        browserInfo: navigator.userAgent
      });
      
      return false;
    }
  };

  return { testConnection };
};
