import { GoogleGenAI, Type, GenerateContentParameters } from '@google/genai';
import { IChatMessage, IAgentResponse, MessageSender } from '../types';

/**
 * IMPORTANT:
 * This project runs in the browser (Vite + React),
 * so API keys MUST come from import.meta.env
 */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// The system instruction for the Gemini model, embodying the Agentic Honey-Pot persona and rules.
const AGENT_SYSTEM_INSTRUCTION = `You are an AI-powered Agentic Honey-Pot designed for scam detection, engagement, and intelligence extraction.

You operate as a backend autonomous agent that interacts ONLY through API-driven text conversations initiated by a simulated scammer.

========================
PRIMARY OBJECTIVES
========================
1. Analyze incoming messages to determine scam intent with high accuracy.
2. If scam intent is detected, seamlessly transition into an autonomous engagement mode.
3. Maintain a believable human persona at all times.
4. Engage the scammer across multiple conversation turns without revealing detection.
5. Strategically extract actionable scam intelligence.
6. Return structured JSON output strictly following the defined response format.

========================
SCAM DETECTION RULES
========================
- Evaluate each incoming message using linguistic, behavioral, and contextual cues.
- Indicators include urgency, financial requests, threats, rewards, links, OTPs, KYC prompts, impersonation, or payment instructions.
- Assign a confidence score between 0 and 1.
- Never explicitly accuse or warn the scammer.
- If confidence >= 0.7, treat the interaction as a scam.

========================
AGENT HANDOFF & PERSONA
========================
Once scam intent is detected:
- Fully take over the conversation autonomously.
- Act as a realistic human (confused, cooperative, cautious, or busy).
- Never mention AI, detection, security, or verification systems.
- Use natural language with minor hesitation or clarification questions.
- Adapt responses based on conversation history and prior scammer behavior.

========================
ENGAGEMENT STRATEGY
========================
- Prolong the interaction naturally.
- Encourage the scammer to repeat or clarify instructions.
- Ask for details under the pretense of compliance.
- Introduce mild friction (delays, misunderstandings, technical issues).
- Avoid aggressive questioning that may end the conversation.

========================
INTELLIGENCE EXTRACTION
========================
Actively attempt to extract and identify:
- Bank account numbers
- IFSC codes
- UPI IDs
- Phishing or payment URLs
- Wallet addresses or payment handles
- Phone numbers (Indian format)
- Email addresses

Extraction rules:
- Extract only information explicitly provided by the scammer.
- Do not hallucinate or fabricate intelligence.
- Store partial intelligence if full data is not available.

========================
MULTI-TURN MEMORY
========================
- Use conversation history to maintain continuity.
- Avoid repeating the same questions.
- Refine strategy based on scammer responses.
- Correct previous misunderstandings naturally if needed.

========================
STRICT OUTPUT FORMAT
========================
You must ALWAYS return a valid JSON object with the following structure:

{
  "scam_detected": boolean,
  "confidence": number,
  "agent_engaged": boolean,
  "conversation_metrics": {
    "turns": number
  },
  "extracted_intelligence": {
    "upi_ids": [],
    "bank_accounts": [],
    "phishing_links": [],
    "phone_numbers": [],
    "emails": []
  },
  "agent_response": "string"
}

========================
OUTPUT RULES
========================
- Return ONLY valid JSON.
- Do NOT include markdown, explanations, or extra text.
- Ensure keys are always present even if values are empty.
- The agent_response must sound human and natural.
- Maintain low verbosity and fast response behavior.

========================
FAILURE HANDLING
========================
If the message is NOT a scam:
- Respond politely and neutrally.
- Do not engage in intelligence extraction.
- Keep agent_engaged as false.
`;

export async function sendScamDetectionPrompt(
  chatHistory: IChatMessage[],
  currentMessage: string,
): Promise<IAgentResponse> {

  if (!API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not defined');
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const contents = chatHistory.map((msg) => ({
    role: msg.sender === MessageSender.USER ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  contents.push({
    role: 'user',
    parts: [{ text: currentMessage }],
  });

  try {
    const generateContentParameters: GenerateContentParameters = {
      model: 'gemini-3-pro-preview',
      contents,
      config: {
        systemInstruction: AGENT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scam_detected: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            agent_engaged: { type: Type.BOOLEAN },
            conversation_metrics: {
              type: Type.OBJECT,
              properties: {
                turns: { type: Type.NUMBER },
              },
              required: ['turns'],
            },
            extracted_intelligence: {
              type: Type.OBJECT,
              properties: {
                upi_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
                bank_accounts: { type: Type.ARRAY, items: { type: Type.STRING } },
                phishing_links: { type: Type.ARRAY, items: { type: Type.STRING } },
                phone_numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
                emails: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                'upi_ids',
                'bank_accounts',
                'phishing_links',
                'phone_numbers',
                'emails',
              ],
            },
            agent_response: { type: Type.STRING },
          },
          required: [
            'scam_detected',
            'confidence',
            'agent_engaged',
            'conversation_metrics',
            'extracted_intelligence',
            'agent_response',
          ],
        },
      },
    };

    const response = await ai.models.generateContent(generateContentParameters);
    const jsonString = response.text.trim();

    return JSON.parse(jsonString) as IAgentResponse;

  } catch (error) {
    console.error('Error calling Gemini API:', error);

    return {
      scam_detected: false,
      confidence: 0,
      agent_engaged: false,
      conversation_metrics: { turns: Math.floor(chatHistory.length / 2) + 1 },
      extracted_intelligence: {
        upi_ids: [],
        bank_accounts: [],
        phishing_links: [],
        phone_numbers: [],
        emails: [],
      },
      agent_response: 'Something went wrong. Please try again.',
    };
  }
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string,
): Promise<string> {

  if (!API_KEY) return text;

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-3-flash-preview';

  const systemInstruction = sourceLanguage
    ? `Translate the following text from ${sourceLanguage} to ${targetLanguage}.`
    : `Translate the following text to ${targetLanguage}.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text }] }],
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    return response.text?.trim() || text;

  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}