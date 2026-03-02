
export enum MessageSender {
  USER = 'user',
  AGENT = 'agent',
}

export interface IChatMessage {
  id: string;
  sender: MessageSender;
  text: string; // This will now contain the formatted string with original and translated text for user messages
  timestamp: string;
  // Added for agent messages to store analysis results directly in chat history
  scamDetected?: boolean;
  confidence?: number;
  agentEngaged?: boolean;
}

export interface IExtractedIntelligence {
  upi_ids: string[];
  bank_accounts: string[];
  phishing_links: string[];
  phone_numbers: string[]; // Added
  emails: string[];        // Added
}

export interface IConversationMetrics {
  turns: number;
}

export interface IAgentResponse {
  scam_detected: boolean;
  confidence: number;
  agent_engaged: boolean;
  conversation_metrics: IConversationMetrics;
  extracted_intelligence: IExtractedIntelligence;
  agent_response: string;
}
