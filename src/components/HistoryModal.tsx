import React, { useState } from 'react';
import { AttendanceRecord, Language } from '../types';
import { t } from '../utils/translations';
import { formatDate, formatDisplayNumber } from '../utils/date';
import {
  History,
  Search,
  ExternalLink,
  Eye,
  Trash2,
  Cloud,
  CheckCircle2,
  Calendar,
  X,
  BookOpen,
} from 'lucide-react';

interface HistoryModalProps {
  records: AttendanceRecord[];
  lang: Language;
  onClose: () => void;
  onSelectRecord: (record: AttendanceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSyncRecordToDrive: (record: AttendanceRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  records,
  lang,
  onClose,
  onSelectRecord,
  onDeleteRecord,
  onSyncRecordToDrive,
}) => {
  const strings = t[lang];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter((rec) => {
    const q = searchTerm.toLowerCase();
    return (
      rec.metadata.subject.toLowerCase().includes(q) ||
      rec.metadata.department.toLowerCase().includes(q) ||
      rec.metadata.section.toLowerCase().includes(q) ||
      rec.metadata.date.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{strings.history}</h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? `${records.length} টি সংরক্ষিত শিট পাওয়া গেছে`
                  : `${records.length} attendance sheets recorded`}
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

        {/* Search Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-800/80 bg-slate-850/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'bn' ? 'বিষয়, বিভাগ বা তারিখ দিয়ে খুঁজুন...' : 'Search records by subject, dept, or date...'}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Record List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs space-y-2">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p>{strings.emptyHistory}</p>
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isDriveSynced = rec.driveBackupStatus === 'synced' && !!rec.driveFileUrl;

              return (
                <div
                  key={rec.id}
                  className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left Metadata info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {rec.metadata.subject || 'Untitled Subject'}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300 font-medium">
                        {rec.metadata.department}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300 font-medium">
                        {rec.metadata.section}
                      </span>
                      {isDriveSynced ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Google Drive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
                          <Cloud className="w-3 h-3" />
                          Local Only
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        {formatDate(rec.metadata.date, lang)}
                      </span>
                      <span>•</span>
                      <span>
                        {strings.totalStudents}:{' '}
                        <strong className="text-white">{rec.summary.total}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400">
                        {strings.presentCount}:{' '}
                        <strong>{rec.summary.present}</strong> ({rec.summary.percentage}%)
                      </span>
                      <span>•</span>
                      <span className="text-rose-400">
                        {strings.absentCount}:{' '}
                        <strong>{rec.summary.absent}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* View Card */}
                    <button
                      type="button"
                      onClick={() => onSelectRecord(rec)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'কার্ড দেখুন' : 'View Card'}</span>
                    </button>

                    {/* Google Drive Link if synced */}
                    {isDriveSynced && rec.driveFileUrl ? (
                      <a
                        href={rec.driveFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-700 rounded-xl transition border border-slate-700"
                        title="View in Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSyncRecordToDrive(rec)}
                        className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition border border-slate-700"
                        title="Sync to Google Drive"
                      >
                        <Cloud className="w-4 h-4 text-cyan-400" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-xl transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {strings.close}
          </button>
        </div>
      </div>
    </div>
  );
};
