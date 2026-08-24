import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Bot, Sparkles } from "lucide-react";

const KasiHero = () => {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-20 lg:py-32">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0BBF6A] opacity-[0.05] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0F8C55] opacity-[0.05] blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F8C55]/10 text-[#0F8C55] text-sm font-bold border border-[#0F8C55]/20 mb-8"
          >
            <Sparkles size={16} />
            Meet Kasi: The Future of Social Commerce
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-[#1E293B] tracking-tight mb-8"
          >
            Stop Hagglin'. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F8C55] to-[#0BBF6A]">
              Start Sellin'.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            Kasi handles your customers on Telegram, negotiates your prices, and
            generates professional invoices—while you focus on growing your brand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center"
          >
            <a
              href="https://kasi.proofdeck.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#0F8C55] to-[#0BBF6A] text-white font-bold text-base shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform no-underline"
            >
              Start Using Kasi Now
              <ArrowRight size={18} className="ml-2" />
            </a>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent z-10 h-20 bottom-0"></div>
          <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-white p-2">
            <div className="rounded-2xl overflow-hidden aspect-video bg-gray-50 flex items-center justify-center relative">
               <img 
                src="/images/kasi/kasi-dashboard.png" 
                alt="Kasi Dashboard" 
                className="w-full h-full object-cover relative z-20"
               />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center">
                  <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-2xl border border-white shadow-lg">
                    <p className="text-[#0F8C55] font-bold flex items-center gap-2">
                        <Bot size={20} /> AI Sales Assistant Live
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-semibold">Ready to handle your orders</p>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default KasiHero;
