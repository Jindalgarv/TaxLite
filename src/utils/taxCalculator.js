export function calculateTax(formData) {
  // Parse inputs
  const salary = parseFloat(formData.income.salary) || 0;
  const business = parseFloat(formData.income.business) || 0;
  const other = parseFloat(formData.income.otherSources) || 0;
  
  const sec80C = Math.min(parseFloat(formData.deductions.lifeInsurance) || 0, 150000); // Max 1.5L
  const sec80D = Math.min(parseFloat(formData.deductions.healthInsurance) || 0, 75000); // Assuming max for senior citizens to be safe
  const sec80CCD = Math.min(parseFloat(formData.deductions.providentFund) || 0, 50000); // Additional 50K for NPS

  const standardDeduction = salary > 0 ? Math.min(salary, 50000) : 0;
  
  // Gross Total Income
  const grossIncome = salary + business + other;

  // -------------------------
  // Old Regime Calculation
  // -------------------------
  const totalDeductionsOld = standardDeduction + sec80C + sec80D + sec80CCD;
  let taxableIncomeOld = Math.max(0, grossIncome - totalDeductionsOld);
  
  // Calculate Old Tax
  let taxOld = 0;
  if (taxableIncomeOld > 1000000) {
    taxOld += (taxableIncomeOld - 1000000) * 0.30;
    taxOld += 100000; // 5L to 10L @ 20%
    taxOld += 12500;  // 2.5L to 5L @ 5%
  } else if (taxableIncomeOld > 500000) {
    taxOld += (taxableIncomeOld - 500000) * 0.20;
    taxOld += 12500;
  } else if (taxableIncomeOld > 250000) {
    taxOld += (taxableIncomeOld - 250000) * 0.05;
  }

  // 87A Rebate for Old Regime (Up to 5L)
  if (taxableIncomeOld <= 500000) {
    taxOld = 0;
  }

  const cessOld = taxOld * 0.04;
  const finalTaxOld = taxOld + cessOld;

  // -------------------------
  // New Regime Calculation
  // -------------------------
  // New regime allows standard deduction for salary, but no 80C/80D/80CCD
  const totalDeductionsNew = standardDeduction;
  let taxableIncomeNew = Math.max(0, grossIncome - totalDeductionsNew);

  // Calculate New Tax
  let taxNew = 0;
  if (taxableIncomeNew > 1500000) {
    taxNew += (taxableIncomeNew - 1500000) * 0.30;
    taxNew += 150000; // sum of previous slabs
  } else if (taxableIncomeNew > 1200000) {
    taxNew += (taxableIncomeNew - 1200000) * 0.20;
    taxNew += 90000;
  } else if (taxableIncomeNew > 900000) {
    taxNew += (taxableIncomeNew - 900000) * 0.15;
    taxNew += 45000;
  } else if (taxableIncomeNew > 600000) {
    taxNew += (taxableIncomeNew - 600000) * 0.10;
    taxNew += 15000;
  } else if (taxableIncomeNew > 300000) {
    taxNew += (taxableIncomeNew - 300000) * 0.05;
  }

  // 87A Rebate for New Regime (Up to 7L)
  if (taxableIncomeNew <= 700000) {
    taxNew = 0;
  } else {
    // Marginal relief logic simplified: if tax > income above 7L, restrict tax
    const incomeAbove7L = taxableIncomeNew - 700000;
    if (taxNew > incomeAbove7L) {
       taxNew = incomeAbove7L; 
    }
  }

  const cessNew = taxNew * 0.04;
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
      finalTax: finalTaxOld
    },
    new: {
      deductions: totalDeductionsNew,
      taxableIncome: taxableIncomeNew,
      taxBeforeCess: taxNew,
      cess: cessNew,
      finalTax: finalTaxNew
    },
    recommendation: {
      regime: isNewRegimeBetter ? 'New Tax Regime' : 'Old Tax Regime',
      savings: savings,
      message: savings === 0 
        ? "Both regimes result in the same tax. The New Regime is generally simpler." 
        : `You save ₹${Math.round(savings).toLocaleString('en-IN')} by choosing the ${isNewRegimeBetter ? 'New' : 'Old'} Tax Regime.`
    }
  };
}
