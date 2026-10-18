# TaxLite

**An AI assistant that walks you through your Indian income tax return in plain language, and tells you which tax regime saves you more.**

Filing an ITR means knowing what 80C, 80D, HRA and Section 24B mean before you can even start. TaxLite turns it into a short guided conversation: answer a few simple questions, see your tax under both regimes side by side, then get a personalised advisory from Gemini that you can ask follow-up questions about.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?logo=googlegemini&logoColor=white)

## Features

- **Guided 4-step flow**: personal details → income (salary, HRA, business, other sources) → core deductions (80C, 80D for self and parents, NPS) → extra deductions (home loan interest, professional tax, donations).
- **Old vs new regime comparison**: computes tax under both regimes, including standard deduction, deduction caps, senior-citizen exemption limits, the Section 87A rebate with marginal relief, and 4% cess, then recommends the cheaper one and shows the saving.
- **Streaming AI advisory**: sends the computed numbers to Gemini as context and streams back a short verdict, the deductions you haven't fully used (with the rupee gap), and ways to restructure income. You can keep chatting with it afterwards.
- **Model fallback**: the API routes try a list of Gemini models in order, so a quota or availability error on one model falls through to the next instead of failing the request.
- **English, Hindi and Hinglish**: the whole UI is translated, and the AI is instructed to answer in the selected language (Hindi in Devanagari script).
- **Responsive UI** that works on phones as well as desktop.

## How it works

```
ITRForm (4 steps) ──► taxCalculator.js ──► old vs new regime result
                                                │
                                                ▼
                       TaxAdvisor ──► /api/chat (streaming) ──► Gemini
                                         └─ falls back through models on error
```

| Path | What it does |
|---|---|
| `src/utils/taxCalculator.js` | Pure function: form data in, both regimes' tax breakdowns and a recommendation out |
| `src/app/api/chat/route.js` | Streaming chat endpoint with Gemini model fallback |
| `src/app/api/suggest/route.js` | One-line encouragement for each step of the form |
| `src/components/TaxAdvisor.js` | Builds the advisory prompt from the computed numbers and renders the streamed Markdown |
| `src/context/LanguageContext.js`, `src/utils/dictionary.js` | i18n for English, Hindi and Hinglish |

## Run locally

```bash
git clone https://github.com/Jindalgarv/TaxLite.git
cd TaxLite
npm install
echo 'GEMINI_API_KEY=your-key-here' > .env.local
npm run dev
```

Open http://localhost:3000. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Disclaimer

TaxLite gives estimates to help you understand your options. It is not a substitute for a chartered accountant, and you should check the figures before filing.

---

Built by [Garv Jindal](https://github.com/Jindalgarv).
