
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

interface PrioritySettingsProps {
  priorities: any;
  onPrioritiesChange: (priorities: any) => void;
}

const PrioritySettings: React.FC<PrioritySettingsProps> = ({
  priorities,
  onPrioritiesChange
}) => {
  const defaultPriorities = {
    taskFulfillment: 50,
    fairness: 30,
    efficiency: 40,
    urgency: 60,
    skillMatch: 45,
    workloadBalance: 35
  };

  const currentPriorities: Record<string, number> = { ...defaultPriorities, ...priorities };

  const updatePriority = (key: string, value: number[]) => {
    onPrioritiesChange({
      ...currentPriorities,
      [key]: value[0]
    });
  };

  const resetToDefaults = () => {
    onPrioritiesChange(defaultPriorities);
  };

  const applyPreset = (preset: string) => {
    const presets = {
      efficiency: {
        taskFulfillment: 80,
        fairness: 20,
        efficiency: 90,
        urgency: 40,
        skillMatch: 70,
        workloadBalance: 30
      },
      fairness: {
        taskFulfillment: 40,
        fairness: 90,
        efficiency: 30,
        urgency: 50,
        skillMatch: 60,
        workloadBalance: 80
      },
      urgent: {
        taskFulfillment: 60,
        fairness: 40,
        efficiency: 50,
        urgency: 95,
        skillMatch: 70,
        workloadBalance: 25
      }
    };

    onPrioritiesChange(presets[preset as keyof typeof presets]);
  };

  const priorityCategories = [
    {
      key: 'taskFulfillment',
      label: 'Task Fulfillment',
      description: 'How important is completing requested tasks'
    },
    {
      key: 'fairness',
      label: 'Fair Distribution',
      description: 'Equal workload distribution among workers'
    },
    {
      key: 'efficiency',
      label: 'Resource Efficiency',
      description: 'Optimal use of available resources'
    },
    {
      key: 'urgency',
      label: 'Priority Level',
      description: 'Respect client priority levels'
    },
    {
      key: 'skillMatch',
      label: 'Skill Matching',
      description: 'Match tasks to worker expertise'
    },
    {
      key: 'workloadBalance',
      label: 'Workload Balance',
      description: 'Prevent worker overload'
    }
  ];

  const getWeightColor = (weight: number) => {
    if (weight >= 70) return 'bg-red-500';
    if (weight >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // const totalWeight = Object.values(currentPriorities).reduce((sum: number, val: any) => sum + val, 0);
  const priorityValues = Object.values(currentPriorities) as number[];
  const totalWeight = priorityValues.reduce((sum: number, val: number) => sum + val, 0);
  const avgWeight = totalWeight / Object.keys(currentPriorities).length;

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
          <CardDescription>
            Apply common priority configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => applyPreset('efficiency')}>
              Maximize Efficiency
            </Button>
            <Button variant="outline" onClick={() => applyPreset('fairness')}>
              Fair Distribution
            </Button>
            <Button variant="outline" onClick={() => applyPreset('urgent')}>
              Urgent Tasks First
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Priority Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Priority Weights
            <Badge variant="outline">
              Avg: {Math.round(avgWeight)}
            </Badge>
          </CardTitle>
          <CardDescription>
            Adjust the relative importance of different criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {priorityCategories.map((category) => {
               const weight = currentPriorities[category.key] as number;
              return (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{category.label}</Label>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getWeightColor(weight)}`}
                        title={`Weight: ${weight}`}
                      />
                      <span className="text-sm font-mono w-8">{weight}</span>
                    </div>
                  </div>
                  <Slider
                    value={[weight]}
                    onValueChange={(value) => updatePriority(category.key, value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Priority Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Summary</CardTitle>
          <CardDescription>
            Current configuration overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Highest Priority</div>
              <div className="font-medium">
                {priorityCategories.find(c => 
                 (currentPriorities[c.key] as number) === Math.max(...priorityValues)
                )?.label}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Lowest Priority</div>
              <div className="font-medium">
                {priorityCategories.find(c => 
                (currentPriorities[c.key] as number) === Math.min(...priorityValues)
                )?.label}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Weight</div>
              <div className="font-medium">{totalWeight}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Average Weight</div>
              <div className="font-medium">{Math.round(avgWeight)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrioritySettings;
