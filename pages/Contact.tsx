import React, { useState } from 'react';
import { ExternalLink, Clock, ChevronDown, MessageCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I place a custom cake order?',
    a: 'Browse our Cakes page and click "Request a Custom Cake". Fill out the inquiry form with your details — our team will review it and send you a price quote.',
  },
  {
    q: 'How far in advance should I order?',
    a: 'We recommend placing custom cake orders at least 5–7 days before your event. For peak seasons (holidays, long weekends), 2 weeks in advance is ideal. Regular menu items can be ordered 2–3 days ahead.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery (COD) for pickup orders and GCash for both pickup and delivery. Payment details are confirmed at checkout.',
  },
  {
    q: 'Do you offer delivery?',
    a: 'Yes! We deliver within Obando, Bulacan and nearby areas. Delivery fees vary by location and will be communicated with your order confirmation.',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'You can cancel your order from Cart → Order History as long as it has not been confirmed yet. Once the status is Confirmed or Baking, please contact us directly on Facebook for any changes.',
  },
  {
    q: 'How long does it take to get a price quote for a custom cake?',
    a: 'We aim to respond to all custom cake inquiries within 24–48 hours. You will receive a notification and email once a price has been set.',
  },
];

const HOURS = [
  { day: 'Monday – Friday', time: '9:00 AM – 6:00 PM' },
  { day: 'Saturday', time: '8:00 AM – 6:00 PM' },
  { day: 'Sunday', time: 'Closed' },
];

const Contact: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-stone-800">Contact Us</h1>
        <p className="text-stone-500 mt-2">Have a question or want to place an order? We're happy to help.</p>
      </div>

      {/* Facebook CTA */}
      <div className="bg-gradient-to-br from-rose-50 to-stone-50 border border-rose-100 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-stone-800 mb-1">Chat with us on Facebook</h2>
        <p className="text-stone-500 text-sm mb-6">
          The fastest way to reach us — for orders, questions, and custom cake inquiries.
        </p>
        <a
          href="https://www.facebook.com/bakedbyiyah"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M24 12.073C24 5.403 18.627 0 12 0S0 5.403 0 12.073c0 6.027 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.024 1.792-4.695 4.533-4.695 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.928-1.956 1.88v2.27h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.1 24 12.073z"/>
          </svg>
          Message on Facebook
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
          <Clock className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-stone-800">Business Hours</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {HOURS.map(({ day, time }) => (
            <div key={day} className="px-6 py-4 flex justify-between items-center">
              <span className="text-stone-700 font-medium">{day}</span>
              <span className={time === 'Closed' ? 'text-stone-400 italic text-sm' : 'text-stone-600 font-medium'}>
                {time}
              </span>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100">
          <p className="text-xs text-stone-400">Hours may vary on Philippine public holidays. Check our Facebook page for updates.</p>
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50 transition-colors"
              >
                <span className="font-medium text-stone-800 pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-400 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-stone-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
