import crypto from 'crypto';

/**
 * Memvalidasi kunci rahasia (GTPS_SECRET) menggunakan perbandingan timing-safe
 * untuk mencegah serangan timing attacks (side-channel analysis).
 *
 * Menggunakan hashing SHA-256 terlebih dahulu agar kedua buffer memiliki
 * panjang yang persis sama (32 bytes), sehingga crypto.timingSafeEqual
 * dapat berjalan secara konstan tanpa membocorkan panjang string asli.
 *
 * @param providedSecret - Kunci rahasia yang dikirimkan oleh klien / script Lua
 * @returns boolean - True jika secret valid dan cocok, false jika tidak cocok
 */
export function validateGtpsSecret(providedSecret?: string | null): boolean {
  if (!providedSecret || typeof providedSecret !== 'string') {
    return false;
  }

  // Ambil secret dari environment variable, atau fallback ke default yang ditentukan
  const configuredSecret = process.env.GTPS_SECRET || '193679634487';

  try {
    const cleanProvided = providedSecret.trim();
    const cleanConfigured = configuredSecret.trim();

    // Hash kedua string menjadi buffer 32 bytes menggunakan SHA-256
    const providedBuffer = crypto.createHash('sha256').update(cleanProvided, 'utf8').digest();
    const configuredBuffer = crypto.createHash('sha256').update(cleanConfigured, 'utf8').digest();

    // Lakukan perbandingan secara konstan (timing-safe)
    return crypto.timingSafeEqual(providedBuffer, configuredBuffer);
  } catch {
    return false;
  }
}
