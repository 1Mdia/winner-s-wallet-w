export interface UserRecord {
  email: string;
  userName: string;
  docsSubmitted: boolean;
  bankSubmitted: boolean;
  loginTs: number;
  lastSeenTs: number | null;
  createdAt: string;
  withdrawalMethod: string | null;
  bankName: string | null;
  routingNumber: string | null;
  accountNumber: string | null;
}

const USERS_KEY = "wallet_users";
const SESSION_TOKEN = "wallet_session_token";
const SESSION_EMAIL = "wallet_session_email";

function readAll(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findByEmail(email: string): UserRecord | undefined {
  return readAll().find((u) => u.email === email.trim().toLowerCase());
}

function upsert(user: UserRecord) {
  const users = readAll();
  const idx = users.findIndex((u) => u.email === user.email);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  writeAll(users);
}

function publicShape(row: UserRecord) {
  return {
    email: row.email,
    userName: row.userName,
    docsSubmitted: row.docsSubmitted,
    bankSubmitted: row.bankSubmitted,
    loginTs: row.loginTs,
    lastSeenTs: row.lastSeenTs,
  };
}

export type PublicProgress = ReturnType<typeof publicShape>;

function makeToken(email: string): string {
  return btoa(`${email}:${Date.now()}:${Math.random()}`);
}

export function getToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN);
}

export function getSessionEmail(): string | null {
  return localStorage.getItem(SESSION_EMAIL);
}

export function setSession(email: string, token: string) {
  localStorage.setItem(SESSION_TOKEN, token);
  localStorage.setItem(SESSION_EMAIL, email);
}

export function clearSession() {
  localStorage.removeItem(SESSION_TOKEN);
  localStorage.removeItem(SESSION_EMAIL);
  localStorage.removeItem("wallet_user_email");
  localStorage.removeItem("wallet_user_name");
  localStorage.removeItem("wallet_login_ts");
  localStorage.removeItem("docs_submitted");
  localStorage.removeItem("bank_submitted");
}

function cacheLocal(p: PublicProgress) {
  localStorage.setItem("wallet_user_email", p.email);
  localStorage.setItem("wallet_user_name", p.userName);
  localStorage.setItem("wallet_login_ts", String(p.loginTs));
  if (p.docsSubmitted) localStorage.setItem("docs_submitted", "true");
  if (p.bankSubmitted) localStorage.setItem("bank_submitted", "true");
}

export function login(email: string): { progress: PublicProgress; token: string } | null {
  const normalized = email.trim().toLowerCase();
  const existing = findByEmail(normalized);

  if (existing) {
    existing.lastSeenTs = Date.now();
    upsert(existing);
    const token = makeToken(normalized);
    setSession(normalized, token);
    const p = publicShape(existing);
    cacheLocal(p);
    return { progress: p, token };
  }

  const name = normalized
    .split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const now = Date.now();
  const user: UserRecord = {
    email: normalized,
    userName: name,
    docsSubmitted: false,
    bankSubmitted: false,
    loginTs: now,
    lastSeenTs: now,
    createdAt: new Date(now).toISOString(),
    withdrawalMethod: null,
    bankName: null,
    routingNumber: null,
    accountNumber: null,
  };
  upsert(user);
  const token = makeToken(normalized);
  setSession(normalized, token);
  const p = publicShape(user);
  cacheLocal(p);
  return { progress: p, token };
}

export function getProgress(email: string): PublicProgress | null {
  const normalized = email.trim().toLowerCase();
  const user = findByEmail(normalized);
  if (!user) return null;
  user.lastSeenTs = Date.now();
  upsert(user);
  const p = publicShape(user);
  cacheLocal(p);
  return p;
}

export function submitDocs(email: string): PublicProgress | null {
  const normalized = email.trim().toLowerCase();
  const user = findByEmail(normalized);
  if (!user) return null;
  user.docsSubmitted = true;
  user.lastSeenTs = Date.now();
  upsert(user);
  const p = publicShape(user);
  cacheLocal(p);
  return p;
}

export function submitBank(
  email: string,
  method: string,
  details: Record<string, string>,
): PublicProgress | null {
  const normalized = email.trim().toLowerCase();
  const user = findByEmail(normalized);
  if (!user) return null;
  user.bankSubmitted = true;
  user.withdrawalMethod = method;
  user.bankName = details.bank ?? null;
  user.routingNumber = details.routing ?? null;
  user.accountNumber = details.account ?? null;
  user.lastSeenTs = Date.now();
  upsert(user);
  const p = publicShape(user);
  cacheLocal(p);
  return p;
}

export function listAllUsers(): UserRecord[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
