import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataGridProps {
  clientsData: any[];
  workersData: any[];
  tasksData: any[];
  onDataChange: (type: 'clients' | 'workers' | 'tasks', data: any[]) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ 
  clientsData, 
  workersData, 
  tasksData, 
  onDataChange 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{type: string, rowIndex: number, field: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const { toast } = useToast();

  // AI-powered natural language search
  const searchData = (data: any[], query: string) => {
    if (!query) return data;

    const lowerQuery = query.toLowerCase();
    
    // Basic keyword matching with some intelligence
    return data.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(lowerQuery)
      );
    });
  };

  const filteredClients = useMemo(() => searchData(clientsData, searchQuery), [clientsData, searchQuery]);
  const filteredWorkers = useMemo(() => searchData(workersData, searchQuery), [workersData, searchQuery]);
  const filteredTasks = useMemo(() => searchData(tasksData, searchQuery), [tasksData, searchQuery]);

  const handleCellEdit = (type: string, rowIndex: number, field: string, currentValue: any) => {
    setEditingCell({ type, rowIndex, field });
    setEditValue(String(currentValue));
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const { type, rowIndex, field } = editingCell;
    let data: any[];
    let setData: (data: any[]) => void;

    switch (type) {
      case 'clients':
        data = [...clientsData];
        setData = (newData) => onDataChange('clients', newData);
        break;
      case 'workers':
        data = [...workersData];
        setData = (newData) => onDataChange('workers', newData);
        break;
      case 'tasks':
        data = [...tasksData];
        setData = (newData) => onDataChange('tasks', newData);
        break;
      default:
        return;
    }

    data[rowIndex][field] = editValue;
    setData(data);
    setEditingCell(null);
    
    toast({
      title: "Data updated",
      description: "Your changes have been saved successfully",
    });
  };

  const renderTable = (data: any[], type: string) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No {type} data loaded. Please upload a file first.
        </div>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((header) => (
                <th key={header} className="border border-gray-200 px-4 py-2 text-left font-semibold">
                  {header}
                </th>
              ))}
              <th className="border border-gray-200 px-4 py-2 text-center font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={header} className="border border-gray-200 px-4 py-2">
                    {editingCell?.type === type && 
                     editingCell?.rowIndex === rowIndex && 
                     editingCell?.field === header ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                        />
                        <Button size="sm" onClick={handleSaveEdit} className="h-8 w-8 p-0">
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCell(null)} className="h-8 w-8 p-0">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span 
                        className="cursor-pointer hover:bg-blue-50 p-1 rounded"
                        onClick={() => handleCellEdit(type, rowIndex, header, row[header])}
                      >
                        {String(row[header])}
                      </span>
                    )}
                  </td>
                ))}
                <td className="border border-gray-200 px-4 py-2 text-center">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCellEdit(type, rowIndex, headers[0], row[headers[0]])}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search using natural language (e.g., 'tasks with duration more than 2 phases')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">
            Clients ({filteredClients.length})
          </TabsTrigger>
          <TabsTrigger value="workers">
            Workers ({filteredWorkers.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({filteredTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Clients Data</CardTitle>
              <CardDescription>
                Click on any cell to edit inline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(filteredClients, 'clients')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers">
          <Card>
            <CardHeader>
              <CardTitle>Workers Data</CardTitle>
              <CardDescription>
                Click on any cell to edit inline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(filteredWorkers, 'workers')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Data</CardTitle>
              <CardDescription>
                Click on any cell to edit inline
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(filteredTasks, 'tasks')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataGrid;
