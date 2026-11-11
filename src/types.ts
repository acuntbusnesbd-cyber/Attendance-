export type StudentStatus = 'present' | 'absent' | 'late';

export interface Student {
  id: string;
  roll: string;
  name?: string;
  status: StudentStatus;
  note?: string;
}

export interface AttendanceMetadata {
  date: string;
  department: string;
  section: string;
  subject: string;
  teacherName: string;
  roomPeriod?: string;
  institutionName?: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export type CardThemeId = 'academic' | 'modern' | 'cyber' | 'minimal';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  nameBn: string;
  description: string;
  accentColor: string;
  bgGradient: string;
}

export interface AttendanceRecord {
  id: string;
  createdAt: number;
  metadata: AttendanceMetadata;
  students: Student[];
  summary: AttendanceSummary;
  cardTheme: CardThemeId;
  imageDataUrl?: string;
  driveFileId?: string;
  driveFileUrl?: string;
  driveBackupStatus?: 'synced' | 'pending' | 'failed' | 'not_connected';
  driveBackupError?: string;
}

export type Language = 'bn' | 'en';
