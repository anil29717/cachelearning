import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="w-full bg-white py-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
          <h1 className="text-5xl font-bold mb-4">BFSI Compliance & Digital Transformation</h1>
          <p className="text-lg max-w-3xl mb-6">
            A modern platform simplifying Banking, Financial Services & Insurance (BFSI) regulatory
            compliance, digital workflows, and operational efficiency.
          </p>
          <button className="px-6 py-3 bg-red-600 text-white rounded-xl text-lg shadow hover:bg-red-700 transition">
            Get Started
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white rounded-2xl p-8 shadow">
            <h3 className="text-2xl font-semibold mb-3">Compliance Automation</h3>
            <p>Stay aligned with RBI, SEBI, IRDAI, DPDP, PCI-DSS & Basel norms automatically.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow">
            <h3 className="text-2xl font-semibold mb-3">Digital Workflow Engine</h3>
            <p>Automate workflows for banking, payments, insurance & capital markets.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow">
            <h3 className="text-2xl font-semibold mb-3">Cyber & Risk Controls</h3>
            <p>Integrated SOC, VAPT, fraud detection & audit-ready operational controls.</p>
          </div>
        </div>
      </section>

      {/* Sector Sections */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-10">Built for the Entire BFSI Ecosystem</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="text-2xl font-semibold mb-2">Banking</h3>
              <p>Onboarding, KYC/CDD, AML monitoring, loan lifecycle controls & liquidity metrics.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="text-2xl font-semibold mb-2">Payments / Fintech</h3>
              <p>UPI, IMPS, NPCI compliance, settlement, reconciliation, API security & fraud rules.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="text-2xl font-semibold mb-2">Insurance</h3>
              <p>Policy issuance, underwriting, FNOL, claim settlement & IRDAI governance.</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow">
              <h3 className="text-2xl font-semibold mb-2">Capital Markets</h3>
              <p>Trade lifecycle, market surveillance, KRA/KYC, T+1 settlement & LODR reporting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-gray-300 text-center">
        <p className="mb-2">© 2025 BFSI Intelligence Platform</p>
        <p className="text-sm">Compliance • Workflows • Cybersecurity • Automation</p>
      </footer>
    </div>
  );
}
