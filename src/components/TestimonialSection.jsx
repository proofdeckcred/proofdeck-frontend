import React, { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function TestimonialSection() {
  const testimonials = [
    {
      quote: "ProofDeck is a game changer. The ability to customize my certificates and issue them in bulk made all the difference.",
      name: "Chibuzor Azodo, PhD",
      title: "Founder, Staunch Analytics Ltd",
      image: "/images/chibuzor-azodo.png",
    },
    {
      quote: "Proofdeck is an amazing platform. I'm glad we found a localized solution like theirs, and their support team is helpful, too.",
      name: "Ransom Philemon",
      title: "Founder @ Zitopy Tech",
      image: "/founder-zitopy-tech.jpeg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

  // Autoplay carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 40 : -40,
      opacity: 0,
    }),
  };

  return (
    <section className="py-24 bg-white border-b border-gray-100 relative overflow-hidden">
      {/* Background decorations */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="pd-pill-label mb-3 inline-flex">Testimonials</span>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trusted by Industry Leaders
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative px-4 sm:px-12">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:scale-110 active:scale-95 focus:outline-none"
            aria-label="Previous Testimonial"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Testimonial Card */}
          <div className="bg-white p-8 sm:p-12 md:p-14 rounded-3xl shadow-xl shadow-indigo-100/60 border border-gray-100 relative text-center min-h-[340px] flex flex-col justify-center overflow-hidden">
            <Quote
              size={72}
              className="text-indigo-50 absolute top-6 left-8 -z-0 transform -scale-x-100 pointer-events-none select-none"
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="relative z-10 space-y-8"
              >
                <p className="text-xl sm:text-2xl md:text-3xl text-gray-800 font-medium leading-relaxed italic">
                  "{currentTestimonial.quote}"
                </p>

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-1 rounded-full bg-[var(--pd-indigo)]">
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-indigo-600 font-semibold text-xs sm:text-sm bg-indigo-50 px-3 py-1 rounded-full inline-block mt-1 border border-indigo-100">
                      {currentTestimonial.title}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:scale-110 active:scale-95 focus:outline-none"
            aria-label="Next Testimonial"
          >
            <ChevronRight size={22} />
          </button>

          {/* Pagination Indicators */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-8 bg-indigo-600"
                    : "w-2.5 bg-gray-200 hover:bg-gray-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
