import React, { useState, useEffect } from 'react';
import {
  Mail, Send, Eye, Plus, Trash2, CheckCircle2, AlertCircle, ShieldAlert,
  Loader2, RefreshCw, BarChart2, Layers, Check, HelpCircle, Image as ImageIcon
} from 'lucide-react';
import {
  getAdminBroadcasts,
  saveAdminBroadcast,
  previewAdminBroadcast,
  testSendAdminBroadcast,
  sendAdminBroadcast,
  uploadEditorImage,
} from '../api';

export default function AdminBroadcastsPage() {
  const [activeTab, setActiveTab] = useState('composer'); // 'composer' | 'preview' | 'history'
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  // Form State
  const [campaignId, setCampaignId] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [tag, setTag] = useState('PRODUCT ANNOUNCEMENT');
  const [openingWhy, setOpeningWhy] = useState('');
  const [segment, setSegment] = useState('all');
  const [blocks, setBlocks] = useState([
    { id: 1, type: 'heading', content: 'Transform How Credentials Are Proven' },
    { id: 2, type: 'paragraph', content: 'Our new update ensures your students and graduates never have to wait weeks to verify their skills.' }
  ]);

  // Preview State
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Test Send State
  const [testEmail, setTestEmail] = useState('omobolajidurojaiye57@gmail.com');
  const [testSentAt, setTestSentAt] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await getAdminBroadcasts();
      setCampaigns(res.data);
    } catch (err) {
      showNotice('error', 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  const addBlock = (type) => {
    const newId = Date.now();
    let initialContent = '';
    if (type === 'heading') initialContent = 'Section Headline';
    if (type === 'paragraph') initialContent = 'Enter your message paragraph here...';
    if (type === 'callout') initialContent = 'Key takeaway or important instruction';
    if (type === 'button') initialContent = 'Claim Your Access';
    if (type === 'image') initialContent = '';

    setBlocks(prev => [
      ...prev,
      {
        id: newId,
        type,
        content: initialContent,
        title: type === 'callout' ? 'Important Update' : undefined,
        url: type === 'button' ? 'https://www.proofdeck.app/dashboard' : (type === 'image' ? 'https://www.proofdeck.app/images/landing_page_image/verification.png' : undefined),
        text: type === 'button' ? 'Get Started' : undefined,
        alt: type === 'image' ? 'ProofDeck Update' : undefined,
        caption: type === 'image' ? '' : undefined,
      }
    ]);
  };

  const removeBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const updateBlock = (id, field, value) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const handleSaveDraft = async () => {
    if (!title || !subject) {
      showNotice('error', 'Title and Subject line are required.');
      return;
    }
    try {
      setSaving(true);
      const res = await saveAdminBroadcast({
        id: campaignId,
        title,
        subject,
        tag,
        opening_why: openingWhy,
        content_blocks: blocks,
        segment,
      });
      setCampaignId(res.data.id);
      showNotice('success', 'Campaign draft saved successfully.');
      fetchCampaigns();
    } catch (err) {
      showNotice('error', err.response?.data?.msg || 'Failed to save campaign draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePreview = async () => {
    try {
      setPreviewLoading(true);
      const res = await previewAdminBroadcast({
        title,
        subject,
        tag,
        opening_why: openingWhy,
        content_blocks: blocks,
      });
      setPreviewHtml(res.data.html);
      setActiveTab('preview');
    } catch (err) {
      showNotice('error', 'Failed to render MJML preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail) {
      showNotice('error', 'Please enter a test email address.');
      return;
    }
    // Automatically save draft first if not saved
    let targetId = campaignId;
    if (!targetId) {
      if (!title || !subject) {
        showNotice('error', 'Please fill in Title and Subject line before sending a test.');
        return;
      }
      try {
        const res = await saveAdminBroadcast({
          title,
          subject,
          tag,
          opening_why: openingWhy,
          content_blocks: blocks,
          segment,
        });
        targetId = res.data.id;
        setCampaignId(targetId);
      } catch (e) {
        showNotice('error', 'Failed to save campaign prior to test send.');
        return;
      }
    }

    try {
      setSendingTest(true);
      const res = await testSendAdminBroadcast(targetId, { test_email: testEmail });
      setTestSentAt(res.data.test_sent_at);
      showNotice('success', `Test email dispatched to ${testEmail}! Check your inbox.`);
      fetchCampaigns();
    } catch (err) {
      showNotice('error', err.response?.data?.msg || 'Failed to send test email.');
    } finally {
      setSendingTest(false);
    }
  };

  const handleLaunchBroadcast = async () => {
    if (!campaignId) {
      showNotice('error', 'Please save campaign first.');
      return;
    }
    if (!testSentAt) {
      showNotice('error', 'Safety Gate: You must perform a test send to verify formatting before launching to all users.');
      return;
    }

    if (!window.confirm(`Are you sure you want to broadcast this campaign to the "${segment.toUpperCase()}" segment?`)) {
      return;
    }

    try {
      setDispatching(true);
      const res = await sendAdminBroadcast(campaignId);
      showNotice('success', res.data.msg);
      fetchCampaigns();
      setActiveTab('history');
    } catch (err) {
      showNotice('error', err.response?.data?.msg || 'Failed to launch broadcast.');
    } finally {
      setDispatching(false);
    }
  };

  const handleLoadCampaign = (c) => {
    setCampaignId(c.id);
    setTitle(c.title);
    setSubject(c.subject);
    setTag(c.tag || 'PRODUCT ANNOUNCEMENT');
    setOpeningWhy(c.opening_why || '');
    setSegment(c.segment || 'all');
    setBlocks(c.content_blocks || []);
    setTestSentAt(c.test_sent_at);
    setActiveTab('composer');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-[#5B4CF5]" /> Email & Broadcast Promotions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Compose and dispatch brand-compliant emails originating from{' '}
            <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-xs">
              mail.proofdeck.app
            </code>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleGeneratePreview}
            disabled={previewLoading}
            className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-[#5B4CF5] text-sm font-medium rounded-xl hover:bg-indigo-100 transition-colors shadow-sm flex items-center gap-1.5"
          >
            {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} Preview
          </button>
          <button
            onClick={handleLaunchBroadcast}
            disabled={!testSentAt || dispatching}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 ${
              testSentAt && !dispatching
                ? 'bg-[#5B4CF5] hover:bg-[#4433E0]'
                : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }`}
          >
            {dispatching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}{' '}
            Launch Broadcast
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('composer')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'composer'
              ? 'border-[#5B4CF5] text-[#5B4CF5]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" /> Block Composer
        </button>
        <button
          onClick={() => {
            handleGeneratePreview();
            setActiveTab('preview');
          }}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'border-[#5B4CF5] text-[#5B4CF5]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye className="w-4 h-4" /> Live MJML Preview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-[#5B4CF5] text-[#5B4CF5]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Past Campaigns & Stats
        </button>
      </div>

      {/* Tab 1: Composer */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Composer Left Col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Internal Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 New Verification & Developer API Release"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#5B4CF5] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Subject Line
                  </label>
                  <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Start With Why: Lead with human outcome
                  </span>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Your students shouldn't wait weeks to prove what they earned"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#5B4CF5] focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Tip: Supports <code>&#123;&#123; user_name &#125;&#125;</code> variable substitution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. PRODUCT UPDATE, SPECIAL OFFER"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#5B4CF5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                    Audience Segment
                  </label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#5B4CF5] focus:outline-none bg-white"
                  >
                    <option value="all">All Non-Suspended Users</option>
                    <option value="active">Active Issuers (Active in last 60 days)</option>
                    <option value="inactive">Quiet Users (Inactive for 60+ days)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Opening Hook (Why Statement)
                </label>
                <textarea
                  rows={2}
                  value={openingWhy}
                  onChange={(e) => setOpeningWhy(e.target.value)}
                  placeholder="e.g. Africa's talent deserves to be trusted at first glance. Here is what we launched this week..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#5B4CF5] focus:outline-none"
                />
              </div>
            </div>

            {/* Block List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  Content Blocks ({blocks.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addBlock('heading')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Subheading
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('paragraph')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Text
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('callout')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Callout Box
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('button')}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Button
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock('image')}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#5B4CF5] rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Image
                  </button>
                </div>
              </div>

              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-[#5B4CF5] text-xs font-bold uppercase rounded-md">
                      Block #{index + 1}: {block.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {block.type === 'heading' && (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                      placeholder="Enter section headline..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]"
                    />
                  )}

                  {block.type === 'paragraph' && (
                    <textarea
                      rows={3}
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                      placeholder="Write your email body paragraph..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4CF5]"
                    />
                  )}

                  {block.type === 'callout' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={block.title || ''}
                        onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                        placeholder="Callout Box Title (e.g. Special Offer / Important Notice)"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                        placeholder="Callout box body text..."
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                      />
                    </div>
                  )}

                  {block.type === 'button' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={block.text || ''}
                        onChange={(e) => updateBlock(block.id, 'text', e.target.value)}
                        placeholder="Button Text (e.g. Claim Your Credits)"
                        className="px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold"
                      />
                      <input
                        type="text"
                        value={block.url || ''}
                        onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                        placeholder="Target URL (e.g. https://...)"
                        className="px-3 py-2 rounded-xl border border-gray-300 text-sm"
                      />
                    </div>
                  )}

                  {block.type === 'image' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
                          <input
                            type="text"
                            value={block.url || ''}
                            onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Or Upload from Computer</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const formData = new FormData();
                                formData.append('image', file);
                                try {
                                  const res = await uploadEditorImage(formData);
                                  updateBlock(block.id, 'url', res.data.imageUrl);
                                  showNotice('success', 'Image uploaded successfully!');
                                } catch (err) {
                                  showNotice('error', 'Failed to upload image.');
                                }
                              }
                            }}
                            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[#5B4CF5] hover:file:bg-indigo-100"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={block.caption || ''}
                          onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
                          placeholder="Optional image caption..."
                          className="px-3 py-2 rounded-xl border border-gray-300 text-sm"
                        />
                        <input
                          type="text"
                          value={block.alt || ''}
                          onChange={(e) => updateBlock(block.id, 'alt', e.target.value)}
                          placeholder="Alt text (e.g. Platform update preview)..."
                          className="px-3 py-2 rounded-xl border border-gray-300 text-sm"
                        />
                      </div>
                      {block.url && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <img src={block.url} alt={block.alt || 'Preview'} className="max-h-40 rounded mx-auto object-contain" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Safeguards & Test Send Gate */}
          <div className="space-y-6">
            {/* Mandatory Test Send Gate Card */}
            <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
                <ShieldAlert className="w-5 h-5 text-[#5B4CF5]" /> Pre-Dispatch Safety Gate
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                To guarantee zero rendering bugs or typos in real inboxes, ProofDeck enforces a mandatory test send before unlocking the live broadcast button.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Recipient Test Email
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@proofdeck.app"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#5B4CF5] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSend}
                disabled={sendingTest}
                className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-[#5B4CF5] text-sm font-semibold rounded-xl border border-indigo-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingTest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}{' '}
                Send Test Preview Email
              </button>

              {testSentAt ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Test send verified at {new Date(testSentAt).toLocaleTimeString()}! Broadcast unlocked.</span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Broadcast is locked until a test email is sent.</span>
                </div>
              )}
            </div>

            {/* Deliverability & Brand Voice Checklist */}
            <div className="bg-[#F7F7FA] p-5 rounded-2xl border border-gray-200 space-y-2.5">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Deliverability Guarantee
              </h4>
              <ul className="text-xs text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Isolated sending subdomain: <code>mail.proofdeck.app</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>List-Unsubscribe RFC 8058 headers attached</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Automatic suppression of unsubscribed recipients</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Cross-client tested MJML email markup</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Preview */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Real Compiled MJML Preview</h3>
              <p className="text-xs text-gray-500">
                This is the exact inlined HTML that will render across Outlook, Gmail, Apple Mail, and mobile clients.
              </p>
            </div>
            <button
              onClick={handleGeneratePreview}
              className="px-3 py-1.5 text-xs font-medium text-[#5B4CF5] bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-render
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-4">
            {previewLoading ? (
              <div className="h-96 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#5B4CF5] animate-spin mb-2" />
                <span className="text-xs text-gray-500">Compiling MJML...</span>
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                title="Email Preview"
                className="w-full h-[650px] bg-white rounded-lg shadow-sm border border-gray-200"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Click "Preview" in the composer to compile.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Broadcast Campaign History</h3>
            <button
              onClick={fetchCampaigns}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5B4CF5]" />
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No broadcast campaigns created yet. Start composing in the Block Composer tab.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Campaign</th>
                    <th className="px-6 py-3">Segment</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Sent / Total</th>
                    <th className="px-6 py-3">Opens</th>
                    <th className="px-6 py-3">Bounces</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{c.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{c.subject}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {c.segment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            c.status === 'sent'
                              ? 'bg-emerald-50 text-emerald-700'
                              : c.status === 'sending'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {c.sent_count} / {c.total_recipients || '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {c.stats?.opens || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {c.stats?.bounces || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleLoadCampaign(c)}
                          className="text-xs font-semibold text-[#5B4CF5] hover:underline"
                        >
                          Edit / View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
