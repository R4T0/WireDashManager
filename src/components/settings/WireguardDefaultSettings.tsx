
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase';

// Interface for default wireguard settings
interface WireguardDefaults {
  endpoint: string;
  port: string;
  allowedIpRange: string;
  dns: string;
}

const WireguardDefaultSettings = () => {
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [defaults, setDefaults] = useState<WireguardDefaults>({
    endpoint: '',
    port: '51820',
    allowedIpRange: '10.0.0.0/24',
    dns: '1.1.1.1'
  });

  useEffect(() => {
    // Load wireguard defaults on component mount
    loadDefaultsFromSupabase();
  }, []);

  const loadDefaultsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('wireguard_defaults')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        console.error('Error loading defaults:', error);
        return;
      }

      if (data) {
        setDefaults({
          endpoint: data.endpoint || '',
          port: data.port || '51820',
          allowedIpRange: data.allowed_ip_range || '10.0.0.0/24',
          dns: data.dns || '1.1.1.1'
        });
      }
    } catch (error) {
      console.error('Failed to load defaults from Supabase:', error);
    }
  };

  const updateDefaults = (key: keyof WireguardDefaults, value: string) => {
    setDefaults(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDefaults = async () => {
    setSavingDefaults(true);
    try {
      // Check if any record exists
      const { data: existingRecords, error: fetchError } = await supabase
        .from('wireguard_defaults')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error checking existing defaults:', fetchError);
        toast.error('Falha ao verificar configurações existentes');
        return;
      }

      const defaultsData = {
        endpoint: defaults.endpoint,
        port: defaults.port,
        allowed_ip_range: defaults.allowedIpRange,
        dns: defaults.dns
      };

      if (existingRecords && existingRecords.length > 0) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('wireguard_defaults')
          .update(defaultsData)
          .eq('id', existingRecords[0].id);
        
        if (updateError) {
          console.error('Error updating defaults:', updateError);
          toast.error('Falha ao atualizar configurações padrão');
          return;
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('wireguard_defaults')
          .insert(defaultsData);
        
        if (insertError) {
          console.error('Error inserting defaults:', insertError);
          toast.error('Falha ao salvar configurações padrão');
          return;
        }
      }

      toast.success('Configurações padrão salvas com sucesso');
    } catch (error) {
      console.error('Failed to save defaults:', error);
      toast.error('Falha ao salvar configurações padrão');
    } finally {
      setSavingDefaults(false);
    }
  };

  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader>
        <CardTitle>Configuração Padrão</CardTitle>
        <CardDescription>
          Configure os valores padrão para novos peers e interfaces
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="form-label">
                Endpoint Padrão
              </label>
              <Input
                placeholder="vpn.example.com"
                className="form-input"
                value={defaults.endpoint}
                onChange={(e) => updateDefaults('endpoint', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">
                Porta Padrão
              </label>
              <Input
                placeholder="51820"
                className="form-input"
                value={defaults.port}
                onChange={(e) => updateDefaults('port', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="form-label">
                Range de IPs Permitidos
              </label>
              <Input
                placeholder="10.0.0.0/24"
                className="form-input"
                value={defaults.allowedIpRange}
                onChange={(e) => updateDefaults('allowedIpRange', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">
                DNS do Cliente
              </label>
              <Input
                placeholder="1.1.1.1"
                className="form-input"
                value={defaults.dns}
                onChange={(e) => updateDefaults('dns', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              className="primary-button"
              onClick={handleSaveDefaults}
              disabled={savingDefaults}
            >
              <Save className="mr-2 h-4 w-4" />
              {savingDefaults ? 'Salvando...' : 'Salvar Configurações Padrão'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WireguardDefaultSettings;
