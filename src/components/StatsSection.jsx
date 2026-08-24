import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { Building2, Users, Award } from "lucide-react";

/**
 * Animated counter component
 */
const Counter = ({ value, suffix = "+" }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest) + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} />;
};

export function StatsSection() {
  const stats = [
    {
      icon: Building2,
      value: 10,
      label: "Companies Onboard",
      delay: 0,
    },
    {
      icon: Users,
      value: 30,
      label: "Active Issuers",
      delay: 0.1,
    },
    {
      icon: Award,
      value: 200,
      label: "Certificates Verified",
      delay: 0.2,
    },
  ];

  return (
    <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 py-16 text-white relative overflow-hidden border-y border-indigo-800/50">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-indigo-700/50">
          {stats.map((stat, index) => (
            <div 
                key={index} 
                className="flex flex-col items-center justify-center p-6 md:p-8 hover:bg-white/5 transition-colors duration-300 rounded-2xl md:rounded-none group"
            >
              <div className="mb-4 text-indigo-300 p-3 bg-indigo-950/50 rounded-full ring-1 ring-indigo-700/50 group-hover:scale-110 group-hover:text-white transition-all duration-300">
                <stat.icon size={28} strokeWidth={1.5} />
              </div>
              
              <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-200">
                <Counter value={stat.value} />
              </div>
              
              <div className="text-indigo-200 font-medium text-sm md:text-base tracking-wide uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
