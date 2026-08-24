import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronRight } from "lucide-react";

const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center z-50">
              <Link
                to="/"
                className="flex items-center gap-2.5 no-underline group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img
                    src="/logo.png"
                    alt="ProofDeck"
                    className="w-10 h-10 rounded-lg"
                  />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  ProofDeck
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/pricing"
                className="text-[15px] font-medium text-gray-600 hover:text-indigo-600 transition-colors no-underline"
              >
                Pricing
              </Link>
              <Link
                to="/search"
                className="text-[15px] font-medium text-gray-600 hover:text-indigo-600 transition-colors no-underline"
              >
                Public Ledger
              </Link>
              <Link
                to="/docs"
                className="text-[15px] font-medium text-gray-600 hover:text-indigo-600 transition-colors no-underline"
              >
                Developers
              </Link>

              <div className="h-5 w-px bg-gray-200 mx-2"></div>

              <Link
                to="/login"
                className="text-[15px] font-medium text-gray-900 hover:text-indigo-600 transition-colors no-underline"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[15px] font-bold text-white bg-gray-900 hover:bg-black transition-all shadow-lg hover:shadow-xl no-underline"
              >
                Get Started
                <ArrowRight
                  size={16}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </nav>

            <div className="md:hidden z-50">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -mr-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-white z-40 transition-all duration-500 ease-in-out md:hidden ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full pt-28 px-6 pb-8">
          <nav className="flex-1 flex flex-col space-y-2">
            {[
              { label: "Pricing", path: "/pricing" },
              { label: "Public Ledger", path: "/search" },
              { label: "Verification", path: "/verify" },
              { label: "API Documentation", path: "/docs" },
            ].map((item) =>
              item.isExternal ? (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-4 text-2xl font-bold text-gray-900 border-b border-gray-100 no-underline group"
                >
                  {item.label}
                  <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center justify-between py-4 text-2xl font-bold text-gray-900 border-b border-gray-100 no-underline group"
                >
                  {item.label}
                  <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                </Link>
              )
            )}
          </nav>

          <div className="mt-auto space-y-4">
            <Link
              to="/login"
              className="flex items-center justify-center w-full py-4 text-lg font-bold text-gray-900 bg-gray-100 rounded-xl no-underline"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="flex items-center justify-center w-full py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl no-underline"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicHeader;
