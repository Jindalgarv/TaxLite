"use client";

import { useState } from "react";
import { CheckCircle, ArrowRight, ArrowLeft, TrendingDown, TrendingUp, IndianRupee, Shield, Sparkles } from "lucide-react";
import { calculateTax } from "../utils/taxCalculator";

function formatINR(num) {
  return Math.round(num).toLocaleString('en-IN');
}

export default function ITRForm({ currentStep, formData, setFormData, onNext, onPrev }) {
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const taxData = currentStep === 4 ? calculateTax(formData) : null;

  return (
    <div>
      {currentStep === 1 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>Let's start with who you are.</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>This info is needed for your tax computation.</p>
          <div className="form-group">
            <label>What is your full name?</label>
            <input type="text" value={formData.personalInfo.fullName} onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)} placeholder="Rahul Sharma" />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>How did you earn money this year?</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>Enter your annual income from all sources.</p>
          <div className="form-group">
            <label>What was your total salary before taxes? (₹)</label>
            <input type="number" value={formData.income.salary} onChange={(e) => handleChange('income', 'salary', e.target.value)} placeholder="e.g. 1200000" />
          </div>
          <div className="form-group">
            <label>Did you run any business or freelance? If yes, how much did you earn? (₹)</label>
            <input type="number" value={formData.income.business} onChange={(e) => handleChange('income', 'business', e.target.value)} placeholder="e.g. 500000" />
          </div>
          <div className="form-group">
            <label>Did you earn from savings interest, dividends, or other sources? (₹)</label>
            <input type="number" value={formData.income.otherSources} onChange={(e) => handleChange('income', 'otherSources', e.target.value)} placeholder="e.g. 20000" />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>Let's find ways to reduce your tax.</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>Just tell us what you spent money on. We'll figure out the tax benefits.</p>
          <div className="form-group">
            <label>Did you pay for Life Insurance, Provident Fund (PPF), or children's tuition fees? (₹)</label>
            <input type="number" value={formData.deductions.lifeInsurance} onChange={(e) => handleChange('deductions', 'lifeInsurance', e.target.value)} placeholder="e.g. 150000" />
          </div>
          <div className="form-group">
            <label>Did you pay health insurance premiums for yourself or your parents? (₹)</label>
            <input type="number" value={formData.deductions.healthInsurance} onChange={(e) => handleChange('deductions', 'healthInsurance', e.target.value)} placeholder="e.g. 25000" />
          </div>
          <div className="form-group">
            <label>Did you contribute to the National Pension Scheme (NPS)? (₹)</label>
            <input type="number" value={formData.deductions.providentFund} onChange={(e) => handleChange('deductions', 'providentFund', e.target.value)} placeholder="e.g. 50000" />
          </div>
        </div>
      )}

      {currentStep === 4 && taxData && (
        <div className="animate-fade-in">
          {/* Recommendation Banner */}
          <div className="result-banner">
            <div className="result-banner-icon">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 style={{ marginBottom: "0.25rem" }}>
                {taxData.recommendation.regime} wins!
              </h2>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "1.05rem" }}>
                {taxData.recommendation.message}
              </p>
            </div>
          </div>

          {/* Income Summary */}
          <div className="result-section">
            <div className="result-section-header">
              <IndianRupee size={18} />
              <h3 style={{ margin: 0 }}>Your Income</h3>
            </div>
            <div className="result-grid">
              <div className="result-row">
                <span className="result-label">Salary Income</span>
                <span className="result-value">₹{formatINR(parseFloat(formData.income.salary) || 0)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Business / Freelance Income</span>
                <span className="result-value">₹{formatINR(parseFloat(formData.income.business) || 0)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Other Sources (Interest, etc.)</span>
                <span className="result-value">₹{formatINR(parseFloat(formData.income.otherSources) || 0)}</span>
              </div>
              <div className="result-row result-row-total">
                <span className="result-label">Gross Total Income</span>
                <span className="result-value">₹{formatINR(taxData.grossIncome)}</span>
              </div>
            </div>
          </div>

          {/* Regime Comparison */}
          <div className="regime-compare">
            {/* Old Regime Card */}
            <div className={`regime-card ${taxData.recommendation.regime === 'Old Tax Regime' ? 'regime-card-winner' : ''}`}>
              {taxData.recommendation.regime === 'Old Tax Regime' && (
                <div className="regime-badge">Best for You</div>
              )}
              <h3 style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>Old Regime</h3>
              <div className="regime-row">
                <span>Deductions Allowed</span>
                <span style={{ color: "var(--success)" }}>- ₹{formatINR(taxData.old.deductions)}</span>
              </div>
              <div className="regime-row">
                <span>Taxable Income</span>
                <span>₹{formatINR(taxData.old.taxableIncome)}</span>
              </div>
              <div className="regime-row">
                <span>Computed Tax</span>
                <span>₹{formatINR(taxData.old.taxBeforeCess)}</span>
              </div>
              <div className="regime-row">
                <span>Cess (4%)</span>
                <span>₹{formatINR(taxData.old.cess)}</span>
              </div>
              <div className="regime-row regime-row-total">
                <span>You Pay</span>
                <span>₹{formatINR(taxData.old.finalTax)}</span>
              </div>
            </div>

            {/* New Regime Card */}
            <div className={`regime-card ${taxData.recommendation.regime === 'New Tax Regime' ? 'regime-card-winner' : ''}`}>
              {taxData.recommendation.regime === 'New Tax Regime' && (
                <div className="regime-badge">Best for You</div>
              )}
              <h3 style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>New Regime</h3>
              <div className="regime-row">
                <span>Deductions Allowed</span>
                <span style={{ color: "var(--success)" }}>- ₹{formatINR(taxData.new.deductions)}</span>
              </div>
              <div className="regime-row">
                <span>Taxable Income</span>
                <span>₹{formatINR(taxData.new.taxableIncome)}</span>
              </div>
              <div className="regime-row">
                <span>Computed Tax</span>
                <span>₹{formatINR(taxData.new.taxBeforeCess)}</span>
              </div>
              <div className="regime-row">
                <span>Cess (4%)</span>
                <span>₹{formatINR(taxData.new.cess)}</span>
              </div>
              <div className="regime-row regime-row-total">
                <span>You Pay</span>
                <span>₹{formatINR(taxData.new.finalTax)}</span>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="result-section">
            <div className="result-section-header">
              <Shield size={18} />
              <h3 style={{ margin: 0 }}>Deductions Mapped (Old Regime)</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              We automatically mapped your simple answers to the right tax laws.
            </p>
            <div className="result-grid">
              <div className="result-row">
                <span className="result-label">Standard Deduction (applied to salary)</span>
                <span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(Math.min(parseFloat(formData.income.salary) || 0, 50000))}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Section 80C (LIC / PPF / Tuition)</span>
                <span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(Math.min(parseFloat(formData.deductions.lifeInsurance) || 0, 150000))}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Section 80D (Health Insurance)</span>
                <span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(Math.min(parseFloat(formData.deductions.healthInsurance) || 0, 75000))}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Section 80CCD(1B) (NPS)</span>
                <span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(Math.min(parseFloat(formData.deductions.providentFund) || 0, 50000))}</span>
              </div>
            </div>
          </div>
        </div>
      )}


      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary" onClick={onPrev} style={{ opacity: currentStep === 1 ? 0.5 : 1, pointerEvents: currentStep === 1 ? 'none' : 'auto' }}>
          <ArrowLeft size={18} /> Back
        </button>
        {currentStep < 4 && (
          <button className="btn btn-primary" onClick={onNext}>
            Continue <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
