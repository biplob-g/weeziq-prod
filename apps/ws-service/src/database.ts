import { prisma } from "../lib/prisma";

export interface ChatMessage {
  id?: string;
  message: string;
  role: "user" | "assistant";
  chatRoomId: string;
  seen?: boolean;
}

export interface Customer {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  ipAddress?: string;
  domainId?: string;
}

export interface ChatRoom {
  id?: string;
  customerId?: string;
  live?: boolean;
}

export class DatabaseService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = "http://localhost:3000/api") {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Save chat message via HTTP API
  async saveMessage(messageData: ChatMessage): Promise<ChatMessage> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/chat-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  // Get or create customer via HTTP API
  async getOrCreateCustomer(
    customerData: Customer,
    domainId: string
  ): Promise<Customer> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...customerData,
          domainId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create/get customer: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating/getting customer:", error);
      throw error;
    }
  }

  // Get or create chat room via HTTP API
  async getOrCreateChatRoom(customerId: string): Promise<ChatRoom> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/chat-rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          live: true,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create/get chat room: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating/getting chat room:", error);
      throw error;
    }
  }

  // Get chat history via HTTP API
  async getChatHistory(chatRoomId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/chat-messages?chatRoomId=${chatRoomId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get chat history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting chat history:", error);
      throw error;
    }
  }

  // Get domain data via HTTP API
  async getDomainData(domainId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/domains/${domainId}`);

      if (!response.ok) {
        throw new Error(`Failed to get domain data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting domain data:", error);
      throw error;
    }
  }
}
