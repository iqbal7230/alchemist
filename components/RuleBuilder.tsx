
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RuleBuilderProps {
  rules: any[];
  onRulesChange: (rules: any[]) => void;
  clientsData: any[];
  workersData: any[];
  tasksData: any[];
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  rules,
  onRulesChange,
  clientsData,
  workersData,
  tasksData
}) => {
  const [selectedRuleType, setSelectedRuleType] = useState('');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const { toast } = useToast();

  const ruleTypes = [
    { value: 'coRun', label: 'Co-run Tasks', description: 'Tasks that must run together' },
    { value: 'slotRestriction', label: 'Slot Restriction', description: 'Minimum common slots requirement' },
    { value: 'loadLimit', label: 'Load Limit', description: 'Maximum slots per worker group' },
    { value: 'phaseWindow', label: 'Phase Window', description: 'Allowed phases for specific tasks' },
    { value: 'precedence', label: 'Precedence', description: 'Task ordering requirements' }
  ];

  const addRule = (ruleData: any) => {
    const newRule = {
      id: Date.now().toString(),
      ...ruleData,
      createdAt: new Date().toISOString()
    };
    onRulesChange([...rules, newRule]);
    toast({
      title: "Rule added",
      description: "New business rule has been created successfully",
    });
  };

  const removeRule = (ruleId: string) => {
    onRulesChange(rules.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule removed",
      description: "Business rule has been deleted",
    });
  };

  const parseNaturalLanguageRule = () => {
    const input = naturalLanguageInput.toLowerCase();
    
    // Simple AI-like parsing for demo
    if (input.includes('run together') || input.includes('co-run')) {
      const taskIds = extractTaskIds(input);
      if (taskIds.length >= 2) {
        addRule({
          type: 'coRun',
          tasks: taskIds,
          description: naturalLanguageInput
        });
        setNaturalLanguageInput('');
        return;
      }
    }
    
    if (input.includes('load limit') || input.includes('maximum')) {
      const workerGroups = extractWorkerGroups(input);
      const limit = extractNumber(input);
      if (workerGroups.length > 0 && limit) {
        addRule({
          type: 'loadLimit',
          workerGroups,
          maxSlotsPerPhase: limit,
          description: naturalLanguageInput
        });
        setNaturalLanguageInput('');
        return;
      }
    }

    toast({
      title: "Rule parsing failed",
      description: "Could not understand the rule. Try using the manual builder.",
      variant: "destructive"
    });
  };

  const extractTaskIds = (text: string): string[] => {
    const taskIds: string[] = [];
    tasksData.forEach(task => {
      if (text.includes(task.TaskID.toLowerCase()) || text.includes(task.TaskName?.toLowerCase())) {
        taskIds.push(task.TaskID);
      }
    });
    return taskIds;
  };

  const extractWorkerGroups = (text: string): string[] => {
    const groups: string[] = [];
    workersData.forEach(worker => {
      if (text.includes(worker.WorkerGroup?.toLowerCase())) {
        groups.push(worker.WorkerGroup);
      }
    });
    return [...new Set(groups)];
  };

  const extractNumber = (text: string): number | null => {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  };

  const CoRunRuleForm = () => (
    <div className="space-y-4">
      <Label>Select Tasks to Run Together</Label>
      <Select onValueChange={(taskId) => {
        // Simple implementation - in real app, would allow multiple selections
        addRule({
          type: 'coRun',
          tasks: [taskId],
          description: `Co-run rule for ${taskId}`
        });
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Select tasks" />
        </SelectTrigger>
        <SelectContent>
          {tasksData.map(task => (
            <SelectItem key={task.TaskID} value={task.TaskID}>
              {task.TaskName || task.TaskID}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const LoadLimitRuleForm = () => (
    <div className="space-y-4">
      <div>
        <Label>Worker Group</Label>
        <Select onValueChange={(group) => {
          addRule({
            type: 'loadLimit',
            workerGroup: group,
            maxSlotsPerPhase: 5,
            description: `Load limit for ${group}`
          });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select worker group" />
          </SelectTrigger>
          <SelectContent>
            {[...new Set(workersData.map(w => w.WorkerGroup).filter(Boolean))].map(group => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderRuleForm = () => {
    switch (selectedRuleType) {
      case 'coRun':
        return <CoRunRuleForm />;
      case 'loadLimit':
        return <LoadLimitRuleForm />;
      default:
        return (
          <div className="text-center text-gray-500 py-4">
            Select a rule type to start building
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Rule Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Rule Assistant
          </CardTitle>
          <CardDescription>
            Describe your business rule in plain English
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., 'Tasks T01 and T02 should run together' or 'Sales team should have maximum 3 slots per phase'"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              rows={3}
            />
            <Button onClick={parseNaturalLanguageRule} disabled={!naturalLanguageInput.trim()}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Rule Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Rule Builder</CardTitle>
          <CardDescription>
            Create rules using the structured interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Rule Type</Label>
              <Select value={selectedRuleType} onValueChange={setSelectedRuleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  {ruleTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {renderRuleForm()}
          </div>
        </CardContent>
      </Card>

      {/* Current Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Current Rules ({rules.length})</CardTitle>
          <CardDescription>
            Active business rules for resource allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No rules defined yet. Add your first rule above.
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{rule.type}</Badge>
                      <span className="font-medium">{rule.description}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Created: {new Date(rule.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeRule(rule.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RuleBuilder;
