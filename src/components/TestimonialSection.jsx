import React, { useState, useEffect } from "react";
import { Quotes, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import Tag from "./ui/Tag";
import { Guilloche } from "./ui/decor";

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
    {
      quote: "ProofDeck has made things so much easier and faster for us at THRIVE Initiative! We recently hosted a webinar, and managing certificates for participants would have been much more stressful and time consuming without a tool like this. ProofDeck simplifies the process, saves valuable time, and makes issuing certificates more seamless and professional. As an organisation committed to empowering young people and creating meaningful impact, we appreciate tools that make our work easier and allow us to focus more on what truly matters. ProofDeck has definitely made a difference for us!",
      name: "Eseoghene Awhatorhe",
      title: "Founder, THRIVE INITIATIVE",
      image: "/images/eseoghene-awhatorhe.jpg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev

  // Autoplay carousel every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
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
      {/* Background decoration */}
      <Guilloche
        size={340}
        color="#5144E8"
        opacity={0.07}
        className="absolute -top-24 -right-24 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="mb-3">
            <Tag tone="indigo">Testimonials</Tag>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trusted by Industry Leaders
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative px-4 sm:px-12">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
            aria-label="Previous Testimonial"
          >
            <CaretLeft size={20} weight="bold" />
          </button>

          {/* Testimonial Card */}
          <div className="bg-white p-8 sm:p-12 md:p-14 rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 relative text-center min-h-[340px] flex flex-col justify-center overflow-hidden">
            <Quotes
              size={72}
              weight="duotone"
              className="text-indigo-100/80 absolute top-6 left-8 -z-0 pointer-events-none select-none"
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
                <p
                  className={`text-gray-800 font-medium leading-relaxed italic ${
                    currentTestimonial.quote.length > 200
                      ? "text-base sm:text-lg md:text-xl"
                      : "text-xl sm:text-2xl md:text-3xl"
                  }`}
                >
                  "{currentTestimonial.quote}"
                </p>

                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={currentTestimonial.image}
                    alt={currentTestimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
                  />
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-base">
                      {currentTestimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentTestimonial.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
            aria-label="Next Testimonial"
          >
            <CaretRight size={20} weight="bold" />
          </button>

          {/* Carousel Dot Indicators */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? "w-8 bg-indigo-600"
                    : "w-2.5 bg-gray-200 hover:bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;
