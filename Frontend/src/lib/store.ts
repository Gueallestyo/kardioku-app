// Kardioku - Local State Store (localStorage-based)

export interface UserProfile {
  username: string;
  password: string;
  umur: number;
  jenisKelamin: 'Pria' | 'Wanita';
  tinggiBadan: number;
  beratBadan: number;
  isGoogleUser?: boolean;
}

export interface AssessmentRecord {
  id: string;
  tanggal: string;
  sistolik: number;
  diastolik: number;
  kolesterol: number;
  glukosa: number;
  merokok: number;
  alkohol: number;
  aktivitasFisik: number;
  bmi: number;
  riskScore: number;
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi';
}

const STORAGE_KEYS = {
  USERS: 'cardioguard_users',
  CURRENT_USER: 'cardioguard_current_user',
  ASSESSMENTS: 'cardioguard_assessments',
  REMINDER_ON: 'cardioguard_reminder_on',
};

// --- User Auth ---
export function getUsers(): Record<string, UserProfile> {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  return raw ? JSON.parse(raw) : {};
}

export function saveUser(profile: UserProfile) {
  const users = getUsers();
  users[profile.username] = profile;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function loginUser(username: string, password: string): UserProfile | null {
  const users = getUsers();
  const user = users[username];
  if (user && user.password === password) return user;
  return null;
}

export function getCurrentUser(): UserProfile | null {
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function updateUserProfile(username: string, profile: Partial<UserProfile>) {
  const users = getUsers();
  if (users[username]) {
    users[username] = { ...users[username], ...profile };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    setCurrentUser(users[username]);
  }
}

// --- Assessments ---
export function getAssessments(username: string): AssessmentRecord[] {
  const raw = localStorage.getItem(`${STORAGE_KEYS.ASSESSMENTS}_${username}`);
  // PERBAIKAN: Mengembalikan array kosong [] jika belum ada data, bukan data acak
  return raw ? JSON.parse(raw) : [];
}

export function saveAssessment(username: string, record: AssessmentRecord) {
  const existing = getAssessments(username);
  const updated = [record, ...existing];
  localStorage.setItem(`${STORAGE_KEYS.ASSESSMENTS}_${username}`, JSON.stringify(updated));
}

// FUNGSI getMockAssessments() TELAH DIHAPUS KARENA MENYEBABKAN DATA DESYNCHRONIZATION

// --- Reminder ---
export function getReminderState(): boolean {
  return localStorage.getItem(STORAGE_KEYS.REMINDER_ON) !== 'false';
}

export function setReminderState(val: boolean) {
  localStorage.setItem(STORAGE_KEYS.REMINDER_ON, String(val));
}

// --- Risk Calculation ---
export function calculateRisk(data: {
  umur: number;
  jenisKelamin: string;
  bmi: number;
  sistolik: number;
  diastolik: number;
  kolesterol: number;
  glukosa: number;
  merokok: number;
  alkohol: number;
  aktivitasFisik: number;
}): { score: number; level: 'Rendah' | 'Sedang' | 'Tinggi' } {
  let score = 0;

  // Age
  if (data.umur >= 50) score += 25;
  else if (data.umur >= 40) score += 15;
  else if (data.umur >= 30) score += 8;
  else score += 3;

  // BMI
  if (data.bmi >= 30) score += 20;
  else if (data.bmi >= 25) score += 10;
  else score += 0;

  // Blood pressure
  if (data.sistolik >= 160 || data.diastolik >= 100) score += 30;
  else if (data.sistolik >= 140 || data.diastolik >= 90) score += 20;
  else if (data.sistolik >= 130 || data.diastolik >= 80) score += 10;
  else score += 0;

  // Cholesterol
  if (data.kolesterol === 3) score += 15;
  else if (data.kolesterol === 2) score += 8;

  // Glucose
  if (data.glukosa === 3) score += 10;
  else if (data.glukosa === 2) score += 5;

  // Smoking
  if (data.merokok === 1) score += 15;

  // Alcohol
  if (data.alkohol === 1) score += 8;

  // Physical activity
  if (data.aktivitasFisik === 0) score += 10;

  // Gender
  if (data.jenisKelamin === 'Pria') score += 5;

  score = Math.min(100, score);

  let level: 'Rendah' | 'Sedang' | 'Tinggi';
  if (score >= 60) level = 'Tinggi';
  else if (score >= 35) level = 'Sedang';
  else level = 'Rendah';

  return { score, level };
}