/**
 * utils/crypto.ts
 * AES-256-GCM 암호화/복호화 + HMAC-SHA256 결정론적 해시
 * 
 * 주의: 이 모듈은 서버 사이드 전용입니다 (Node.js crypto 모듈 사용)
 * Server Actions에서만 import하여 사용하세요.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm' as const;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SEP = ':';

function getEncryptionKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error('[CBNUMatch] ENCRYPTION_KEY가 설정되지 않았거나 64자 헥사 스트링이 아닙니다.');
  }
  return Buffer.from(hexKey, 'hex');
}

function getPepperKey(): string {
  const pepper = process.env.PEPPER_KEY;
  if (!pepper || pepper.length < 16) {
    throw new Error('[CBNUMatch] PEPPER_KEY가 설정되지 않았거나 너무 짧습니다 (최소 16자).');
  }
  return pepper;
}

/**
 * 평문을 AES-256-GCM으로 암호화합니다.
 * @returns "iv:authTag:ciphertext" 헥사 인코딩 문자열
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(SEP);
}

/**
 * encrypt()로 생성된 암호문을 복호화합니다.
 */
export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(SEP);
  if (parts.length !== 3) {
    throw new Error('[CBNUMatch] 암호문 형식이 올바르지 않습니다 (iv:authTag:ciphertext).');
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encryptedData = Buffer.from(encryptedHex, 'hex');

  if (iv.length !== IV_LENGTH) throw new Error('[CBNUMatch] IV 길이가 유효하지 않습니다.');
  if (authTag.length !== AUTH_TAG_LENGTH) throw new Error('[CBNUMatch] authTag 길이가 유효하지 않습니다.');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);
  try {
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString('utf8');
  } catch {
    throw new Error('[CBNUMatch] 복호화 인증 실패: 데이터가 변조되었을 수 있습니다.');
  }
}

/**
 * PEPPER_KEY를 결합한 HMAC-SHA256 결정론적 해시 (중복 학번 탐지용)
 */
export function generateDeterministicHash(studentId: string): string {
  return crypto.createHmac('sha256', getPepperKey()).update(studentId.trim()).digest('hex');
}

/**
 * 타이밍 공격에 안전한 해시 비교
 */
export function safeCompareHash(hashA: string, hashB: string): boolean {
  const bufA = Buffer.from(hashA, 'hex');
  const bufB = Buffer.from(hashB, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
