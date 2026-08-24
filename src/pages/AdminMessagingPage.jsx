import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Mail,
  Send,
  Image as ImageIcon,
  Eye,
  Users,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  getEmailRecipients,
  sendAdminBulkEmail,
  uploadEditorImage,
} from "../api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";

// Custom styles for React Select to match Tailwind
const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
      borderRadius: '0.5rem',
      padding: '2px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
      ':hover': {
        borderColor: '#6366f1'
      }
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: '#e0e7ff',
        borderRadius: '0.25rem',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#3730a3',
        fontWeight: '500'
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#3730a3',
        ':hover': {
            backgroundColor: '#c7d2fe',
            color: '#312e81',
        },
    }),
};

function AdminMessagingPage() {
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [headerImageUrl, setHeaderImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const quillRef = useRef(null);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await uploadEditorImage(formData);
          const imageUrl = res.data.imageUrl;

          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", imageUrl);
          quill.setSelection(range.index + 1);
        } catch (err) {
          setError(
            err.response?.data?.msg ||
              "Failed to upload image. Please try again."
          );
        }
      }
    };
  };

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          [{ align: [] }],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const res = await getEmailRecipients();
        const options = res.data.map((user) => ({
          value: user.id,
          label: `${user.name} (${user.email})`,
        }));
        setRecipientOptions([
          { value: "all", label: "All Active Users" },
          ...options,
        ]);
      } catch (err) {
        setError("Failed to fetch recipient list.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipients();
  }, []);

  const handleSelectChange = (selected) => {
    if (selected && selected.some((option) => option.value === "all")) {
      setSelectedOptions([{ value: "all", label: "All Active Users" }]);
    } else {
      setSelectedOptions(selected);
    }
  };

  const handleHeaderImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await uploadEditorImage(formData);
        setHeaderImageUrl(res.data.imageUrl);
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            "Failed to upload header image. Please try again."
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !body || !selectedOptions || selectedOptions.length === 0) {
      setError("Please fill in all fields and select recipients.");
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        subject,
        body,
        recipients:
          selectedOptions[0].value === "all"
            ? "all"
            : selectedOptions.map((opt) => opt.value),
        header_image_url: headerImageUrl,
      };
      const res = await sendAdminBulkEmail(payload);
      setSuccess(res.data.msg);
      setSubject("");
      setBody("");
      setSelectedOptions(null);
      setHeaderImageUrl("");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  const previewBody = body.replace(/{{ user_name }}/g, "John Doe");

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Messaging</h1>
          <p className="text-sm text-gray-500">
            Send bulk emails and announcements
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
            {error && (
                <div className="mb-4 p-4 text-red-700 bg-red-50 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={20}/> {error}
                    <button onClick={() => setError("")} className="ml-auto hover:text-red-900"><X size={16}/></button>
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 text-green-700 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle size={20}/> {success}
                    <button onClick={() => setSuccess("")} className="ml-auto hover:text-green-900"><X size={16}/></button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                         <Select
                            isMulti
                            options={recipientOptions}
                            isLoading={loading}
                            value={selectedOptions}
                            onChange={handleSelectChange}
                            closeMenuOnSelect={false}
                            placeholder="Select recipients..."
                            styles={selectStyles}
                            className="text-sm"
                        />
                         <p className="mt-1 text-xs text-gray-500">Select "All Active Users" or specific individuals.</p>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            placeholder="e.g., Important Platform Update"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                     </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Image (Optional)</label>
                    <div className="flex items-center gap-4">
                         <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                            <ImageIcon size={18}/> Choose Image
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleHeaderImageUpload}
                                className="hidden"
                            />
                         </label>
                         {headerImageUrl && (
                             <div className="relative group">
                                 <img src={headerImageUrl} alt="Header Preview" className="h-10 w-20 object-cover rounded border border-gray-200"/>
                                 <button type="button" onClick={() => setHeaderImageUrl("")} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <X size={10}/>
                                 </button>
                             </div>
                         )}
                    </div>
                </div>

                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                     <div className="prose-editor">
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={body}
                            onChange={setBody}
                            modules={quillModules}
                            className="bg-white rounded-lg"
                            style={{ height: '300px', marginBottom: '40px' }}
                        />
                     </div>
                     <p className="mt-2 text-xs text-gray-500">
                        Use <code className="bg-gray-100 px-1 py-0.5 rounded text-indigo-600">{"{{ user_name }}"}</code> to personalize the message.
                    </p>
                </div>

                <div className="pt-4 flex items-center gap-3 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={sending || loading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                    >
                        {sending ? <Loader2 size={18} className="animate-spin"/> : <Send size={18}/>}
                        {sending ? 'Sending...' : 'Send Email'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        disabled={!body}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        <Eye size={18}/> Preview
                    </button>
                </div>
            </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                 <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                     <h3 className="font-bold text-lg text-gray-800">Email Preview</h3>
                     <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                         <X size={24}/>
                     </button>
                 </div>
                 <div className="p-8 overflow-y-auto bg-gray-50">
                      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-xl mx-auto">
                        <div className="mb-6 pb-6 border-b border-gray-100">
                             <h2 className="text-xl font-bold text-gray-900 mb-2">{subject || "No Subject"}</h2>
                        </div>
                        {headerImageUrl && (
                            <img
                            src={headerImageUrl}
                            alt="Header"
                            className="w-full h-auto rounded-lg mb-6"
                            />
                        )}
                        <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: previewBody }} />
                      </div>
                 </div>
                 <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
                     <button
                        onClick={() => setShowPreview(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                     >
                         Close Preview
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}

export default AdminMessagingPage;
