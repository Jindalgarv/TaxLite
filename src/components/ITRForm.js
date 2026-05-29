"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ArrowRight, ArrowLeft, TrendingDown, TrendingUp, IndianRupee, Shield, Trophy } from "lucide-react";
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
          <h2 style={{ marginBottom: "0.5rem" }}>{t.step1Title}</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>{t.step1Desc}</p>
          <div className="form-group">
            <label>{t.fullNameLabel}</label>
            <input type="text" value={formData.personalInfo.fullName} onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)} placeholder="Rahul Sharma" />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>{t.step2Title}</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>{t.step2Desc}</p>
          <div className="form-group">
            <label>{t.salaryLabel}</label>
            <input type="number" value={formData.income.salary} onChange={(e) => handleChange('income', 'salary', e.target.value)} placeholder="e.g. 1200000" />
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

      {currentStep === 3 && (
        <div className="animate-fade-in">
          <h2 style={{ marginBottom: "0.5rem" }}>{t.step3Title}</h2>
          <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>{t.step3Desc}</p>
          <div className="form-group">
            <label>{t.sec80cLabel}</label>
            <input type="number" value={formData.deductions.lifeInsurance} onChange={(e) => handleChange('deductions', 'lifeInsurance', e.target.value)} placeholder="e.g. 150000" />
          </div>
          <div className="form-group">
            <label>{t.sec80dLabel}</label>
            <input type="number" value={formData.deductions.healthInsurance} onChange={(e) => handleChange('deductions', 'healthInsurance', e.target.value)} placeholder="e.g. 25000" />
          </div>
          <div className="form-group">
            <label>{t.npsLabel}</label>
            <input type="number" value={formData.deductions.providentFund} onChange={(e) => handleChange('deductions', 'providentFund', e.target.value)} placeholder="e.g. 50000" />
          </div>
        </div>
      )}

      {currentStep === 4 && taxData && (
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
            {/* Old Regime Card */}
            <div className={`regime-card ${taxData.recommendation.regime === 'Old Tax Regime' ? 'regime-card-winner' : ''}`}>
              {taxData.recommendation.regime === 'Old Tax Regime' && (
                <div className="regime-badge">{t.bestForYou}</div>
              )}
              <h3 style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>{t.oldRegime}</h3>
              <div className="regime-row">
                <span>{t.deductionsAllowed}</span>
                <span style={{ color: "var(--success)" }}>- ₹{formatINR(taxData.old.deductions)}</span>
              </div>
              <div className="regime-row">
                <span>{t.taxableIncome}</span>
                <span>₹{formatINR(taxData.old.taxableIncome)}</span>
              </div>
              <div className="regime-row">
                <span>{t.computedTax}</span>
                <span>₹{formatINR(taxData.old.taxBeforeCess)}</span>
              </div>
              <div className="regime-row">
                <span>{t.cess}</span>
                <span>₹{formatINR(taxData.old.cess)}</span>
              </div>
              <div className="regime-row regime-row-total">
                <span>{t.youPay}</span>
                <span>₹{formatINR(taxData.old.finalTax)}</span>
              </div>
            </div>

            {/* New Regime Card */}
            <div className={`regime-card ${taxData.recommendation.regime === 'New Tax Regime' ? 'regime-card-winner' : ''}`}>
              {taxData.recommendation.regime === 'New Tax Regime' && (
                <div className="regime-badge">{t.bestForYou}</div>
              )}
              <h3 style={{ color: "var(--text-color)", marginBottom: "1.5rem" }}>{t.newRegime}</h3>
              <div className="regime-row">
                <span>{t.deductionsAllowed}</span>
                <span style={{ color: "var(--success)" }}>- ₹{formatINR(taxData.new.deductions)}</span>
              </div>
              <div className="regime-row">
                <span>{t.taxableIncome}</span>
                <span>₹{formatINR(taxData.new.taxableIncome)}</span>
              </div>
              <div className="regime-row">
                <span>{t.computedTax}</span>
                <span>₹{formatINR(taxData.new.taxBeforeCess)}</span>
              </div>
              <div className="regime-row">
                <span>{t.cess}</span>
                <span>₹{formatINR(taxData.new.cess)}</span>
              </div>
              <div className="regime-row regime-row-total">
                <span>{t.youPay}</span>
                <span>₹{formatINR(taxData.new.finalTax)}</span>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="result-section">
            <div className="result-section-header">
              <Shield size={18} />
              <h3 style={{ margin: 0 }}>{t.deductionsMapped}</h3>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              {t.mappedDesc}
            </p>
            <div className="result-grid">
              <div className="result-row">
                <span className="result-label">{t.stdDed}</span>
                <span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(Math.min(parseFloat(formData.income.salary) || 0, 50000))}</span>
              </div>
              <div className="result-row">
                <span className="result-label">{t.sec80c}</span>
                <span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(Math.min(parseFloat(formData.deductions.lifeInsurance) || 0, 150000))}</span>
              </div>
              <div className="result-row">
                <span className="result-label">{t.sec80d}</span>
                <span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(Math.min(parseFloat(formData.deductions.healthInsurance) || 0, 75000))}</span>
              </div>
              <div className="result-row">
                <span className="result-label">{t.sec80ccd}</span>
                <span className="result-value" style={{ color: "var(--success)" }}>₹{formatINR(Math.min(parseFloat(formData.deductions.providentFund) || 0, 50000))}</span>
              </div>
            </div>
          </div>
        </div>
      )}


      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary" onClick={onPrev} style={{ opacity: currentStep === 1 ? 0.5 : 1, pointerEvents: currentStep === 1 ? 'none' : 'auto' }}>
          <ArrowLeft size={18} /> {t.back}
        </button>
        {currentStep < 4 && (
          <button className="btn btn-primary" onClick={onNext}>
            {t.continue} <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
