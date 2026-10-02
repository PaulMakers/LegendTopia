/**
 * Tipe data status server game
 * - ONLINE: Server mengirim heartbeat dalam kurun waktu kurang dari 60 detik
 * - STALE: Sinyal heartbeat terakhir berumur antara 61 detik sampai 180 detik
 * - OFFLINE: Tidak ada heartbeat lebih dari 180 detik atau cache dikosongkan
 */
export type ServerStatus = 'ONLINE' | 'STALE' | 'OFFLINE';

/**
 * Informasi data pemain yang sedang online di server game
 */
export interface Player {
  name: string;
  world?: string;
  level?: number;
  role?: string;
}

/**
 * Alias PlayerInfo untuk backward-compatibility komponen lama
 */
export type PlayerInfo = Player;

/**
 * Struktur payload data yang dikirimkan oleh script Lua GTPS Cloud ke endpoint /api/heartbeat
 */
export interface HeartbeatPayload {
  secret: string;
  serverName?: string;
  playerCount?: number;
  maxPlayers?: number;
  players?: (string | Player)[];
  worldCount?: number;
  uptime?: string | number;
  version?: string;
}

/**
 * Struktur data status server yang disimpan ke dalam Redis (dengan TTL 180 detik)
 */
export interface StoredServerData {
  status: ServerStatus;
  serverName: string;
  playerCount: number;
  maxPlayers: number;
  players: Player[];
  worldCount: number;
  uptime: string;
  uptimeSeconds?: number;
  version: string;
  lastHeartbeat: number; // Unix timestamp dalam milidetik (Date.now())
  lastHeartbeatIso: string; // ISO 8601 string
  ip: string;
  port: number;
}

/**
 * Respons standar API publik /api/status untuk ditampilkan di antarmuka website
 */
export interface StatusResponse {
  success: boolean;
  status: ServerStatus;
  online?: boolean;
  stale?: boolean;
  uptimeSeconds?: number;
  server: {
    name: string;
    status: ServerStatus;
    online?: boolean;
    stale?: boolean;
    playerCount: number;
    maxPlayers: number;
    players: Player[];
    worldCount: number;
    uptime: string;
    uptimeSeconds?: number;
    version: string;
    ip: string;
    port: number;
    lastSeenSecondsAgo: number;
    lastHeartbeatIso: string;
  };
}

/**
 * Respons ringkas untuk pemeriksaan ping / status cepat
 */
export interface PingResponse {
  success: boolean;
  server: {
    status: 'online' | 'offline' | 'stale';
    detailedStatus: ServerStatus;
    playerCount: number;
    uptime: string;
    lastSeen: string | null;
  };
}

/**
 * Kategori jenis broadcast pengumuman di banner website
 */
export type BroadcastType = 'announcement' | 'maintenance' | 'event' | 'info';

/**
 * Struktur data broadcast yang disiarkan admin ke website
 */
export interface BroadcastMessage {
  id: string;
  message: string;
  type: BroadcastType;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  author?: string;
}

/**
 * Respons API /api/broadcast
 */
export interface BroadcastResponse {
  success: boolean;
  broadcast: BroadcastMessage | null;
}

/**
 * Respons autentikasi admin login /api/admin/login
 */
export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  error?: string;
}

/**
 * Respons tindakan admin (misalnya force refresh cache)
 */
export interface AdminActionResponse {
  success: boolean;
  message: string;
  status?: ServerStatus;
  error?: string;
}
