import React, { forwardRef } from 'react';
import { AttendanceMetadata, Student, AttendanceSummary, CardThemeId, Language } from '../types';
import { t } from '../utils/translations';
import { formatDate, formatDisplayNumber } from '../utils/date';
import {
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  UserCheck,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  CloudCheck,
} from 'lucide-react';

interface AttendanceCardPreviewProps {
  metadata: AttendanceMetadata;
  students: Student[];
  summary: AttendanceSummary;
  theme: CardThemeId;
  lang: Language;
  sheetId: string;
  isBackedUp?: boolean;
}

export const AttendanceCardPreview = forwardRef<HTMLDivElement, AttendanceCardPreviewProps>(
  ({ metadata, students, summary, theme, lang, sheetId, isBackedUp }, ref) => {
    const strings = t[lang];

    // Absent students list
    const absentStudents = students.filter((s) => s.status === 'absent');
    const lateStudents = students.filter((s) => s.status === 'late');

    // Theme Styles
    const getThemeClasses = () => {
      switch (theme) {
        case 'academic':
          return {
            wrapper: 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white border-blue-900/60',
            headerBg: 'bg-gradient-to-r from-blue-950/90 to-indigo-950/90 border-blue-800/40',
            accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
            kpiCard: 'bg-slate-900/90 border-slate-800',
            absentBox: 'bg-rose-950/40 border-rose-800/50 text-rose-200',
            pillPresent: 'bg-emerald-950 text-emerald-300 border-emerald-700/50',
            pillAbsent: 'bg-rose-950 text-rose-300 border-rose-700/50',
            pillLate: 'bg-amber-950 text-amber-300 border-amber-700/50',
            divider: 'border-slate-800',
            stampColor: 'text-amber-400 border-amber-500/40',
          };
        case 'modern':
          return {
            wrapper: 'bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 text-white border-emerald-900/60',
            headerBg: 'bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-emerald-800/40',
            accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
            kpiCard: 'bg-slate-900/90 border-teal-900/40',
            absentBox: 'bg-rose-950/40 border-rose-800/50 text-rose-200',
            pillPresent: 'bg-emerald-900/70 text-emerald-200 border-emerald-600/60',
            pillAbsent: 'bg-rose-950 text-rose-300 border-rose-700/50',
            pillLate: 'bg-amber-950 text-amber-300 border-amber-700/50',
            divider: 'border-teal-900/40',
            stampColor: 'text-emerald-400 border-emerald-500/40',
          };
        case 'cyber':
          return {
            wrapper: 'bg-gradient-to-br from-slate-950 via-zinc-950 to-cyan-950 text-white border-cyan-800/50',
            headerBg: 'bg-gradient-to-r from-slate-900/90 to-cyan-950/90 border-cyan-800/40',
            accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
            kpiCard: 'bg-zinc-900/90 border-zinc-800',
            absentBox: 'bg-rose-950/50 border-rose-800/60 text-rose-200',
            pillPresent: 'bg-emerald-950 text-emerald-300 border-emerald-600/60',
            pillAbsent: 'bg-rose-950 text-rose-300 border-rose-700/50',
            pillLate: 'bg-amber-950 text-amber-300 border-amber-700/50',
            divider: 'border-zinc-800',
            stampColor: 'text-cyan-400 border-cyan-500/40',
          };
        case 'minimal':
          return {
            wrapper: 'bg-white text-slate-900 border-slate-200 shadow-2xl',
            headerBg: 'bg-slate-50 border-slate-200',
            accentBadge: 'bg-blue-100 text-blue-900 border-blue-300',
            kpiCard: 'bg-white border-slate-200 shadow-sm',
            absentBox: 'bg-rose-50 border-rose-200 text-rose-900',
            pillPresent: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
            pillAbsent: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
            pillLate: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
            divider: 'border-slate-200',
            stampColor: 'text-blue-900 border-blue-400',
          };
      }
    };

    const styles = getThemeClasses();
    const isLight = theme === 'minimal';

    return (
      <div
        ref={ref}
        id="attendance-card-render-node"
        className={`w-full max-w-[880px] mx-auto p-6 sm:p-8 rounded-3xl border-2 shadow-2xl transition-all font-sans relative overflow-hidden ${styles.wrapper}`}
        style={{ minWidth: '340px' }}
      >
        {/* Subtle Decorative Background Seal */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

        {/* Institution / Title Header */}
        <div className={`p-5 rounded-2xl border mb-6 relative overflow-hidden ${styles.headerBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md border ${styles.accentBadge}`}>
                  {metadata.institutionName || (lang === 'bn' ? 'অফিসিয়াল উপস্থিতি রেকর্ড' : 'Official Attendance Sheet')}
                </span>
                {isBackedUp && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                    <CloudCheck className="w-3 h-3 text-emerald-400" />
                    Drive Synced
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {metadata.subject || (lang === 'bn' ? 'বিষয়ের নাম' : 'Subject Name')}
              </h2>

              <p className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{metadata.department || (lang === 'bn' ? 'বিভাগ' : 'Department')}</span>
                <span>•</span>
                <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{metadata.section || (lang === 'bn' ? 'শাখা' : 'Section')}</span>
              </p>
            </div>

            {/* Date & Sheet ID Badge */}
            <div className="sm:text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-cyan-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatDate(metadata.date, lang)}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                ID: {sheetId}
              </div>
            </div>
          </div>

          {/* Sub metadata bar: Teacher & Room */}
          <div className={`mt-4 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs ${styles.divider} ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-medium">{strings.teacherName}:</span>
              <span className="font-bold">{metadata.teacherName || '—'}</span>
            </div>
            {metadata.roomPeriod && (
              <div className="flex items-center gap-1.5 sm:justify-end">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-medium">{strings.roomPeriod}:</span>
                <span className="font-bold">{metadata.roomPeriod}</span>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Total */}
          <div className={`p-3 rounded-xl border text-center ${styles.kpiCard}`}>
            <div className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {strings.totalStudents}
            </div>
            <div className="text-xl sm:text-2xl font-black mt-0.5">
              {formatDisplayNumber(summary.total, lang)}
            </div>
          </div>

          {/* Present */}
          <div className={`p-3 rounded-xl border text-center ${styles.kpiCard} bg-emerald-500/5`}>
            <div className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>{strings.presentCount}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-500 mt-0.5">
              {formatDisplayNumber(summary.present, lang)}
            </div>
          </div>

          {/* Absent */}
          <div className={`p-3 rounded-xl border text-center ${styles.kpiCard} bg-rose-500/5`}>
            <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3 text-rose-500" />
              <span>{strings.absentCount}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-500 mt-0.5">
              {formatDisplayNumber(summary.absent, lang)}
            </div>
          </div>

          {/* Attendance Rate */}
          <div className={`p-3 rounded-xl border text-center ${styles.kpiCard} bg-indigo-500/5`}>
            <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>{strings.attendanceRate}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5">
              {formatDisplayNumber(summary.percentage, lang)}%
            </div>
          </div>
        </div>

        {/* Absent Rolls Callout (Crucial for reports & teachers) */}
        {absentStudents.length > 0 ? (
          <div className={`p-3.5 rounded-xl border mb-6 ${styles.absentBox}`}>
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide mb-1.5 text-rose-400">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>
                {lang === 'bn'
                  ? `অনুপস্থিত রোলসমূহ (${absentStudents.length} জন):`
                  : `Absent Rolls (${absentStudents.length}):`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {absentStudents.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 text-xs font-mono font-extrabold rounded-md bg-rose-900/60 text-rose-200 border border-rose-700/60"
                >
                  {formatDisplayNumber(s.roll, lang)}
                  {s.name && <span className="font-sans font-normal opacity-70 ml-1">({s.name})</span>}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-emerald-800/40 bg-emerald-950/20 text-emerald-300 text-xs font-medium mb-6 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{strings.noAbsent}</span>
          </div>
        )}

        {/* Complete Student Roster Grid */}
        <div className="space-y-2 mb-8">
          <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider pb-1 border-b ${styles.divider} ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>{lang === 'bn' ? 'সকল শিক্ষার্থী ও উপস্থিতির তালিকা' : 'Complete Student Attendance Matrix'}</span>
            <span>
              {formatDisplayNumber(students.length, lang)} {lang === 'bn' ? 'জন' : 'Students'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-1">
            {students.map((student) => {
              const isPresent = student.status === 'present';
              const isAbsent = student.status === 'absent';
              const isLate = student.status === 'late';

              const pillStyle = isPresent
                ? styles.pillPresent
                : isAbsent
                ? styles.pillAbsent
                : styles.pillLate;

              return (
                <div
                  key={student.id}
                  className={`p-2 rounded-lg border text-center transition flex flex-col justify-between ${pillStyle}`}
                >
                  <div className="text-[10px] uppercase opacity-70 font-semibold">
                    {strings.rollText}
                  </div>
                  <div className="text-xs sm:text-sm font-black font-mono truncate">
                    {formatDisplayNumber(student.roll, lang)}
                  </div>
                  <div className="text-[10px] font-bold tracking-wider uppercase mt-1">
                    {isPresent
                      ? (lang === 'bn' ? 'উপস্থিত' : 'PRES')
                      : isAbsent
                      ? (lang === 'bn' ? 'অনুপস্থিত' : 'ABS')
                      : (lang === 'bn' ? 'বিলম্ব' : 'LATE')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official Verification Seal & Signature Footer */}
        <div className={`pt-6 border-t grid grid-cols-1 sm:grid-cols-2 items-end justify-between gap-6 ${styles.divider}`}>
          {/* Stamp / Verification */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${styles.stampColor}`}>
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-[11px] leading-tight space-y-0.5">
              <div className="font-extrabold uppercase tracking-wide flex items-center gap-1">
                <span>{strings.verifiedStamp}</span>
              </div>
              <p className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                Attendance Studio Digital Archive
              </p>
              <p className="text-[10px] font-mono opacity-60">
                Verified on {new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          {/* Instructor Signature Box */}
          <div className="text-right flex flex-col items-end">
            <div className="w-48 sm:w-56 border-b border-dashed border-slate-600/60 pb-1 mb-1">
              <span className="font-serif italic text-sm text-blue-400 font-semibold opacity-90">
                {metadata.teacherName ? `${metadata.teacherName}` : ''}
              </span>
            </div>
            <div className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {strings.signature}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AttendanceCardPreview.displayName = 'AttendanceCardPreview';
