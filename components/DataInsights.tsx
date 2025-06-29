
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Bot, User, TrendingUp, Database } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface DataInsightsProps {
  clientsData: any[];
  workersData: any[];
  tasksData: any[];
}

interface Conversation {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: {
    dataPoints: number;
    confidence: number;
    suggestions: string[];
  };
}

const DataInsights: React.FC<DataInsightsProps> = ({
  clientsData,
  workersData,
  tasksData,

}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();

  const handleAskQuestion = async () => {
  
    // Add user message to conversation
    const userMessage: Conversation = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    setConversations(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      const response = await aiService.getDataInsights(query, {
        clients: clientsData,
        workers: workersData,
        tasks: tasksData
      });
      
      const assistantMessage: Conversation = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        insights: response.insights
      };
      
      setConversations(prev => [...prev, assistantMessage]);
      setQuery('');
      
      toast({
        title: "Insights Generated",
        description: "AI has analyzed your data and provided insights",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestedQueries = [
    "Show me all high-priority clients with their requested tasks",
    "Find workers who have Python skills and available capacity",
    "What are the data quality issues in my client data?",
    "Suggest optimizations for task allocation",
    "Which clients have the most complex requirements?",
    "What skills are most in demand across all tasks?"
  ];
  if (!clientsData || !workersData || !tasksData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Please load your data to start using AI insights.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Data Conversation
          </CardTitle>
          <CardDescription>
            Ask questions about your data and get AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 mb-4 p-4 border rounded-lg bg-gray-50">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with your data!</p>
                <p className="text-sm">Ask questions like "What are my highest priority tasks?"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {msg.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        msg.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                        {msg.insights && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex flex-wrap gap-1 mb-2">
                              <Badge variant="outline" className="text-xs">
                                <Database className="w-3 h-3 mr-1" />
                                {msg.insights.dataPoints} data points
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {Math.round(msg.insights.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            {msg.insights.suggestions.length > 0 && (
                              <div className="text-xs">
                                <p className="font-medium mb-1">Suggestions:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {msg.insights.suggestions.map((suggestion, i) => (
                                    <li key={i}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask me anything about your data... e.g., 'Which clients have the highest priority?' or 'Show me task allocation patterns'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
            />
            <Button 
              onClick={handleAskQuestion}
              disabled={!query.trim() || isProcessing}
              className="self-end"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Questions</CardTitle>
          <CardDescription>
            Click any question to ask the AI about your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQueries.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3"
                onClick={() => setQuery(suggestion)}
                disabled={isProcessing}
              >
                <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataInsights;