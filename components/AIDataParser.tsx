import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

const AIDataParser = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modificationQuery, setModificationQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [modificationSuggestion, setModificationSuggestion] = useState<any>(null);
  const { toast } = useToast();

  const handleNaturalLanguageSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsProcessing(true);
    try {
      const sampleDataStructure = {
        tasks: { TaskID: 'string', Duration: 'number', PreferredPhases: 'string' },
        clients: { ClientID: 'string', PriorityLevel: 'number' },
        workers: { WorkerID: 'string', Skills: 'string' }
      };

      const filterConfig = await aiService.parseSearchQuery(searchQuery, sampleDataStructure);

      setSearchResults([{ message: 'Search configured', filters: filterConfig.filters }]);

      toast({
        title: 'Search Processed',
        description: `Found ${filterConfig.filters.length} filter condition(s)`,
      });
    } catch (error) {
      toast({
        title: 'Search Failed',
        description: 'Could not process the search query',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNaturalLanguageModification = async () => {
    if (!modificationQuery.trim()) return;

    setIsProcessing(true);
    try {
      const sampleDataStructure = {
        tasks: { TaskID: 'string', Duration: 'number', PreferredPhases: 'string' },
        clients: { ClientID: 'string', PriorityLevel: 'number' },
        workers: { WorkerID: 'string', Skills: 'string' }
      };

      const modification = await aiService.parseModificationQuery(modificationQuery, sampleDataStructure);

      if (modification.confidence > 0.8) {
        setModificationSuggestion(modification);
        toast({
          title: 'Modification Suggestion Ready',
          description: `Confidence: ${Math.round(modification.confidence * 100)}%`,
        });
      } else {
        toast({
          title: 'Low Confidence',
          description: 'Please rephrase your modification request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Modification Failed',
        description: 'Could not process the modification request',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Search */}
      <Card>
        <CardHeader>
          <CardTitle>Natural Language Data Search</CardTitle>
          <CardDescription>
            Search your data using plain English queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., 'All tasks having a Duration of more than 1 phase and having phase 2 in their Preferred Phases list'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleNaturalLanguageSearch}
              disabled={!searchQuery.trim() || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Search Data'}
            </Button>

            {searchResults.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Search Configuration:</h4>
                <pre className="text-sm text-gray-600">
                  {JSON.stringify(searchResults[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Natural Language Modifications */}
      <Card>
        <CardHeader>
          <CardTitle>Natural Language Data Modification</CardTitle>
          <CardDescription>
            Describe changes you want to make in plain English
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., 'Set all high priority clients to priority level 5' or 'Add Frontend skill to all UI developers'"
              value={modificationQuery}
              onChange={(e) => setModificationQuery(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleNaturalLanguageModification}
              disabled={!modificationQuery.trim() || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Analyze Modification'}
            </Button>

            {modificationSuggestion && (
              <div className="mt-4 p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Modification Suggestion</h4>
                  <Badge variant="outline">
                    {Math.round(modificationSuggestion.confidence * 100)}% confidence
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Action:</strong> {modificationSuggestion.action}</p>
                  <p><strong>Changes:</strong> {JSON.stringify(modificationSuggestion.changes)}</p>
                  {modificationSuggestion.filters && (
                    <p><strong>Affects:</strong> Records matching {modificationSuggestion.filters.length} filter(s)</p>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    Apply Changes
                  </Button>
                  <Button size="sm" variant="ghost">
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDataParser;
