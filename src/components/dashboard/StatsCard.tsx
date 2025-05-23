
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
    <Card className="bg-wireguard-muted/50 h-full flex flex-col">
      <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
        <CardTitle className="text-base md:text-lg font-medium flex items-center">
          <Icon className="mr-1.5 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-wireguard-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0 flex-1 flex flex-col justify-center">
        <div className="text-2xl md:text-3xl font-bold">{value}</div>
        {isLoading && <div className="text-xs text-wireguard-muted-foreground mt-1">Carregando...</div>}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
