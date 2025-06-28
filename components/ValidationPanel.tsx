import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ValidationPanelProps {
  clientsData: any[];
  workersData: any[];
  tasksData: any[];
  validationResults: any;
  onValidationComplete: (results: any) => void;
}

interface ValidationError {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  entity: string;
  field?: string;
  rowIndex?: number;
  suggestion?: string;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  clientsData,
  workersData,
  tasksData,
  validationResults,
  onValidationComplete
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { toast } = useToast();

  const runValidation = async () => {
    setIsValidating(true);
    const newErrors: ValidationError[] = [];

    try {
      // Core Validation 1: Missing required columns
      validateRequiredColumns(clientsData, 'clients', newErrors);
      validateRequiredColumns(workersData, 'workers', newErrors);
      validateRequiredColumns(tasksData, 'tasks', newErrors);

      // Core Validation 2: Duplicate IDs
      validateDuplicateIds(clientsData, 'ClientID', 'clients', newErrors);
      validateDuplicateIds(workersData, 'WorkerID', 'workers', newErrors);
      validateDuplicateIds(tasksData, 'TaskID', 'tasks', newErrors);

      // Core Validation 3: Out-of-range values
      validatePriorityLevels(clientsData, newErrors);
      validateDurations(tasksData, newErrors);

      // Core Validation 4: Unknown references
      validateTaskReferences(clientsData, tasksData, newErrors);

      // Core Validation 5: Skill coverage
      validateSkillCoverage(tasksData, workersData, newErrors);

      setErrors(newErrors);
      
      const results = {
        totalErrors: newErrors.filter(e => e.severity === 'error').length,
        totalWarnings: newErrors.filter(e => e.severity === 'warning').length,
        errors: newErrors,
        isValid: newErrors.filter(e => e.severity === 'error').length === 0
      };

      onValidationComplete(results);

      toast({
        title: "Validation complete",
        description: `Found ${results.totalErrors} errors and ${results.totalWarnings} warnings`,
        variant: results.totalErrors > 0 ? "destructive" : "default"
      });

    } catch (error) {
      toast({
        title: "Validation failed",
        description: "An error occurred during validation",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validateRequiredColumns = (data: any[], entityType: string, errors: ValidationError[]) => {
    if (!data || data.length === 0) return;

    const requiredColumns = {
      clients: ['ClientID', 'ClientName', 'PriorityLevel'],
      workers: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots'],
      tasks: ['TaskID', 'TaskName', 'Duration', 'RequiredSkills']
    };

    const required = requiredColumns[entityType as keyof typeof requiredColumns];
    const columns = Object.keys(data[0] || {});

    required.forEach(col => {
      if (!columns.includes(col)) {
        errors.push({
          type: 'missing_column',
          severity: 'error',
          message: `Missing required column: ${col}`,
          entity: entityType,
          suggestion: `Add the ${col} column to your ${entityType} data`
        });
      }
    });
  };

  const validateDuplicateIds = (data: any[], idField: string, entityType: string, errors: ValidationError[]) => {
    if (!data || data.length === 0) return;

    const ids = new Set();
    data.forEach((row, index) => {
      const id = row[idField];
      if (ids.has(id)) {
        errors.push({
          type: 'duplicate_id',
          severity: 'error',
          message: `Duplicate ${idField}: ${id}`,
          entity: entityType,
          rowIndex: index,
          field: idField,
          suggestion: `Change the duplicate ${idField} to a unique value`
        });
      }
      ids.add(id);
    });
  };

  const validatePriorityLevels = (clientsData: any[], errors: ValidationError[]) => {
    if (!clientsData || clientsData.length === 0) return;

    clientsData.forEach((client, index) => {
      const priority = parseInt(client.PriorityLevel);
      if (isNaN(priority) || priority < 1 || priority > 5) {
        errors.push({
          type: 'invalid_priority',
          severity: 'error',
          message: `Invalid priority level: ${client.PriorityLevel}. Must be 1-5`,
          entity: 'clients',
          rowIndex: index,
          field: 'PriorityLevel',
          suggestion: 'Set priority level to a value between 1 and 5'
        });
      }
    });
  };

  const validateDurations = (tasksData: any[], errors: ValidationError[]) => {
    if (!tasksData || tasksData.length === 0) return;

    tasksData.forEach((task, index) => {
      const duration = parseInt(task.Duration);
      if (isNaN(duration) || duration < 1) {
        errors.push({
          type: 'invalid_duration',
          severity: 'error',
          message: `Invalid duration: ${task.Duration}. Must be >= 1`,
          entity: 'tasks',
          rowIndex: index,
          field: 'Duration',
          suggestion: 'Set duration to a positive number'
        });
      }
    });
  };

  const validateTaskReferences = (clientsData: any[], tasksData: any[], errors: ValidationError[]) => {
    if (!clientsData || !tasksData || clientsData.length === 0 || tasksData.length === 0) return;

    const taskIds = new Set(tasksData.map(task => task.TaskID));

    clientsData.forEach((client, index) => {
      const requestedTasks = client.RequestedTaskIDs?.split(',') || [];
      requestedTasks.forEach((taskId: string) => {

        const trimmedTaskId = taskId.trim();
        if (trimmedTaskId && !taskIds.has(trimmedTaskId)) {
          errors.push({
            type: 'unknown_task_reference',
            severity: 'error',
            message: `Unknown task reference: ${trimmedTaskId}`,
            entity: 'clients',
            rowIndex: index,
            field: 'RequestedTaskIDs',
            suggestion: `Remove ${trimmedTaskId} or add it to the tasks data`
          });
        }
      });
    });
  };

  const validateSkillCoverage = (tasksData: any[], workersData: any[], errors: ValidationError[]) => {
    if (!tasksData || !workersData || tasksData.length === 0 || workersData.length === 0) return;

    const allWorkerSkills = new Set();
    workersData.forEach(worker => {
      const skills = worker.Skills?.split(',') || [];
      skills.forEach((skill: string) => allWorkerSkills.add(skill.trim()));
    });

    tasksData.forEach((task, index) => {
      const requiredSkills = task.RequiredSkills?.split(',') || [];
      requiredSkills.forEach((skill: string) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill && !allWorkerSkills.has(trimmedSkill)) {
          errors.push({
            type: 'missing_skill_coverage',
            severity: 'warning',
            message: `No worker has skill: ${trimmedSkill}`,
            entity: 'tasks',
            rowIndex: index,
            field: 'RequiredSkills',
            suggestion: `Add a worker with ${trimmedSkill} skill or modify the task requirements`
          });
        }
      });
    });
  };

  useEffect(() => {
    if (clientsData.length > 0 || workersData.length > 0 || tasksData.length > 0) {
      runValidation();
    }
  }, [clientsData, workersData, tasksData]);

  const getErrorIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const totalErrors = errors.filter(e => e.severity === 'error').length;
  const totalWarnings = errors.filter(e => e.severity === 'warning').length;
  const validationScore = Math.max(0, 100 - (totalErrors * 10 + totalWarnings * 5));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Validation Status</h3>
          <p className="text-sm text-gray-600">
            {totalErrors === 0 ? 'All validations passed!' : `${totalErrors} errors, ${totalWarnings} warnings`}
          </p>
        </div>
        <Button onClick={runValidation} disabled={isValidating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          Run Validation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Validation Score
            <Badge variant={totalErrors === 0 ? 'default' : 'destructive'}>
              {validationScore}%
            </Badge>
          </CardTitle>
          <CardDescription>
            Overall data quality score based on validation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={validationScore} className="w-full" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Errors: {totalErrors}</span>
            <span>Warnings: {totalWarnings}</span>
            <span>Score: {validationScore}%</span>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              Issues found in your data with suggested fixes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errors.map((error, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getErrorIcon(error.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{error.message}</span>
                      <Badge variant={getSeverityColor(error.severity)}>
                        {error.severity}
                      </Badge>
                      <Badge variant="outline">
                        {error.entity}
                      </Badge>
                    </div>
                    {error.suggestion && (
                      <p className="text-sm text-gray-600">
                        💡 {error.suggestion}
                      </p>
                    )}
                    {error.rowIndex !== undefined && (
                      <p className="text-xs text-gray-500">
                        Row {error.rowIndex + 1}{error.field && `, Field: ${error.field}`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ValidationPanel;
