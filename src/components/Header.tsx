import React from 'react';
import { User } from 'firebase/auth';
import { Language } from '../types';
import { t } from '../utils/translations';
import {
  Cloud,
  CheckCircle2,
  FolderOpen,
  LogOut,
  History,
  FilePlus,
  Languages,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  accessToken: string | null;
  driveFolderLink?: string;
  lang: Language;
  onToggleLang: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  onNewSheet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  accessToken,
  driveFolderLink,
  lang,
  onToggleLang,
  onSignIn,
  onSignOut,
  isSigningIn,
  historyCount,
  onOpenHistory,
  onNewSheet,
}) => {
  const strings = t[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 shadow-md shadow-blue-500/20 ring-1 ring-white/20">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>{strings.appName}</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                  Drive Backup
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-400 line-clamp-1">
                {strings.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* New Sheet Button */}
            <button
              onClick={onNewSheet}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition"
            >
              <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{strings.newSheet}</span>
            </button>

            {/* History Button */}
            <button
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{strings.history}</span>
              {historyCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Google Drive Status & Auth */}
            {user && accessToken ? (
              <div className="flex items-center gap-2 bg-slate-800/90 rounded-xl p-1 sm:pr-2.5 border border-emerald-500/30">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-lg object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}

                <div className="hidden lg:flex flex-col text-left">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{strings.driveConnected}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 max-w-[130px] truncate">
                    {user.email}
                  </span>
                </div>

                {driveFolderLink && (
                  <a
                    href={driveFolderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
                    title={strings.driveFolder}
                  >
                    <FolderOpen className="w-4 h-4 text-cyan-400" />
                  </a>
                )}

                <button
                  onClick={onSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition"
                  title={strings.signOut}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                disabled={isSigningIn}
                className="group relative inline-flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-xl bg-white text-slate-800 hover:bg-slate-100 hover:shadow-md transition active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="font-semibold text-slate-800">
                  {isSigningIn ? '...' : strings.loginWithGoogle}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auto Backup Notice Bar */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border-t border-slate-800/80 px-4 py-1.5 text-center text-xs text-blue-200/90 flex items-center justify-center gap-2">
        <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate">{strings.backupNotice}</span>
      </div>
    </header>
  );
};
