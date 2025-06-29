'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataIngestion from '@/components/DataIngestion';
import DataGrid from '@/components/DataGrid';
import ValidationPanel from '@/components/ValidationPanel';
import RuleBuilder from '@/components/RuleBuilder';
import PrioritySettings from '@/components/PrioritySettings';
import ExportPanel from '@/components/ExportPanel';
import DataInsights from '@/components/DataInsights';
import { Upload, Database, Shield, Settings, Download,  Brain } from 'lucide-react';

export default function Home() {
  const [clientsData, setClientsData] = useState<any[]>([]);
  const [workersData, setWorkersData] = useState<any[]>([]);
  const [tasksData, setTasksData] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any>({});
  const [rules, setRules] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any>({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
             Data Alchemist
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your spreadsheet chaos into organized, validated data with AI-powered intelligence
          </p>
        </div>

        <Tabs defaultValue="ingestion" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="ingestion" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Data Ingestion
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Data Chat
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Management
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Rules & Priorities
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingestion">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Data Ingestion</CardTitle>
                <CardDescription>
                  Upload your CSV or XLSX files for clients, workers, and tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataIngestion 
                  onDataLoad={(type, data) => {
                    if (type === 'clients') setClientsData(data);
                    if (type === 'workers') setWorkersData(data);
                    if (type === 'tasks') setTasksData(data);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="insights">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Data Conversations</CardTitle>
                <CardDescription>
                  Chat with your data using natural language to get insights, find patterns, and ask questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataInsights 
                  clientsData={clientsData}
                  workersData={workersData}
                  tasksData={tasksData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Data Management</CardTitle>
                <CardDescription>
                  View and edit your data with AI-powered search and validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataGrid 
                  clientsData={clientsData}
                  workersData={workersData}
                  tasksData={tasksData}
                  onDataChange={(type, data) => {
                    if (type === 'clients') setClientsData(data);
                    if (type === 'workers') setWorkersData(data);
                    if (type === 'tasks') setTasksData(data);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Validation Center</CardTitle>
                <CardDescription>
                  Real-time validation with AI-powered error detection and correction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ValidationPanel 
                  clientsData={clientsData}
                  workersData={workersData}
                  tasksData={tasksData}
                  validationResults={validationResults}
                  onValidationComplete={setValidationResults}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Rule Builder</CardTitle>
                  <CardDescription>
                    Create business rules with natural language or UI controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RuleBuilder 
                    rules={rules}
                    onRulesChange={setRules}
                    clientsData={clientsData}
                    workersData={workersData}
                    tasksData={tasksData}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Priority Settings</CardTitle>
                  <CardDescription>
                    Set weights and priorities for resource allocation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PrioritySettings 
                    priorities={priorities}
                    onPrioritiesChange={setPriorities}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Export Center</CardTitle>
                <CardDescription>
                  Download your validated data and rules configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportPanel 
                  clientsData={clientsData}
                  workersData={workersData}
                  tasksData={tasksData}
                  rules={rules}
                  priorities={priorities}
                  validationResults={validationResults}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

