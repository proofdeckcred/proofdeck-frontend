import React, { useEffect } from "react";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import KasiHero from "../components/kasi/KasiHero";
import KasiFeatures from "../components/kasi/KasiFeatures";
import { ArrowRight, Zap, Bot, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

const KasiLandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Kasi | AI Sales Assistant for Social Commerce";
  }, []);

  return (
    <div className="font-sans text-gray-900 bg-[#F8FAFC]">
      <PublicHeader />
      <main>
        <KasiHero />
        
        {/* Intro Section / Problem */}
        <section className="py-20 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-6 leading-tight">
                            Social Commerce is <span className="text-[#0F8C55]">Hard</span>. <br/>
                            We're here to make it <span className="text-[#0BBF6A]">Seamless</span>.
                        </h2>
                        <div className="space-y-6">
                            {[
                                { title: "Ditch the repetitive questions", desc: "No more answering 'How much?' or 'Is this available?' 50 times a day." },
                                { title: "Automate your negotiations", desc: "Let the AI haggle based on your secret minimum price. You never lose a sale or a margin." },
                                { title: "Look like a big brand", desc: "Send professional PDF invoices and secure payment links instantly." }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="mt-1 w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-[#0BBF6A] flex-shrink-0">
                                        <Zap size={14} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1E293B] mb-1">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#0F8C55]/10 to-transparent blur-2xl rounded-3xl"></div>
                        <div className="relative bg-white p-4 rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                            <img 
                                src="/images/kasi/kasi-product-list.png" 
                                alt="Kasi Product Management" 
                                className="w-full h-auto rounded-2xl shadow-sm"
                            />
                            <div className="mt-6 space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Customer</p>
                                    <p className="text-sm text-gray-700 font-medium">"Abeg how much be dat lipgloss? I wan buy 3."</p>
                                </div>
                                <div className="p-4 bg-[#0F8C55]/5 rounded-2xl border border-[#0F8C55]/10 ml-8 ring-1 ring-[#0BBF6A]/20">
                                    <p className="text-[10px] text-[#0F8C55] uppercase tracking-widest font-bold mb-2">Kasi AI Assistant</p>
                                    <p className="text-sm text-gray-800 font-semibold mb-2">"The Lip Gloss is ₦3,000 each. For 3 units, I can give you a special price of ₦8,500 total! Plus, I'll send your invoice right now. Want to proceed?"</p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-[#0F8C55] text-white text-[10px] rounded-md font-bold">Smart Negotiation</span>
                                        <span className="px-2 py-1 bg-white text-[#0F8C55] text-[10px] rounded-md border border-[#0F8C55]/20 font-bold">Fast Reply</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-20 bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-[#1E293B]">One Bot. All Your Channels.</h2>
                    <p className="text-gray-500 mt-4">Kasi is expanding to where your customers are.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: "Telegram", status: "Live & Ready", icon: "🚀", desc: "Integrated and ready to handle your sales today." },
                        { name: "WhatsApp", status: "Coming Soon", icon: "⌛", desc: "The future of automated chat commerce." },
                        { name: "Instagram", status: "Coming Soon", icon: "⌛", desc: "Convert DMs into sales automatically." }
                    ].map((platform, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                            <div className="text-4xl mb-4">{platform.icon}</div>
                            <h4 className="text-xl font-bold text-[#1E293B] mb-2">{platform.name}</h4>
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-4 ${platform.status === 'Live & Ready' ? 'bg-green-100 text-[#0F8C55]' : 'bg-gray-100 text-gray-400'}`}>
                                {platform.status}
                            </span>
                            <p className="text-sm text-gray-500">{platform.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-16 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
                    <img src="/images/kasi/kasi-integration.png" alt="Integrations" className="w-full h-auto" />
                </div>
            </div>
        </section>

        <KasiFeatures />

        {/* CTA Section */}
        <section className="py-24 bg-[#1E293B] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0F8C55]/10 blur-[100px] -z-0"></div>
            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 tracking-tight">
                    Ready to scale your <br/> brand with AI?
                </h2>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    Take your business from "WhatsApp seller" to "Verified Merchant" in minutes. No technical skills required.
                </p>
                <div className="flex justify-center">
                    <a
                    href="https://kasi.proofdeck.app"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#0BBF6A] text-white font-bold text-lg hover:bg-[#0F8C55] transition-all no-underline shadow-2xl shadow-[#0BBF6A]/20"
                    >
                    Start Using Kasi Now
                    <ArrowRight size={22} className="ml-2" />
                    </a>
                </div>
            </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default KasiLandingPage;
