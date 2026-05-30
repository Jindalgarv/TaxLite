"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ArrowRight, ArrowLeft, IndianRupee, Shield } from "lucide-react";
import { calculateTax } from "../utils/taxCalculator";
import { useLanguage } from "../context/LanguageContext";
import { dict } from "../utils/dictionary";

function formatINR(num) {
  return Math.round(num).toLocaleString('en-IN');
}

export default function ITRForm({ currentStep, formData, setFormData, onNext, onPrev }) {
  const { language } = useLanguage();
  const t = dict[language];

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const taxData = currentStep === 5 ? calculateTax(formData) : null;

  return (
    <div>
      {/* ── Step 1: Personal Info ── */}
      {currentStep === 1 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>{t.step1Title}</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>{t.step1Desc}</p>
          <div className="form-group">
            <label>{t.fullNameLabel}</label>
            <input type="text" value={formData.personalInfo.fullName} onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)} placeholder="Rahul Sharma" />
          </div>
          <div className="form-group">
            <label>{t.ageLabel}</label>
            <input type="number" value={formData.personalInfo.age} onChange={(e) => handleChange('personalInfo', 'age', e.target.value)} placeholder="e.g. 30" />
          </div>
        </div>
      )}

      {/* ── Step 2: Salary & Business Income ── */}
      {currentStep === 2 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>{t.step2Title}</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>{t.step2Desc}</p>
          <div className="form-group">
            <label>{t.salaryLabel}</label>
            <input type="number" value={formData.income.salary} onChange={(e) => handleChange('income', 'salary', e.target.value)} placeholder="e.g. 1200000" />
          </div>
          <div className="form-group">
            <label>{t.hraLabel}</label>
            <input type="number" value={formData.income.hra} onChange={(e) => handleChange('income', 'hra', e.target.value)} placeholder="e.g. 240000" />
          </div>
          <div className="form-group">
            <label>{t.businessLabel}</label>
            <input type="number" value={formData.income.business} onChange={(e) => handleChange('income', 'business', e.target.value)} placeholder="e.g. 500000" />
          </div>
          <div className="form-group">
            <label>{t.otherIncomeLabel}</label>
            <input type="number" value={formData.income.otherSources} onChange={(e) => handleChange('income', 'otherSources', e.target.value)} placeholder="e.g. 20000" />
          </div>
        </div>
      )}

      {/* ── Step 3: Deductions (80C, 80D, NPS) ── */}
      {currentStep === 3 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>{t.step3Title}</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>{t.step3Desc}</p>
          <div className="form-group">
            <label>{t.sec80cLabel}</label>
            <input type="number" value={formData.deductions.lifeInsurance} onChange={(e) => handleChange('deductions', 'lifeInsurance', e.target.value)} placeholder="Max ₹1,50,000" />
          </div>
          <div className="form-group">
            <label>{t.sec80dSelfLabel}</label>
            <input type="number" value={formData.deductions.healthInsurance} onChange={(e) => handleChange('deductions', 'healthInsurance', e.target.value)} placeholder="Max ₹25,000 (₹50,000 if senior)" />
          </div>
          <div className="form-group">
            <label>{t.sec80dParentsLabel}</label>
            <input type="number" value={formData.deductions.healthParents} onChange={(e) => handleChange('deductions', 'healthParents', e.target.value)} placeholder="Max ₹50,000" />
          </div>
          <div className="form-group">
            <label>{t.npsLabel}</label>
            <input type="number" value={formData.deductions.nps} onChange={(e) => handleChange('deductions', 'nps', e.target.value)} placeholder="Max ₹50,000" />
          </div>
        </div>
      )}

      {/* ── Step 4: Other Deductions ── */}
      {currentStep === 4 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>{t.step4Title}</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>{t.step4Desc}</p>
          <div className="form-group">
            <label>{t.homeLoanLabel}</label>
            <input type="number" value={formData.income.homeLoanInt} onChange={(e) => handleChange('income', 'homeLoanInt', e.target.value)} placeholder="Max ₹2,00,000" />
          </div>
          <div className="form-group">
            <label>{t.professionalTaxLabel}</label>
            <input type="number" value={formData.income.professionalTax} onChange={(e) => handleChange('income', 'professionalTax', e.target.value)} placeholder="Max ₹2,400" />
          </div>
          <div className="form-group">
            <label>{t.donationsLabel}</label>
            <input type="number" value={formData.deductions.donations} onChange={(e) => handleChange('deductions', 'donations', e.target.value)} placeholder="e.g. 10000" />
          </div>
        </div>
      )}

      {/* ── Step 5: Results ── */}
      {currentStep === 5 && taxData && (
        <div className="animate-fade-in">
          {/* Recommendation Banner */}
          <div className="result-banner">
            <Star size={36} color="var(--accent)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <div>
              <h2 style={{ marginBottom: "0.25rem" }}>
                {taxData.recommendation.regime === 'New Tax Regime' ? t.newRegime : t.oldRegime} {t.wins}
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
              <h3 style={{ margin: 0 }}>{t.yourIncome}</h3>
            </div>
            <div className="result-grid">
              <div className="result-row">
                <span className="result-label">{t.salaryIncome}</span>
                <span className="result-value">₹{formatINR(parseFloat(formData.income.salary) || 0)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">{t.businessIncome}</span>
                <span className="result-value">₹{formatINR(parseFloat(formData.income.business) || 0)}</span>
              </div>
              <div className="result-row">
                <span className="result-label">{t.otherSources}</span>
                <span className="result-value">₹{formatINR(parseFloat(formData.income.otherSources) || 0)}</span>
              </div>
              <div className="result-row result-row-total">
                <span className="result-label">{t.grossIncome}</span>
                <span className="result-value">₹{formatINR(taxData.grossIncome)}</span>
              </div>
            </div>
          </div>

          {/* Regime Comparison */}
          <div className="regime-compare">
            {/* Old Regime */}
            <div className={`regime-card ${taxData.recommendation.regime === 'Old Tax Regime' ? 'regime-card-winner' : ''}`}>
              {taxData.recommendation.regime === 'Old Tax Regime' && <div className="regime-badge">{t.bestForYou}</div>}
              <h3 style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>{t.oldRegime}</h3>
              <div className="regime-row"><span>{t.deductionsAllowed}</span><span style={{ color: "var(--success)" }}>- ₹{formatINR(taxData.old.deductions)}</span></div>
              <div className="regime-row"><span>{t.taxableIncome}</span><span>₹{formatINR(taxData.old.taxableIncome)}</span></div>
              <div className="regime-row"><span>{t.computedTax}</span><span>₹{formatINR(taxData.old.taxBeforeCess)}</span></div>
              <div className="regime-row"><span>{t.cess}</span><span>₹{formatINR(taxData.old.cess)}</span></div>
              <div className="regime-row regime-row-total"><span>{t.youPay}</span><span>₹{formatINR(taxData.old.finalTax)}</span></div>
            </div>

            {/* New Regime */}
            <div className={`regime-card ${taxData.recommendation.regime === 'New Tax Regime' ? 'regime-card-winner' : ''}`}>
              {taxData.recommendation.regime === 'New Tax Regime' && <div className="regime-badge">{t.bestForYou}</div>}
              <h3 style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>{t.newRegime}</h3>
              <div className="regime-row"><span>{t.deductionsAllowed}</span><span style={{ color: "var(--success)" }}>- ₹{formatINR(taxData.new.deductions)}</span></div>
              <div className="regime-row"><span>{t.taxableIncome}</span><span>₹{formatINR(taxData.new.taxableIncome)}</span></div>
              <div className="regime-row"><span>{t.computedTax}</span><span>₹{formatINR(taxData.new.taxBeforeCess)}</span></div>
              <div className="regime-row"><span>{t.cess}</span><span>₹{formatINR(taxData.new.cess)}</span></div>
              <div className="regime-row regime-row-total"><span>{t.youPay}</span><span>₹{formatINR(taxData.new.finalTax)}</span></div>
            </div>
          </div>

          {/* Deductions Breakdown (Old Regime) */}
          <div className="result-section">
            <div className="result-section-header">
              <Shield size={18} />
              <h3 style={{ margin: 0 }}>{t.deductionsMapped}</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>{t.mappedDesc}</p>
            <div className="result-grid">
              {taxData.old.breakdown.standardDeduction > 0 && (
                <div className="result-row"><span className="result-label">{t.stdDed}</span><span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(taxData.old.breakdown.standardDeduction)}</span></div>
              )}
              {taxData.old.breakdown.hraExemption > 0 && (
                <div className="result-row"><span className="result-label">{t.hraExemption}</span><span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(taxData.old.breakdown.hraExemption)}</span></div>
              )}
              {taxData.old.breakdown.sec24B > 0 && (
                <div className="result-row"><span className="result-label">{t.sec24b}</span><span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(taxData.old.breakdown.sec24B)}</span></div>
              )}
              {taxData.old.breakdown.sec80C > 0 && (
                <div className="result-row"><span className="result-label">{t.sec80c}</span><span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(taxData.old.breakdown.sec80C)}</span></div>
              )}
              {taxData.old.breakdown.sec80D > 0 && (
                <div className="result-row"><span className="result-label">{t.sec80d}</span><span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(taxData.old.breakdown.sec80D)}</span></div>
              )}
              {taxData.old.breakdown.sec80CCD > 0 && (
                <div className="result-row"><span className="result-label">{t.sec80ccd}</span><span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(taxData.old.breakdown.sec80CCD)}</span></div>
              )}
              {taxData.old.breakdown.sec80G > 0 && (
                <div className="result-row"><span className="result-label">{t.sec80g}</span><span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(taxData.old.breakdown.sec80G)}</span></div>
              )}
              {taxData.old.breakdown.professionalTax > 0 && (
                <div className="result-row"><span className="result-label">{t.professionalTax}</span><span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(taxData.old.breakdown.professionalTax)}</span></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary" onClick={onPrev} style={{ opacity: currentStep === 1 ? 0.5 : 1, pointerEvents: currentStep === 1 ? 'none' : 'auto' }}>
          <ArrowLeft size={18} /> {t.back}
        </button>
        {currentStep < 5 && (
          <button className="btn btn-primary" onClick={onNext}>
            {t.continue} <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
