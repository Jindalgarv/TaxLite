"use client";

import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { language, changeLanguage } = useLanguage();
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <Image src="/logo.png" alt="TaxLite Logo" width={32} height={32} />
          </div>
          <span className="navbar-title">TaxLite</span>
        </div>
        
        <select 
          className="lang-select" 
          value={language} 
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="hn">Hinglish</option>
        </select>
      </div>
    </nav>
  );
}
