import React from "react";
import { Link } from "react-router-dom";
import { Copy, Check } from "lucide-react";

export function ApiSection() {
  const [copied, setCopied] = React.useState(false);

  const copyEndpoint = () => {
    navigator.clipboard.writeText("https://api.proofdeck.app/api/v1/certificates");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-[var(--pd-ink)] text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
        
        {/* Text Content */}
        <div className="md:w-1/2 space-y-8">
          <span className="pd-pill-label" style={{ background: "rgba(91,76,245,0.1)", borderColor: "rgba(91,76,245,0.3)", color: "rgba(91,76,245,0.8)" }}>For Developers</span>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Build on our <span className="text-[var(--pd-indigo)]">infrastructure</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-xl">
              Automate certificate generation directly from your own application
              using our robust REST API. Perfect for LMS platforms, event apps, and
              HR tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/docs"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline"
            >
              Read documentation
            </Link>
            <Link
              to="/docs#auth"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full text-white/70 border border-white/20 hover:bg-white/5 hover:text-white transition-colors no-underline"
            >
              View API reference
            </Link>
          </div>
        </div>

        {/* Code Visual */}
        <div className="md:w-1/2 w-full">
          <div className="bg-[#0a0a14] rounded-2xl border border-white/10 overflow-hidden font-mono text-sm leading-relaxed" style={{ boxShadow: "var(--pd-shadow)" }}>
            {/* Window Controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/15"></div>
                <div className="w-3 h-3 rounded-full bg-white/15"></div>
                <div className="w-3 h-3 rounded-full bg-white/15"></div>
              </div>
              <div className="text-xs text-white/30 font-sans">cURL / HTTP Request</div>
            </div>

            {/* Code Content */}
            <div className="p-6 space-y-4 overflow-x-auto">
              <div>
                <div className="flex items-center justify-between text-white/30 text-xs mb-2">
                  <span>// Generate a certificate via API</span>
                  <button onClick={copyEndpoint} className="hover:text-white transition-colors flex items-center gap-1">
                    {copied ? <Check size={14} className="text-[var(--pd-success)]" /> : <Copy size={14} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="text-indigo-300">
                  <span className="text-pink-400 font-bold">POST</span> https://api.proofdeck.app/api/v1/certificates
                </div>
              </div>

              <div className="text-gray-300">
                <span className="text-white/30">{`{`}</span>
                <div className="pl-4">
                  <p><span className="text-cyan-400">"template_id"</span>: <span className="text-emerald-400">1</span>,</p>
                  <p><span className="text-cyan-400">"recipient_name"</span>: <span className="text-emerald-400">"Jane Doe"</span>,</p>
                  <p><span className="text-cyan-400">"recipient_email"</span>: <span className="text-emerald-400">"jane@example.com"</span>,</p>
                  <p><span className="text-cyan-400">"course_title"</span>: <span className="text-emerald-400">"Full-Stack Web Development"</span></p>
                </div>
                <span className="text-white/30">{`}`}</span>
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="text-white/30">// Response: 201 Created</span>
                <div className="text-emerald-400/90 text-xs mt-1 font-mono">
                  {`{ "msg": "Certificate created", "verification_url": "https://www.proofdeck.app/verify/df849a29-3440-477d-826c-5e996932e123" }`}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
