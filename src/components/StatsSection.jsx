import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

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
    { value: 10, label: "Companies Onboard", delay: 0 },
    { value: 30, label: "Active Issuers", delay: 0.1 },
    { value: 500, label: "Certificates Verified", delay: 0.2 },
  ];

  return (
    <section className="bg-[var(--pd-ink)] py-16 text-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-6 md:p-8"
            >
              <div className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white">
                <Counter value={stat.value} />
              </div>
              <div className="text-white/60 font-medium text-sm tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
