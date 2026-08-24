// frontend/src/pages/SupportHubPage.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { helpArticles } from "../data/helpArticles.jsx";
import { Search, MessageCircle, HelpCircle } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 text-center mb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Search our knowledge base or browse the topics below to find
            answers.
          </p>

          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
          Browse Help Topics
        </h3>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArticles.map((article) => (
              <Link
                key={article.slug}
                to={`/dashboard/support/articles/${article.slug}`}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col h-full text-decoration-none"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${article.theme}`}
                >
                  {article.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {article.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {article.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              No articles found matching "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-indigo-600 font-medium mt-2 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Support Contact */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-indigo-900 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-400 opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <MessageCircle size={48} className="mx-auto mb-6 text-indigo-300" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Still need help?
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
              Our Nigerian-based support team is ready to assist you. Create a
              ticket and we'll get back to you as soon as possible.
            </p>

            <div className="inline-flex items-center gap-2 bg-indigo-800/50 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-indigo-700/50">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? "bg-green-400 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  isOnline ? "text-green-300" : "text-gray-300"
                }`}
              >
                {isOnline ? "Support Team Online" : "Currently Offline"}
              </span>
            </div>

            <div>
              <Link
                to="/dashboard/support/tickets"
                className="inline-block bg-white text-indigo-900 font-bold py-3.5 px-8 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-decoration-none"
              >
                Create Support Ticket
              </Link>
            </div>

            <p className="mt-6 text-indigo-300/80 text-xs">
              Support Hours: Mon - Fri, 9am - 5pm (WAT)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportHubPage;
