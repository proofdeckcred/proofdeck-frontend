import React from "react";
import { Bot, FileText, BookOpen, Clock, Shield, BarChart3, TrendingUp, MessageSquareQuote } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, badge, list, image }) => (
  <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#0F8C55]/20 transition-all group overflow-hidden">
    {image && (
      <div className="w-full aspect-video overflow-hidden border-b border-gray-100">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
    )}
    <div className="p-8 flex-1 flex flex-col">
      <div className="w-14 h-14 rounded-2xl bg-[#0F8C55]/10 flex items-center justify-center text-[#0F8C55] mb-6 group-hover:scale-110 transition-transform">
        <Icon size={28} />
      </div>
      {badge && (
        <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-[#0F8C55] text-[10px] font-bold uppercase tracking-wider mb-4 border border-green-100">
          {badge}
        </span>
      )}
      <h3 className="text-2xl font-bold text-[#1E293B] mb-4 group-hover:text-[#0F8C55] transition-colors">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>
      {list && (
        <ul className="space-y-3 mt-auto">
          {list.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-500">
              <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#0BBF6A]" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const KasiFeatures = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-extrabold text-[#1E293B] mb-6">
            Everything your business needs to grow.
          </h2>
          <p className="text-lg text-gray-600">
            Kasi is more than a chatbot—it's your command center for social commerce.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Bot}
            title="SalesAI"
            image="/images/kasi/kasi-product-list.png"
            description="The smart negotiator that understands Nigerian commerce. From Pidgin to proper English, it's got you covered."
            list={[
              "Intelligent Price Haggling",
              "Minimum Price Protection",
              "Pidgin & Language Fluidity",
              "Context Aware Conversations"
            ]}
          />
          <FeatureCard
            icon={FileText}
            title="Smart Invoicing"
            image="/images/kasi/kasi-payment.png"
            description="Professional invoices generated in seconds. No more manual typing or losing track of orders."
            list={[
              "Auto-Generated PDFs",
              "Bank & Paystack Integration",
              "Branded Templates",
              "Instant Delivery"
            ]}
          />
          <FeatureCard
            icon={BookOpen}
            title="Digital Notebook"
            image="/images/kasi/kasi-settings.png"
            description="Your modern replacement for the traditional paper ledger. Always in your pocket, always accurate."
            list={[
              "Unified Sales Feed",
              "Revenue & Profit Analytics",
              "Customer Management",
              "Cloud Sync & Zero Loss"
            ]}
          />
        </div>

        {/* Benefits Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-12 border-t border-gray-100 pt-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Clock size={24} />
            </div>
            <h4 className="text-lg font-bold text-[#1E293B] mb-2">Save 5 Hours Daily</h4>
            <p className="text-sm text-gray-500 italic">"Let Kasi answer the repetitive 'How much?' questions for you."</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Shield size={24} />
            </div>
            <h4 className="text-lg font-bold text-[#1E293B] mb-2">Look Premium</h4>
            <p className="text-sm text-gray-500 italic">"Every customer gets a professional PDF invoice and secure link."</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-lg font-bold text-[#1E293B] mb-2">Know Your Numbers</h4>
            <p className="text-sm text-gray-500 italic">"Your sales notebook is always on, showing real business growth."</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KasiFeatures;
