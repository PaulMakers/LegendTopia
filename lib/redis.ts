import { Redis } from '@upstash/redis';
import { StoredServerData, ServerStatus, BroadcastMessage } from './types';

// Key penyimpanan Redis
const REDIS_STATUS_KEY = 'gtps:status';
const REDIS_BROADCAST_KEY = 'gtps:legendtopia:broadcast';

// TTL (Time To Live) status server dalam detik: 3 menit (180 detik)
const STATUS_EXPIRY_SECONDS = 180;

/**
 * Penyimpanan memori sementara (In-Memory Store)
 * Digunakan sebagai fallback otomatis apabila kredensial Upstash Redis
 * belum diisi pada lingkungan pengembangan lokal.
 */
class MemoryStore {
  private serverData: StoredServerData | null = null;
  private serverExpiresAt: number = 0;
  private broadcastMessage: BroadcastMessage | null = null;

  getServerData(): StoredServerData | null {
    if (!this.serverData) return null;
    if (Date.now() > this.serverExpiresAt) {
      this.serverData = null;
      return null;
    }
    return this.serverData;
  }

  setServerData(data: StoredServerData, ttlSeconds: number): void {
    this.serverData = data;
    this.serverExpiresAt = Date.now() + ttlSeconds * 1000;
  }

  clearServerData(): void {
    this.serverData = null;
    this.serverExpiresAt = 0;
  }

  getBroadcast(): BroadcastMessage | null {
    return this.broadcastMessage;
  }

  setBroadcast(message: BroadcastMessage | null): void {
    this.broadcastMessage = message;
  }
}

// Inisialisasi memory store fallback
const memoryFallback = new MemoryStore();

// Inisialisasi klien Upstash Redis (jika env variable tersedia)
let redisClient: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err: unknown) {
    console.warn('[Redis] Gagal menginisialisasi Upstash Redis, menggunakan memory store:', err);
  }
}

/**
 * Menyimpan data heartbeat server game ke dalam Redis dengan masa berlaku (TTL) 180 detik.
 *
 * @param data - Informasi status server game yang telah dinormalisasi
 */
export async function saveServerHeartbeat(data: StoredServerData): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.set(REDIS_STATUS_KEY, JSON.stringify(data), {
        ex: STATUS_EXPIRY_SECONDS,
      });
      return;
    } catch (err: unknown) {
      console.warn('[Redis] Gagal menyimpan heartbeat ke Redis, menggunakan memory fallback:', err);
    }
  }
  memoryFallback.setServerData(data, STATUS_EXPIRY_SECONDS);
}

/**
 * Mengambil data status server game terbaru dari Redis atau fallback memory store.
 *
 * @returns StoredServerData jika tersedia dan belum kedaluwarsa, atau null jika tidak ada data/offline.
 */
export async function getServerData(): Promise<StoredServerData | null> {
  if (redisClient) {
    try {
      const result = await redisClient.get<string | StoredServerData>(REDIS_STATUS_KEY);
      if (result) {
        if (typeof result === 'string') {
          return JSON.parse(result) as StoredServerData;
        }
        return result;
      }
      return null;
    } catch (err: unknown) {
      console.warn('[Redis] Gagal mengambil status dari Redis, memeriksa memory store:', err);
    }
  }
  return memoryFallback.getServerData();
}

/**
 * Mengosongkan cache status server di Redis (Force-Flush)
 * Digunakan oleh admin untuk mereset status secara instan tanpa menunggu TTL habis.
 */
export async function flushServerCache(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(REDIS_STATUS_KEY);
    } catch (err: unknown) {
      console.warn('[Redis] Gagal menghapus key status di Redis:', err);
    }
  }
  memoryFallback.clearServerData();
}

/**
 * Menyimpan pesan broadcast pengumuman website ke dalam Redis
 *
 * @param broadcast - Data pengumuman yang akan ditampilkan di banner website
 */
export async function saveBroadcast(broadcast: BroadcastMessage): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.set(REDIS_BROADCAST_KEY, JSON.stringify(broadcast));
      return;
    } catch (err: unknown) {
      console.warn('[Redis] Gagal menyimpan broadcast ke Redis, menggunakan memory fallback:', err);
    }
  }
  memoryFallback.setBroadcast(broadcast);
}

/**
 * Mengambil pesan broadcast pengumuman yang sedang aktif
 *
 * @returns BroadcastMessage jika ada, atau null jika tidak ada broadcast aktif
 */
export async function getBroadcast(): Promise<BroadcastMessage | null> {
  if (redisClient) {
    try {
      const result = await redisClient.get<string | BroadcastMessage>(REDIS_BROADCAST_KEY);
      if (result) {
        if (typeof result === 'string') {
          return JSON.parse(result) as BroadcastMessage;
        }
        return result;
      }
      return null;
    } catch (err: unknown) {
      console.warn('[Redis] Gagal mengambil broadcast dari Redis:', err);
    }
  }
  return memoryFallback.getBroadcast();
}

/**
 * Menghapus pesan broadcast pengumuman dari Redis
 */
export async function clearBroadcast(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(REDIS_BROADCAST_KEY);
    } catch (err: unknown) {
      console.warn('[Redis] Gagal menghapus key broadcast di Redis:', err);
    }
  }
  memoryFallback.setBroadcast(null);
}

/**
 * Menghitung status server berdasarkan selisih waktu heartbeat terakhir
 *
 * Aturan status:
 * - OFFLINE: Sinyal heartbeat tidak ada atau berumur lebih dari 180 detik
 * - STALE: Sinyal heartbeat berumur antara 61 hingga 180 detik (mungkin ada lag)
 * - ONLINE: Sinyal heartbeat berumur kurang dari atau sama dengan 60 detik
 *
 * @param lastHeartbeat - Unix timestamp dalam milidetik (ms)
 * @returns ServerStatus ('ONLINE' | 'STALE' | 'OFFLINE')
 */
export function computeServerStatus(lastHeartbeat: number | null | undefined): ServerStatus {
  if (!lastHeartbeat) return 'OFFLINE';
  const diffSeconds = (Date.now() - lastHeartbeat) / 1000;
  if (diffSeconds > STATUS_EXPIRY_SECONDS) return 'OFFLINE';
  if (diffSeconds > 60) return 'STALE';
  return 'ONLINE';
}
