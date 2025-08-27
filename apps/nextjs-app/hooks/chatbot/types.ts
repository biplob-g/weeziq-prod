// Type definitions for multi-page chatbot

export type ChatbotPage =
  | "landing"
  | "history"
  | "chat"
  | "helpdesk"
  | "answer";

export interface ConversationData {
  id: string;
  messages: {
    id: string;
    message: string;
    role: "OWNER" | "CUSTOMER";
    createdAt: Date;
  }[];
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  countryCode: string;
}

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  link?: string;
  isNewMessage?: boolean;
}

export interface HelpDeskQuestion {
  id: string;
  question: string;
  answered: string;
  domainId: string | null;
}

export interface ChatbotPageState {
  currentPage: ChatbotPage;
  previousPage: ChatbotPage | null;
  pageData: {
    landing: {
      hasPreviousMessages: boolean;
      customerName: string;
      lastMessage?: {
        message: string;
        createdAt: Date;
      };
    };
    history: {
      conversations: ConversationData[];
      customer: CustomerData | null;
    };
    chat: {
      messages: ChatMessage[];
      isTyping: boolean;
    };
    helpdesk: {
      questions: HelpDeskQuestion[];
      selectedCategory: string;
      searchQuery: string;
    };
    answer: {
      question: HelpDeskQuestion | null;
      answer: string | null;
      related: HelpDeskQuestion[];
    };
  };
  navigation: {
    canGoBack: boolean;
    breadcrumbs: string[];
  };
}
