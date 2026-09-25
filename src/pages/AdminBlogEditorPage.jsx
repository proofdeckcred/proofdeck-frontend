import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Video,
  Quote,
  Code,
  Link2,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  X,
  Loader2,
  ExternalLink,
  Camera,
  Trash2
} from "lucide-react";
import {
  getAdminBlogPost,
  createAdminBlogPost,
  updateAdminBlogPost,
  uploadBlogImage
} from "../api";

const PRESET_CATEGORIES = ["General", "How to", "For devs"];

function formatInlineMarkdown(text) {
  if (!text) return "";
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

  // Italic: *text*
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Inline Code: `code`
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-[#5B4CF5] font-mono text-[12px] border border-slate-200/70">$1</code>'
  );

  // Links: [text](url)
  formatted = formatted.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#5B4CF5] hover:text-[#4433E0] font-semibold underline underline-offset-4 transition-colors">$1</a>'
  );

  return formatted;
}

function parseMarkdownBlocks(content) {
  if (!content) return [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Empty lines
    if (!line) {
      i++;
      continue;
    }

    // 2. Code Block: ```[lang] ... ```
    if (line.startsWith("```")) {
      const lang = line.replace(/^```/, "").trim() || "text";
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++;
      }
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    // 3. Blockquote: lines starting with >
    if (line.startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const fullQuote = quoteLines.join("\n");
      const hasAuthor = fullQuote.includes("—") || fullQuote.includes("--");
      let text = fullQuote;
      let author = "";
      if (hasAuthor) {
        const parts = fullQuote.split(/(?:—|--)/);
        text = parts[0].trim();
        author = parts.slice(1).join("—").trim();
      }
      blocks.push({ type: "blockquote", text: text.replace(/^["']|["']$/g, ""), author });
      continue;
    }

    // 4. Horizontal Rule: --- or ***
    if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 5. Headings: #, ##, ###, ####
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // 6. Standalone Image: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push({ type: "image", alt: imgMatch[1], url: imgMatch[2] });
      i++;
      continue;
    }

    // 7. Standalone YouTube Link
    const ytMatch = line.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (ytMatch && (line.startsWith("http") || line.startsWith("<iframe") || line.startsWith("[youtube]"))) {
      blocks.push({ type: "youtube", id: ytMatch[1] });
      i++;
      continue;
    }

    // 8. Bullet or Numbered Lists
    const isBullet = /^\s*[-*+]\s+/.test(rawLine);
    const isNum = /^\s*\d+\.\s+/.test(rawLine);
    if (isBullet || isNum) {
      const listType = isNum ? "ol" : "ul";
      const items = [];
      while (i < lines.length) {
        const curRaw = lines[i];
        const matchBullet = isNum ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
        const m = curRaw.match(matchBullet);
        if (m) {
          items.push(m[1]);
          i++;
        } else if (
          curRaw.trim() &&
          !curRaw.trim().startsWith("#") &&
          !curRaw.trim().startsWith("```") &&
          !curRaw.trim().startsWith(">") &&
          !/^(\s*[-*_]\s*){3,}$/.test(curRaw.trim())
        ) {
          if (items.length > 0) items[items.length - 1] += " " + curRaw.trim();
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", listType, items });
      continue;
    }

    // 9. Regular Paragraph
    const paraLines = [rawLine];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("#") &&
      !/^(\s*[-*_]\s*){3,}$/.test(lines[i].trim()) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().match(/^!\[(.*?)\]\((.*?)\)$/) &&
      !lines[i].trim().match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }

  return blocks;
}

function AdminBlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const textareaRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const authorAvatarInputRef = useRef(null);

  const [formData, setFormData] = useState(() => {
    let savedName = "Bolaji";
    let savedRole = "Founder";
    let savedAvatar = "";
    try {
      const n = localStorage.getItem("proofdeck_blog_author_name");
      if (n) savedName = n;
      const r = localStorage.getItem("proofdeck_blog_author_role");
      if (r) savedRole = r;
      const a = localStorage.getItem("proofdeck_blog_author_avatar");
      if (a) savedAvatar = a;
    } catch (err) {}

    return {
      title: "",
      slug: "",
      category: "General",
      excerpt: "",
      content: "",
      featured_image: "",
      author_name: savedName,
      author_role: savedRole,
      author_avatar: savedAvatar,
      meta_title: "",
      meta_description: "",
      canonical_url: "",
      is_published: false
    };
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCatInput, setCustomCatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [previewMode, setPreviewMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    setFetching(true);
    try {
      const res = await getAdminBlogPost(id);
      const post = res.data;
      const cat = post.category || "General";
      const isPreset = PRESET_CATEGORIES.some(c => c.toLowerCase() === cat.toLowerCase());

      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        category: cat,
        excerpt: post.excerpt || "",
        content: post.content || "",
        featured_image: post.featured_image || "",
        author_name: post.author_name || localStorage.getItem("proofdeck_blog_author_name") || "Bolaji",
        author_role: post.author_role || localStorage.getItem("proofdeck_blog_author_role") || "Founder",
        author_avatar: post.author_avatar || localStorage.getItem("proofdeck_blog_author_avatar") || "",
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        canonical_url: post.canonical_url || "",
        is_published: Boolean(post.is_published)
      });

      if (!isPreset) {
        setIsCustomCategory(true);
        setCustomCatInput(cat);
      }
    } catch (err) {
      setStatusMessage({ type: "error", text: "Failed to load article details." });
    } finally {
      setFetching(false);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing && (!prev.slug || prev.slug === generateSlug(prev.title))
        ? generateSlug(title)
        : prev.slug,
      meta_title: !prev.meta_title || prev.meta_title === prev.title ? title : prev.meta_title
    }));
  };

  const handleCategorySelect = (e) => {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustomCategory(true);
    } else {
      setIsCustomCategory(false);
      setFormData({ ...formData, category: val });
    }
  };

  const handleCustomCategoryChange = (e) => {
    const val = e.target.value;
    setCustomCatInput(val);
    setFormData({ ...formData, category: val || "General" });
  };

  // Thumbnail File Upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    setUploadingThumb(true);
    try {
      const res = await uploadBlogImage(data);
      const url = res.data.imageUrl || res.data.url;
      setFormData((prev) => ({ ...prev, featured_image: url }));
    } catch (err) {
      alert("Failed to upload thumbnail image: " + (err.response?.data?.msg || err.message));
    } finally {
      setUploadingThumb(false);
    }
  };

  // Inline Image Upload in Markdown
  const handleInlineImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    setUploadingInline(true);
    try {
      const res = await uploadBlogImage(data);
      const url = res.data.imageUrl || res.data.url;
      const altText = file.name.split(".")[0] || "Blog Image";
      insertTextAtCursor(`\n\n![${altText}](${url})\n\n`);
    } catch (err) {
      alert("Failed to upload inline image: " + (err.response?.data?.msg || err.message));
    } finally {
      setUploadingInline(false);
    }
  };

  // Author Profile Avatar Upload
  const handleAuthorAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("image", file);

    setUploadingAvatar(true);
    try {
      const res = await uploadBlogImage(data);
      const url = res.data.imageUrl || res.data.url;
      setFormData((prev) => ({ ...prev, author_avatar: url }));
      try {
        localStorage.setItem("proofdeck_blog_author_avatar", url);
      } catch (err) {}
    } catch (err) {
      alert("Failed to upload author avatar: " + (err.response?.data?.msg || err.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAuthorAvatar = () => {
    setFormData((prev) => ({ ...prev, author_avatar: "" }));
    try {
      localStorage.removeItem("proofdeck_blog_author_avatar");
    } catch (err) {}
  };

  // Markdown Toolbar Insertion Helper
  const insertTextAtCursor = (insertion) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setFormData((prev) => ({ ...prev, content: (prev.content || "") + insertion }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const oldText = formData.content || "";
    const newText = oldText.substring(0, start) + insertion + oldText.substring(end);

    setFormData((prev) => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 50);
  };

  const wrapSelection = (before, after, placeholder = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const oldText = formData.content || "";
    const selected = oldText.substring(start, end) || placeholder;

    const replacement = `${before}${selected}${after}`;
    const newText = oldText.substring(0, start) + replacement + oldText.substring(end);

    setFormData((prev) => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const handleInsertYouTube = () => {
    const url = prompt("Enter YouTube Video URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...):");
    if (!url) return;
    insertTextAtCursor(`\n\n${url.trim()}\n\n`);
  };

  const handleInsertLink = () => {
    const url = prompt("Enter URL (e.g. https://www.proofdeck.app):");
    if (!url) return;
    const text = prompt("Enter Link Text:") || "Learn more";
    insertTextAtCursor(`[${text}](${url.trim()})`);
  };

  const handleInsertQuote = () => {
    insertTextAtCursor(`\n\n> "Add your memorable quote here"\n> — Speaker Name, Title\n\n`);
  };

  const handleInsertCode = () => {
    insertTextAtCursor(`\n\n\`\`\`javascript\n// write code snippet here\n\`\`\`\n\n`);
  };

  const handleSubmit = async (publishOverride) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required.");
      return;
    }

    const targetPublished =
      typeof publishOverride === "boolean" ? publishOverride : Boolean(formData.is_published);

    const payload = {
      ...formData,
      is_published: targetPublished,
    };

    setFormData((prev) => ({ ...prev, is_published: targetPublished }));
    setLoading(true);
    setStatusMessage(null);

    try {
      if (isEditing) {
        await updateAdminBlogPost(id, payload);
        setStatusMessage({
          type: "success",
          text: targetPublished
            ? "Article published live! Live blog updated via Next.js ISR."
            : "Draft updated successfully."
        });
        setTimeout(() => {
          navigate("/admin/blog");
        }, 1000);
      } else {
        await createAdminBlogPost(payload);
        setStatusMessage({
          type: "success",
          text: targetPublished
            ? "Article published live! Live blog updated via Next.js ISR."
            : "Draft saved successfully."
        });
        setTimeout(() => {
          navigate("/admin/blog");
        }, 1000);
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err.response?.data?.msg || "Failed to save article."
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract YouTube video ID for preview
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
  };

  if (fetching) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm font-sans flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin text-[#5B4CF5]" />
        Loading article data...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto font-sans">
      {/* Hidden file inputs for uploads */}
      <input
        type="file"
        ref={thumbnailInputRef}
        onChange={handleThumbnailUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={inlineImageInputRef}
        onChange={handleInlineImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/blog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isEditing ? "Edit Article" : "Write New Article"}
            </h1>
            <p className="text-xs text-slate-500">
              Saved articles automatically trigger ISR revalidation on the blog app.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              previewMode
                ? "bg-indigo-50 border-indigo-200 text-[#5B4CF5]"
                : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            }`}
          >
            <Eye size={14} />
            {previewMode ? "Return to Editor" : "Live Preview"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#5B4CF5] hover:bg-[#4433E0] text-white text-xs font-semibold shadow-xs cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
            Publish Live
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium mb-6 flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Box */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Article Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. How to Verify a Certificate Online & Spot Fake Credentials"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2.5 text-base sm:text-lg font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20 focus:border-[#5B4CF5]"
            />
          </div>

          {/* URL Slug & Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 text-xs font-mono bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500">
                  blog.proofdeck.app/
                </span>
                <input
                  type="text"
                  required
                  placeholder="article-slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: generateSlug(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20 focus:border-[#5B4CF5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Article Category *
              </label>
              <div className="space-y-2">
                <select
                  value={isCustomCategory ? "__custom__" : formData.category}
                  onChange={handleCategorySelect}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20 focus:border-[#5B4CF5] font-medium"
                >
                  <option value="General">General</option>
                  <option value="How to">How to</option>
                  <option value="For devs">For devs</option>
                  <option value="__custom__">+ Add Custom Category...</option>
                </select>

                {isCustomCategory && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type custom category (e.g. Case Studies, AI, Security)"
                      value={customCatInput}
                      onChange={handleCustomCategoryChange}
                      className="w-full px-3 py-1.5 text-xs bg-indigo-50/50 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setFormData({ ...formData, category: "General" });
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                      title="Cancel custom category"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Short Excerpt (Search Engine & Card Summary)
            </label>
            <textarea
              rows={2}
              placeholder="Brief overview shown on article cards and search results..."
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  excerpt: e.target.value,
                  meta_description: !formData.meta_description ? e.target.value : formData.meta_description
                })
              }
              className="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20 focus:border-[#5B4CF5]"
            />
          </div>

          {/* Article Thumbnail Image with Upload Button */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Article Thumbnail / Featured Image
              </label>
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={uploadingThumb}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B4CF5] hover:bg-[#4433E0] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {uploadingThumb ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {uploadingThumb ? "Uploading..." : "Upload Thumbnail"}
              </button>
            </div>

            {formData.featured_image ? (
              <div className="flex items-center gap-4 bg-white p-2.5 rounded-xl border border-slate-200">
                <img
                  src={formData.featured_image}
                  alt="Thumbnail Preview"
                  className="w-20 h-14 object-cover rounded-lg border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-600 truncate">{formData.featured_image}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Thumbnail Attached</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, featured_image: "" })}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Or paste image URL (e.g. /images/blog/cover.png or https://...)"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20"
              />
            )}
          </div>

          {/* Content Editor with Rich Formatting Toolbar */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-bold text-slate-800">
                Article Body Content (Markdown Supported) *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Supports YouTube videos, images, quotes, links, and code blocks
              </span>
            </div>

            {/* Rich Formatting Toolbar */}
            {!previewMode && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-t-xl border-b-0 text-slate-600">
                {/* Headers */}
                <button
                  type="button"
                  onClick={() => wrapSelection("## ", "", "Heading 2")}
                  className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                  title="Heading 2 (## )"
                >
                  <Heading2 size={14} /> H2
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection("### ", "", "Heading 3")}
                  className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-bold flex items-center gap-1"
                  title="Heading 3 (### )"
                >
                  <Heading3 size={14} /> H3
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Bold & Italic */}
                <button
                  type="button"
                  onClick={() => wrapSelection("**", "**", "bold text")}
                  className="p-1.5 rounded hover:bg-slate-200 text-xs font-bold"
                  title="Bold (**text**)"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection("*", "*", "italic text")}
                  className="p-1.5 rounded hover:bg-slate-200 text-xs"
                  title="Italic (*text*)"
                >
                  <Italic size={14} />
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Quotes */}
                <button
                  type="button"
                  onClick={handleInsertQuote}
                  className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-medium flex items-center gap-1"
                  title="Insert Quote (>)"
                >
                  <Quote size={13} /> Quote
                </button>

                {/* Links */}
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-medium flex items-center gap-1"
                  title="Insert Link [text](url)"
                >
                  <Link2 size={13} /> Link
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Media: Image & YouTube Video */}
                <button
                  type="button"
                  onClick={() => inlineImageInputRef.current?.click()}
                  disabled={uploadingInline}
                  className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-[#5B4CF5] text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Upload & Insert Inline Image"
                >
                  {uploadingInline ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                  {uploadingInline ? "Uploading..." : "Upload Image"}
                </button>

                <button
                  type="button"
                  onClick={handleInsertYouTube}
                  className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Insert YouTube Video (Plays directly in article)"
                >
                  <Video size={13} /> YouTube Video
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Lists & Code */}
                <button
                  type="button"
                  onClick={() => wrapSelection("- ", "", "List item")}
                  className="p-1.5 rounded hover:bg-slate-200 text-xs"
                  title="Bullet list (- )"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelection("1. ", "", "Ordered item")}
                  className="p-1.5 rounded hover:bg-slate-200 text-xs"
                  title="Numbered list (1. )"
                >
                  <ListOrdered size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleInsertCode}
                  className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-medium flex items-center gap-1"
                  title="Insert Code Block (```)"
                >
                  <Code size={13} /> Code
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("\n\n---\n\n")}
                  className="p-1.5 rounded hover:bg-slate-200 text-xs"
                  title="Divider (---)"
                >
                  <Minus size={14} />
                </button>
              </div>
            )}

            {/* Textarea or Rich Live Preview */}
            {previewMode ? (
              <div className="p-6 sm:p-8 bg-slate-50/70 border border-slate-200 rounded-2xl min-h-[450px] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5B4CF5]">
                    Live Article Preview ({formData.category})
                  </span>
                  <div className="flex items-center gap-2">
                    {formData.author_avatar ? (
                      <img
                        src={formData.author_avatar}
                        alt="Author"
                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#5B4CF5] text-white flex items-center justify-center text-[10px] font-bold">
                        {formData.author_name?.charAt(0) || "B"}
                      </div>
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                      {formData.author_name} · {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {formData.title || "Untitled Article"}
                </h1>

                {formData.featured_image && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                    <img src={formData.featured_image} alt="Cover" className="w-full h-auto max-h-[400px] object-cover" />
                  </div>
                )}

                <div className="space-y-6 text-sm sm:text-base text-slate-800 leading-relaxed font-sans">
                  {parseMarkdownBlocks(formData.content).map((block, idx) => {
                    // YouTube
                    if (block.type === "youtube") {
                      return (
                        <div key={idx} className="my-6">
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-950">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${block.id}`}
                              title="Video preview"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full border-0"
                            />
                          </div>
                          <p className="text-center text-xs text-slate-400 mt-1 font-medium">YouTube Video Preview</p>
                        </div>
                      );
                    }

                    // Image
                    if (block.type === "image") {
                      return (
                        <figure key={idx} className="my-6">
                          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                            <img src={block.url} alt={block.alt || "Preview"} className="w-full h-auto max-h-[450px] object-cover" />
                          </div>
                          {block.alt && (
                            <figcaption className="text-center text-xs text-slate-500 mt-1.5 italic">{block.alt}</figcaption>
                          )}
                        </figure>
                      );
                    }

                    // Blockquote
                    if (block.type === "blockquote") {
                      return (
                        <blockquote key={idx} className="p-4 sm:p-5 rounded-2xl border-l-[5px] border-[#5B4CF5] bg-[#F7F7FA] border-t border-r border-b border-slate-200/60 my-4 text-slate-800">
                          <p className="italic font-serif text-base leading-relaxed">"{block.text}"</p>
                          {block.author && (
                            <footer className="text-xs font-bold text-[#5B4CF5] mt-1.5 uppercase tracking-wide">
                              — {block.author}
                            </footer>
                          )}
                        </blockquote>
                      );
                    }

                    // Headings
                    if (block.type === "heading") {
                      if (block.level === 1) {
                        return <h1 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 pt-4 leading-tight">{block.text}</h1>;
                      }
                      if (block.level === 2) {
                        return <h2 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 pt-4 border-b border-slate-100 pb-1">{block.text}</h2>;
                      }
                      return <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 pt-3">{block.text}</h3>;
                    }

                    // Code block
                    if (block.type === "code") {
                      return (
                        <div key={idx} className="my-5 rounded-2xl overflow-hidden border border-slate-800 bg-[#0B0B12] shadow-md">
                          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
                            <span className="font-mono uppercase text-[11px] font-semibold text-slate-300">{block.lang || "code"}</span>
                          </div>
                          <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
                            <code>{block.code}</code>
                          </pre>
                        </div>
                      );
                    }

                    // Divider
                    if (block.type === "hr") {
                      return <hr key={idx} className="my-6 border-slate-200" />;
                    }

                    // Lists
                    if (block.type === "list") {
                      if (block.listType === "ol") {
                        return (
                          <ol key={idx} className="my-4 space-y-2 pl-6 list-decimal marker:font-bold marker:text-[#5B4CF5]">
                            {block.items.map((item, lIdx) => (
                              <li key={lIdx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                            ))}
                          </ol>
                        );
                      }
                      return (
                        <ul key={idx} className="my-4 space-y-2 pl-6 list-disc marker:text-[#5B4CF5]">
                          {block.items.map((item, lIdx) => (
                            <li key={lIdx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                          ))}
                        </ul>
                      );
                    }

                    // Paragraph
                    return (
                      <p
                        key={idx}
                        className="leading-relaxed text-slate-800"
                        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text) }}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                rows={16}
                required
                placeholder="Write your article in markdown format. Use toolbar above to insert images, YouTube videos, quotes, and links..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-4 py-3 text-xs sm:text-sm font-mono text-slate-800 bg-white border border-slate-200 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20 focus:border-[#5B4CF5] leading-relaxed shadow-inner"
              />
            )}
          </div>
        </div>

        {/* Author & Publishing Settings */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Author & Status
            </h2>
            <span className="text-[11px] text-slate-400">
              Profile details are automatically saved for your next articles
            </span>
          </div>

          {/* Author Profile Picture / Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="relative group shrink-0">
              {formData.author_avatar ? (
                <img
                  src={formData.author_avatar}
                  alt={formData.author_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#5B4CF5] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                  {formData.author_name?.charAt(0) || "B"}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => authorAvatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                >
                  <Camera size={13} className="text-slate-500" />
                  {formData.author_avatar ? "Change Photo" : "Upload Profile Photo"}
                </button>
                {formData.author_avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAuthorAvatar}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Upload your headshot or profile photo (JPG, PNG). It will appear next to your name across the blog.
              </p>
              <input
                ref={authorAvatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAuthorAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, author_name: val }));
                  try {
                    localStorage.setItem("proofdeck_blog_author_name", val);
                  } catch (err) {}
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Author Role
              </label>
              <input
                type="text"
                value={formData.author_role}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, author_role: val }));
                  try {
                    localStorage.setItem("proofdeck_blog_author_role", val);
                  } catch (err) {}
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.checked })
                }
                className="w-4 h-4 text-[#5B4CF5] rounded border-slate-300 focus:ring-[#5B4CF5]"
              />
              <span className="text-xs font-bold text-slate-900">
                Publish live immediately (triggers on-demand Next.js ISR revalidation)
              </span>
            </label>
          </div>
        </div>

        {/* SEO & Social Metadata Box */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#5B4CF5]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              SEO & Social Metadata
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Custom Meta Title
              </label>
              <input
                type="text"
                placeholder="Leave blank to use Article Title"
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData({ ...formData, meta_title: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Custom Meta Description
              </label>
              <textarea
                rows={2}
                placeholder="Leave blank to use Excerpt"
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({ ...formData, meta_description: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]/20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5B4CF5] hover:bg-[#4433E0] text-white text-xs font-semibold shadow-xs cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
            Publish Live
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminBlogEditorPage;
