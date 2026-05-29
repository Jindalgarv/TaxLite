"use client";

import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <Image src="/logo.png" alt="TaxLite Logo" width={32} height={32} />
          </div>
          <span className="navbar-title">TaxLite</span>
        </div>
      </div>
    </nav>
  );
}
