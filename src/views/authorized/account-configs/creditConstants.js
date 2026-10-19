/**
 * BeyondSend Telecom Channels & Categories Definitions
 *
 * 20 Exact Granular Routes:
 * 1. SMS (OTP, Implicit, Explicit, Promo, ILDO Intl, DLT Scrubbing)
 * 2. WhatsApp (Domestic Auth, International Auth, Utility, Marketing, Service)
 * 3. RCS (OTP, Service, Marketing)
 * 4. Voice / OBD (15s Pulse, 30s Pulse, 60s Pulse, DTMF Interactive)
 * 5. Email (Dedicated IP Transactional, Bulk Marketing)
 */

export const CREDIT_KEYS = [
  // ── 1. SMS CREDITS ─────────────────────────────────────────────────
  "sms_otp_credits",
  "sms_implicit_credits",
  "sms_explicit_credits",
  "sms_promotional_credits",
  "sms_international_credits",
  "sms_dLT_scrubbing_credits",

  // ── 2. WHATSAPP BUSINESS API ───────────────────────────────────────
  "whatsapp_authentication_credits",
  "whatsapp_auth_international_credits",
  "whatsapp_utility_credits",
  "whatsapp_marketing_credits",
  "whatsapp_service_credits",

  // ── 3. RCS BUSINESS MESSAGING ──────────────────────────────────────
  "rcs_otp_credits",
  "rcs_service_credits",
  "rcs_marketing_credits",

  // ── 4. OBD / VOICE BROADCAST ───────────────────────────────────────
  "voice_15s_credits",
  "voice_30s_credits",
  "voice_60s_credits",
  "voice_dtmf_interactive_credits",

  // ── 5. EMAIL CREDITS ───────────────────────────────────────────────
  "email_transactional_credits",
  "email_marketing_credits",

  // ── 6. PUSH NOTIFICATIONS ───────────────────────────────────────────
  "push_credits",

  // ── 7. TELEGRAM SERVICES & MESSAGING ─────────────────────────────────
  "telegram_gateway_otp_credits",
  "telegram_marketing_broadcasts",
  "telegram_utility_session_credits",
  "telegram_ai_bot_credits",
  "telegram_service_credits",
];

export const CHANNELS_LIST = [
  { id: "ALL", label: "All Channels", name: "All Channels" },
  { id: "SMS", label: "SMS (DLT Routes)", name: "SMS", color: "#0ca678", icon: "✆" },
  { id: "WHATSAPP", label: "WhatsApp (Meta API)", name: "WhatsApp", color: "#25D366", icon: "💬" },
  { id: "RCS", label: "RCS (Google RBM)", name: "RCS", color: "#7950f2", icon: "◈" },
  { id: "VOICE", label: "Voice / OBD", name: "Voice", color: "#fd7e14", icon: "☎" },
  { id: "EMAIL", label: "Email (SMTP / Blast)", name: "Email", color: "#228be6", icon: "✉" },
  { id: "PUSH", label: "Push Notifications", name: "Push Notifications", color: "#f59f00", icon: "🔔" },
  { id: "TELEGRAM", label: "Telegram Bot", name: "Telegram Bot", color: "#0088cc", icon: "✈" },
];

export const CHANNEL_META = {
  // ── 1. SMS
  sms_otp_credits: {
    channel: "SMS",
    category: "OTP",
    code: "SMS_OTP",
    label: "SMS OTP (24x7 Route)",
    shortName: "SMS OTP",
    color: "#0ca678",
    icon: "🔑",
    desc: "DLT Service Implicit: 24x7 OTP/2FA route",
  },
  sms_implicit_credits: {
    channel: "SMS",
    category: "IMPLICIT",
    code: "SMS_IMPLICIT",
    label: "SMS Service Implicit",
    shortName: "SMS Implicit",
    color: "#0ca678",
    icon: "🔔",
    desc: "DLT Service Implicit: Transactional notifications (bills, order updates)",
  },
  sms_explicit_credits: {
    channel: "SMS",
    category: "EXPLICIT",
    code: "SMS_EXPLICIT",
    label: "SMS Service Explicit",
    shortName: "SMS Explicit",
    color: "#20c997",
    icon: "🏷",
    desc: "DLT Service Explicit: Opt-in registered user promos/offers",
  },
  sms_promotional_credits: {
    channel: "SMS",
    category: "PROMOTIONAL",
    code: "SMS_PROMOTIONAL",
    label: "SMS Promotional",
    shortName: "SMS Promo",
    color: "#38d9a9",
    icon: "📣",
    desc: "Pure Promo (10 AM - 9 PM, Numeric Sender ID, hard DND filter)",
  },
  sms_international_credits: {
    channel: "SMS",
    category: "INTERNATIONAL",
    code: "SMS_INTERNATIONAL",
    label: "SMS International (ILDO)",
    shortName: "SMS Intl",
    color: "#12b886",
    icon: "🌐",
    desc: "ILDO Route (Non-+91 international destinations)",
  },
  sms_dLT_scrubbing_credits: {
    channel: "SMS",
    category: "DLT_SCRUBBING",
    code: "SMS_DLT_SCRUBBING",
    label: "SMS DLT Scrubbing Pool",
    shortName: "DLT Scrub",
    color: "#63e6be",
    icon: "🛡",
    desc: "Telco carrier scrubbing fee pool (optional per-message fee)",
  },

  // ── 2. WHATSAPP
  whatsapp_authentication_credits: {
    channel: "WHATSAPP",
    category: "AUTHENTICATION",
    code: "WHATSAPP_AUTH",
    label: "WhatsApp Authentication (India)",
    shortName: "WA Auth Dom",
    color: "#25D366",
    icon: "🔐",
    desc: "OTP / Account Verification (India domestic)",
  },
  whatsapp_auth_international_credits: {
    channel: "WHATSAPP",
    category: "AUTH_INTERNATIONAL",
    code: "WHATSAPP_AUTH_INTL",
    label: "WhatsApp Authentication (International)",
    shortName: "WA Auth Intl",
    color: "#1ebe5d",
    icon: "🌍",
    desc: "Auth OTP for international numbers",
  },
  whatsapp_utility_credits: {
    channel: "WHATSAPP",
    category: "UTILITY",
    code: "WHATSAPP_UTILITY",
    label: "WhatsApp Utility",
    shortName: "WA Utility",
    color: "#128c7e",
    icon: "🧾",
    desc: "Receipts, transaction & delivery updates",
  },
  whatsapp_marketing_credits: {
    channel: "WHATSAPP",
    category: "MARKETING",
    code: "WHATSAPP_MARKETING",
    label: "WhatsApp Marketing",
    shortName: "WA Marketing",
    color: "#075e54",
    icon: "🎯",
    desc: "Offers, catalogues, announcements, re-engagement",
  },
  whatsapp_service_credits: {
    channel: "WHATSAPP",
    category: "SERVICE",
    code: "WHATSAPP_SERVICE",
    label: "WhatsApp Service (User-Initiated)",
    shortName: "WA Service",
    color: "#00a884",
    icon: "💬",
    desc: "Customer Care (24-hr user-initiated support window)",
  },

  // ── 3. RCS
  rcs_otp_credits: {
    channel: "RCS",
    category: "OTP",
    code: "RCS_OTP",
    label: "RCS OTP Verified Cards",
    shortName: "RCS OTP",
    color: "#7950f2",
    icon: "📲",
    desc: "Verified RCS OTP cards",
  },
  rcs_service_credits: {
    channel: "RCS",
    category: "SERVICE",
    code: "RCS_SERVICE",
    label: "RCS Service (Transactional)",
    shortName: "RCS Service",
    color: "#845ef7",
    icon: "✉",
    desc: "Transactional text & simple rich notifications",
  },
  rcs_marketing_credits: {
    channel: "RCS",
    category: "MARKETING",
    code: "RCS_MARKETING",
    label: "RCS Marketing & Carousels",
    shortName: "RCS Marketing",
    color: "#5f3dc4",
    icon: "🎠",
    desc: "Rich cards, carousels, action buttons & promo media",
  },

  // ── 4. VOICE
  voice_15s_credits: {
    channel: "VOICE",
    category: "15S",
    code: "VOICE_15S",
    label: "Voice 1-15 sec Pulse (Quick Alert / OTP)",
    shortName: "Voice 15s",
    color: "#ff922b",
    icon: "⏱",
    desc: "Quick alert / Voice OTP pulse (1-15 sec)",
  },
  voice_30s_credits: {
    channel: "VOICE",
    category: "30S",
    code: "VOICE_30S",
    label: "Voice 1-30 sec Pulse (Standard)",
    shortName: "Voice 30s",
    color: "#fd7e14",
    icon: "📞",
    desc: "Standard campaign pulse (1-30 sec)",
  },
  voice_60s_credits: {
    channel: "VOICE",
    category: "60S",
    code: "VOICE_60S",
    label: "Voice 1-60 sec Pulse (Full Announcement)",
    shortName: "Voice 60s",
    color: "#e8590c",
    icon: "📢",
    desc: "Full announcement broadcast pulse (1-60 sec)",
  },
  voice_dtmf_interactive_credits: {
    channel: "VOICE",
    category: "DTMF_INTERACTIVE",
    code: "VOICE_DTMF",
    label: "Voice DTMF Interactive IVR",
    shortName: "Voice IVR",
    color: "#d9480f",
    icon: "🔢",
    desc: "Inbound/Outbound IVR (Press 1 to confirm, survey responses)",
  },

  // ── 5. EMAIL
  email_transactional_credits: {
    channel: "EMAIL",
    category: "TRANSACTIONAL",
    code: "EMAIL_TRANSACTIONAL",
    label: "Email Transactional & Invoices",
    shortName: "Email Txn",
    color: "#228be6",
    icon: "📨",
    desc: "Dedicated IP, instant OTP & order invoices",
  },
  email_marketing_credits: {
    channel: "EMAIL",
    category: "MARKETING",
    code: "EMAIL_MARKETING",
    label: "Email Marketing & Campaigns",
    shortName: "Email Promo",
    color: "#1c7ed6",
    icon: "📧",
    desc: "Bulk campaigns, newsletters & blast lists",
  },

  // ── 6. PUSH NOTIFICATIONS
  push_credits: {
    channel: "PUSH",
    category: "ENGAGEMENT",
    code: "PUSH_NOTIFICATIONS",
    label: "Web & Mobile Push Notifications",
    shortName: "Push Alerts",
    color: "#f59f00",
    icon: "🔔",
    desc: "Browser Web Push and native mobile app engagement notifications",
  },

  // ── 7. TELEGRAM SERVICES & MESSAGING
  telegram_gateway_otp_credits: {
    channel: "TELEGRAM",
    category: "GATEWAY_OTP",
    code: "TELEGRAM_GATEWAY_OTP",
    label: "Telegram Gateway OTP",
    shortName: "TG OTP",
    color: "#0088cc",
    icon: "🔐",
    desc: "Charged only on successful delivery (status: 'delivered')",
  },
  telegram_marketing_broadcasts: {
    channel: "TELEGRAM",
    category: "MARKETING",
    code: "TELEGRAM_MARKETING",
    label: "Telegram Marketing Broadcasts",
    shortName: "TG Broadcast",
    color: "#229ED9",
    icon: "📢",
    desc: "Charged per unique chat_id targeted in bulk broadcasts",
  },
  telegram_utility_session_credits: {
    channel: "TELEGRAM",
    category: "UTILITY",
    code: "TELEGRAM_UTILITY",
    label: "Telegram Utility & Invoices",
    shortName: "TG Utility",
    color: "#2AABEE",
    icon: "🧾",
    desc: "Charged for single transactional triggers (Invoices, Alerts)",
  },
  telegram_ai_bot_credits: {
    channel: "TELEGRAM",
    category: "AI_BOT",
    code: "TELEGRAM_AI_BOT",
    label: "Telegram AI Bot Queries",
    shortName: "TG AI Bot",
    color: "#179cde",
    icon: "🤖",
    desc: "Charged when automated LLM processors handle user queries",
  },
  telegram_service_credits: {
    channel: "TELEGRAM",
    category: "SERVICE",
    code: "TELEGRAM_SERVICE",
    label: "Telegram Live Agent Desk",
    shortName: "TG Live Desk",
    color: "#0077b5",
    icon: "🎧",
    desc: "Charged upon explicit activation of a human agent desk session",
  },
};

export const CHANNEL_CATEGORIES_BY_CHANNEL = {
  SMS: [
    "sms_otp_credits",
    "sms_implicit_credits",
    "sms_explicit_credits",
    "sms_promotional_credits",
    "sms_international_credits",
    "sms_dLT_scrubbing_credits",
  ],
  WHATSAPP: [
    "whatsapp_authentication_credits",
    "whatsapp_auth_international_credits",
    "whatsapp_utility_credits",
    "whatsapp_marketing_credits",
    "whatsapp_service_credits",
  ],
  RCS: [
    "rcs_otp_credits",
    "rcs_service_credits",
    "rcs_marketing_credits",
  ],
  VOICE: [
    "voice_15s_credits",
    "voice_30s_credits",
    "voice_60s_credits",
    "voice_dtmf_interactive_credits",
  ],
  EMAIL: [
    "email_transactional_credits",
    "email_marketing_credits",
  ],
  PUSH: [
    "push_credits",
  ],
  TELEGRAM: [
    "telegram_gateway_otp_credits",
    "telegram_marketing_broadcasts",
    "telegram_utility_session_credits",
    "telegram_ai_bot_credits",
    "telegram_service_credits",
  ],
};

export const getEmptyCreditForm = () => {
  return CREDIT_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
};

export const CHANNEL_OBJECT_KEYS = {
  SMS: "smsCredits",
  WHATSAPP: "whatsappCredits",
  RCS: "rcsCredits",
  VOICE: "voiceCredits",
  EMAIL: "emailCredits",
  PUSH: "pushCredits",
  TELEGRAM: "telegramCredits",
};

export const FLAT_TO_NESTED_MAP = {
  sms_otp_credits: { objectKey: "smsCredits", field: "sms_otp_credits", altField: "otp" },
  sms_implicit_credits: { objectKey: "smsCredits", field: "sms_implicit_credits", altField: "implicit" },
  sms_explicit_credits: { objectKey: "smsCredits", field: "sms_explicit_credits", altField: "explicit" },
  sms_promotional_credits: { objectKey: "smsCredits", field: "sms_promotional_credits", altField: "promotional" },
  sms_international_credits: { objectKey: "smsCredits", field: "sms_international_credits", altField: "international" },
  sms_dLT_scrubbing_credits: { objectKey: "smsCredits", field: "sms_dLT_scrubbing_credits", altField: "dlt_scrubbing" },

  whatsapp_authentication_credits: { objectKey: "whatsappCredits", field: "whatsapp_authentication_credits", altField: "authentication" },
  whatsapp_auth_international_credits: { objectKey: "whatsappCredits", field: "whatsapp_auth_international_credits", altField: "auth_international" },
  whatsapp_utility_credits: { objectKey: "whatsappCredits", field: "whatsapp_utility_credits", altField: "utility" },
  whatsapp_marketing_credits: { objectKey: "whatsappCredits", field: "whatsapp_marketing_credits", altField: "marketing" },
  whatsapp_service_credits: { objectKey: "whatsappCredits", field: "whatsapp_service_credits", altField: "service" },

  rcs_otp_credits: { objectKey: "rcsCredits", field: "rcs_otp_credits", altField: "otp" },
  rcs_service_credits: { objectKey: "rcsCredits", field: "rcs_service_credits", altField: "service" },
  rcs_marketing_credits: { objectKey: "rcsCredits", field: "rcs_marketing_credits", altField: "marketing" },

  voice_15s_credits: { objectKey: "voiceCredits", field: "voice_15s_credits", altField: "pulse_15s" },
  voice_30s_credits: { objectKey: "voiceCredits", field: "voice_30s_credits", altField: "pulse_30s" },
  voice_60s_credits: { objectKey: "voiceCredits", field: "voice_60s_credits", altField: "pulse_60s" },
  voice_dtmf_interactive_credits: { objectKey: "voiceCredits", field: "voice_dtmf_interactive_credits", altField: "dtmf_interactive" },

  email_transactional_credits: { objectKey: "emailCredits", field: "email_transactional_credits", altField: "transactional" },
  email_marketing_credits: { objectKey: "emailCredits", field: "email_marketing_credits", altField: "marketing" },

  push_credits: { objectKey: "pushCredits", field: "push_credits" },

  telegram_gateway_otp_credits: { objectKey: "telegramCredits", field: "telegram_gateway_otp_credits", altField: "gateway_otp" },
  telegram_marketing_broadcasts: { objectKey: "telegramCredits", field: "telegram_marketing_broadcasts", altField: "marketing_broadcasts" },
  telegram_utility_session_credits: { objectKey: "telegramCredits", field: "telegram_utility_session_credits", altField: "utility_session" },
  telegram_ai_bot_credits: { objectKey: "telegramCredits", field: "telegram_ai_bot_credits", altField: "ai_bot" },
  telegram_service_credits: { objectKey: "telegramCredits", field: "telegram_service_credits", altField: "service" },
};

/** Helper to read credit balance from either flat field or nested object */
export const getWalletCredit = (wallet, key) => {
  if (!wallet) return 0;
  if (wallet[key] !== undefined && wallet[key] !== null && typeof wallet[key] === "number") {
    return Number(wallet[key]) || 0;
  }
  const mapping = FLAT_TO_NESTED_MAP[key];
  if (mapping && wallet[mapping.objectKey]) {
    const obj = wallet[mapping.objectKey];
    if (typeof obj === "number") return obj;
    if (obj[key] !== undefined) return Number(obj[key]) || 0;
    if (mapping.field && obj[mapping.field] !== undefined) return Number(obj[mapping.field]) || 0;
    if (mapping.altField && obj[mapping.altField] !== undefined) return Number(obj[mapping.altField]) || 0;
  }
  return 0;
};


