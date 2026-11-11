import React, { useState } from 'react';
import { Student, StudentStatus, Language } from '../types';
import { t } from '../utils/translations';
import { formatDisplayNumber } from '../utils/date';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  CheckCheck,
  XSquare,
  ArrowLeftRight,
  Trash2,
  UserPlus,
} from 'lucide-react';

interface StudentRosterProps {
  students: Student[];
  lang: Language;
  onUpdateStatus: (id: string, status: StudentStatus) => void;
  onUpdateName?: (id: string, name: string) => void;
  onRemoveStudent: (id: string) => void;
  onMarkAll: (status: StudentStatus) => void;
  onInvertAll: () => void;
  onAddSingleStudent: (roll: string, name?: string) => void;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  students,
  lang,
  onUpdateStatus,
  onUpdateName,
  onRemoveStudent,
  onMarkAll,
  onInvertAll,
  onAddSingleStudent,
}) => {
  const strings = t[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'present' | 'absent' | 'late'>('all');
  const [newRollInput, setNewRollInput] = useState('');
  const [newNameInput, setNewNameInput] = useState('');

  // Counts
  const total = students.length;
  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const percentage = total > 0 ? Math.round(((presentCount + lateCount * 0.5) / total) * 100) : 0;

  // Filtered list
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.roll.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.name && student.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterTab === 'present') return student.status === 'present';
    if (filterTab === 'absent') return student.status === 'absent';
    if (filterTab === 'late') return student.status === 'late';
    return true;
  });

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRollInput.trim()) {
      onAddSingleStudent(newRollInput.trim(), newNameInput.trim());
      setNewRollInput('');
      setNewNameInput('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Live Stats Header Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400">{strings.totalStudents}</div>
            <div className="text-xl font-bold text-white">
              {formatDisplayNumber(total, lang)}
            </div>
          </div>
        </div>

        {/* Present */}
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-emerald-300">{strings.presentCount}</div>
            <div className="text-xl font-bold text-emerald-400">
              {formatDisplayNumber(presentCount, lang)}
            </div>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-rose-300">{strings.absentCount}</div>
            <div className="text-xl font-bold text-rose-400">
              {formatDisplayNumber(absentCount, lang)}
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-indigo-300">{strings.attendanceRate}</div>
            <div className="text-xl font-bold text-indigo-300">
              {formatDisplayNumber(percentage, lang)}%
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onMarkAll('present')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition shadow-sm"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{strings.markAllPresent}</span>
          </button>

          <button
            type="button"
            onClick={() => onMarkAll('absent')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/60 transition shadow-sm"
          >
            <XSquare className="w-3.5 h-3.5 text-rose-400" />
            <span>{strings.markAllAbsent}</span>
          </button>

          <button
            type="button"
            onClick={onInvertAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Invert status"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{strings.invertSelection}</span>
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={strings.searchRoll}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {(['all', 'present', 'absent', 'late'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  filterTab === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'all' && strings.filterAll}
                {tab === 'present' && `${strings.filterPresent} (${presentCount})`}
                {tab === 'absent' && `${strings.filterAbsent} (${absentCount})`}
                {tab === 'late' && `${strings.filterLate} (${lateCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add Single Roll Form */}
      <form
        onSubmit={handleAddSingle}
        className="flex items-center gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50"
      >
        <UserPlus className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
        <input
          type="text"
          value={newRollInput}
          onChange={(e) => setNewRollInput(e.target.value)}
          placeholder={lang === 'bn' ? 'রোল নং (যেমন: 45)' : 'Roll Number (e.g. 45)'}
          className="w-28 sm:w-36 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="text"
          value={newNameInput}
          onChange={(e) => setNewNameInput(e.target.value)}
          placeholder={lang === 'bn' ? 'নাম (ঐচ্ছিক)' : 'Student Name (Optional)'}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shrink-0"
        >
          {lang === 'bn' ? 'যুক্ত করুন' : 'Add'}
        </button>
      </form>

      {/* Student Cards Grid */}
      {students.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">
            {lang === 'bn' ? 'কোনো রোল যুক্ত করা হয়নি' : 'No rolls in roster yet'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {lang === 'bn'
              ? 'উপরের "রোল রেঞ্জ তৈরি করুন" বা "নমুনা ডাটা লোড করুন" বাটনে ক্লিক করে শুরু করুন।'
              : 'Use the quick range generator above or click "Load Demo Class" to start.'}
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          {lang === 'bn' ? 'সার্চ অনুযায়ী কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No students match your filter or search query.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredStudents.map((student) => {
            const isPresent = student.status === 'present';
            const isAbsent = student.status === 'absent';
            const isLate = student.status === 'late';

            return (
              <div
                key={student.id}
                className={`group relative flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-150 select-none ${
                  isPresent
                    ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-100 hover:border-emerald-500'
                    : isAbsent
                    ? 'bg-rose-950/40 border-rose-600/40 text-rose-100 hover:border-rose-500'
                    : 'bg-amber-950/40 border-amber-600/40 text-amber-100 hover:border-amber-500'
                }`}
              >
                {/* Roll & Name */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      {strings.rollText}
                    </span>
                    <div className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                      {formatDisplayNumber(student.roll, lang)}
                    </div>
                    {student.name && (
                      <div className="text-[11px] text-slate-300 truncate font-medium">
                        {student.name}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveStudent(student.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition"
                    title="Remove roll"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* 3-State Toggle Button Group */}
                <div className="grid grid-cols-3 gap-1 bg-slate-900/80 rounded-lg p-0.5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(student.id, 'present')}
                    className={`py-1 rounded text-[11px] font-black transition ${
                      isPresent
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
                    }`}
                    title="Mark Present"
                  >
                    P
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateStatus(student.id, 'absent')}
                    className={`py-1 rounded text-[11px] font-black transition ${
                      isAbsent
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800'
                    }`}
                    title="Mark Absent"
                  >
                    A
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateStatus(student.id, 'late')}
                    className={`py-1 rounded text-[11px] font-black transition ${
                      isLate
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                    }`}
                    title="Mark Late / Leave"
                  >
                    L
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
