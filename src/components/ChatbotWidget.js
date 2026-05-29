"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { calculateTax } from "../utils/taxCalculator";
import { useLanguage } from "../context/LanguageContext";
import { dict } from "../utils/dictionary";

function buildSystemContext(formData, languageInstruction) {
  const tax = calculateTax(formData);
  return `You are an expert Indian Income Tax assistant. The user has just completed their tax computation. Here is their complete data — use it to answer any question accurately with their exact numbers:

TAXPAYER: ${formData.personalInfo.fullName || "Not provided"}

INCOME:
- Salary: ₹${parseFloat(formData.income.salary) || 0}
- Business/Freelance: ₹${parseFloat(formData.income.business) || 0}
- Other Sources: ₹${parseFloat(formData.income.otherSources) || 0}
- Gross Total Income: ₹${tax.grossIncome}

DEDUCTIONS:
- Section 80C: ₹${Math.min(parseFloat(formData.deductions.lifeInsurance) || 0, 150000)}
- Section 80D: ₹${Math.min(parseFloat(formData.deductions.healthInsurance) || 0, 75000)}
- Section 80CCD 1B: ₹${Math.min(parseFloat(formData.deductions.providentFund) || 0, 50000)}

OLD REGIME: Deductions ₹${tax.old.deductions}, Taxable ₹${tax.old.taxableIncome}, Tax ₹${tax.old.taxBeforeCess}, Cess ₹${tax.old.cess}, Final ₹${tax.old.finalTax}
NEW REGIME: Deductions ₹${tax.new.deductions}, Taxable ₹${tax.new.taxableIncome}, Tax ₹${tax.new.taxBeforeCess}, Cess ₹${tax.new.cess}, Final ₹${tax.new.finalTax}

RECOMMENDATION: ${tax.recommendation.regime} — ${tax.recommendation.message}

${languageInstruction}`;
}

export default function ChatbotWidget({ formData }) {
  const { language } = useLanguage();
  const t = dict[language];

  const [messages, setMessages] = useState([
    { role: "assistant", content: t.aiContext ? "Have any questions about your results? Ask me anything!" : "Have any questions about your results? Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const systemContext = buildSystemContext(formData, t.aiContext);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          systemContext 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Please check your connection." }]);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div className="chat-header-icon" style={{ background: "transparent", padding: 0 }}>
          <Image src="/logo.png" alt="AI Logo" width={24} height={24} />
        </div>
        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-color)" }}>Ask AI</h3>
      </div>

      <div className="chat-messages-inline">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
            {msg.role === "assistant" && (
              <div className="chat-avatar" style={{ background: "transparent", padding: 0, border: "none", boxShadow: "none" }}>
                <Image src="/logo.png" alt="AI Avatar" width={20} height={20} />
              </div>
            )}
            <div className="chat-bubble-content markdown-body">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble chat-bubble-ai">
            <div className="chat-avatar" style={{ background: "transparent", padding: 0, border: "none", boxShadow: "none" }}>
              <Image src="/logo.png" alt="AI Avatar" width={20} height={20} />
            </div>
            <div className="chat-bubble-content" style={{ color: "var(--text-muted)" }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-inline">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="e.g. Why is the New Regime better for me?"
          className="chat-input"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`chat-send-btn ${input.trim() && !isLoading ? 'chat-send-btn-active' : ''}`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
