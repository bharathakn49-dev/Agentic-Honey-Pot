import React, { useState } from 'react';
import { IAgentResponse, IExtractedIntelligence } from '../types';
import { ChevronDownIcon, ChevronUpIcon, PhoneIcon, EnvelopeIcon, CreditCardIcon, LinkIcon, ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

interface AgentOutputDisplayProps {
  output: IAgentResponse | null;
  onSelectApiKey: () => void;
  isVoiceOutputEnabled: boolean;
  onToggleVoiceOutput: () => void;
  accumulatedIntelligence: IExtractedIntelligence;
  nativeVoiceAvailable: boolean;
  selectedLanguageCode: string;
  onBackToChat?: () => void;
}

const AgentOutputDisplay: React.FC<AgentOutputDisplayProps> = ({
  output,
  onSelectApiKey,
  isVoiceOutputEnabled,
  onToggleVoiceOutput,
  accumulatedIntelligence,
  nativeVoiceAvailable,
  selectedLanguageCode,
  onBackToChat
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const renderIntelligence = (intelligence: IExtractedIntelligence) => {
    const hasData = intelligence.upi_ids.length > 0 || 
                    intelligence.bank_accounts.length > 0 || 
                    intelligence.phishing_links.length > 0 ||
                    intelligence.phone_numbers.length > 0 ||
                    intelligence.emails.length > 0;

    return (
      <div className="space-y-4">
        {intelligence.phone_numbers.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 text-gray-800 font-bold">
              <PhoneIcon className="h-4 w-4 text-blue-600" />
              <span>Phone Numbers:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {intelligence.phone_numbers.map((id, i) => (
                <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-md text-sm text-black font-medium border border-gray-200 break-all">
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}

        {intelligence.upi_ids.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 text-gray-800 font-bold">
              <CreditCardIcon className="h-4 w-4 text-green-600" />
              <span>UPI IDs:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {intelligence.upi_ids.map((id, i) => (
                <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-md text-sm text-black font-medium border border-gray-200 break-all">
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}

        {intelligence.emails.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 text-gray-800 font-bold">
              <EnvelopeIcon className="h-4 w-4 text-purple-600" />
              <span>Emails:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {intelligence.emails.map((id, i) => (
                <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-md text-sm text-black font-medium border border-gray-200 break-all">
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}

        {intelligence.bank_accounts.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 text-gray-800 font-bold">
              <CreditCardIcon className="h-4 w-4 text-orange-600" />
              <span>Bank Accounts:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {intelligence.bank_accounts.map((acc, i) => (
                <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-md text-sm text-black font-medium border border-gray-200 break-all">
                  {acc}
                </span>
              ))}
            </div>
          </div>
        )}

        {intelligence.phishing_links.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 text-gray-800 font-bold">
              <LinkIcon className="h-4 w-4 text-red-600" />
              <span>Phishing Links:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {intelligence.phishing_links.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline bg-gray-100 px-2 py-0.5 rounded-md text-sm font-medium border border-gray-200 break-all"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}

        {!hasData && (
          <div className="text-gray-500 italic text-sm">No intelligence extracted yet.</div>
        )}
      </div>
    );
  };

  const getRiskBadge = (confidence: number) => {
    let colorClass = 'bg-gray-500';
    let text = 'Low';
    if (confidence < 0.3) { colorClass = 'bg-green-500'; text = 'Low'; }
    else if (confidence < 0.7) { colorClass = 'bg-orange-500'; text = 'Medium'; }
    else { colorClass = 'bg-red-500'; text = 'High'; }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${colorClass}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Top Mobile Bar */}
      <div className="lg:hidden p-4 border-b flex items-center justify-between bg-gray-50">
        <button 
          onClick={onBackToChat}
          className="flex items-center gap-1 text-blue-600 font-bold"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Chat
        </button>
        <h2 className="text-lg font-bold text-gray-800">Agent Intelligence</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100">
          <p className="font-bold mb-1">Agent Status:</p>
          <p>Analyzing conversation flow and extracting intelligence in real-time.</p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Agent Metrics</h2>
          {!output ? (
            <div className="text-gray-500 italic py-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-300">
              Start a conversation to see analysis
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">Scam Detected:</span>
                <span className={`font-bold px-3 py-1 rounded-full text-xs ${output.scam_detected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {output.scam_detected ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">Confidence:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-800">{(output.confidence * 100).toFixed(0)}%</span>
                  {getRiskBadge(output.confidence)}
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">Agent Engaged:</span>
                <span className={`font-bold ${output.agent_engaged ? 'text-green-600' : 'text-gray-400'}`}>
                  {output.agent_engaged ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">Turns:</span>
                <span className="font-mono bg-white px-2 rounded border">{output.conversation_metrics.turns}</span>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  Extracted Intelligence
                </h3>
                {renderIntelligence(accumulatedIntelligence)}
              </div>
            </div>
          )}
        </section>

        <section className="border-t pt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Voice Settings</h3>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="font-medium text-gray-700">Native Audio Playback</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isVoiceOutputEnabled} onChange={onToggleVoiceOutput} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {isVoiceOutputEnabled && !nativeVoiceAvailable && !selectedLanguageCode.startsWith('en') && (
            <div className="mt-3 flex items-start gap-2 text-xs text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200 animate-fade-in">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
              <span>Native voice unavailable on this device. The system will use the best available pronunciation.</span>
            </div>
          )}
        </section>

        <section className="border-t pt-6">
          <button 
            onClick={onSelectApiKey}
            className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-all font-bold shadow-md active:scale-[0.98]"
          >
            Update API Key
          </button>
        </section>

        <section className="border-t pt-6">
          <button 
            onClick={() => setIsGuideOpen(!isGuideOpen)} 
            className="flex justify-between items-center w-full text-lg font-bold text-gray-800 focus:outline-none"
          >
            User Guide
            {isGuideOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </button>
          {isGuideOpen && (
            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-1">1. Select Language</h4>
                <p>Use the dropdown in the chat to pick your language.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-1">2. Simulate a Scam</h4>
                <p>Provide fake phone numbers, ask for UPI transfers, or urgent help.</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-1">3. Observe the AI</h4>
                <p>Watch how the "Agent Intelligence" panel updates live as data is captured.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

export default AgentOutputDisplay;