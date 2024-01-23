import { Client } from '@hubspot/api-client';
import axios, { AxiosInstance } from 'axios';

const API_KEY = process.env.HUBSPOT_TOKEN;
const BASE_URL = 'https://api.hubapi.com';

class HubSpotClient {
  private client: Client;

  constructor() {
    this.client = new Client({ accessToken: process.env.HUBSPOT_TOKEN });
  }

  getClient(): Client {
    return this.client;
  }

  // Add other methods for different HubSpot API endpoints as needed
  public async getContacts(): Promise<any> {
    try {
      const response = await this.client.      return response.results;
    } catch (error) {
      console.error('Error fetching contacts from HubSpot:', error);
      throw error;
    }
  }
}

export default new HubSpotClient();
