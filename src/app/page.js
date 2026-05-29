"use client";

import { useState } from "react";
import ITRForm from "../components/ITRForm";
import ChatbotWidget from "../components/ChatbotWidget";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: ""
    },
    income: {
      salary: "",
      business: "",
      otherSources: ""
    },
    deductions: {
      lifeInsurance: "",
      healthInsurance: "",
      providentFund: ""
    }
  });

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handlePrev = () => setCurrentStep(prev => Math.max(0, prev - 1));

  return (
    <div className="container">
      {currentStep === 0 && (
        <div className="animate-fade-in" style={{ textAlign: "center", width: "100%", maxWidth: "800px" }}>
          <h1>File your taxes.<br/>Without the headache.</h1>
          <p style={{ fontSize: "1.25rem", margin: "1.5rem 0 3rem 0", maxWidth: "600px", marginLeft: "auto", marginRight: "auto", color: "var(--text-muted)" }}>
            Answer simple questions in plain English. Our AI takes care of the complex tax mapping, deductions, and forms.
          </p>
          <button className="btn btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }} onClick={handleNext}>
            Get Started
          </button>
        </div>
      )}

      {currentStep > 0 && (
        <div className="animate-fade-in" style={{ width: "100%", maxWidth: currentStep === 4 ? "1200px" : "600px", transition: "max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="step-indicator">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step} 
                className={`step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              />
            ))}
          </div>

          <ITRForm 
            currentStep={currentStep} 
            formData={formData} 
            setFormData={setFormData}
            onNext={handleNext}
            onPrev={handlePrev}
          />

          {/* Chat integrated below results on step 4 */}
          {currentStep === 4 && (
            <div style={{ marginTop: "4rem", borderTop: "1px solid var(--border)", paddingTop: "3rem" }}>
              <ChatbotWidget formData={formData} />
            </div>
          )}
        </div>
      )}

      {/* Footer Signature */}
      <div style={{ position: "absolute", bottom: "1.5rem", left: "0", width: "100%", textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem", letterSpacing: "0.02em" }}>
        Made with 🤍 by Garv
      </div>
    </div>
  );
}
