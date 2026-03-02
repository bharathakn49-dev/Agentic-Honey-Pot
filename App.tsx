import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import AgentOutputDisplay from './components/AgentOutputDisplay';
import WelcomeModal from './components/WelcomeModal';
import { sendScamDetectionPrompt, translateText } from './services/geminiService';
import { IChatMessage, IAgentResponse, MessageSender, IExtractedIntelligence } from './types';
import { ChartBarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message?: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    abort(): void;
    start(): void;
    stop(): void;
  }

  interface Window {
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
  }
}

const extractEntities = (text: string) => {
  const phoneRegex = /(?:\+91|0)?[6789]\d{9}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const upiRegex = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g;

  return {
    phone_numbers: Array.from(text.matchAll(phoneRegex)).map(m => m[0]),
    emails: Array.from(text.matchAll(emailRegex)).map(m => m[0]),
    upi_ids: Array.from(text.matchAll(upiRegex)).map(m => m[0]),
  };
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [agentOutput, setAgentOutput] = useState<IAgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'chat' | 'metrics'>('chat');
  
  const [accumulatedIntelligence, setAccumulatedIntelligence] = useState<IExtractedIntelligence>({
    upi_ids: [],
    bank_accounts: [],
    phishing_links: [],
    phone_numbers: [],
    emails: [],
  });

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [nativeVoiceAvailable, setNativeVoiceAvailable] = useState<boolean>(true);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  const languageOptions = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'kn-IN', name: 'Kannada (India)' },
    { code: 'ta-IN', name: 'Tamil (India)' },
    { code: 'te-IN', name: 'Telugu (India)' },
    { code: 'ml-IN', name: 'Malayalam (India)' },
    { code: 'mr-IN', name: 'Marathi (India)' },
    { code: 'bn-IN', name: 'Bengali (India)' },
    { code: 'gu-IN', name: 'Gujarati (India)' },
    { code: 'pa-IN', name: 'Punjabi (India)' },
  ];
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('en-US');

  // Welcome Modal Logic
  useEffect(() => {
    const hasBeenDismissed = sessionStorage.getItem('agentic_honeypot_welcome_dismissed');
    if (!hasBeenDismissed) {
      setIsWelcomeModalOpen(true);
    }
  }, []);

  const handleDismissWelcomeModal = () => {
    sessionStorage.setItem('agentic_honeypot_welcome_dismissed', 'true');
    setIsWelcomeModalOpen(false);
  };

  const checkVoiceAvailability = useCallback((langCode: string) => {
    if (!speechSynthesisRef.current) return false;
    const voices = speechSynthesisRef.current.getVoices();
    const target = langCode.toLowerCase().replace('_', '-');
    const langPrefix = target.split('-')[0];
    
    return voices.some(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang === target || vLang.startsWith(langPrefix);
    });
  }, []);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      const updateVoiceStatus = () => {
        setNativeVoiceAvailable(checkVoiceAvailability(selectedLanguageCode));
      };
      speechSynthesisRef.current.onvoiceschanged = updateVoiceStatus;
      updateVoiceStatus();
    }
  }, [selectedLanguageCode, checkVoiceAvailability]);

  const speakText = useCallback(async (text: string, langCode: string) => {
    if (!isVoiceOutputEnabled || !speechSynthesisRef.current || !text) return;
    
    speechSynthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesisRef.current.getVoices();
    
    const target = langCode.toLowerCase().replace('_', '-');
    const langPrefix = target.split('-')[0];

    let selectedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === target);

    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix));
    }

    if (!selectedVoice && !langPrefix.startsWith('en')) {
      selectedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === 'en-in');
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = langCode;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event: any) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    speechSynthesisRef.current.speak(utterance);
  }, [isVoiceOutputEnabled]);

  const handleSelectApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    } else {
      alert("API key selection feature is not available in this environment.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    } else if (!recognitionRef.current && isListening) {
      setIsListening(false);
    }
  }, [isListening]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (isLoading || text.trim() === '') return;
      if (speechSynthesisRef.current && isSpeaking) {
        speechSynthesisRef.current.cancel();
        setIsSpeaking(false);
      }
      stopListening();

      if (!hasApiKey && window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        alert('Please select an API key to proceed.');
        await handleSelectApiKey();
        return;
      }

      const clientExtracted = extractEntities(text);

      setIsLoading(true);
      let textToSendToGemini = text;
      let userMessageDisplay = text;
      const targetLangForGemini = 'en';
      const sourceLangForGemini = selectedLanguageCode.substring(0, 2);
      const selectedLangName = languageOptions.find(lang => lang.code === selectedLanguageCode)?.name || selectedLanguageCode;

      if (!selectedLanguageCode.startsWith('en')) {
        try {
          textToSendToGemini = await translateText(text, targetLangForGemini, sourceLangForGemini);
          userMessageDisplay = `Spoken in ${selectedLangName}: "${text}" -> Translated to English (System View): "${textToSendToGemini}"`;
        } catch (error) {
          textToSendToGemini = text;
          userMessageDisplay = `Spoken in ${selectedLangName}: "${text}" -> [Translation failed]: "${text}"`;
        }
      } else {
        userMessageDisplay = `Spoken in ${selectedLangName}: "${text}"`;
      }

      const userMessage: IChatMessage = {
        id: uuidv4(),
        sender: MessageSender.USER,
        text: userMessageDisplay,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await sendScamDetectionPrompt(messages, textToSendToGemini);
        setAgentOutput(response);

        setAccumulatedIntelligence((prev) => ({
          upi_ids: Array.from(new Set([...prev.upi_ids, ...response.extracted_intelligence.upi_ids, ...clientExtracted.upi_ids])),
          bank_accounts: Array.from(new Set([...prev.bank_accounts, ...response.extracted_intelligence.bank_accounts])),
          phishing_links: Array.from(new Set([...prev.phishing_links, ...response.extracted_intelligence.phishing_links])),
          phone_numbers: Array.from(new Set([...prev.phone_numbers, ...response.extracted_intelligence.phone_numbers, ...clientExtracted.phone_numbers])),
          emails: Array.from(new Set([...prev.emails, ...response.extracted_intelligence.emails, ...clientExtracted.emails])),
        }));

        let agentResponseText = response.agent_response;
        if (!selectedLanguageCode.startsWith('en')) {
          try {
            agentResponseText = await translateText(response.agent_response, sourceLangForGemini, targetLangForGemini);
          } catch (error) {
            agentResponseText = response.agent_response;
          }
        }

        const agentMessage: IChatMessage = {
          id: uuidv4(),
          sender: MessageSender.AGENT,
          text: agentResponseText,
          timestamp: new Date().toISOString(),
          scamDetected: response.scam_detected,
          confidence: response.confidence,
          agentEngaged: response.agent_engaged,
        };
        setMessages((prev) => [...prev, agentMessage]);
        speakText(agentResponseText, selectedLanguageCode);

      } catch (error: any) {
        console.error('Error processing message:', error);
        let errorMessage = error.message.includes("API key issue detected") ? error.message : 'Failed to get response. Please try again.';
        const agentErrorMessage: IChatMessage = {
          id: uuidv4(),
          sender: MessageSender.AGENT,
          text: errorMessage,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentErrorMessage]);
        if (error.message.includes("Requested entity was not found.")) setHasApiKey(false);
        speakText(errorMessage, 'en-US');
      } finally {
        setIsLoading(false);
        setTranscript('');
      }
    },
    [messages, isLoading, hasApiKey, handleSelectApiKey, speakText, isSpeaking, stopListening, selectedLanguageCode, languageOptions],
  );

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      if (speechSynthesisRef.current && isSpeaking) {
        speechSynthesisRef.current.cancel();
        setIsSpeaking(false);
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguageCode;
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript || interimTranscript);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = recognition;
      try { recognition.start(); } catch (e) { setIsListening(false); }
    } else {
      alert('Speech Recognition is not supported in this browser.');
    }
  }, [isSpeaking, selectedLanguageCode, isListening]);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleInputTextChange = useCallback((newText: string) => {
    if (isListening) stopListening();
    setTranscript(newText);
  }, [isListening, stopListening]);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full md:max-w-6xl md:h-[90dvh] bg-white md:rounded-xl shadow-2xl overflow-hidden relative">
      {isWelcomeModalOpen && (
        <WelcomeModal onDismiss={handleDismissWelcomeModal} />
      )}
      
      {/* Mobile Toggle Navigation */}
      <div className="lg:hidden flex border-b bg-gray-50 pt-safe">
        <button 
          onClick={() => setMobileView('chat')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold ${mobileView === 'chat' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500'}`}
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          Chat
        </button>
        <button 
          onClick={() => setMobileView('metrics')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold ${mobileView === 'metrics' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500'}`}
        >
          <ChartBarIcon className="h-5 w-5" />
          Metrics
        </button>
      </div>

      <div className={`flex-col flex-grow bg-gray-50 h-full overflow-hidden ${mobileView === 'chat' ? 'flex' : 'hidden lg:flex'} lg:w-2/3`}>
        <div className="p-4 bg-blue-600 text-white text-xl font-bold hidden md:block">
          🛡️ Honey-Pot Chat
        </div>
        <ChatWindow messages={messages} />
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onToggleSpeechRecognition={isListening ? stopListening : startListening}
          isListening={isListening}
          transcript={transcript}
          onInputChange={handleInputTextChange}
          languageOptions={languageOptions}
          selectedLanguageCode={selectedLanguageCode}
          onSelectLanguage={setSelectedLanguageCode}
        />
      </div>

      <div className={`h-full overflow-hidden ${mobileView === 'metrics' ? 'flex' : 'hidden lg:flex'} lg:w-1/3 border-l border-gray-200`}>
        <AgentOutputDisplay
          output={agentOutput}
          onSelectApiKey={handleSelectApiKey}
          isVoiceOutputEnabled={isVoiceOutputEnabled}
          onToggleVoiceOutput={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
          accumulatedIntelligence={accumulatedIntelligence}
          nativeVoiceAvailable={nativeVoiceAvailable}
          selectedLanguageCode={selectedLanguageCode}
          onBackToChat={() => setMobileView('chat')}
        />
      </div>
    </div>
  );
};

export default App;