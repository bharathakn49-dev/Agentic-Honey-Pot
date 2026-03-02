
import React from 'react';

interface WelcomeModalProps {
  onDismiss: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🛡️ Agentic Honey-Pot – AI Fraud Detection Demo
          </h1>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <p className="text-lg">
                This demo showcases an AI-powered system designed to detect financial fraud by engaging scammers in real-time conversations.
              </p>
              <p className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-3 text-blue-800 italic rounded-r-lg">
                Imagine you are a scammer contacting a victim. Instead of a real person replying, an AI agent responds intelligently from a human perspective, keeps the conversation going, and safely extracts scam-related information for reporting and prevention.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How this demo works:</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>The AI behaves like a cautious real user during suspicious conversations</li>
                <li>Scam intent is detected in real time</li>
                <li>Phone numbers, UPI IDs, names, and payment requests are automatically extracted</li>
                <li>Risk level and confidence score are updated live</li>
                <li>Voice and multilingual conversations are supported</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">How to try it:</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Type or speak like a scammer</li>
                <li>Ask for money, OTPs, or UPI transfers</li>
                <li>Share a phone number or UPI ID</li>
                <li>Watch how the AI responds and captures intelligence</li>
              </ul>
            </section>

            <section className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Disclaimer:</h2>
              <p className="text-sm text-gray-600">
                This is a controlled demo for educational and safety purposes. No real transactions or personal data are processed.
              </p>
            </section>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 text-lg active:scale-[0.98] mt-auto"
        >
          Continue to Demo
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
