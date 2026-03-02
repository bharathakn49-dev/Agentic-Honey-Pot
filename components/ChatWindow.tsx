import React, { useRef, useEffect } from 'react';
import { IChatMessage, MessageSender } from '../types';

interface ChatWindowProps {
  messages: IChatMessage[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle mobile keyboard open resize
  useEffect(() => {
    const handleResize = () => {
      scrollToBottom(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRiskBadge = (confidence: number | undefined) => {
    if (confidence === undefined) return null;

    let colorClass = '';
    let text = 'Risk: Unknown';

    if (confidence < 0.3) {
      colorClass = 'bg-green-500';
      text = 'Risk: Low';
    } else if (confidence >= 0.3 && confidence < 0.7) {
      colorClass = 'bg-orange-500';
      text = 'Risk: Medium';
    } else {
      colorClass = 'bg-red-500';
      text = 'Risk: High';
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${colorClass}`}
        aria-label={text}
      >
        {text}
      </span>
    );
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 p-3 md:p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4"
    >
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785c-.442.483.023 1.211.639 1.061a11.026 11.026 0 0 0 2.237-1.002c.499-.305 1.144-.306 1.665-.027A9.99 9.99 0 0 0 12 20.25Z" />
            </svg>
          </div>
          <p className="text-sm">No messages yet. Try engaging the honey-pot agent!</p>
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex animate-fade-in ${
            message.sender === MessageSender.USER ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[85%] md:max-w-[75%] p-3 rounded-2xl text-sm md:text-base flex flex-col shadow-sm ${
              message.sender === MessageSender.USER
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
            <div className={`flex items-center gap-2 mt-2 ${message.sender === MessageSender.USER ? 'justify-end text-blue-100' : 'justify-start text-gray-400'}`}>
              {message.sender === MessageSender.AGENT && message.scamDetected && message.confidence !== undefined && (
                getRiskBadge(message.confidence)
              )}
              <span className="text-[10px] opacity-80">{formatTimestamp(message.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
    </div>
  );
};

export default ChatWindow;