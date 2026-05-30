export function calculateTax(formData) {
  const salary       = parseFloat(formData.income?.salary)       || 0;
  const business     = parseFloat(formData.income?.business)     || 0;
  const other        = parseFloat(formData.income?.otherSources) || 0;
  const hra          = parseFloat(formData.income?.hra)          || 0;
  const homeLoanInt  = parseFloat(formData.income?.homeLoanInt)  || 0;

  const age          = parseInt(formData.personalInfo?.age)      || 30;
  const isSenior     = age >= 60;
  const isSuperSenior = age >= 80;

  // --- Section 80C (Max ₹1.5L) ---
  const sec80C = Math.min(parseFloat(formData.deductions?.lifeInsurance) || 0, 150000);

  // --- Section 80D: Health Insurance (Max ₹25K self, ₹50K senior parents) ---
  const healthSelf   = parseFloat(formData.deductions?.healthInsurance)  || 0;
  const healthParents = parseFloat(formData.deductions?.healthParents)   || 0;
  const selfLimit    = isSenior ? 50000 : 25000;
  const sec80D       = Math.min(healthSelf, selfLimit) + Math.min(healthParents, 50000);

  // --- Section 80CCD(1B): NPS (Max ₹50K) ---
  const sec80CCD = Math.min(parseFloat(formData.deductions?.nps) || 0, 50000);

  // --- Section 80G: Donations ---
  const sec80G = parseFloat(formData.deductions?.donations) || 0;

  // --- Professional Tax ---
  const professionalTax = Math.min(parseFloat(formData.income?.professionalTax) || 0, 2400);

  // --- HRA Exemption (Old Regime only) ---
  const hraExemption = Math.min(hra, salary * 0.5); // simplified: 50% of salary

  // --- Section 24B: Home Loan Interest (Old Regime, Max ₹2L) ---
  const sec24B = Math.min(homeLoanInt, 200000);

  // Gross Total Income
  const grossIncome = salary + business + other;

  // -------------------------
  // OLD REGIME
  // -------------------------
  // Standard deduction: ₹50,000 for salary in old regime
  const standardDeductionOld = salary > 0 ? 50000 : 0;

  const totalDeductionsOld = standardDeductionOld + sec80C + sec80D + sec80CCD +
                             sec80G + professionalTax + hraExemption + sec24B;
  let taxableIncomeOld = Math.max(0, grossIncome - totalDeductionsOld);

  // Old regime slabs (FY 2024-25)
  // Basic exemption: ₹2.5L (< 60), ₹3L (60-79), ₹5L (80+)
  const basicExemption = isSuperSenior ? 500000 : isSenior ? 300000 : 250000;
  let taxOld = 0;
  if (taxableIncomeOld > 1000000) {
    taxOld = (taxableIncomeOld - 1000000) * 0.30 + 100000 + (500000 - basicExemption) * 0.05;
  } else if (taxableIncomeOld > 500000) {
    taxOld = (taxableIncomeOld - 500000) * 0.20 + (500000 - basicExemption) * 0.05;
  } else if (taxableIncomeOld > basicExemption) {
    taxOld = (taxableIncomeOld - basicExemption) * 0.05;
  }

  // 87A Rebate: if taxable income ≤ ₹5L, full tax rebate
  if (taxableIncomeOld <= 500000) taxOld = 0;

  const cessOld     = taxOld * 0.04;
  const finalTaxOld = taxOld + cessOld;

  // -------------------------
  // NEW REGIME (FY 2024-25)
  // Standard deduction: ₹75,000 for salaried
  // -------------------------
  const standardDeductionNew = salary > 0 ? 75000 : 0;
  const totalDeductionsNew   = standardDeductionNew;
  let taxableIncomeNew        = Math.max(0, grossIncome - totalDeductionsNew);

  // New regime slabs (Budget 2024)
  let taxNew = 0;
  if (taxableIncomeNew > 2400000) {
    taxNew = (taxableIncomeNew - 2400000) * 0.30 + 330000 + 60000 + 45000 + 30000 + 20000;
  } else if (taxableIncomeNew > 2000000) {
    taxNew = (taxableIncomeNew - 2000000) * 0.25 + 60000 + 45000 + 30000 + 20000;
  } else if (taxableIncomeNew > 1600000) {
    taxNew = (taxableIncomeNew - 1600000) * 0.20 + 45000 + 30000 + 20000;
  } else if (taxableIncomeNew > 1200000) {
    taxNew = (taxableIncomeNew - 1200000) * 0.15 + 30000 + 20000;
  } else if (taxableIncomeNew > 800000) {
    taxNew = (taxableIncomeNew - 800000) * 0.10 + 20000;
  } else if (taxableIncomeNew > 400000) {
    taxNew = (taxableIncomeNew - 400000) * 0.05;
  }

  // 87A Rebate: if taxable income ≤ ₹12L, full tax rebate (New Regime, Budget 2025)
  if (taxableIncomeNew <= 1200000) {
    taxNew = 0;
  } else {
    // Marginal relief: tax can't exceed income above ₹12L
    const incomeAbove12L = taxableIncomeNew - 1200000;
    if (taxNew > incomeAbove12L) taxNew = incomeAbove12L;
  }

  const cessNew     = taxNew * 0.04;
  const finalTaxNew = taxNew + cessNew;

  // -------------------------
  // Result
  // -------------------------
  const isNewRegimeBetter = finalTaxNew <= finalTaxOld;
  const savings = Math.abs(finalTaxOld - finalTaxNew);

  return {
    grossIncome,
    old: {
      deductions: totalDeductionsOld,
      taxableIncome: taxableIncomeOld,
      taxBeforeCess: taxOld,
      cess: cessOld,
      finalTax: finalTaxOld,
      breakdown: {
        standardDeduction: standardDeductionOld,
        sec80C,
        sec80D,
        sec80CCD,
        sec80G,
        professionalTax,
        hraExemption,
        sec24B
      }
    },
    new: {
      deductions: totalDeductionsNew,
      taxableIncome: taxableIncomeNew,
      taxBeforeCess: taxNew,
      cess: cessNew,
      finalTax: finalTaxNew,
      breakdown: {
        standardDeduction: standardDeductionNew
      }
    },
    recommendation: {
      regime: isNewRegimeBetter ? 'New Tax Regime' : 'Old Tax Regime',
      savings,
      message: savings === 0
        ? "Both regimes result in the same tax. The New Regime is generally simpler."
        : `You save ₹${Math.round(savings).toLocaleString('en-IN')} by choosing the ${isNewRegimeBetter ? 'New' : 'Old'} Tax Regime.`
    }
  };
}
