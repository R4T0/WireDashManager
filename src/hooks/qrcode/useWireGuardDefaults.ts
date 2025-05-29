
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import logger from '@/services/loggerService';

export interface QRCodeDefaults {
  endpoint: string;
  port: string;
  dns: string;
  allowedIpRange: string;
}

export const useWireGuardDefaults = () => {
  const [defaults, setDefaults] = useState<QRCodeDefaults>({
    endpoint: 'vpn.example.com',
    port: '51820',
    dns: '1.1.1.1',
    allowedIpRange: '10.0.0.0/24'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDefaultsFromSupabase();
  }, []);

  const loadDefaultsFromSupabase = async () => {
    try {
      logger.info("Loading WireGuard defaults from Supabase");
      setLoading(true);
      
      const result = await supabase
        .from('wireguard_defaults')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (result.error && result.error.code !== 'PGRST116') {
        logger.error('Error loading defaults:', result.error);
        return;
      }

      if (result.data) {
        logger.info("Loaded defaults from Supabase", result.data);
        setDefaults({
          endpoint: result.data.endpoint || 'vpn.example.com',
          port: result.data.port || '51820',
          dns: result.data.dns || '1.1.1.1',
          allowedIpRange: result.data.allowed_ip_range || '10.0.0.0/24'
        });
      } else {
        logger.warn("No defaults found in Supabase");
      }
    } catch (error) {
      logger.error('Failed to load defaults from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  return { defaults, loading };
};
