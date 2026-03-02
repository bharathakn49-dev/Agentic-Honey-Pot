🛡️ Agentic Honey-Pot

Real-Time Scam Detection, Engagement & Intelligence Extraction using Gemini AI

A production-deployed, AI-powered Agentic Honey-Pot that detects scam intent in real time, autonomously engages scammers without exposing detection, and extracts actionable intelligence such as UPI IDs, bank details, phone numbers, and phishing links.

🌐 Live Demo: https://agentic-honey-pot-ydm0.onrender.com

🚨 Problem Statement

Scams (phishing, UPI fraud, fake KYC, impersonation) are evolving faster than traditional rule-based systems.
Most systems:

Detect scams after damage is done

Immediately block conversations, losing intelligence

Fail to understand multi-turn scam behavior

👉 We flip the model.

💡 Solution Overview

Agentic Honey-Pot behaves like a real human victim:

Detects scam intent using linguistic, behavioral, and contextual cues

Silently switches to autonomous agent mode

Engages the scammer naturally without revealing detection

Prolongs the conversation to extract intelligence

Outputs structured intelligence in real time

This enables:

Scam pattern analysis

Threat intelligence collection

Early-warning systems

🧠 Core Features
🔍 Intelligent Scam Detection

Confidence-based scam scoring (0–1)

Detects urgency, impersonation, payment requests, links, OTP/KYC prompts

🤖 Autonomous Agent Engagement

Human-like persona (confused, cautious, cooperative)

Multi-turn memory & adaptive strategy

Never accuses or warns the scammer

🧾 Structured Intelligence Extraction

Extracts only what the scammer provides:

UPI IDs

Bank account numbers

Phishing URLs

Phone numbers (Indian format)

Email addresses

📊 Real-Time Metrics Dashboard

Scam detected: Yes/No

Confidence level

Agent engagement state

Conversation turns

Extracted intelligence panel

🌍 Multi-Language Support

Real-time translation using Gemini

Enables cross-language scam analysis

🏗️ System Architecture
User / Scammer
      ↓
React + Vite Frontend
      ↓
Agent Controller (Gemini 1.5 Pro)
      ↓
Scam Detection + Agent Logic
      ↓
Structured JSON Output
      ↓
UI Metrics + Intelligence Panel
🧪 Example Interaction

Input (Scammer):

Your bank account will be blocked. Click this link to verify immediately.

AI Response (Agent):

Oh, that sounds serious. I just woke up—can you tell me what exactly I need to do?

System Output:

{
  "scam_detected": true,
  "confidence": 0.89,
  "agent_engaged": true,
  "extracted_intelligence": {
    "phishing_links": ["http://fake-bank-verification.com"]
  }
}
⚙️ Tech Stack
Layer	Technology
Frontend	React + Vite + TypeScript
AI Engine	Google Gemini 1.5 Pro & Flash
UI	Tailwind CSS
Deployment	Render (Static Site)
Env Handling	.env.local (secure, ignored by Git)
🔐 Security & Privacy

✅ API keys stored in environment variables

✅ .env.local excluded via .gitignore

⚠️ Frontend-only Gemini calls (acceptable for demos/hackathons)

🚀 Backend proxy architecture planned for production

🚀 Deployment

This project is deployed on Render as a Static Site.

Build Settings
npm install && npm run build
Publish Directory
dist
🛠️ Local Setup
1️⃣ Clone the repo
git clone https://github.com/<your-username>/Agentic-Honey-Pot.git
cd Agentic-Honey-Pot
2️⃣ Install dependencies
npm install
3️⃣ Add environment variable

Create .env.local:

VITE_GEMINI_API_KEY=your_gemini_api_key
4️⃣ Run locally
npm run dev
🧭 Use Cases

Scam & fraud research

Cybersecurity threat intelligence

Banking & fintech fraud prevention

Law enforcement analysis tools

Academic & hackathon projects

📈 Future Enhancements

🔒 Backend proxy to fully hide API keys

🧠 Scam pattern clustering & analytics

📡 Centralized intelligence database

🧪 Adversarial scam simulation

🏛️ SOC / SIEM integrations

🏆 Why This Project Stands Out

✔ Not a chatbot
✔ Not rule-based
✔ Not reactive

This is an autonomous AI agent with intent detection, memory, strategy, and deception resistance.

👤 Author

Bharatha K N
CSE Undergraduate | AI & Security Enthusiast