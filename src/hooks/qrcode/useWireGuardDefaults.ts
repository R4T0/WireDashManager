
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/services/loggerService';

export interface QRCodeDefaults {
  endpoint: string;
  port: string;
  dns: string;
  allowedIpRange: string; // Added this missing property
}

export const useWireGuardDefaults = () => {
  const [defaults, setDefaults] = useState<QRCodeDefaults>({
    endpoint: 'vpn.example.com',
    port: '51820',
    dns: '1.1.1.1',
    allowedIpRange: '10.0.0.0/24' // Add default value
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDefaultsFromSupabase();
  }, []);

  const loadDefaultsFromSupabase = async () => {
    try {
      logger.info("Loading WireGuard defaults from Supabase");
      setLoading(true);
      
      const { data, error } = await supabase
        .from('wireguard_defaults')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        logger.error('Error loading defaults:', error);
        return;
      }

      if (data) {
        logger.info("Loaded defaults from Supabase", data);
        setDefaults({
          endpoint: data.endpoint || 'vpn.example.com',
          port: data.port || '51820',
          dns: data.dns || '1.1.1.1',
          allowedIpRange: data.allowed_ip_range || '10.0.0.0/24' // Map to the database field
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
