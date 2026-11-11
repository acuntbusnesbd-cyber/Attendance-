import React, { useState } from 'react';
import { AttendanceMetadata, Language } from '../types';
import { t } from '../utils/translations';
import { getTodayDateString } from '../utils/date';
import {
  Calendar,
  GraduationCap,
  Layers,
  BookOpen,
  UserCheck,
  Building2,
  Clock,
  Sparkles,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';

interface AttendanceFormProps {
  metadata: AttendanceMetadata;
  onChangeMetadata: (meta: AttendanceMetadata) => void;
  lang: Language;
  onGenerateRange: (start: number, end: number, prefix: string) => void;
  onAddCustomRolls: (rawText: string) => void;
  onLoadDemo: () => void;
  onClearAllRolls: () => void;
  totalRolls: number;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  metadata,
  onChangeMetadata,
  lang,
  onGenerateRange,
  onAddCustomRolls,
  onLoadDemo,
  onClearAllRolls,
  totalRolls,
}) => {
  const strings = t[lang];

  // Quick Range State
  const [startRoll, setStartRoll] = useState<string>('1');
  const [endRoll, setEndRoll] = useState<string>('30');
  const [rollPrefix, setRollPrefix] = useState<string>('');

  // Custom Raw Text State
  const [customText, setCustomText] = useState<string>('');
  const [showCustomBox, setShowCustomBox] = useState<boolean>(false);

  const updateField = (field: keyof AttendanceMetadata, value: string) => {
    onChangeMetadata({
      ...metadata,
      [field]: value,
    });
  };

  const handleRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseInt(startRoll, 10);
    const end = parseInt(endRoll, 10);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      onGenerateRange(start, end, rollPrefix.trim());
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onAddCustomRolls(customText);
      setCustomText('');
      setShowCustomBox(false);
    }
  };

  // Quick department suggestions
  const deptSuggestions = ['Computer Science (CSE)', 'Electrical (EEE)', 'BBA', 'Civil (CE)', 'English', 'Bangla'];
  const secSuggestions = ['Section A', 'Section B', 'Batch 2024', 'Semester 5', 'Morning Shift'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header with Title and Demo loader */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>{strings.basicDetails}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'bn' ? 'তারিখ, বিভাগ, সেকশন ও বিষয় কাস্টমাইজ করুন' : 'Customize date, department, section, and subject details'}
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{strings.loadDemo}</span>
        </button>
      </div>

      {/* Grid of Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              {strings.date}
            </span>
            <button
              type="button"
              onClick={() => updateField('date', getTodayDateString())}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              {lang === 'bn' ? 'আজকের দিন' : 'Today'}
            </button>
          </label>
          <input
            type="date"
            value={metadata.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Department Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            {strings.department}
          </label>
          <input
            type="text"
            value={metadata.department}
            onChange={(e) => updateField('department', e.target.value)}
            placeholder={strings.departmentPlaceholder}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {/* Quick Dept Chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {deptSuggestions.slice(0, 3).map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => updateField('department', dept)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
              >
                {dept.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Section / Batch Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            {strings.section}
          </label>
          <input
            type="text"
            value={metadata.section}
            onChange={(e) => updateField('section', e.target.value)}
            placeholder={strings.sectionPlaceholder}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <div className="flex flex-wrap gap-1 mt-1.5">
            {secSuggestions.slice(0, 3).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => updateField('section', sec)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Subject / Course */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            {strings.subject}
          </label>
          <input
            type="text"
            value={metadata.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            placeholder={strings.subjectPlaceholder}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Teacher / Instructor Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            {strings.teacherName}
          </label>
          <input
            type="text"
            value={metadata.teacherName}
            onChange={(e) => updateField('teacherName', e.target.value)}
            placeholder={strings.teacherPlaceholder}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Room / Period (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            {strings.roomPeriod}
          </label>
          <input
            type="text"
            value={metadata.roomPeriod || ''}
            onChange={(e) => updateField('roomPeriod', e.target.value)}
            placeholder={strings.roomPlaceholder}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Institution / College Name (Optional, full width on 3 cols) */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            {strings.institutionName}
          </label>
          <input
            type="text"
            value={metadata.institutionName || ''}
            onChange={(e) => updateField('institutionName', e.target.value)}
            placeholder={strings.institutionPlaceholder}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Roll Configuration Section */}
      <div className="pt-4 border-t border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{strings.quickRange}</span>
              <span className="text-xs font-normal text-slate-400">
                ({totalRolls} {lang === 'bn' ? 'টি রোল যুক্ত আছে' : 'rolls added'})
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'এক ক্লিকে রোল ১ থেকে ৬০ বা যেকোনো রেঞ্জ তৈরি করুন'
                : 'Instantly generate numeric roll series or paste custom lists'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCustomBox(!showCustomBox)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
            >
              {showCustomBox ? (lang === 'bn' ? 'রেঞ্জ মোড' : 'Range Mode') : strings.customInput}
            </button>
            {totalRolls > 0 && (
              <button
                type="button"
                onClick={onClearAllRolls}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 transition flex items-center gap-1"
                title="Clear all student rolls"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{strings.clearAll}</span>
              </button>
            )}
          </div>
        </div>

        {!showCustomBox ? (
          /* Range Generator Form */
          <form
            onSubmit={handleRangeSubmit}
            className="flex flex-wrap items-center gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60"
          >
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300 font-medium">{strings.startRoll}:</label>
              <input
                type="number"
                min="1"
                value={startRoll}
                onChange={(e) => setStartRoll(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300 font-medium">{strings.endRoll}:</label>
              <input
                type="number"
                min="1"
                value={endRoll}
                onChange={(e) => setEndRoll(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300 font-medium">{strings.prefix}:</label>
              <input
                type="text"
                placeholder="e.g. 01-"
                value={rollPrefix}
                onChange={(e) => setRollPrefix(e.target.value)}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm ml-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{strings.generateRolls}</span>
            </button>
          </form>
        ) : (
          /* Custom Paste Box */
          <form
            onSubmit={handleCustomSubmit}
            className="space-y-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60"
          >
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={strings.customPlaceholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              >
                {strings.addCustomRolls}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
