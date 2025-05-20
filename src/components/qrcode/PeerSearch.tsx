
import React from 'react';
import { Search } from 'lucide-react';
import { WireguardPeer } from '@/services/mikrotikService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PeerSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPeers: WireguardPeer[];
  selectedPeer: WireguardPeer | null;
  handlePeerSelect: (peerId: string) => void;
  loading: boolean;
}

const PeerSearch: React.FC<PeerSearchProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  filteredPeers, 
  selectedPeer, 
  handlePeerSelect,
  loading 
}) => {
  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader>
        <CardTitle>Search Peer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Enter peer name...</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-wireguard-muted-foreground" />
              <Input
                id="search"
                placeholder="Enter peer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="peer-select">Select Peer</Label>
            <Select
              value={selectedPeer?.id || ''}
              onValueChange={handlePeerSelect}
              disabled={loading || filteredPeers.length === 0}
            >
              <SelectTrigger id="peer-select">
                <SelectValue placeholder="Select a peer" />
              </SelectTrigger>
              <SelectContent>
                {filteredPeers.map((peer) => (
                  <SelectItem key={peer.id} value={peer.id}>
                    {peer.name} ({peer.interface})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPeer && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-wireguard-muted-foreground">Peer Information</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-wireguard-muted-foreground">Name:</div>
                <div className="text-right">{selectedPeer.name}</div>
                
                <div className="text-wireguard-muted-foreground">Interface:</div>
                <div className="text-right">{selectedPeer.interface}</div>
                
                <div className="text-wireguard-muted-foreground">Created:</div>
                <div className="text-right">May 20, 2025</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PeerSearch;
