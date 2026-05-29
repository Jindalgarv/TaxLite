"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function StepGuidance({ currentStep, formData }) {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // We only fetch suggestions for steps 1, 2, 3
    if (currentStep < 1 || currentStep > 3) {
      setSuggestion("");
      return;
    }

    const fetchSuggestion = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: currentStep, data: formData })
        });
        
        if (response.ok) {
          const result = await response.json();
          setSuggestion(result.suggestion);
        } else {
          setSuggestion("Unable to load AI suggestions at the moment.");
        }
      } catch (err) {
        console.error(err);
        setSuggestion("Error connecting to AI service.");
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchSuggestion();
    }, 1000); // Debounce fetching

    return () => clearTimeout(timer);
  }, [currentStep, formData]);

  if (currentStep === 0 || currentStep === 4) return null;

  return (
    <div className="animate-fade-in" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--accent)", background: "rgba(59, 130, 246, 0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "var(--accent)" }}>
        <Sparkles size={18} />
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>AI Assistant Says:</h3>
      </div>
      
      {loading ? (
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", color: "var(--text-muted)", fontSize: "0.95rem" }}>
          <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid var(--border)", borderRadius: "50%", borderTopColor: "var(--accent)", animation: "spin 1s linear infinite" }}></div>
          Reviewing your inputs...
        </div>
      ) : (
        <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-color)" }}>
          {suggestion ? (
            <p dangerouslySetInnerHTML={{ __html: suggestion.replace(/\n/g, '<br/>') }} />
          ) : (
            <p style={{ color: "var(--text-muted)" }}>Fill in the details above to get simple, jargon-free tax-saving tips based on your answers.</p>
          )}
        </div>
      )}
      <style jsx>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
