"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Lightbulb, RefreshCw } from "lucide-react";
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

  return `You are a senior Indian Chartered Accountant and tax advisor with 20+ years of experience. 
A user has just computed their income tax. Analyze their financial data deeply and give them HIGHLY SPECIFIC, ACTIONABLE tax-saving recommendations for FY 2024-25.

--- USER'S FINANCIAL PROFILE ---
Name: ${formData.personalInfo?.fullName || "User"}
Age: ${age} years

INCOME SOURCES:
- Gross Salary (before deductions): ₹${salary.toLocaleString('en-IN')}
- HRA received from employer: ₹${hra.toLocaleString('en-IN')}
- Business / Freelance income: ₹${business.toLocaleString('en-IN')}
- Other income (interest, dividends, etc.): ₹${other.toLocaleString('en-IN')}
- Home loan interest paid: ₹${homeLoanInt.toLocaleString('en-IN')}
- Professional tax paid: ₹${profTax.toLocaleString('en-IN')}
- Gross Total Income: ₹${taxData.grossIncome.toLocaleString('en-IN')}

CURRENT DEDUCTIONS BEING CLAIMED (Old Regime):
- Section 80C investments: ₹${sec80C.toLocaleString('en-IN')} (Limit: ₹1,50,000)
- 80D Health Insurance (Self): ₹${sec80DSelf.toLocaleString('en-IN')} (Limit: ₹25,000 or ₹50,000 if senior)
- 80D Health Insurance (Parents): ₹${sec80DPar.toLocaleString('en-IN')} (Limit: ₹50,000)
- NPS 80CCD(1B): ₹${nps.toLocaleString('en-IN')} (Limit: ₹50,000)
- Donations 80G: ₹${donations.toLocaleString('en-IN')}

TAX COMPUTATION:
- Old Regime: Total deductions ₹${taxData.old.deductions.toLocaleString('en-IN')}, Taxable income ₹${taxData.old.taxableIncome.toLocaleString('en-IN')}, Final Tax ₹${Math.round(taxData.old.finalTax).toLocaleString('en-IN')}
- New Regime: Total deductions ₹${taxData.new.deductions.toLocaleString('en-IN')}, Taxable income ₹${taxData.new.taxableIncome.toLocaleString('en-IN')}, Final Tax ₹${Math.round(taxData.new.finalTax).toLocaleString('en-IN')}
- RECOMMENDED: ${taxData.recommendation.regime} (saves ₹${Math.round(taxData.recommendation.savings).toLocaleString('en-IN')})

--- YOUR TASK ---
Give a structured, deeply personalized tax advisory report. Be SPECIFIC with exact rupee amounts wherever possible. Focus only on what's RELEVANT to this user's profile — skip generic advice that doesn't apply to them.

Structure your response EXACTLY like this:

## 🔍 Quick Assessment
In 2-3 lines, summarize their current tax situation and the biggest opportunity you see.

## 💰 Untapped Deductions
List ONLY the deductions they haven't fully utilized. Show exact gap (e.g., "You've used ₹X of ₹1,50,000 limit — investing ₹Y more in ELSS/PPF would save you ₹Z in tax").

## 🔄 Income Restructuring Tips
Based on their income mix (salary vs business vs other), suggest 2-3 specific restructuring ideas. For example:
- If they have business income, suggest specific expenses they can legitimately deduct
- If they have capital gains, suggest tax-loss harvesting or LTCG optimization
- If HRA is 0 but they pay rent, flag the missed exemption

## 📈 Investment Recommendations
Suggest specific financial products that will both save tax AND build wealth. Be precise about amounts.

## ⚠️ Regime Strategy
Explain in concrete numbers WHY the recommended regime is better for THEM specifically. If the gap is small, mention at what income/deduction level the other regime becomes better.

## 🎯 Action Plan
Give a numbered, prioritized to-do list of the top 5 things they should do THIS financial year, ordered by tax impact.

---
${languageInstruction}
Be conversational but expert. No fluff. Every point must be backed by actual numbers from their data.`;
}

export default function TaxAdvisor({ formData }) {
  const { language } = useLanguage();
  const t = dict[language];
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis("");

    try {
      const taxData = calculateTax(formData);
      const prompt = buildAnalysisPrompt(formData, taxData, t.aiContext);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Please analyze my tax situation and give me your expert recommendations." }],
          systemContext: prompt,
          stream: true
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.reply || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';

      // Streaming path
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
        // Fallback: non-streaming JSON
        const data = await response.json();
        setAnalysis(data.reply || '');
      }
    } catch (err) {
      setError("Could not generate analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="advisor-card">
      {/* Header */}
      <div className="advisor-header">
        <div className="advisor-header-left">
          <div className="advisor-icon">
            <Lightbulb size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem" }}>AI Tax Advisor</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Personalized analysis based on your profile
            </p>
          </div>
        </div>
        {!isLoading && (
          <button className="btn btn-secondary" onClick={runAnalysis} style={{ padding: "0.5rem 0.875rem", fontSize: "0.85rem", gap: "0.4rem" }}>
            <RefreshCw size={14} /> Re-analyze
          </button>
        )}
      </div>

      {/* Content */}
      <div className="advisor-body">
        {isLoading && !analysis && (
          <div className="advisor-loading">
            <div className="advisor-dots">
              <span /><span /><span />
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>
              Analyzing your income, deductions, and finding savings...
            </p>
          </div>
        )}

        {error && (
          <p style={{ color: "var(--error)", fontSize: "0.95rem" }}>{error}</p>
        )}

        {analysis && (
          <div className="advisor-markdown markdown-body">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
