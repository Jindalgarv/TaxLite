"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Lightbulb, RefreshCw, Send } from "lucide-react";
import { calculateTax } from "../utils/taxCalculator";
import { useLanguage } from "../context/LanguageContext";
import { dict } from "../utils/dictionary";

function buildAnalysisPrompt(formData, taxData, languageInstruction) {
  const salary      = parseFloat(formData.income?.salary)       || 0;
  const hra         = parseFloat(formData.income?.hra)          || 0;
  const business    = parseFloat(formData.income?.business)     || 0;
  const other       = parseFloat(formData.income?.otherSources) || 0;
  const homeLoanInt = parseFloat(formData.income?.homeLoanInt)  || 0;
  const profTax     = parseFloat(formData.income?.professionalTax) || 0;
  const sec80C      = parseFloat(formData.deductions?.lifeInsurance) || 0;
  const sec80DSelf  = parseFloat(formData.deductions?.healthInsurance) || 0;
  const sec80DPar   = parseFloat(formData.deductions?.healthParents) || 0;
  const nps         = parseFloat(formData.deductions?.nps)      || 0;
  const donations   = parseFloat(formData.deductions?.donations) || 0;
  const age         = parseInt(formData.personalInfo?.age)      || 30;

  return `You are a senior Indian CA. Be extremely concise — use short bullet points only, NO long paragraphs.

USER DATA (FY 2024-25):
- Age: ${age} | Salary: ₹${salary.toLocaleString('en-IN')} | HRA: ₹${hra.toLocaleString('en-IN')} | Business: ₹${business.toLocaleString('en-IN')} | Other: ₹${other.toLocaleString('en-IN')}
- Home Loan Interest: ₹${homeLoanInt.toLocaleString('en-IN')} | Prof. Tax: ₹${profTax.toLocaleString('en-IN')}
- 80C: ₹${sec80C.toLocaleString('en-IN')}/₹1,50,000 | 80D Self: ₹${sec80DSelf.toLocaleString('en-IN')} | 80D Parents: ₹${sec80DPar.toLocaleString('en-IN')} | NPS: ₹${nps.toLocaleString('en-IN')}/₹50,000 | 80G: ₹${donations.toLocaleString('en-IN')}
- Old Regime Tax: ₹${Math.round(taxData.old.finalTax).toLocaleString('en-IN')} | New Regime Tax: ₹${Math.round(taxData.new.finalTax).toLocaleString('en-IN')}
- Recommended: ${taxData.recommendation.regime} (saves ₹${Math.round(taxData.recommendation.savings).toLocaleString('en-IN')})

Give a SHORT advisory using EXACTLY this format. Each section max 3 bullet points. Be specific with rupee amounts.

## ✅ Verdict
One line summary of their situation and best choice.

## 💰 Missed Deductions
Only list deductions they haven't fully used with exact gap amount and potential tax saving.

## 🔄 Key Recommendations
Top 3 actions they should take THIS year, ordered by impact. Specific rupee amounts only.

## ⚠️ Watch Out
1-2 risks or commonly missed things specific to their profile.

Total response must be under 300 words. No intro, no conclusion, no fluff.
${languageInstruction}`;
}

function buildFollowUpContext(formData, taxData, languageInstruction) {
  const salary  = parseFloat(formData.income?.salary) || 0;
  const business = parseFloat(formData.income?.business) || 0;
  const age     = parseInt(formData.personalInfo?.age) || 30;
  return `You are an expert Indian CA chatbot. The user is asking a follow-up question about their tax analysis.

Their profile: Age ${age}, Salary ₹${salary.toLocaleString('en-IN')}, Business ₹${business.toLocaleString('en-IN')}, Gross Income ₹${taxData.grossIncome.toLocaleString('en-IN')}.
Old Regime Tax: ₹${Math.round(taxData.old.finalTax).toLocaleString('en-IN')} | New Regime Tax: ₹${Math.round(taxData.new.finalTax).toLocaleString('en-IN')} | Recommended: ${taxData.recommendation.regime}.

Answer concisely. Use ₹ for amounts. Be direct and specific to their numbers.
${languageInstruction}`;
}

export default function TaxAdvisor({ formData }) {
  const { language } = useLanguage();
  const t = dict[language];
  const taxData = calculateTax(formData);

  // Analysis state
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisError, setAnalysisError] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, isChatLoading]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis("");
    setMessages([]);

    try {
      const prompt = buildAnalysisPrompt(formData, taxData, t.aiContext);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Analyze my tax." }],
          systemContext: prompt,
          stream: true
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.reply || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/plain') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) setAnalysis(prev => prev + chunk);
        }
      } else {
        const data = await response.json();
        setAnalysis(data.reply || '');
      }
    } catch (err) {
      setAnalysisError("Could not generate analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => { runAnalysis(); }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isChatLoading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsChatLoading(true);

    try {
      const systemContext = buildFollowUpContext(formData, taxData, t.aiContext);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, systemContext })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="advisor-card">
      {/* Header */}
      <div className="advisor-header">
        <div className="advisor-header-left">
          <div className="advisor-icon">
            <Lightbulb size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>AI Tax Advisor</h3>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Analysis + ask follow-up questions below
            </p>
          </div>
        </div>
        {!isAnalyzing && (
          <button className="btn btn-secondary" onClick={runAnalysis} style={{ padding: "0.45rem 0.875rem", fontSize: "0.82rem", gap: "0.35rem" }}>
            <RefreshCw size={13} /> Re-analyze
          </button>
        )}
      </div>

      {/* Analysis Body */}
      <div className="advisor-body">
        {isAnalyzing && !analysis && (
          <div className="advisor-loading">
            <div className="advisor-dots"><span /><span /><span /></div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Analyzing your tax profile...
            </p>
          </div>
        )}
        {analysisError && <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>{analysisError}</p>}
        {analysis && (
          <div className="advisor-markdown markdown-body">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Divider */}
      {!isAnalyzing && analysis && (
        <>
          <div style={{ borderTop: "1px solid var(--border)", padding: "1rem 1.5rem 0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Image src="/logo.png" alt="AI" width={18} height={18} />
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Ask a follow-up question</span>
          </div>

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="chat-messages-inline" style={{ padding: "0 1.5rem", maxHeight: "320px" }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  {msg.role === "assistant" && (
                    <div className="chat-avatar" style={{ background: "transparent", border: "none", padding: 0 }}>
                      <Image src="/logo.png" alt="AI" width={20} height={20} />
                    </div>
                  )}
                  <div className="chat-bubble-content markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="chat-bubble chat-bubble-ai">
                  <div className="chat-avatar" style={{ background: "transparent", border: "none", padding: 0 }}>
                    <Image src="/logo.png" alt="AI" width={20} height={20} />
                  </div>
                  <div className="chat-bubble-content" style={{ color: "var(--text-muted)" }}>Thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Chat Input */}
          <div style={{ padding: "0.75rem 1.5rem 1.25rem" }}>
            <div className="chat-input-inline">
              <input
                className="chat-input"
                type="text"
                placeholder="e.g. Why is New Regime better for me?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                className={`chat-send-btn ${input.trim() ? 'chat-send-btn-active' : ''}`}
                onClick={sendMessage}
                disabled={!input.trim() || isChatLoading}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
