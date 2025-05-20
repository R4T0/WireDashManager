
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCw, Download, X } from 'lucide-react';
import logger from '@/services/loggerService';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'info' | 'error' | 'warn' | 'debug'>('all');
  
  useEffect(() => {
    // Refresh logs every 2 seconds
    const intervalId = setInterval(() => {
      refreshLogs();
    }, 2000);
    
    // Initial load
    refreshLogs();
    
    return () => clearInterval(intervalId);
  }, []);
  
  const refreshLogs = () => {
    setLogs(logger.getLogs());
  };
  
  const clearLogs = () => {
    logger.clearLogs();
    refreshLogs();
  };
  
  const downloadLogs = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message} ${log.data ? JSON.stringify(log.data) : ''}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wireguard-manager-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const filteredLogs = logs.filter(log => {
    if (activeTab === 'all') return true;
    return log.level === activeTab;
  });
  
  const getLogColorClass = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-gray-400';
      default: return '';
    }
  };
  
  return (
    <Card className="mt-6 bg-wireguard-muted/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Logs</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={refreshLogs}>
            <RotateCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="error">Errors</TabsTrigger>
            <TabsTrigger value="warn">Warnings</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-0">
            <div className="bg-black/80 text-white p-4 rounded-md h-80 overflow-y-auto font-mono text-sm">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-gray-500">{log.timestamp.toISOString().replace('T', ' ').substring(0, 19)}</span>
                    <span className={`ml-2 ${getLogColorClass(log.level)}`}>[{log.level.toUpperCase()}]</span>
                    <span className="ml-2">{log.message}</span>
                    {log.data && (
                      <pre className="ml-8 text-xs text-gray-400 whitespace-pre-wrap">
                        {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center mt-10">No logs available</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LogViewer;
