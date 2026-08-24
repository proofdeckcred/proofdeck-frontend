import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Shield, Zap, Award } from "lucide-react";
import { Button } from "./button";
import { motion } from "motion/react";

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
      {/* Subtle background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center py-16 md:py-20 lg:py-28">
          
          {/* LEFT COLUMN — Text + Stats */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-5">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Issue Verifiable
                <br />
                Credentials,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  Effortlessly.
                </span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
                ProofDeck lets you create, issue, and manage digital certificates,
                receipts, and invitation cards — all from one powerful platform.
                Verify instantly. Share everywhere.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate("/signup")}
                className="h-12 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer"
              >
                Start Issuing Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-12 px-7 rounded-xl border-slate-300 text-slate-700 text-base font-medium hover:bg-slate-50 cursor-pointer"
              >
                See How It Works
              </Button>
            </div>

            {/* Inline Stats Row */}
            <div className="flex items-center gap-8 pt-4">
              {[
                { value: "10+", label: "Companies" },
                { value: "200+", label: "Certs Verified" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT COLUMN — Dashboard Mockup with Perspective */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Layered card shadows behind the main mockup */}
            <div className="absolute -top-4 -right-4 w-full h-full bg-indigo-200/30 rounded-2xl transform rotate-2 scale-[0.97]" />
            <div className="absolute -top-2 -right-2 w-full h-full bg-indigo-100/50 rounded-2xl transform rotate-1 scale-[0.985]" />
            
            {/* Main Dashboard Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-2xl bg-white">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200/60">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-white rounded-md px-3 py-1 text-[10px] text-slate-400 font-mono border border-slate-200/60 text-center">
                    app.proofdeck.com/dashboard
                  </div>
                </div>
              </div>
              <img
                src="/images/landing_page_image/dashboard.png"
                alt="ProofDeck Dashboard"
                className="w-full h-auto object-cover animate-fade-in"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
