import React from "react";
import { Link } from "react-router-dom";
import { Code, ArrowRight, Copy, Check } from "lucide-react";

export function ApiSection() {
  const [copied, setCopied] = React.useState(false);

  const copyEndpoint = () => {
    navigator.clipboard.writeText("https://certifyme.pythonanywhere.com/api/v1/certificates");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/20 to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
        
        {/* Text Content */}
        <div className="md:w-1/2 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold backdrop-blur-sm">
            <Code size={16} /> <span>For Developers</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Build on our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Infrastructure</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
              Automate certificate generation directly from your own application
              using our robust REST API. Perfect for LMS platforms, event apps, and
              HR tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
                to="/docs"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/50"
            >
                Read Documentation <ArrowRight className="ml-2" size={18} />
            </Link>
            <button
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-700 text-base font-medium rounded-xl text-gray-300 bg-gray-800/50 hover:bg-gray-800 hover:text-white transition-all"
            >
                View API Reference
            </button>
          </div>
        </div>

        {/* Code Visual */}
        <div className="md:w-1/2 w-full">
            <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                
                <div className="relative bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden font-mono text-sm leading-relaxed">
                    {/* Window Controls */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800">
                        <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="text-xs text-gray-500 font-sans">bash</div>
                    </div>

                    {/* Code Content */}
                    <div className="p-6 space-y-4 overflow-x-auto custom-scrollbar">
                        <div>
                            <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
                                <span>// Generate a certificate</span>
                                <button onClick={copyEndpoint} className="hover:text-white transition-colors">
                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="text-indigo-300">
                                <span className="text-pink-400">POST</span> https://certifyme.pythonanywhere.com/api/v1/certificates
                            </div>
                        </div>

                        <div className="text-gray-300">
                            <span className="text-gray-500">{`{`}</span>
                            <div className="pl-4">
                                <p><span className="text-cyan-400">"template_id"</span>: <span className="text-emerald-400">"tmpl_modern_123"</span>,</p>
                                <p><span className="text-cyan-400">"recipient_name"</span>: <span className="text-emerald-400">"Jane Doe"</span>,</p>
                                <p><span className="text-cyan-400">"recipient_email"</span>: <span className="text-emerald-400">"jane@example.com"</span>,</p>
                                <p><span className="text-cyan-400">"course_title"</span>: <span className="text-emerald-400">"Advanced React Patterns"</span></p>
                            </div>
                            <span className="text-gray-500">{`}`}</span>
                        </div>

                        <div className="pt-2 border-t border-gray-800/50">
                            <span className="text-gray-500">// Response: 201 Created</span>
                            <div className="text-emerald-400/90 text-xs mt-1">
                                {`{ "url": "https://certify.me/verify/abc-123", "status": "sent" }`}
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
