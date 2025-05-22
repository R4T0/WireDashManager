
import { toast } from '@/components/ui/sonner';
import MikrotikApi from '@/services/mikrotikService';
import { WireguardPeer } from '@/services/mikrotik/types';
import { MikrotikConfig } from '@/services/mikrotik/types';
import { PeerFormData } from './types';
import { generateKeys } from '@/services/mikrotik/utils';
import logger from '@/services/loggerService';

export const usePeerCrud = (
  config: MikrotikConfig, 
  setPeers: React.Dispatch<React.SetStateAction<WireguardPeer[]>>
) => {
  const createPeer = async (formData: PeerFormData): Promise<boolean> => {
    try {
      const api = new MikrotikApi(config);
      
      // Generate WireGuard keypair for new peer
      const keys = await generateKeys();
      logger.info('Generated WireGuard keys for new peer');
      
      // Preparar os dados para API no formato correto
      const peerData = {
        "interface": formData.interface,
        "public-key": keys.publicKey,
        "allowed-address": formData.allowedAddress,
        "endpoint-address": formData.endpoint || "",
        "endpoint-port": formData.endpointPort,
        "name": formData.name,
        "persistent-keepalive": "25",
        "disabled": formData.disabled ? "true" : "false"
      };
      
      logger.info('Creating new peer with data:', peerData);
      const newPeer = await api.createPeer(peerData);
      
      // Adicionar o novo peer à lista
      setPeers(prev => [...prev, {
        ...newPeer,
        id: newPeer.id,
        name: formData.name,
        interface: formData.interface,
        allowedAddress: formData.allowedAddress,
        endpoint: formData.endpoint,
        endpointPort: formData.endpointPort,
        publicKey: keys.publicKey,
        disabled: formData.disabled
      } as WireguardPeer]);
      
      toast.success('Peer criado com sucesso');
      return true;
    } catch (error) {
      console.error('Failed to create peer:', error);
      toast.error('Falha ao criar peer');
      return false;
    }
  };

  const updatePeer = async (selectedPeerId: string, formData: PeerFormData): Promise<boolean> => {
    try {
      const api = new MikrotikApi(config);
      
      // Preparar os dados para API no formato correto
      const peerData = {
        name: formData.name,
        interface: formData.interface,
        "allowed-address": formData.allowedAddress,
        "endpoint-address": formData.endpoint,
        "endpoint-port": formData.endpointPort,
        "disabled": formData.disabled ? "true" : "false",
        // Manter a chave pública original
        "public-key": formData.publicKey || ''
      };
      
      logger.info('Updating peer with data:', peerData);
      await api.updatePeer(selectedPeerId, peerData);
      
      // Atualizar a lista de peers
      setPeers(prev => prev.map(peer => 
        peer.id === selectedPeerId ? { 
          ...peer, 
          name: formData.name,
          interface: formData.interface,
          allowedAddress: formData.allowedAddress,
          endpoint: formData.endpoint,
          endpointPort: formData.endpointPort,
          publicKey: peerData["public-key"],
          disabled: formData.disabled
        } : peer
      ));
      
      toast.success('Peer atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Failed to update peer:', error);
      toast.error('Falha ao atualizar peer');
      return false;
    }
  };

  const deletePeer = async (id: string): Promise<boolean> => {
    if (!window.confirm('Tem certeza que deseja excluir este peer?')) {
      return false;
    }
    
    try {
      const api = new MikrotikApi(config);
      await api.deletePeer(id);
      setPeers(prev => prev.filter(peer => peer.id !== id));
      toast.success('Peer excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Failed to delete peer:', error);
      toast.error('Falha ao excluir peer');
      return false;
    }
  };

  return {
    createPeer,
    updatePeer,
    deletePeer
  };
};
