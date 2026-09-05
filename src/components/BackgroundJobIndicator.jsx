import React, { useState, useEffect } from 'react';
import { getJobStatus, getBackgroundJobs } from '../api';
import { Loader2, CheckCircle, XCircle, X } from 'lucide-react';

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

  // Sync with prop or localStorage or window event
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
      }
    };

    window.addEventListener('proofdeck-job-started', handleJobStarted);
    return () => window.removeEventListener('proofdeck-job-started', handleJobStarted);
  }, [propJobId]);

  // Polling loop
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
          // Auto hide after 8s on complete
          if (data.status === 'completed') {
            setTimeout(() => setVisible(false), 8000);
          }
        }
      } catch (err) {
        console.error("Error polling job status:", err);
      }
    };

    pollStatus();
    timer = setInterval(pollStatus, 3000);

    return () => clearInterval(timer);
  }, [jobId]);

  if (!visible || !jobId) return null;

  const isCompleted = jobData?.status === 'completed';
  const isFailed = jobData?.status === 'failed';
  const total = jobData?.total_items || 0;
  const processed = jobData?.processed_items || 0;
  const percentage = jobData?.percentage ?? (total > 0 ? Math.round((processed / total) * 100) : 0);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 max-w-sm w-full font-sans transition-all duration-300 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {isCompleted ? (
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            ) : isFailed ? (
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900">
              {isCompleted
                ? 'Bulk Issuance Complete!'
                : isFailed
                ? 'Bulk Issuance Failed'
                : 'Processing Bulk Certificates...'}
            </span>

            <p className="text-[11px] text-slate-500 m-0 leading-tight">
              {isCompleted
                ? `${jobData?.result_summary?.created || processed} certificates issued successfully.`
                : isFailed
                ? (jobData?.result_summary?.error || 'An error occurred during processing.')
                : total > 0
                ? `${processed} of ${total} records processed (${percentage}%)`
                : 'Parsing uploaded file and preparing credentials...'}
            </p>

            {!isCompleted && !isFailed && total > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
