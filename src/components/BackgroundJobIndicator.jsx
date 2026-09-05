import React, { useState, useEffect } from 'react';
import { getJobStatus } from '../api';
import { Loader2, CheckCircle, XCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

export function useBackgroundJob() {
  const [activeJobId, setActiveJobId] = useState(() => {
    const saved = localStorage.getItem('proofdeck_active_job_id');
    return saved ? parseInt(saved, 10) : null;
  });

  const startJob = (id) => {
    localStorage.setItem('proofdeck_active_job_id', id.toString());
    setActiveJobId(id);
  };

  const clearJob = () => {
    localStorage.removeItem('proofdeck_active_job_id');
    setActiveJobId(null);
  };

  return { activeJobId, startJob, clearJob };
}

export default function BackgroundJobIndicator({ jobId: propJobId }) {
  const [jobId, setJobId] = useState(propJobId || null);
  const [jobData, setJobData] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sync with prop, localStorage, or custom event
  useEffect(() => {
    if (propJobId) {
      setJobId(propJobId);
      setVisible(true);
      return;
    }

    const savedId = localStorage.getItem('proofdeck_active_job_id');
    if (savedId) {
      setJobId(parseInt(savedId, 10));
      setVisible(true);
    }

    const handleJobStarted = (e) => {
      const id = e.detail?.jobId;
      if (id) {
        setJobId(id);
        setVisible(true);
        setIsMinimized(false);
      }
    };

    window.addEventListener('proofdeck-job-started', handleJobStarted);
    return () => window.removeEventListener('proofdeck-job-started', handleJobStarted);
  }, [propJobId]);

  // Polling loop (every 2.5s for fast real-time feedback)
  useEffect(() => {
    if (!jobId) return;

    let timer;
    const pollStatus = async () => {
      try {
        const res = await getJobStatus(jobId);
        const data = res.data;
        setJobData(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(timer);
          localStorage.removeItem('proofdeck_active_job_id');
          // Auto-hide after 8s when completed
          if (data.status === 'completed') {
            setTimeout(() => setVisible(false), 8000);
          }
        }
      } catch (err) {
        console.error("Error polling background job status:", err);
      }
    };

    pollStatus();
    timer = setInterval(pollStatus, 2500);

    return () => clearInterval(timer);
  }, [jobId]);

  if (!visible || !jobId) return null;

  const isCompleted = jobData?.status === 'completed';
  const isFailed = jobData?.status === 'failed';
  const total = jobData?.total_items || 0;
  const processed = jobData?.processed_items || 0;
  const percentage = jobData?.percentage ?? (total > 0 ? Math.round((processed / total) * 100) : 0);

  // Positioned bottom-left (next to sidebar) to never obstruct the blue Support Widget at bottom-right
  return (
    <div className="fixed bottom-20 md:bottom-5 left-4 md:left-64 z-40 font-sans transition-all duration-300">
      {isMinimized ? (
        /* Minimized pill: tiny, zero obstruction */
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-lg border border-slate-800 cursor-pointer hover:bg-slate-800 transition-all text-xs select-none"
        >
          {isCompleted ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : isFailed ? (
            <XCircle className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          )}
          <span className="font-semibold text-[11px]">
            {isCompleted ? 'Bulk Complete' : isFailed ? 'Failed' : `${processed}/${total} (${percentage}%)`}
          </span>
          <ChevronUp size={12} className="text-slate-400" />
        </div>
      ) : (
        /* Slim floating card */
        <div className="bg-white border border-slate-200/90 shadow-xl rounded-2xl p-3.5 w-76 sm:w-84 flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
              ) : isFailed ? (
                <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}

              <span className="text-xs font-bold text-slate-900 truncate">
                {isCompleted
                  ? 'Issuance Complete!'
                  : isFailed
                  ? 'Issuance Failed'
                  : 'Issuing in Background...'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                title="Minimize indicator"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => setVisible(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 m-0 leading-tight">
            {isCompleted
              ? `${jobData?.result_summary?.created || processed} certificates ready in your folder.`
              : isFailed
              ? (jobData?.result_summary?.error || 'An error occurred during processing.')
              : total > 0
              ? `Processing: ${processed} of ${total} records completed (${percentage}%)`
              : 'Reading uploaded spreadsheet and queueing certificates...'}
          </p>

          {!isCompleted && !isFailed && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(percentage, 5)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
