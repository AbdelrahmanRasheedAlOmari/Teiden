import axios from 'axios';

export interface OpenAIUsageResponse {
  object: string;
  data: {
    object: string;
    daily_costs: {
      timestamp: number;
      line_items: {
        name: string;
        cost: number;
      }[];
    }[];
    total_usage: number;
  };
}

export interface OpenAISubscriptionResponse {
  object: string;
  has_payment_method: boolean;
  soft_limit_usd: number;
  hard_limit_usd: number;
  system_hard_limit_usd: number;
  usage_usd: number; // Current usage in the current month
}

export interface OpenAIModelsResponse {
  object: string;
  data: {
    id: string;
    object: string;
    created: number;
    owned_by: string;
  }[];
}

export class OpenAIClient {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetches usage data for a specific date range
   * @param startDate Start date in format YYYY-MM-DD
   * @param endDate End date in format YYYY-MM-DD
   */
  async getUsage(startDate: string, endDate: string): Promise<OpenAIUsageResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching OpenAI usage:', error);
      throw error;
    }
  }

  /**
   * Fetches subscription data
   */
  async getSubscription(): Promise<OpenAISubscriptionResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/dashboard/billing/subscription`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching OpenAI subscription:', error);
      throw error;
    }
  }

  /**
   * Lists available models
   */
  async listModels(): Promise<OpenAIModelsResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/models`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      throw error;
    }
  }

  /**
   * Test the API key
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default OpenAIClient; 