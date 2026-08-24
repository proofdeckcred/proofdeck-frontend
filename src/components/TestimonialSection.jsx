import React from "react";
import { Quote } from "lucide-react";

export function TestimonialSection() {
  const testimonials = [
    {
      quote: "ProofDeck is a game changer. The ability to customize my certificates and issue them in bulk made all the difference.",
      name: "Chibuzor Azodo, PhD",
      title: "Founder, Staunch Analytics Ltd",
      image: "/images/chibuzor-azodo.png",
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-gray-100 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
            <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">
                Testimonials
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Trusted by Industry Leaders
            </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 relative text-center">
            <Quote
              size={64}
              className="text-indigo-50 absolute top-6 left-8 -z-0 transform -scale-x-100"
            />
            
            <div className="relative z-10 space-y-8">
              <p className="text-xl md:text-3xl text-gray-800 font-medium leading-relaxed">
                "{testimonials[0].quote}"
              </p>
              
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-1 rounded-full bg-indigo-100/50">
                    <img
                        src={testimonials[0].image}
                        alt={testimonials[0].name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {testimonials[0].name}
                  </div>
                  <div className="text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1 rounded-full inline-block mt-1">
                    {testimonials[0].title}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
