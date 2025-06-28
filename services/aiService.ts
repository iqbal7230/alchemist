// aiService.ts

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class AIService {
  // Use env var in production for security
  private apiKey = 'AIzaSyBs8EfUb_ww-7UyYaaK5R2mLfx_vgJ5BaA';

  // Core function to communicate with Gemini
  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  // AI-enabled header mapping
  async mapHeaders(headers: string[], expectedStructure: any): Promise<Record<string, string | null>> {
    const prompt = `
You are an AI data parser. Map the following CSV headers to the expected data structure.

CSV Headers: [${headers.join(', ')}]

Expected Structure: ${JSON.stringify(expectedStructure, null, 2)}

Return ONLY a JSON object mapping each CSV header to the correct expected field. 
If no match is found, map to null.

Example: {"client_id": "ClientID", "name": "ClientName", "priority": "PriorityLevel"}
    `;

    const result = await this.callGemini(prompt);
    try {
      return JSON.parse(result.replace(/```json|```/g, '').trim());
    } catch {
      return {};
    }
  }

  // Advanced AI validations
  async validateData(data: any[], entityType: string): Promise<any[]> {
    const prompt = `
Analyze this ${entityType} data and identify validation issues beyond basic checks.
Consider business logic, data consistency, and realistic constraints.

Data sample: ${JSON.stringify(data.slice(0, 5), null, 2)}

Return a JSON array of validation issues with this structure:
[{"type": "validation_type", "severity": "error|warning|info", "message": "description", "rowIndex": 0, "field": "fieldName", "suggestion": "fix_suggestion"}]
    `;

    const result = await this.callGemini(prompt);
    try {
      return JSON.parse(result.replace(/```json|```/g, '').trim());
    } catch {
      return [];
    }
  }

  // Natural language data filtering
  async parseSearchQuery(query: string, dataStructure: any): Promise<any> {
    const prompt = `
Convert this natural language query into a data filter configuration:
Query: "${query}"

Data Structure: ${JSON.stringify(dataStructure, null, 2)}

Return a JSON filter object that can be used to filter the data:
{"filters": [{"field": "fieldName", "operator": "equals|contains|greater|less", "value": "filterValue"}], "logic": "and|or"}
    `;

    const result = await this.callGemini(prompt);
    try {
      return JSON.parse(result.replace(/```json|```/g, '').trim());
    } catch {
      return { filters: [], logic: 'and' };
    }
  }

  // Natural language data modifications
  async parseModificationQuery(query: string, dataStructure: any): Promise<any> {
    const prompt = `
Convert this natural language modification request into actionable changes:
Query: "${query}"

Data Structure: ${JSON.stringify(dataStructure, null, 2)}

Return a JSON modification object:
{"action": "update|add|delete", "filters": [{"field": "fieldName", "operator": "equals", "value": "filterValue"}], "changes": {"field": "newValue"}, "confidence": 0.95}

Only return high-confidence modifications (>0.8).
    `;

    const result = await this.callGemini(prompt);
    try {
      return JSON.parse(result.replace(/```json|```/g, '').trim());
    } catch {
      return { action: 'none', confidence: 0 };
    }
  }

  // Data correction suggestions
  async suggestCorrections(data: any[], validationErrors: any[]): Promise<any[]> {
    const prompt = `
Based on these validation errors and data sample, suggest specific corrections:

Validation Errors: ${JSON.stringify(validationErrors, null, 2)}
Data Sample: ${JSON.stringify(data.slice(0, 3), null, 2)}

Return a JSON array of correction suggestions:
[{"rowIndex": 0, "field": "fieldName", "currentValue": "current", "suggestedValue": "suggested", "reason": "explanation", "confidence": 0.9}]
    `;

    const result = await this.callGemini(prompt);
    try {
      return JSON.parse(result.replace(/```json|```/g, '').trim());
    } catch {
      return [];
    }
  }
}

export const aiService = new AIService();
