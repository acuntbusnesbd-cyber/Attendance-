/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import {
  Student,
  StudentStatus,
  AttendanceMetadata,
  AttendanceRecord,
  CardThemeId,
  Language,
} from './types';
import { t } from './utils/translations';
import { getTodayDateString } from './utils/date';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/firebase';
import {
  getOrCreateAttendanceFolder,
  uploadAttendanceImageToDrive,
} from './lib/drive';

import { Header } from './components/Header';
import { AttendanceForm } from './components/AttendanceForm';
import { StudentRoster } from './components/StudentRoster';
import { AttendanceCardPreview } from './components/AttendanceCardPreview';
import { GeneratedCardModal } from './components/GeneratedCardModal';
import { HistoryModal } from './components/HistoryModal';
import { CARD_THEMES } from './utils/themes';

import {
  Sparkles,
  Cloud,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Palette,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'attendance_card_studio_history_v1';

export default function App() {
  const [lang, setLang] = useState<Language>('bn');
  const strings = t[lang];

  // Auth & Drive State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [driveFolderLink, setDriveFolderLink] = useState<string | undefined>(undefined);

  // Metadata State
  const [metadata, setMetadata] = useState<AttendanceMetadata>({
    date: getTodayDateString(),
    department: 'Computer Science & Engineering',
    section: 'Section A (Batch 22)',
    subject: 'Data Structures & Algorithms',
    teacherName: 'Prof. Md. Khan',
    roomPeriod: 'Room 402 • Period 2',
    institutionName: 'University / Institute of Technology',
  });

  // Students Roster State (Initialized with realistic demo roster)
  const [students, setStudents] = useState<Student[]>(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: `std-${i + 1}`,
      roll: String(i + 1).padStart(2, '0'),
      name: i === 0 ? 'Tanvir Ahmed' : i === 1 ? 'Sadia Rahman' : i === 2 ? 'Mehedi Hasan' : undefined,
      status: i === 4 || i === 11 || i === 18 ? 'absent' : i === 9 ? 'late' : 'present',
    }));
  });

  // Theme & Output State
  const [selectedTheme, setSelectedTheme] = useState<CardThemeId>('academic');
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [activeModal, setActiveModal] = useState<'preview' | 'history' | null>(null);
  const [activeRecord, setActiveRecord] = useState<AttendanceRecord | null>(null);
  const [generatedImageDataUrl, setGeneratedImageDataUrl] = useState<string | null>(null);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);

  // Ref to render target
  const renderCardRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveRecordsToStorage = (records: AttendanceRecord[]) => {
    try {
      setHistory(records);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authUser, token) => {
        setUser(authUser);
        setAccessToken(token);
        try {
          const folder = await getOrCreateAttendanceFolder(token);
          if (folder.webViewLink) {
            setDriveFolderLink(folder.webViewLink);
          }
        } catch (err) {
          console.warn('Could not auto-fetch drive folder:', err);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setDriveFolderLink(undefined);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Sign-In Action
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        const folder = await getOrCreateAttendanceFolder(result.accessToken);
        if (folder.webViewLink) {
          setDriveFolderLink(folder.webViewLink);
        }
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setDriveFolderLink(undefined);
  };

  // Student Roster Manipulations
  const handleUpdateStatus = (id: string, status: StudentStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleUpdateName = (id: string, name: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  const handleRemoveStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleMarkAll = (status: StudentStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleInvertAll = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: s.status === 'present' ? 'absent' : 'present',
      }))
    );
  };

  const handleAddSingleStudent = (roll: string, name?: string) => {
    setStudents((prev) => [
      ...prev,
      {
        id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        roll,
        name: name || undefined,
        status: 'present',
      },
    ]);
  };

  const handleGenerateRange = (start: number, end: number, prefix: string) => {
    const newStudents: Student[] = [];
    for (let i = start; i <= end; i++) {
      const rollStr = `${prefix}${String(i).padStart(2, '0')}`;
      newStudents.push({
        id: `std-${Date.now()}-${i}`,
        roll: rollStr,
        status: 'present',
      });
    }
    setStudents(newStudents);
  };

  const handleAddCustomRolls = (rawText: string) => {
    const rawItems = rawText
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const newStudents: Student[] = rawItems.map((roll, idx) => ({
      id: `std-${Date.now()}-${idx}`,
      roll,
      status: 'present',
    }));

    setStudents((prev) => [...prev, ...newStudents]);
  };

  const handleClearAllRolls = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি সব রোল মুছে ফেলতে চান?' : 'Clear all student rolls?')) {
      setStudents([]);
    }
  };

  const handleLoadDemo = () => {
    setMetadata({
      date: getTodayDateString(),
      department: 'Computer Science & Engineering',
      section: 'Section B (6th Semester)',
      subject: 'Artificial Intelligence & Neural Networks',
      teacherName: 'Dr. Rafiqul Islam',
      roomPeriod: 'Lab 3 • 10:00 AM',
      institutionName: 'Faculty of Engineering & Technology',
    });

    const demoStudents: Student[] = Array.from({ length: 30 }, (_, i) => ({
      id: `demo-${i + 1}`,
      roll: `CSE-${String(i + 1).padStart(2, '0')}`,
      status: [3, 7, 14, 22].includes(i + 1) ? 'absent' : i + 1 === 10 ? 'late' : 'present',
    }));
    setStudents(demoStudents);
  };

  const handleNewSheet = () => {
    if (window.confirm(lang === 'bn' ? 'নতুন শিট শুরু করতে চান?' : 'Start a new attendance sheet?')) {
      setMetadata({
        date: getTodayDateString(),
        department: '',
        section: '',
        subject: '',
        teacherName: '',
        roomPeriod: '',
        institutionName: '',
      });
      setStudents([]);
    }
  };

  // Calculate live summary
  const total = students.length;
  const present = students.filter((s) => s.status === 'present').length;
  const absent = students.filter((s) => s.status === 'absent').length;
  const late = students.filter((s) => s.status === 'late').length;
  const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

  const currentSummary = {
    total,
    present,
    absent,
    late,
    percentage,
  };

  const currentSheetId = `ATT-${metadata.date.replace(/-/g, '')}-${(metadata.department || 'GEN')
    .slice(0, 3)
    .toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  // SUBMIT & GENERATE IMAGE ACTION
  const handleSubmitAndGenerate = async () => {
    if (students.length === 0) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে অন্তত একটি রোল নম্বর যোগ করুন।' : 'Please add at least one roll number.');
      return;
    }

    setIsSubmitting(true);
    setGeneratedImageDataUrl(null);

    // Initial Record creation
    const recordId = `rec-${Date.now()}`;
    const newRecord: AttendanceRecord = {
      id: recordId,
      createdAt: Date.now(),
      metadata: { ...metadata },
      students: [...students],
      summary: { ...currentSummary },
      cardTheme: selectedTheme,
      driveBackupStatus: accessToken ? 'pending' : 'not_connected',
    };

    setActiveRecord(newRecord);
    setActiveModal('preview');

    // Wait for DOM to paint render node
    setTimeout(async () => {
      try {
        const node = document.getElementById('attendance-card-render-node');
        if (!node) {
          throw new Error('Card DOM element not found');
        }

        // Render crisp 2x retina PNG
        const dataUrl = await toPng(node, {
          pixelRatio: 2,
          quality: 0.95,
          cacheBust: true,
        });

        setGeneratedImageDataUrl(dataUrl);

        // Celebration confetti!
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas is blocked
        }

        // Update record with image
        let updatedRecord: AttendanceRecord = {
          ...newRecord,
          imageDataUrl: dataUrl,
        };

        // If user is connected to Google Drive, auto-backup!
        const currentToken = accessToken || (await getAccessToken());
        if (currentToken) {
          setIsUploadingToDrive(true);
          try {
            const fileName = `Attendance_${(metadata.department || 'Dept').replace(/[^a-zA-Z0-9]/g, '_')}_${(
              metadata.subject || 'Subject'
            ).replace(/[^a-zA-Z0-9]/g, '_')}_${metadata.date}.png`;

            const uploadRes = await uploadAttendanceImageToDrive(
              currentToken,
              dataUrl,
              fileName,
              `Attendance card for ${metadata.subject} on ${metadata.date}`
            );

            updatedRecord = {
              ...updatedRecord,
              driveFileId: uploadRes.id,
              driveFileUrl: uploadRes.webViewLink,
              driveBackupStatus: 'synced',
            };
          } catch (driveErr: any) {
            console.error('Drive backup error:', driveErr);
            updatedRecord = {
              ...updatedRecord,
              driveBackupStatus: 'failed',
              driveBackupError: driveErr?.message || 'Drive upload failed',
            };
          } finally {
            setIsUploadingToDrive(false);
          }
        }

        // Save into history
        setActiveRecord(updatedRecord);
        const newHistory = [updatedRecord, ...history.filter((h) => h.id !== recordId)];
        saveRecordsToStorage(newHistory);
      } catch (err) {
        console.error('Image capture error:', err);
        alert(lang === 'bn' ? 'ইমেজ তৈরি করতে সমস্যা হয়েছে।' : 'Failed to capture image card.');
      } finally {
        setIsSubmitting(false);
      }
    }, 350);
  };

  // Re-generate image when theme is changed in modal
  const handleThemeChangeInModal = async (newTheme: CardThemeId) => {
    setSelectedTheme(newTheme);
    if (!activeRecord) return;

    const updated = {
      ...activeRecord,
      cardTheme: newTheme,
    };
    setActiveRecord(updated);

    // Re-render image
    setTimeout(async () => {
      const node = document.getElementById('attendance-card-render-node');
      if (node) {
        const dataUrl = await toPng(node, {
          pixelRatio: 2,
          quality: 0.95,
          cacheBust: true,
        });
        setGeneratedImageDataUrl(dataUrl);

        // Update stored record
        const updatedWithImg = { ...updated, imageDataUrl: dataUrl };
        setActiveRecord(updatedWithImg);
        saveRecordsToStorage(
          history.map((h) => (h.id === updated.id ? updatedWithImg : h))
        );
      }
    }, 300);
  };

  // Manual Retry Drive Backup
  const handleRetryDriveUpload = async () => {
    if (!activeRecord || !generatedImageDataUrl) return;

    let token = accessToken;
    if (!token) {
      await handleSignIn();
      token = await getAccessToken();
    }

    if (!token) {
      alert(lang === 'bn' ? 'গুগল অ্যাকাউন্টে সাইন ইন করতে ব্যর্থ হয়েছে।' : 'Failed to obtain Drive token.');
      return;
    }

    setIsUploadingToDrive(true);
    try {
      const fileName = `Attendance_${(activeRecord.metadata.department || 'Dept').replace(/[^a-zA-Z0-9]/g, '_')}_${(
        activeRecord.metadata.subject || 'Subject'
      ).replace(/[^a-zA-Z0-9]/g, '_')}_${activeRecord.metadata.date}.png`;

      const uploadRes = await uploadAttendanceImageToDrive(
        token,
        generatedImageDataUrl,
        fileName,
        `Attendance card for ${activeRecord.metadata.subject} on ${activeRecord.metadata.date}`
      );

      const updatedRecord: AttendanceRecord = {
        ...activeRecord,
        driveFileId: uploadRes.id,
        driveFileUrl: uploadRes.webViewLink,
        driveBackupStatus: 'synced',
      };

      setActiveRecord(updatedRecord);
      saveRecordsToStorage(
        history.map((h) => (h.id === updatedRecord.id ? updatedRecord : h))
      );
    } catch (err: any) {
      console.error('Drive upload failed:', err);
      alert(err?.message || 'Drive backup failed');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // History record selection
  const handleSelectHistoryRecord = (record: AttendanceRecord) => {
    setActiveRecord(record);
    setSelectedTheme(record.cardTheme);
    setGeneratedImageDataUrl(record.imageDataUrl || null);
    setActiveModal('preview');
  };

  // History delete
  const handleDeleteHistoryRecord = (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছে ফেলতে চান?' : 'Delete this record?')) {
      const newHistory = history.filter((h) => h.id !== id);
      saveRecordsToStorage(newHistory);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Header
        user={user}
        accessToken={accessToken}
        driveFolderLink={driveFolderLink}
        lang={lang}
        onToggleLang={() => setLang(lang === 'bn' ? 'en' : 'bn')}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSigningIn={isSigningIn}
        historyCount={history.length}
        onOpenHistory={() => setActiveModal('history')}
        onNewSheet={handleNewSheet}
      />

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome & Info Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-800/40 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>{lang === 'bn' ? 'স্মার্ট উপস্থিতি ও ভিজ্যুয়াল কার্ড' : 'Smart Attendance & Card Studio'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'bn'
                ? 'রোল, বিভাগ ও বিষয় অনুযায়ী ইউনিক ইমেজ তৈরি ও গুগল ড্রাইভ ব্যাকআপ'
                : 'Custom Roll & Course Attendance with Instant Card Image & Drive Sync'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? 'তারিখ, বিভাগ, সেকশন ও বিষয় ইনপুট দিন, রোল নির্বাচন করুন এবং সাবমিট বাটনে ক্লিক করুন। চমৎকার ও অফিসিয়াল ইমেজ কার্ড তৈরি হয়ে স্বয়ংক্রিয়ভাবে গুগল ড্রাইভে সংরক্ষণ হবে।'
                : 'Enter your class details, mark student attendance with 1-click toggles, and generate a verified high-resolution attendance card that automatically saves to your Google Drive.'}
            </p>
          </div>

          {/* Quick Stats on Banner */}
          <div className="mt-5 pt-4 border-t border-blue-800/40 flex flex-wrap items-center gap-4 text-xs font-medium text-blue-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'হাই-রেজোলিউশন ইমেজ কার্ড' : 'High-Res Image Card'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'bn' ? 'গুগল ড্রাইভ অটো ক্লাউড ব্যাকআপ' : 'Automatic Google Drive Backup'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'অফিসিয়াল সিল ও ডিজিটাল যাচাইকরণ' : 'Official Verification & Signature'}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Attendance Details Form */}
        <AttendanceForm
          metadata={metadata}
          onChangeMetadata={setMetadata}
          lang={lang}
          onGenerateRange={handleGenerateRange}
          onAddCustomRolls={handleAddCustomRolls}
          onLoadDemo={handleLoadDemo}
          onClearAllRolls={handleClearAllRolls}
          totalRolls={students.length}
        />

        {/* Section 2: Student Roster & Live Status */}
        <StudentRoster
          students={students}
          lang={lang}
          onUpdateStatus={handleUpdateStatus}
          onUpdateName={handleUpdateName}
          onRemoveStudent={handleRemoveStudent}
          onMarkAll={handleMarkAll}
          onInvertAll={handleInvertAll}
          onAddSingleStudent={handleAddSingleStudent}
        />

        {/* Section 3: Visual Theme Selection & Submit Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                <span>{strings.cardTheme}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'আপনার পছন্দের আকর্ষণীয় ডিজাইন টেমপ্লেট নির্বাচন করুন'
                  : 'Choose your desired aesthetic template for the exported attendance card'}
              </p>
            </div>

            {/* Theme Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CARD_THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/30'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shadow-inner"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <span>{lang === 'bn' ? theme.nameBn : theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action Banner */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-850/50 p-4 rounded-xl">
            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {students.length} {lang === 'bn' ? 'জন শিক্ষার্থীর উপস্থিতি প্রস্তুত' : 'students ready for export'}
                </span>
              </div>
              <p className="text-slate-400">
                {user
                  ? lang === 'bn'
                    ? `Google Drive: "${user.email}" একাউন্টে অটো ব্যাকআপ হবে`
                    : `Will auto-backup to Google Drive (${user.email})`
                  : lang === 'bn'
                  ? 'গুগল ড্রাইভে অটো-সেভের জন্য উপরের Google Sign In ব্যবহার করতে পারেন'
                  : 'Sign in above if you wish to auto-backup directly to Google Drive'}
              </p>
            </div>

            <button
              type="button"
              disabled={isSubmitting || students.length === 0}
              onClick={handleSubmitAndGenerate}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-black rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-blue-500/25 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSubmitting ? (
                <span>{strings.generating}</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{strings.submitAndGenerate}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Card Preview (rendered in DOM for clean snapshotting and immediate visual feedback) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                {lang === 'bn' ? 'লাইভ কার্ড প্রিভিউ' : 'Live Card Preview'}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {lang === 'bn' ? 'সাবমিট করলে এটি হাই-কোয়ালিটি ইমেজে কনভার্ট হবে' : 'Captured on submit'}
            </span>
          </div>

          <div className="overflow-x-auto py-2">
            <AttendanceCardPreview
              ref={renderCardRef}
              metadata={metadata}
              students={students}
              summary={currentSummary}
              theme={selectedTheme}
              lang={lang}
              sheetId={currentSheetId}
              isBackedUp={false}
            />
          </div>
        </div>
      </main>

      {/* Generated Card Modal */}
      {activeModal === 'preview' && activeRecord && (
        <GeneratedCardModal
          record={activeRecord}
          imageDataUrl={generatedImageDataUrl}
          isGeneratingImage={isSubmitting}
          isUploadingToDrive={isUploadingToDrive}
          lang={lang}
          onClose={() => setActiveModal(null)}
          onThemeChange={handleThemeChangeInModal}
          onRetryDriveUpload={handleRetryDriveUpload}
          onSignInWithGoogle={handleSignIn}
          userEmail={user?.email}
        />
      )}

      {/* History Modal */}
      {activeModal === 'history' && (
        <HistoryModal
          records={history}
          lang={lang}
          onClose={() => setActiveModal(null)}
          onSelectRecord={handleSelectHistoryRecord}
          onDeleteRecord={handleDeleteHistoryRecord}
          onSyncRecordToDrive={handleSelectHistoryRecord}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {strings.appName} • {new Date().getFullYear()} • Custom Roll, Section, Subject & Drive Backup
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" /> Google Drive Sync
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure OAuth 2.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
