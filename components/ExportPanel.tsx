'use-client'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Database, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportPanelProps {
  clientsData: any[];
  workersData: any[];
  tasksData: any[];
  rules: any[];
  priorities: any;
  validationResults: any;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  clientsData,
  workersData,
  tasksData,
  rules,
  priorities,
  validationResults
}) => {
  const { toast } = useToast();

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: "Export failed",
        description: "No data available to export",
        variant: "destructive"
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            value = `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `${filename} downloaded successfully`,
    });
  };

  const exportRulesConfig = () => {
    const config = {
      rules,
      priorities,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalRules: rules.length,
        validationStatus: validationResults?.isValid ? 'passed' : 'failed'
      }
    };

    const jsonContent = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rules-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Rules exported",
      description: "rules-config.json downloaded successfully",
    });
  };

  const exportAll = () => {
    exportToCSV(clientsData, 'clients-validated.csv');
    setTimeout(() => exportToCSV(workersData, 'workers-validated.csv'), 100);
    setTimeout(() => exportToCSV(tasksData, 'tasks-validated.csv'), 200);
    setTimeout(() => exportRulesConfig(), 300);
  };

  const getValidationStatus = () => {
    if (!validationResults) return { icon: AlertTriangle, color: 'text-gray-500', text: 'Not validated' };
    if (validationResults.isValid) return { icon: CheckCircle, color: 'text-green-500', text: 'All validations passed' };
    return { icon: AlertTriangle, color: 'text-red-500', text: `${validationResults.totalErrors} errors found` };
  };

  const validationStatus = getValidationStatus();
  const ValidationIcon = validationStatus.icon;

  const isReadyForExport = validationResults?.isValid && 
                          (clientsData.length > 0 || workersData.length > 0 || tasksData.length > 0);

  return (
    <div className="space-y-6">
      {/* Export Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ValidationIcon className={`w-5 h-5 ${validationStatus.color}`} />
            Export Readiness
          </CardTitle>
          <CardDescription>
            Current status of your data and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{clientsData.length}</div>
              <div className="text-sm text-gray-600">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{workersData.length}</div>
              <div className="text-sm text-gray-600">Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{tasksData.length}</div>
              <div className="text-sm text-gray-600">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{rules.length}</div>
              <div className="text-sm text-gray-600">Rules</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <ValidationIcon className={`w-4 h-4 ${validationStatus.color}`} />
              <span className={validationStatus.color}>{validationStatus.text}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Data Exports</CardTitle>
          <CardDescription>
            Download specific datasets as CSV files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => exportToCSV(clientsData, 'clients-validated.csv')}
              disabled={clientsData.length === 0}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Export Clients
              <Badge variant="secondary">{clientsData.length}</Badge>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => exportToCSV(workersData, 'workers-validated.csv')}
              disabled={workersData.length === 0}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Export Workers
              <Badge variant="secondary">{workersData.length}</Badge>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => exportToCSV(tasksData, 'tasks-validated.csv')}
              disabled={tasksData.length === 0}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Export Tasks
              <Badge variant="secondary">{tasksData.length}</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rules Export */}
      <Card>
        <CardHeader>
          <CardTitle>Rules Configuration</CardTitle>
          <CardDescription>
            Download your business rules and priority settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">Rules Configuration</div>
                  <div className="text-sm text-gray-600">
                    {rules.length} rules, priority settings, and metadata
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={exportRulesConfig}
                disabled={rules.length === 0}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Export */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Export Package</CardTitle>
          <CardDescription>
            Download all validated data and configuration files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="p-6 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
              <Download className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">Ready for Resource Allocation</h3>
              <p className="text-gray-600 mb-4">
                Export all your validated data and rules for the next stage of processing
              </p>
              <Button 
                onClick={exportAll}
                disabled={!isReadyForExport}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Complete Package
              </Button>
            </div>
            
            {!isReadyForExport && (
              <div className="text-sm text-gray-500">
                {!validationResults?.isValid ? 
                  'Fix validation errors before exporting' : 
                  'Upload data files before exporting'
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPanel;
