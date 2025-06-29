import dotenv from 'dotenv';
dotenv.config(); // Ensure env vars are loaded

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
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('❌ Gemini API key is not set. Please define GEMINI_API_KEY in your .env file.');
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    console.log('📨 Making Gemini API call with prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    console.log('📬 Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('✅ Gemini API response data:', data);

    const result = data.candidates[0]?.content?.parts[0]?.text || '';
    console.log('🧠 Extracted result:', result);

    return result;
  }

  // AI-powered data insights and conversations
  async getDataInsights(
    query: string,
    data: { clients: any[]; workers: any[]; tasks: any[] }
  ): Promise<any> {
    const dataStats = {
      clientsCount: data.clients.length,
      workersCount: data.workers.length,
      tasksCount: data.tasks.length,
      clientsSample: data.clients.slice(0, 3),
      workersSample: data.workers.slice(0, 3),
      tasksSample: data.tasks.slice(0, 3),
    };

    const prompt = `
You are a data analyst AI. Analyze the following business data and answer the user's question comprehensively.

User Question: "${query}"

Available Data:
- Clients: ${dataStats.clientsCount} records
- Workers: ${dataStats.workersCount} records  
- Tasks: ${dataStats.tasksCount} records

Sample Data Structure:
Clients: ${dataStats.clientsCount > 0 ? JSON.stringify(dataStats.clientsSample, null, 2) : 'No client data available'}
Workers: ${dataStats.workersCount > 0 ? JSON.stringify(dataStats.workersSample, null, 2) : 'No worker data available'}
Tasks: ${dataStats.tasksCount > 0 ? JSON.stringify(dataStats.tasksSample, null, 2) : 'No task data available'}

Full Data (for analysis):
${JSON.stringify(data, null, 2)}

Please provide:
1. A comprehensive answer to the user's question
2. Specific data insights and patterns you notice
3. Actionable recommendations based on the data
4. Data quality observations if relevant

Format your response as JSON:
{
  "answer": "Your detailed answer here",
  "insights": {
    "dataPoints": number_of_relevant_records,
    "confidence": confidence_score_0_to_1,
    "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
  },
  "patterns": ["pattern1", "pattern2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`;

    try {
      const result = await this.callGemini(prompt);
      const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
      console.log('✅ Data insights result:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error in getDataInsights:', error);
      return {
        answer:
          "I'm having trouble analyzing your data right now. Please try rephrasing your question or check your API connection.",
        insights: {
          dataPoints: 0,
          confidence: 0,
          suggestions: [],
        },
        patterns: [],
        recommendations: [],
      };
    }
  }
}

export const aiService = new AIService();
