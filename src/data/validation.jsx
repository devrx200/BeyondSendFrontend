/* ================= TEXT REGEX ================= */
export const HINDI_TEXT_ONLY = /^[\u0900-\u097F\s.,!?'"()\-\n\r]+$/;
export const HINDI_WITH_NUMBERS = /^[\u0900-\u097F0-9०-९\s.,!?'"()\-\n\r]+$/;

export const ENGLISH_TEXT_ONLY = /^[A-Za-z\s.,!?'"()\-\n\r]+$/;
export const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9\s.,!?'"()\-\n\r]+$/;

/* ================= CONTACT REGEX ================= */
// export const PHONE_REGEX = /^(\+91[- ]?)?[6-9][0-9]{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 export const PHONE_REGEX = /^(\+91[- ]?)?[0-9]{10}$/;
export const PINCODE_REGEX = /^[0-9]{6}$/;
export const NUMBERS_ONLY = /^[0-9]+$/;

/* ================= URL REGEX ================= */
export const URL_REGEX =
  /^(https?:\/\/)(www\.)?[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/;
