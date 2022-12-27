const MINUTE = 60 * 1000;

// Verification email
export const PASSWORD_RESET_TIMEOUT = 60 * MINUTE; // 1 hour
export const EMAIL_VERIFICATION_TIMEOUT = PASSWORD_RESET_TIMEOUT * 24;

// Bcrypt
export const BCRYPT_WORK_FACTOR = 12;
export const BCRYPT_MAX_BYTES = 72;

// sha256 -> 256 bits / 8 = 32 bytes * 2 (hex) = 64 bytes
export const STATE_BYTES = 64;

// Username
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 32;

// Email
export const EMAIL_MIN = 8;
export const EMAIL_MAX = 254;

// Account lock

export const ACCOUNT_LOCK_DURATION = 5 * MINUTE; // 5 minutes
