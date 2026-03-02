import React, { useEffect, useRef } from 'react';
import { MicrophoneIcon, StopIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface LanguageOption {
  code: string;
  name: string;
}

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onToggleSpeechRecognition: () => void;
  isListening: boolean;
  transcript: string;
  onInputChange: (newText: string) => void;
  languageOptions: LanguageOption[];
  selectedLanguageCode: string;
  onSelectLanguage: (code: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  onToggleSpeechRecognition,
  isListening,
  transcript,
  onInputChange,
  languageOptions,
  selectedLanguageCode,
  onSelectLanguage,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = transcript;
    }
  }, [transcript]);

  const handleSend = () => {
    const textToSend = inputRef.current ? inputRef.current.value : '';
    if (textToSend.trim() && !isLoading) {
      onSendMessage(textToSend);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      onInputChange('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
  };

  return (
    <div className="p-3 md:p-4 bg-white border-t border-gray-200 pb-safe">
      <div className="flex flex-col gap-2">
        {/* Top controls: Language and Voice Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLanguageCode}
            onChange={(e) => onSelectLanguage(e.target.value)}
            className="flex-1 min-w-0 h-10 px-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-gray-50 font-semibold text-sm"
            aria-label="Select input language"
            disabled={isLoading || isListening}
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={onToggleSpeechRecognition}
            className={`h-10 w-10 flex items-center justify-center rounded-full text-white shadow-sm transition-all active:scale-90 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : isListening
                ? 'bg-red-500 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
            disabled={isLoading}
          >
            {isListening ? (
              <StopIcon className="h-5 w-5" />
            ) : (
              <MicrophoneIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 h-12 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder:text-gray-400 font-medium text-base shadow-inner"
            placeholder={isListening ? 'Listening...' : 'Type or speak scam query...'}
            defaultValue={transcript}
            onChange={handleLocalInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            aria-live="polite"
          />
          <button
            onClick={handleSend}
            className={`h-12 w-12 flex items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 ${
              isLoading || !transcript.trim() && (!inputRef.current || !inputRef.current.value.trim())
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <PaperAirplaneIcon className="h-6 w-6 -rotate-45 relative left-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;