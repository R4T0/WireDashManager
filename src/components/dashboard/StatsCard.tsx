
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, title, value, isLoading }) => {
  return (
    <Card className="bg-wireguard-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Icon className="mr-2 h-5 w-5 text-wireguard-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {isLoading && <div className="text-xs text-wireguard-muted-foreground mt-1">Carregando...</div>}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
