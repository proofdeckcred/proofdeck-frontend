// frontend/src/pages/HelpArticlePage.jsx

import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { helpArticles } from "../data/helpArticles.jsx";

function HelpArticlePage() {
  const { slug } = useParams();
  const article = helpArticles.find((art) => art.slug === slug);

  if (!article) {
    return <Navigate to="/dashboard/support" />;
  }

  return (
    <div className="w-full pb-20">
      {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
          {/* Left: Page Title */}
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0">Help Center</h1>

          {/* Right Action */}
          <Link
            to="/dashboard/support"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-655 hover:text-slate-855 decoration-none bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200/40 text-slate-600 hover:text-slate-850"
          >
            <ArrowLeft size={13} />
            <span>All Articles</span>
          </Link>
        </div>
      </div>

      {/* --- 2. Article Content Container --- */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        
        {/* Article Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 md:p-12 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${article.theme}`}>
              {article.icon}
            </div>
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider">
              {article.title}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-850 mb-6 border-b border-slate-100 pb-4">
            {article.title}
          </h1>

          <div className="text-xs text-slate-650 leading-relaxed space-y-4">
            {article.content}
          </div>
        </div>

        {/* --- 3. Contact Support Bento Callout --- */}
        <div className="bg-slate-900 rounded-2xl p-8 text-center text-white relative overflow-hidden shadow">
          <div className="relative z-10 max-w-lg mx-auto space-y-4">
            <MessageCircle size={36} className="mx-auto text-indigo-400" />
            <h2 className="text-sm font-bold">Still need help?</h2>
            <p className="text-[10px] text-slate-350 leading-relaxed">
              If this article didn't solve your issue, our team is ready to assist. Create a ticket and we'll get back to you as soon as possible.
            </p>
            <Link
              to="/dashboard/support/tickets"
              className="inline-block bg-white text-slate-900 hover:bg-slate-50 font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all text-xs text-decoration-none"
            >
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default HelpArticlePage;
