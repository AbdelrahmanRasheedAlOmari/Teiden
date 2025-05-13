'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Key, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

type ApiKey = {
  id: string;
  provider: string;
  name: string;
  maskedKey?: string;
  created_at: string;
  updated_at: string;
};

type ApiKeyListProps = {
  selectedProject: Project | null;
};

export function ApiKeyList({ selectedProject }: ApiKeyListProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});

  // Fetch API keys when the selected project changes
  useEffect(() => {
    if (selectedProject) {
      fetchApiKeys();
    } else {
      setApiKeys([]);
    }
  }, [selectedProject]);

  const fetchApiKeys = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}/keys`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch API keys');
      }

      setApiKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDetails = async (key: ApiKey) => {
    try {
      const response = await fetch(`/api/projects/${selectedProject!.id}/keys/${key.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch API key details');
      }

      setSelectedKey(data.key);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching key details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API key details',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteKey = async (key: ApiKey) => {
    if (!confirm(`Are you sure you want to delete the API key for ${key.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${selectedProject!.id}/keys?id=${key.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete API key');
      }

      // Remove the key from the list
      setApiKeys(apiKeys.filter(k => k.id !== key.id));
      
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  const toggleMasked = (keyId: string) => {
    setShowMasked(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getProviderLabel = (provider: string) => {
    const providerMap: Record<string, string> = {
      'openai': 'OpenAI',
      'anthropic': 'Anthropic',
      'gemini': 'Google Gemini',
      'azure_openai': 'Azure OpenAI',
      'cohere': 'Cohere',
    };
    
    return providerMap[provider] || provider;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your stored API keys
          </CardDescription>
        </div>
        {selectedProject && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchApiKeys}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!selectedProject ? (
          <div className="text-center py-6 text-muted-foreground">
            Please select a project to view its API keys
          </div>
        ) : isLoading && apiKeys.length === 0 ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No API keys found for this project
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {getProviderLabel(key.provider)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(key.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleKeyDetails(key)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKey(key)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Key Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Details</DialogTitle>
              <DialogDescription>
                Viewing details for {selectedKey?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedKey && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Provider</p>
                  <Badge variant="outline" className="font-mono">
                    {getProviderLabel(selectedKey.provider)}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">API Key (Masked)</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleMasked(selectedKey.id)}
                    >
                      {showMasked[selectedKey.id] ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <div className="p-2 rounded-md bg-muted font-mono text-xs break-all">
                    {showMasked[selectedKey.id] ? (
                      <span>{selectedKey.maskedKey}</span>
                    ) : (
                      <span>••••••••••••••••••••••••</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Added On</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedKey.created_at)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedKey.updated_at)}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 text-xs text-muted-foreground border-t">
                  <p>For security reasons, full API keys are never exposed. Only a masked version is shown.</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 