import React, { useState } from 'react';
import SEO from '../seo/SEO';
import { buildFaqSchema } from '../seo/structuredData';
import PublicLayout from '../components/layout/PublicLayout';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'What documents are required to rent a car in Pakistan?',
      a: 'To rent a car, customers must provide a valid original Computerized National Identity Card (CNIC) or Passport, and an active Pakistani Driving License (or International Driving Permit for foreign nationals). All documents must be verified by staff before vehicle release.',
    },
    {
      q: 'How does the digital contract and e-signature work?',
      a: 'Once your booking and documents are verified, a digital rental agreement is generated. You can securely e-sign the contract on your smartphone or PC. The system records your digital signature with tamper-proof cryptographic audit hashes and IP timestamping.',
    },
    {
      q: 'What is the security deposit policy?',
      a: 'A refundable security deposit is held at the time of booking. The deposit amount depends on the vehicle category (Economy, Luxury, SUV). It is refunded within 24–48 hours after vehicle return inspection provided there are no damage or traffic violation claims.',
    },
    {
      q: 'Can I extend my rental period during an active booking?',
      a: 'Yes! Extensions can be requested through your Customer Dashboard or by contacting customer support prior to your scheduled return time, subject to vehicle availability.',
    },
    {
      q: 'What happens if the vehicle undergoes mechanical breakdown?',
      a: 'All AutoRent vehicles undergo regular maintenance. In the rare event of a mechanical breakdown, our 24/7 roadside team provides immediate roadside repair or a replacement vehicle at no extra cost.',
    },
    {
      q: 'What is the fuel and mileage policy?',
      a: 'Vehicles are provided with a specific fuel level and must be returned with the same fuel level. Most rentals include unlimited mileage within province limits unless specified otherwise.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(searchTerm.toLowerCase()) || f.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const faqSchema = buildFaqSchema(faqs.map(f => ({ question: f.q, answer: f.a })));

  return (
    <PublicLayout>
      <SEO
        title="Frequently Asked Questions (FAQ) | DriveElite"
        description="Find answers to common questions about document verification, security deposits, digital contract e-signing, and vehicle pickup policies at DriveElite."
        canonicalPath="/faq"
        structuredData={faqSchema}
      />
      <div className="bg-white text-slate-900 py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Everything You Need to Know</h1>
          <p className="text-slate-600 text-xs max-w-xl mx-auto">
            Find quick answers regarding rental requirements, e-signatures, security deposits, and booking procedures.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search FAQ keywords e.g. CNIC, deposit, extension..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-xs focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-sky-600 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
