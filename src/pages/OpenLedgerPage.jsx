import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { advancedSearchCertificates } from "../api";
import {
  Search,
  Building,
  User,
  BookOpen,
  Filter,
  X,
  Calendar,
  ChevronRight,
  Loader2,
} from "lucide-react";
import DatePicker from "react-datepicker";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import "react-datepicker/dist/react-datepicker.css";

// --- COMPONENTS ---

const CredentialCard = ({ cert }) => {
  const isCompany = cert.issuer_type === "company";

  return (
    <Link
      to={`/verify/${cert.verification_id}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group no-underline"
    >
      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
        {isCompany ? <Building size={14} /> : <User size={14} />}
        {cert.issuer_name}
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
        {cert.recipient_name}
      </h3>

      <div className="flex items-center gap-2 text-gray-600 mb-6 text-sm line-clamp-1">
        <BookOpen size={16} className="text-gray-400" />
        {cert.course_title}
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
        <span className="flex items-center text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
          Verify <ChevronRight size={14} className="ml-1" />
        </span>
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="h-3 w-1/3 bg-gray-200 rounded mb-4"></div>
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
    <div className="h-4 w-1/2 bg-gray-200 rounded mb-8"></div>
    <div className="h-px bg-gray-100 mb-4"></div>
    <div className="flex justify-between">
      <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const OpenLedgerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    recipient: searchParams.get("recipient") || "",
    issuer: searchParams.get("issuer") || "",
    course: searchParams.get("course") || "",
    startDate: searchParams.get("start_date")
      ? new Date(searchParams.get("start_date"))
      : null,
    endDate: searchParams.get("end_date")
      ? new Date(searchParams.get("end_date"))
      : null,
    sort_by: searchParams.get("sort_by") || "issue_date",
    sort_order: searchParams.get("sort_order") || "desc",
  });

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // --- Initial Load Check ---
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    if (Object.keys(params).length > 0) {
      performSearch(params);
    }
  }, []); // Run once on mount

  const performSearch = useCallback(async (params) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await advancedSearchCertificates(params);
      setResults(response.data.results);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { page: 1 };

    if (filters.recipient) newParams.recipient = filters.recipient;
    if (filters.issuer) newParams.issuer = filters.issuer;
    if (filters.course) newParams.course = filters.course;
    if (filters.startDate)
      newParams.start_date = filters.startDate.toISOString().split("T")[0];
    if (filters.endDate)
      newParams.end_date = filters.endDate.toISOString().split("T")[0];

    newParams.sort_by = filters.sort_by;
    newParams.sort_order = filters.sort_order;

    setSearchParams(newParams);
    performSearch(newParams);
  };

  const clearFilters = () => {
    setFilters({
      recipient: "",
      issuer: "",
      course: "",
      startDate: null,
      endDate: null,
      sort_by: "issue_date",
      sort_order: "desc",
    });
    setSearchParams({});
    setResults([]);
    setHasSearched(false);
  };

  const handlePageChange = (newPage) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const newParams = { ...currentParams, page: newPage };
    setSearchParams(newParams);
    performSearch(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-grow">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Public Credential Ledger
            </h1>
            <p className="text-gray-500 text-lg">
              Search and verify credentials issued by organizations on
              ProofDeck.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold text-lg">
                  <Filter size={20} className="text-indigo-600" />
                  Search Filters
                </div>

                <form onSubmit={handleSearch} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                      placeholder="e.g. Jane Doe"
                      value={filters.recipient}
                      onChange={(e) =>
                        setFilters({ ...filters, recipient: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issuer Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                      placeholder="e.g. Tech Corp"
                      value={filters.issuer}
                      onChange={(e) =>
                        setFilters({ ...filters, issuer: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Range
                    </label>
                    <div className="flex gap-2">
                      <DatePicker
                        selected={filters.startDate}
                        onChange={(date) =>
                          setFilters({ ...filters, startDate: date })
                        }
                        selectsStart
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        placeholderText="Start"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                      />
                      <DatePicker
                        selected={filters.endDate}
                        onChange={(date) =>
                          setFilters({ ...filters, endDate: date })
                        }
                        selectsEnd
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        minDate={filters.startDate}
                        placeholderText="End"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Search size={18} /> Search Ledger
                    </button>
                    {hasSearched && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <X size={18} /> Clear Filters
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : hasSearched && results.length > 0 ? (
                <>
                  <p className="text-gray-500 mb-6 text-sm">
                    Found{" "}
                    <strong className="text-gray-900">
                      {pagination.total}
                    </strong>{" "}
                    credentials matching your criteria.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map((cert) => (
                      <CredentialCard key={cert.verification_id} cert={cert} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                      {[...Array(pagination.pages)].map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pageNum === pagination.page;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              isCurrent
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : hasSearched ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No credentials found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search terms.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center h-full flex flex-col justify-center items-center min-h-[400px]">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <BookOpen size={40} className="text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Start your search
                  </h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Use the filters on the left to browse the public ledger of
                    verified credentials issued on ProofDeck.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default OpenLedgerPage;
