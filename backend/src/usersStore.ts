import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  salt?: string;
  avatar?: string;
  role: string;
  authProvider: "local" | "google";
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

// In-memory cache synced with users.json
let usersMap: Map<string, StoredUser> = new Map();

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const key = crypto.scryptSync(password, salt, 64);
    const expectedKey = Buffer.from(expectedHash, "hex");
    return crypto.timingSafeEqual(key, expectedKey);
  } catch {
    return false;
  }
}

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveUsersToFile() {
  try {
    ensureDataDirectory();
    const list = Array.from(usersMap.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.error("[UsersStore] Failed to write users to disk:", err);
  }
}

export function initUsersStore() {
  ensureDataDirectory();
  if (fs.existsSync(USERS_FILE)) {
    try {
      const content = fs.readFileSync(USERS_FILE, "utf8");
      const list: StoredUser[] = JSON.parse(content || "[]");
      usersMap.clear();
      for (const u of list) {
        usersMap.set(u.email.toLowerCase().trim(), u);
      }
      console.log(`[UsersStore] Loaded ${usersMap.size} users from ${USERS_FILE}`);
    } catch (err) {
      console.error("[UsersStore] Error reading users.json, re-initializing:", err);
      usersMap.clear();
    }
  }

  // Pre-seed default user if database is empty so testing is immediate
  if (usersMap.size === 0) {
    console.log("[UsersStore] Seeding initial test user: radhikapatil37011@gmail.com");
    createUser({
      email: "radhikapatil37011@gmail.com",
      name: "Radhika Patil",
      password: "Password123!",
      role: "Creator"
    });
  }
}

export function getUserByEmail(email: string): StoredUser | null {
  if (!email) return null;
  return usersMap.get(email.toLowerCase().trim()) || null;
}

export function getUserById(id: string): StoredUser | null {
  if (!id) return null;
  for (const u of usersMap.values()) {
    if (u.id === id) return u;
  }
  return null;
}

export function createUser(params: {
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  role?: string;
  authProvider?: "local" | "google";
}): StoredUser {
  const emailKey = params.email.toLowerCase().trim();
  const id = "usr_" + crypto.randomBytes(6).toString("hex");
  const now = new Date().toISOString();

  let passwordHash: string | undefined;
  let salt: string | undefined;

  if (params.password) {
    salt = crypto.randomBytes(16).toString("hex");
    passwordHash = hashPassword(params.password, salt);
  }

  const newUser: StoredUser = {
    id,
    email: emailKey,
    name: params.name.trim(),
    passwordHash,
    salt,
    avatar: params.avatar || "",
    role: params.role || "Creator",
    authProvider: params.authProvider || (params.password ? "local" : "google"),
    createdAt: now,
    updatedAt: now
  };

  usersMap.set(emailKey, newUser);
  saveUsersToFile();
  return newUser;
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  const user = getUserByEmail(email);
  if (!user) return false;

  const salt = crypto.randomBytes(16).toString("hex");
  user.passwordHash = hashPassword(newPassword, salt);
  user.salt = salt;
  user.updatedAt = new Date().toISOString();

  usersMap.set(user.email.toLowerCase().trim(), user);
  saveUsersToFile();
  return true;
}

export function upsertGoogleUser(profile: {
  email: string;
  name: string;
  avatar?: string;
}): StoredUser {
  const emailKey = profile.email.toLowerCase().trim();
  const existing = usersMap.get(emailKey);

  if (existing) {
    existing.name = profile.name || existing.name;
    if (profile.avatar) existing.avatar = profile.avatar;
    existing.updatedAt = new Date().toISOString();
    saveUsersToFile();
    return existing;
  }

  return createUser({
    email: emailKey,
    name: profile.name,
    avatar: profile.avatar || "",
    role: "Creator",
    authProvider: "google"
  });
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role
  };
}
