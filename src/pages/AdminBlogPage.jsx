import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Globe,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { getAdminBlogPosts, deleteAdminBlogPost } from "../api";

function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [search, statusFilter, page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status: statusFilter,
        page,
        limit: 10
      };
      const res = await getAdminBlogPosts(params);
      setPosts(res.data.posts || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      setError("Failed to fetch blog posts from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also remove it from the live Next.js blog.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteAdminBlogPost(id);
      fetchPosts();
    } catch (err) {
      alert("Error deleting article.");
    } finally {
      setDeletingId(null);
    }
  };

  const publishedCount = posts.filter(p => p.is_published).length;
  const draftCount = posts.filter(p => !p.is_published).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Blog & Article Manager
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Next.js SSG + ISR
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Publish educational guides and articles. Saved changes trigger instant on-demand revalidation on the blog frontend.
          </p>
        </div>

        <Link
          to="/admin/blog/editor"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-colors no-underline cursor-pointer"
        >
          <Plus size={16} />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Articles</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs">
          <p className="text-xs font-medium text-emerald-600 mb-1">Published Live</p>
          <p className="text-2xl font-bold text-emerald-700">{publishedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs">
          <p className="text-xs font-medium text-amber-600 mb-1">Drafts</p>
          <p className="text-2xl font-bold text-amber-700">{draftCount}</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, category, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            Loading articles...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 text-sm flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-900 font-semibold mb-1">No articles found</p>
            <p className="text-gray-500 text-sm mb-4">Get started by creating your first blog guide.</p>
            <Link
              to="/admin/blog/editor"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold no-underline"
            >
              <Plus size={14} />
              Create Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Article</th>
                  <th className="px-6 py-3.5 font-semibold">Category</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Views</th>
                  <th className="px-6 py-3.5 font-semibold">Date</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/admin/blog/editor/${post.id}`}
                          className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors no-underline line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs font-mono text-gray-400 mt-0.5 line-clamp-1">
                          /{post.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {post.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {post.view_count || 0}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/blog/editor/${post.id}`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deletingId === post.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBlogPage;
