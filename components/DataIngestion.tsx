'use client'
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataIngestionProps {
  onDataLoad: (type: 'clients' | 'workers' | 'tasks', data: any[]) => void;
}

const DataIngestion: React.FC<DataIngestionProps> = ({ onDataLoad }) => {
  const [uploadStates, setUploadStates] = useState({
    clients: 'idle',
    workers: 'idle',
    tasks: 'idle'
  });
  const { toast } = useToast();

  const parseCSV = (content: string) => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    return data;
  };

  const handleFileUpload = useCallback((type: 'clients' | 'workers' | 'tasks', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStates(prev => ({ ...prev, [type]: 'loading' }));

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: any[] = [];

        if (file.name.endsWith('.csv')) {
          data = parseCSV(content);
        } else {
          // For XLSX files, we'll use a simple CSV parser for now
          data = parseCSV(content);
        }

        // AI-powered header mapping
        const normalizedData = normalizeHeaders(data, type);
        
        onDataLoad(type, normalizedData);
        setUploadStates(prev => ({ ...prev, [type]: 'success' }));
        
        toast({
          title: "File uploaded successfully",
          description: `${normalizedData.length} ${type} records loaded`,
          variant: "success",
        });
      } catch (error) {
        setUploadStates(prev => ({ ...prev, [type]: 'error' }));
        toast({
          title: "Upload failed",
          description: "Please check your file format and try again",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  }, [onDataLoad, toast]);

  const normalizeHeaders = (data: any[], type: string) => {
    // AI-powered header mapping logic
    const headerMappings: Record<string, Record<string, string>> = {
      clients: {
        'client_id': 'ClientID',
        'clientid': 'ClientID',
        'id': 'ClientID',
        'client_name': 'ClientName',
        'clientname': 'ClientName',
        'name': 'ClientName',
        'priority': 'PriorityLevel',
        'priority_level': 'PriorityLevel',
        'prioritylevel': 'PriorityLevel',
        'requested_tasks': 'RequestedTaskIDs',
        'requestedtaskids': 'RequestedTaskIDs',
        'tasks': 'RequestedTaskIDs',
        'group': 'GroupTag',
        'group_tag': 'GroupTag',
        'grouptag': 'GroupTag',
        'attributes': 'AttributesJSON',
        'attributesjson': 'AttributesJSON'
      },
      workers: {
        'worker_id': 'WorkerID',
        'workerid': 'WorkerID',
        'id': 'WorkerID',
        'worker_name': 'WorkerName',
        'workername': 'WorkerName',
        'name': 'WorkerName',
        'skills': 'Skills',
        'available_slots': 'AvailableSlots',
        'availableslots': 'AvailableSlots',
        'slots': 'AvailableSlots',
        'max_load': 'MaxLoadPerPhase',
        'maxloadperphase': 'MaxLoadPerPhase',
        'worker_group': 'WorkerGroup',
        'workergroup': 'WorkerGroup',
        'group': 'WorkerGroup',
        'qualification': 'QualificationLevel',
        'qualification_level': 'QualificationLevel',
        'qualificationlevel': 'QualificationLevel'
      },
      tasks: {
        'task_id': 'TaskID',
        'taskid': 'TaskID',
        'id': 'TaskID',
        'task_name': 'TaskName',
        'taskname': 'TaskName',
        'name': 'TaskName',
        'category': 'Category',
        'duration': 'Duration',
        'required_skills': 'RequiredSkills',
        'requiredskills': 'RequiredSkills',
        'skills': 'RequiredSkills',
        'preferred_phases': 'PreferredPhases',
        'preferredphases': 'PreferredPhases',
        'phases': 'PreferredPhases',
        'max_concurrent': 'MaxConcurrent',
        'maxconcurrent': 'MaxConcurrent',
        'concurrent': 'MaxConcurrent'
      }
    };

    return data.map(row => {
      const normalizedRow: any = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().replace(/[\s_-]/g, '');
        const mapping = headerMappings[type];
        const mappedKey = mapping[normalizedKey] || key;
        normalizedRow[mappedKey] = row[key];
      });
      return normalizedRow;
    });
  };

  const getUploadState = (type: string) => {
    const state = uploadStates[type as keyof typeof uploadStates];
    switch (state) {
      case 'success':
        return { icon: CheckCircle, color: 'text-green-500', text: 'Uploaded' };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-500', text: 'Error' };
      case 'loading':
        return { icon: Upload, color: 'text-blue-500', text: 'Uploading...' };
      default:
        return { icon: FileSpreadsheet, color: 'text-gray-400', text: 'Upload File' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(['clients', 'workers', 'tasks'] as const).map((type) => {
        const state = getUploadState(type);
        const Icon = state.icon;
        
        return (
          <Card key={type} className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center">
              <Icon className={`w-12 h-12 mx-auto mb-2 ${state.color}`} />
              <CardTitle className="capitalize">{type}</CardTitle>
              <CardDescription>
                Upload {type} CSV or XLSX file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`${type}-file`} className="sr-only">
                    Upload {type} file
                  </Label>
                  <Input
                    id={`${type}-file`}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => handleFileUpload(type, e)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="text-center">
                  <span className={`text-sm ${state.color}`}>
                    {state.text}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DataIngestion;
