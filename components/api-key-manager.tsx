'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Plus, Trash2, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

type ApiKey = {
  id: string;
  provider: string;
  name: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
  projects?: {
    id: string;
    name: string;
  };
};

// Map of provider IDs to display names
const providerNames: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
  azure_openai: 'Azure OpenAI',
  cohere: 'Cohere',
};

// Map of provider IDs to colors
const providerColors: Record<string, string> = {
  openai: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  anthropic: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  gemini: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  azure_openai: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  cohere: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch API keys');
      }
      
      setApiKeys(data.keys || []);
    } catch (err: any) {
      console.error('Error fetching API keys:', err);
      setError(err.message || 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/keys?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete API key');
      }
      
      // Remove the key from the state
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been successfully deleted.',
      });
    } catch (err: any) {
      console.error('Error deleting API key:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete API key',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getDisplayName = (provider: string): string => {
    return providerNames[provider] || provider;
  };

  const getBadgeClass = (provider: string): string => {
    return providerColors[provider] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your API Keys</h3>
        <Link href="/add-api-key">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New API Key
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : apiKeys.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <Key className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No API Keys Yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your first API key to start monitoring usage
              </p>
              <Link href="/add-api-key">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add API Key
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {apiKeys.map((key) => (
            <Card key={key.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{key.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Added on {new Date(key.created_at).toLocaleDateString()}
                      {key.projects && <> · Project: {key.projects.name}</>}
                    </CardDescription>
                  </div>
                  <Badge className={`${getBadgeClass(key.provider)} text-xs font-medium px-2`}>
                    {getDisplayName(key.provider)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-3">
                    <div className="flex space-x-1">
                      <span className="text-muted-foreground">•••••••••••••••••</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => deleteApiKey(key.id)}
                      disabled={deletingId === key.id}
                    >
                      {deletingId === key.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 