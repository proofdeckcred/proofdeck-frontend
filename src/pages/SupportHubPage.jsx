// frontend/src/pages/SupportHubPage.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { helpArticles } from "../data/helpArticles.jsx";
import { Search, MessageCircle, HelpCircle, ArrowLeft } from "lucide-react";
import { useSupportStatus } from "../hooks/useSupportStatus";

function SupportHubPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { isOnline } = useSupportStatus();

  const filteredArticles = helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full pb-20">
      {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
          {/* Left: Page Title */}
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0">Support Hub</h1>

          {/* Right Action */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800 decoration-none bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200/40"
          >
            <ArrowLeft size={13} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* --- 2. Main Cohesive Bento Container --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-200/80 bg-white rounded-xl overflow-hidden shadow-sm divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80">
        
        {/* Left Column: Search & Articles Grid (col-span-8) */}
        <div className="lg:col-span-8 p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Browse Knowledge Base</h2>
            <p className="text-[10px] text-slate-400">Search guides and articles to solve common questions</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200/60 rounded-lg focus:bg-white focus:border-slate-400 transition-all text-xs outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Help Topics Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredArticles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/dashboard/support/articles/${article.slug}`}
                  className="group bg-white rounded-xl border border-slate-200/70 p-4 hover:shadow hover:border-indigo-400 hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col justify-between text-decoration-none h-full"
                >
                  <div>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${article.theme}`}>
                      {article.icon}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1 group-hover:text-indigo-650 transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed">
                      {article.description}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform mt-3.5 flex items-center gap-0.5">
                    Read article &rarr;
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <HelpCircle className="text-slate-350 w-8 h-8 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No articles match your search</h4>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 bg-white border border-slate-200 text-slate-700 rounded-lg py-1 px-3.5 hover:bg-slate-50 transition-all font-semibold text-xs shadow-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Support Tickets & Contact info (col-span-4) */}
        <div className="lg:col-span-4 p-6 bg-slate-50/20 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Direct Support</h3>
              <p className="text-[9px] text-slate-400">Submit requests directly to our team</p>
            </div>

            {/* Premium Indigo Dark Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow">
              <div className="relative z-10 space-y-4">
                <MessageCircle size={36} className="text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold mb-1">Create Support Ticket</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Our team is based in Nigeria and will review your request quickly. Expected response time: under 12 hours.
                  </p>
                </div>

                {/* Online Status Pill */}
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                  <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                  <span className="text-[9px] font-semibold text-slate-200">
                    {isOnline ? "Support Staff Online" : "Staff Currently Offline"}
                  </span>
                </div>

                <Link
                  to="/dashboard/support/tickets"
                  className="block w-full text-center bg-white text-slate-900 hover:bg-slate-50 font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all text-xs text-decoration-none"
                >
                  New Support Ticket
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/50 mt-6 text-center text-[10px] text-slate-400">
            <span>Support hours: Mon - Fri, 9am - 5pm WAT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportHubPage;
