import React, { useState } from 'react';
import { AttendanceRecord, CardThemeId, Language } from '../types';
import { t } from '../utils/translations';
import { CARD_THEMES } from '../utils/themes';
import {
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Cloud,
  Loader2,
  X,
  Palette,
  Sparkles,
} from 'lucide-react';

interface GeneratedCardModalProps {
  record: AttendanceRecord;
  imageDataUrl: string | null;
  isGeneratingImage: boolean;
  isUploadingToDrive: boolean;
  lang: Language;
  onClose: () => void;
  onThemeChange: (theme: CardThemeId) => void;
  onRetryDriveUpload: () => void;
  onSignInWithGoogle: () => void;
  userEmail?: string | null;
}

export const GeneratedCardModal: React.FC<GeneratedCardModalProps> = ({
  record,
  imageDataUrl,
  isGeneratingImage,
  isUploadingToDrive,
  lang,
  onClose,
  onThemeChange,
  onRetryDriveUpload,
  onSignInWithGoogle,
  userEmail,
}) => {
  const strings = t[lang];
  const [copiedAbsent, setCopiedAbsent] = useState(false);

  // Absent rolls string
  const absentStudents = record.students.filter((s) => s.status === 'absent');
  const absentRollsText = absentStudents.map((s) => s.roll).join(', ');

  const handleCopyAbsent = () => {
    if (absentStudents.length > 0) {
      navigator.clipboard.writeText(absentRollsText);
      setCopiedAbsent(true);
      setTimeout(() => setCopiedAbsent(false), 2500);
    }
  };

  const handleDownload = () => {
    if (!imageDataUrl) return;
    const link = document.createElement('a');
    const safeSubject = (record.metadata.subject || 'Subject').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeDept = (record.metadata.department || 'Dept').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Attendance_${safeDept}_${safeSubject}_${record.metadata.date}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!imageDataUrl) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance Record - ${record.metadata.subject}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${imageDataUrl}" onload="window.print();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {strings.sheetPreview}
              </h3>
              <p className="text-xs text-slate-400">
                {record.metadata.subject} • {record.metadata.date}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Theme Selector Bar */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>{strings.cardTheme}:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CARD_THEMES.map((theme) => {
                const isActive = record.cardTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onThemeChange(theme.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <span>{lang === 'bn' ? theme.nameBn : theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Drive Status Bar inside Modal */}
          <div className="rounded-2xl border p-4 bg-slate-850/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-slate-700/60">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  record.driveBackupStatus === 'synced'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : record.driveBackupStatus === 'pending' || isUploadingToDrive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isUploadingToDrive ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Cloud className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Google Drive Backup</span>
                  {record.driveBackupStatus === 'synced' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Saved & Synced
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {record.driveBackupStatus === 'synced'
                    ? strings.driveSyncSuccess
                    : userEmail
                    ? isUploadingToDrive
                      ? strings.uploadingDrive
                      : 'Connecting to Drive...'
                    : strings.driveSyncPendingLogin}
                </p>
              </div>
            </div>

            {/* Drive Action Buttons */}
            <div>
              {record.driveBackupStatus === 'synced' && record.driveFileUrl ? (
                <a
                  href={record.driveFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{strings.viewInDrive}</span>
                </a>
              ) : !userEmail ? (
                <button
                  type="button"
                  onClick={onSignInWithGoogle}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition shadow-sm"
                >
                  <Cloud className="w-3.5 h-3.5 text-blue-600" />
                  <span>{strings.loginWithGoogle}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isUploadingToDrive}
                  onClick={onRetryDriveUpload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isUploadingToDrive ? 'Uploading...' : 'Save to Drive'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Generated Image Preview Area */}
          <div className="relative border border-slate-800 rounded-2xl p-2 bg-slate-950/60 overflow-hidden flex items-center justify-center min-h-[300px]">
            {isGeneratingImage ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-xs text-slate-400 font-medium">
                  {strings.generating}
                </p>
              </div>
            ) : imageDataUrl ? (
              <img
                src={imageDataUrl}
                alt="Attendance Sheet Card"
                className="w-full h-auto max-h-[550px] object-contain rounded-xl shadow-lg border border-slate-800"
              />
            ) : (
              <div className="text-xs text-slate-500 py-12">
                Card preview loading...
              </div>
            )}
          </div>

          {/* Quick Absent Rolls Copy Strip */}
          {absentStudents.length > 0 && (
            <div className="flex items-center justify-between gap-3 bg-rose-950/30 border border-rose-900/40 rounded-xl p-3">
              <div className="text-xs text-rose-300">
                <span className="font-bold">
                  {lang === 'bn' ? 'অনুপস্থিত রোলসমূহ:' : 'Absent Rolls:'}
                </span>{' '}
                <span className="font-mono">{absentRollsText}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyAbsent}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 transition shrink-0"
              >
                {copiedAbsent ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{strings.absentCopied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{strings.copyAbsentList}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {strings.close}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={!imageDataUrl}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>{strings.printSheet}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!imageDataUrl}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{strings.downloadImage}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
