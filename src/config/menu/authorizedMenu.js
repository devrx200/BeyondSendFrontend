import {
  FaTachometerAlt,
  FaChartPie,
  FaFileAlt,
  FaPaperPlane,
  FaExchangeAlt,
  FaChartLine,
  FaEnvelope,
  FaCommentAlt,
  FaComments,
  FaWhatsapp,
  FaPhoneAlt,
  FaList,
  FaUserSlash,
  FaKey,
  FaListUl,
  FaNetworkWired,
  FaNewspaper,
  FaBolt,
  FaListAlt,
  FaExclamationCircle,
  FaFolderOpen,
  FaDownload,
  FaLayerGroup,
  FaWindowMaximize,
  FaWindowMinimize,
  FaBars,
  FaImage,
  FaThLarge,
  FaTags,
  FaAddressBook,
  FaIdCard,
  FaHeadset,
  FaHandsHelping,
  FaBookOpen,
  FaCommentDots,
  FaUsers,
  FaHistory,
  FaUserShield,
  FaDatabase,
  FaChevronRight,
  FaClock,
  FaPager,
  FaCoins,
  FaUserCog,
  FaCalendarCheck,
  FaSignOutAlt,
  FaShieldAlt,
  FaSitemap,
  FaPlug,
  FaBullhorn,
  FaBell,
  FaUserFriends,
  FaSlidersH,
  FaCogs,
  FaChartBar,
  FaHourglassHalf,
  FaTelegramPlane,
  FaRobot,
  FaCode,
} from "react-icons/fa";

/* =========================================================
   ROLES
========================================================= */

export const ROLES = {
  DEVOPS: "DEVOPS",
  ADMIN: "ADMIN",
  RESELLER: "RESELLER",
  CLIENT: "CLIENT",
  MANAGER: "MANAGER",
};

/* =========================================================
   ROLE GROUPS
========================================================= */

const ALL_ROLES = [
  ROLES.DEVOPS,
  ROLES.ADMIN,
  ROLES.RESELLER,
  ROLES.CLIENT,
  ROLES.MANAGER,
];

const ADMIN_ROLES = [
  ROLES.DEVOPS,
  ROLES.ADMIN,
];

const TENANT_ROLES = [
  ROLES.DEVOPS,
  ROLES.ADMIN,
  ROLES.RESELLER,
  ROLES.CLIENT,
];

const CHANNEL_ROLES = [
  ROLES.DEVOPS,
  ROLES.ADMIN,
  ROLES.RESELLER,
  ROLES.CLIENT,
];

/* =========================================================
   ICON MAP
========================================================= */

export const ICON_MAP = {
  FaTachometerAlt,
  FaChartPie,
  FaFileAlt,
  FaPaperPlane,
  FaExchangeAlt,
  FaChartLine,
  FaEnvelope,
  FaCommentAlt,
  FaComments,
  FaWhatsapp,
  FaPhoneAlt,
  FaList,
  FaUserSlash,
  FaKey,
  FaListUl,
  FaNetworkWired,
  FaNewspaper,
  FaBolt,
  FaListAlt,
  FaExclamationCircle,
  FaFolderOpen,
  FaDownload,
  FaLayerGroup,
  FaWindowMaximize,
  FaWindowMinimize,
  FaBars,
  FaImage,
  FaThLarge,
  FaTags,
  FaAddressBook,
  FaIdCard,
  FaHeadset,
  FaHandsHelping,
  FaBookOpen,
  FaCommentDots,
  FaUsers,
  FaHistory,
  FaUserShield,
  FaDatabase,
  FaChevronRight,
  FaClock,
  FaPager,
  FaCoins,
  FaUserCog,
  FaCalendarCheck,
  FaSignOutAlt,
  FaShieldAlt,
  FaSitemap,
  FaPlug,
  FaBullhorn,
  FaBell,
  FaUserFriends,
  FaSlidersH,
  FaTelegramPlane,
  FaRobot,
};

/* =========================================================
   LABEL HELPER
========================================================= */

const t = (en, hi = en) => ({
  en,
  hi,
});

/* =========================================================
   NORMALIZERS
========================================================= */

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toUpperCase();

const normalizePermission = (permission) =>
  String(permission || "")
    .trim()
    .toLowerCase();

const normalizePermissions = (permissions) => {
  if (!permissions) return [];

  if (Array.isArray(permissions)) {
    return permissions
      .map((permission) => {
        if (typeof permission === "string") {
          return normalizePermission(permission);
        }

        if (
          permission &&
          typeof permission === "object"
        ) {
          return normalizePermission(
            permission.name ??
              permission.permission ??
              permission.key ??
              permission.code
          );
        }

        return "";
      })
      .filter(Boolean);
  }

  if (
    typeof permissions === "object"
  ) {
    return Object.entries(permissions)
      .filter(([, value]) => value === true)
      .map(([key]) =>
        normalizePermission(key)
      );
  }

  return [];
};

const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles
    .map(normalizeRole)
    .filter(Boolean);
};

/* =========================================================
   ICON RESOLVER
========================================================= */

export const resolveIcon = (
  icon,
  fallback = FaFileAlt
) => {
  if (!icon) {
    return fallback;
  }

  if (typeof icon === "function") {
    return icon;
  }

  if (typeof icon === "string") {
    return (
      ICON_MAP[icon] ||
      fallback
    );
  }

  return fallback;
};

/* =========================================================
   LABEL RESOLVER
========================================================= */

export const resolveLabel = (
  label,
  fallback = ""
) => {
  if (!label) {
    return {
      en: fallback,
      hi: fallback,
    };
  }

  if (typeof label === "string") {
    return {
      en: label,
      hi: label,
    };
  }

  return {
    en:
      label.en ||
      label.hi ||
      fallback,

    hi:
      label.hi ||
      label.en ||
      fallback,
  };
};

/* =========================================================
   CHANNEL PERMISSIONS
========================================================= */

const CHANNEL_PERMISSIONS = [
  "whatsapp",
  "sms",
  "email",
  "rcs",
  "voice",
  "push",
  "telegram",
];

/*
 * CLIENT MUST ALWAYS SEE THESE CHANNELS.
 *
 * This is independent of the permissions API.
 */
const CLIENT_ALWAYS_VISIBLE_CHANNELS = [
  "whatsapp-modules",
  "sms-modules",
  "email-modules",
  "rcs-modules",
  "voice-modules",
  "push-modules",
  "telegram-modules",
];

/* =========================================================
   CHANNEL GROUPS
 *
 * REQUIRED ORDER:
 *
 * WhatsApp
 * SMS
 * Email
 * RCS
 * Voice / OBD
 * Push
========================================================= */

const CHANNEL_GROUPS = [
  /* =======================================================
     WHATSAPP
  ======================================================= */

  {
    id: "whatsapp-modules",
    icon: FaWhatsapp,
    requiredPerm: "whatsapp",
    allowedRoles: CHANNEL_ROLES,
    label: t(
      "WhatsApp Services",
      "व्हाट्सएप सेवाएँ"
    ),

    submenu: [
      {
        id: "wa-templates",
        icon: FaFileAlt,
        path: "/authorized/whatsapp/templates",
        requiredPerm: "whatsapp",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Templates",
          "टेम्पलेट्स"
        ),
      },

      {
        id: "wa-responses",
        icon: FaComments,
        path: "/authorized/responses/whatsapp",
        requiredPerm: "whatsapp",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Responses",
          "रिस्पॉन्स"
        ),
      },

      {
        id: "wa-campaigns",
        icon: FaPaperPlane,
        path: "/authorized/whatsapp/campaigns",
        requiredPerm: "whatsapp",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "WhatsApp Campaigns",
          "व्हाट्सएप कैंपेन"
        ),
      },
    ],
  },

  /* =======================================================
     SMS
  ======================================================= */

  {
    id: "sms-modules",
    icon: FaCommentAlt,
    requiredPerm: "sms",
    allowedRoles: CHANNEL_ROLES,
    label: t(
      "SMS Services ",
      "एसएमएस सेवाएँ"
    ),

    submenu: [
      {
        id: "sms-templates",
        icon: FaFileAlt,
        path: "/authorized/sms/templates",
        requiredPerm: "sms",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Templates",
          "टेम्पलेट्स"
        ),
      },

      {
        id: "sms-sender-ids",
        icon: FaIdCard,
        path: "/authorized/config/from-ids?channel=SMS",
        requiredPerm: "sms",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Sender / From IDs",
          "सेंडर / From IDs"
        ),
      },

      {
        id: "sms-campaigns",
        icon: FaPaperPlane,
        path: "/authorized/sms/campaigns",
        requiredPerm: "sms",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "SMS Campaigns",
          "एसएमएस कैंपेन"
        ),
      },

      {
        id: "sms-unsubscribers",
        icon: FaUserSlash,
        path: "/authorized/campaigns/unsubscribers?channel=SMS",
        requiredPerm: "sms",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Unsubscribers (DND)",
          "Unsubscribers (DND)"
        ),
      },
    ],
  },

  /* =======================================================
     EMAIL
  ======================================================= */

  {
    id: "email-modules",
    icon: FaEnvelope,
    requiredPerm: "email",
    allowedRoles: CHANNEL_ROLES,
    label: t(
      "Email Services",
      "ईमेल सेवाएँ"
    ),

    submenu: [
      {
        id: "email-templates",
        icon: FaFileAlt,
        path: "/authorized/email/templates",
        requiredPerm: "email",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Templates",
          "टेम्पलेट्स"
        ),
      },

      {
        id: "email-sender-ids",
        icon: FaIdCard,
        path: "/authorized/config/from-ids?channel=EMAIL",
        requiredPerm: "email",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Sender / From IDs",
          "सेंडर / From IDs"
        ),
      },

      {
        id: "email-campaigns",
        icon: FaPaperPlane,
        path: "/authorized/email/campaigns",
        requiredPerm: "email",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Email Campaigns",
          "ईमेल कैंपेन"
        ),
      },

      {
        id: "email-unsubscribers",
        icon: FaUserSlash,
        path: "/authorized/campaigns/unsubscribers?channel=EMAIL",
        requiredPerm: "email",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Unsubscribers (DND)",
          "Unsubscribers (DND)"
        ),
      },
    ],
  },

  /* =======================================================
     RCS
  ======================================================= */

  {
    id: "rcs-modules",
    icon: FaComments,
    requiredPerm: "rcs",
    allowedRoles: CHANNEL_ROLES,
    label: t(
      "RCS Services",
      "आरसीएस सेवाएँ"
    ),

    submenu: [
      {
        id: "rcs-templates",
        icon: FaFileAlt,
        path: "/authorized/rcs/templates",
        requiredPerm: "rcs",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Templates",
          "टेम्पलेट्स"
        ),
      },

      {
        id: "rcs-responses",
        icon: FaComments,
        path: "/authorized/responses/rcs",
        requiredPerm: "rcs",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Responses",
          "रिस्पॉन्स"
        ),
      },

      {
        id: "rcs-campaigns",
        icon: FaPaperPlane,
        path: "/authorized/rcs/campaigns",
        requiredPerm: "rcs",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "RCS Campaigns",
          "आरसीएस कैंपेन"
        ),
      },
    ],
  },

  /* =======================================================
     VOICE / OBD
  ======================================================= */

  {
    id: "voice-modules",
    icon: FaPhoneAlt,
    requiredPerm: "voice",
    allowedRoles: CHANNEL_ROLES,
    label: t(
      "Voice / OBD Services",
      "वॉइस / OBD सेवाएँ"
    ),

    submenu: [
      {
        id: "voice-templates",
        icon: FaFileAlt,
        path: "/authorized/voice/templates",
        requiredPerm: "voice",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Templates",
          "टेम्पलेट्स"
        ),
      },

      {
        id: "voice-campaigns",
        icon: FaPaperPlane,
        path: "/authorized/voice/campaigns",
        requiredPerm: "voice",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Voice Campaigns",
          "वॉयस कैंपेन"
        ),
      },
    ],
  },

  /* =======================================================
     PUSH
  ======================================================= */

  {
    id: "push-modules",
    icon: FaBell,
    requiredPerm: "push",
    allowedRoles: CHANNEL_ROLES,
    label: t(
      "Push",
      "पुश"
    ),

    submenu: [
      {
        id: "push-campaigns",
        icon: FaPaperPlane,
        path: "/authorized/campaigns/all?channel=PUSH",
        requiredPerm: "push",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Push Campaigns",
          "पुश कैंपेन"
        ),
      },
    ],
  },

  /* =======================================================
     TELEGRAM
  ======================================================= */

  {
    id: "telegram-modules",
    icon: FaTelegramPlane,
    requiredPerm: "telegram",
    allowedRoles: CHANNEL_ROLES,
    label: t(
      "Telegram Services",
      "टेलीग्राम सेवाएँ"
    ),

    submenu: [
      {
        id: "telegram-templates",
        icon: FaFileAlt,
        path: "/authorized/telegram/templates",
        requiredPerm: "telegram",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Templates",
          "टेम्पलेट्स"
        ),
      },

      {
        id: "telegram-broadcasts",
        icon: FaPaperPlane,
        path: "/authorized/telegram/broadcasts",
        requiredPerm: "telegram",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Bulk Broadcasts",
          "बल्क ब्रॉडकास्ट"
        ),
      },

      {
        id: "telegram-gateway-otp",
        icon: FaShieldAlt,
        path: "/authorized/telegram/gateway-otp",
        requiredPerm: "telegram",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Gateway Phone OTP",
          "गेटवे फ़ोन ओटीपी"
        ),
      },

      {
        id: "telegram-bot-config",
        icon: FaRobot,
        path: "/authorized/telegram/bot-config",
        requiredPerm: "telegram",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "Bot Configuration",
          "बॉट कॉन्फ़िगरेशन"
        ),
      },

      {
        id: "telegram-docs",
        icon: FaBookOpen,
        path: "/authorized/telegram/docs",
        requiredPerm: "telegram",
        allowedRoles: CHANNEL_ROLES,
        label: t(
          "APIs & Docs",
          "एपीआई व दस्तावेज़"
        ),
      },
    ],
  },
];

/* =========================================================
   PLATFORM GROUPS
========================================================= */

const PLATFORM_GROUPS = [

  {
    id: "cms-modules",
    icon: FaNewspaper,
    allowedRoles: ADMIN_ROLES,
    label: t(
      "CMS - Modules",
      "cms - मॉड्यूल"
    ),

    submenu: [
      {
        id: "cms-updates",
        icon: FaBolt,
        path: "/authorized/new-updates",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Latest Updates",
          "लेटेस्ट अपडेट्स"
        ),
      },

      {
        id: "cms-quick-access",
        icon: FaBolt,
        path: "/authorized/quick-access",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Quick Access",
          "क्विक एक्सेस"
        ),
      },

      {
        id: "cms-categories",
        icon: FaListAlt,
        path: "/authorized/categories",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Categories",
          "कैटेगरी"
        ),
      },

      {
        id: "cms-pages",
        icon: FaPager,
        path: "/authorized/rich-content-pages",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Rich Content Pages",
          "रिच कंटेंट पेज"
        ),
      },

      {
        id: "cms-important-pages",
        icon: FaExclamationCircle,
        path: "/authorized/important-page-management",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Important Pages",
          "इंपोर्टेंट पेज"
        ),
      },

      {
        id: "cms-media",
        icon: FaFolderOpen,
        path: "/authorized/media-library",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Media Library",
          "मीडिया लाइब्रेरी"
        ),
      },

      {
        id: "cms-downloads",
        icon: FaDownload,
        path: "/authorized/download-management",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Downloads",
          "डाउनलोड्स"
        ),
      },

      {
        id: "cms-menu",
        icon: FaBars,
        path: "/authorized/menu",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Menu Management",
          "मेनू मैनेजमेंट"
        ),
      },

      {
        id: "cms-header",
        icon: FaWindowMaximize,
        path: "/authorized/header-management",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Header Management",
          "हेडर मैनेजमेंट"
        ),
      },

      {
        id: "cms-footer",
        icon: FaWindowMinimize,
        path: "/authorized/footer-section-manager",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Footer Management",
          "फूटर मैनेजमेंट"
        ),
      },

      {
        id: "cms-brands",
        icon: FaTags,
        path: "/authorized/brands",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Brands & Partners",
          "ब्रांड्स और पार्टनर्स"
        ),
      },

      {
        id: "cms-about",
        icon: FaFileAlt,
        path: "/authorized/about-section",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "About Section",
          "अबाउट सेक्शन"
        ),
      },

      {
        id: "cms-contacts",
        icon: FaAddressBook,
        path: "/authorized/contact-management",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Contact Info CMS",
          "कॉन्टैक्ट Info CMS"
        ),
      },

      {
        id: "cms-contact-cards",
        icon: FaIdCard,
        path: "/authorized/contact-card-management",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Contact Cards",
          "कॉन्टैक्ट कार्ड्स"
        ),
      },
    ],
  },

  {
    id: "system-security",
    icon: FaUserShield,
    allowedRoles: ADMIN_ROLES,
    label: t(
      "System & Security",
      "सिस्टम और सिक्योरिटी"
    ),

    submenu: [
      {
        id: "sec-activity-logs",
        icon: FaHistory,
        path: "/authorized/activity-logs",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Activity Logs",
          "एक्टिविटी लॉग्स"
        ),
      },

      {
        id: "sec-sessions",
        icon: FaUserShield,
        path: "/authorized/session-manager",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "User Sessions",
          "यूज़र सेशन्स"
        ),
      },

      {
        id: "sec-backup",
        icon: FaDatabase,
        path: "/authorized/database-backup",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Database Backup",
          "डेटाबेस बैकअप"
        ),
      },
    ],
  },
];

/* =========================================================
   SHARED GROUPS
========================================================= */

const SHARED_GROUPS = [
  {
    id: "campaigns-module",
    icon: FaLayerGroup,
    allowedRoles: TENANT_ROLES,
    label: t(
      "Campaigns & Audience",
      "कैंपेन और ऑडियंस"
    ),

    submenu: [
      {
        id: "camp-lists",
        icon: FaList,
        path: "/authorized/campaigns/lists",
        allowedRoles: TENANT_ROLES,
        label: t(
          "Audience & Contacts",
          "ऑडियंस और कॉन्टैक्ट"
        ),
      },

      {
        id: "camp-segments",
        icon: FaLayerGroup,
        path: "/authorized/campaigns/segments",
        allowedRoles: TENANT_ROLES,
        label: t(
          "Audience Segments",
          "ऑडियंस सेगमेंट"
        ),
      },

      {
        id: "camp-all",
        icon: FaPaperPlane,
        path: "/authorized/campaigns/all",
        allowedRoles: TENANT_ROLES,
        label: t(
          "All Campaigns",
          "सभी कैंपेन"
        ),
      },

      {
        id: "camp-bounces",
        icon: FaExclamationCircle,
        path: "/authorized/campaigns/bounces-spam",
        allowedRoles: TENANT_ROLES,
        label: t(
          "Bounces & SPAM",
          "बाउंस और SPAM"
        ),
      },
    ],
  },

  {
    id: "apis-modules",
    icon: FaExchangeAlt,
    allowedRoles: TENANT_ROLES,
    label: t(
      "APIs & Docs & Webhooks",
      "API और Docs और Webhooks"
    ),

    submenu: [
      {
        id: "api-dashboard",
        icon: FaChartPie,
        path: "/authorized/transactional/dashboard",
        allowedRoles: TENANT_ROLES,
        label: t(
          "API Dashboard",
          "API डैशबोर्ड"
        ),
      },

      {
        id: "api-keys",
        icon: FaKey,
        path: "/authorized/transactional/api-key",
        allowedRoles: TENANT_ROLES,
        label: t(
          "API Keys",
          "API Keys"
        ),
      },

      {
        id: "api-message-logs",
        icon: FaListUl,
        path: "/authorized/transactional/message-log",
        allowedRoles: TENANT_ROLES,
        label: t(
          "Message Logs",
          "मैसेज लॉग्स"
        ),
      },

      {
        id: "api-webhook-setup",
        icon: FaNetworkWired,
        path: "/authorized/transactional/webhook-setup",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Webhook Setup",
          "Webhook Setup"
        ),
      },

      {
        id: "api-webhook-logs",
        icon: FaHistory,
        path: "/authorized/transactional/webhook-logs",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Webhook Logs",
          "Webhook Logs"
        ),
      },

      {
        id: "api-doc",
        icon: FaBookOpen,
        path: "/authorized/transactional/api-doc",
        allowedRoles: TENANT_ROLES,
        label: t(
          "API Documentation",
          "API Documentation"
        ),
      },
    ],
  },

  {
    id: "account-settings",
    icon: FaUserCog,
    allowedRoles: ALL_ROLES,
    label: t(
      "Accounts Settings",
      "खाता सेटिंग्स"
    ),

    submenu: [
      {
        id: "acc-settings",
        icon: FaSlidersH,
        path: "/authorized/account/profile-settings",
        allowedRoles: ALL_ROLES,
        label: t(
          "My Profile & Settings",
          "मेरी प्रोफ़ाइल और सेटिंग्स"
        ),
      },
      {
        id: "acc-credits",
        icon: FaCoins,
        path: "/authorized/account/my-wallet",
        allowedRoles: [
          ROLES.RESELLER,
          ROLES.CLIENT,
          ROLES.MANAGER,
        ],
        label: t(
          "My Credit Wallet",
          "मेरा क्रेडिट वॉलेट"
        ),
      },
      {
        id: "acc-subscriptions",
        icon: FaCalendarCheck,
        path: "/authorized/account/subscriptions",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
          ROLES.RESELLER,
        ],
        label: t(
          "Subscriptions",
          "सब्सक्रिप्शन"
        ),
      },
      {
        id: "acc-sidebar-menus",
        icon: FaBars,
        path: "/authorized/sidebar-menu-management",
        allowedRoles: ADMIN_ROLES,
        label: t(
          "Sidebar Menus",
          "साइडबार मेनू"
        ),
      },
    ],
  },

  {
    id: "system-configurations",
    icon: FaCogs,
    allowedRoles: [
      ROLES.DEVOPS,
      ROLES.ADMIN,
      ROLES.RESELLER,
    ],
    label: t(
      "System Configurations",
      "सिस्टम विन्यास"
    ),

    submenu: [
      {
        id: "sys-config-communication",
        icon: FaCogs,
        path: "/authorized/config/communication",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
          ROLES.RESELLER,
        ],
        label: t(
          "Communication Config",
          "संचार विन्यास"
        ),
      },
      {
        id: "sys-config-channels",
        icon: FaBullhorn,
        path: "/authorized/settings/channels",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Channel Master",
          "चैनल मास्टर"
        ),
      },
      {
        id: "sys-config-channel-categories",
        icon: FaLayerGroup,
        path: "/authorized/settings/channel-categories",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Channel Category Master",
          "चैनल कैटेगरी मास्टर"
        ),
      },
      {
        id: "sys-config-providers",
        icon: FaNetworkWired,
        path: "/authorized/settings/providers",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Enterprise CPaaS Providers",
          "एंटरप्राइज प्रोवाइडर्स"
        ),
      },
      {
        id: "sys-config-api-catalog",
        icon: FaCode,
        path: "/authorized/settings/provider-api-catalogs",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Provider API Catalog",
          "प्रोवाइडर एपीआई कैटलॉग"
        ),
      },
    ],
  },

  {
    id: "credit-wallet-configurations",
    icon: FaCoins,
    allowedRoles: [
      ROLES.DEVOPS,
      ROLES.ADMIN,
    ],
    label: t(
      "Credit Wallet Configuration",
      "क्रेडिट वॉलेट विन्यास"
    ),

    submenu: [
      {
        id: "cw-accounts",
        icon: FaUsers,
        path: "/authorized/credits/accounts",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Credit Wallets Management",
          "क्रेडिट वॉलेट प्रबंधन"
        ),
      },
      {
        id: "cw-requests",
        icon: FaHourglassHalf,
        path: "/authorized/credits/requests",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Topup Requests Workflow",
          "टॉपअप अनुरोध वर्कफ़्लो"
        ),
      },
      {
        id: "cw-history",
        icon: FaHistory,
        path: "/authorized/credits/history",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Transactions & Deductions",
          "लेन-देन और कटौती इतिहास"
        ),
      },
      {
        id: "cw-pricing-plans",
        icon: FaTags,
        path: "/authorized/settings/credit-plans",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Credit Pricing Plans",
          "क्रेडिट प्राइसिंग प्लान्स"
        ),
      },
      {
        id: "cw-reports",
        icon: FaChartBar,
        path: "/authorized/credits/reports",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Platform Credit Analytics",
          "क्रेडिट एनालिटिक्स और रिपोर्ट"
        ),
      },
      {
        id: "cw-dlr-simulator",
        icon: FaExchangeAlt,
        path: "/authorized/credits/dlr-simulator",
        allowedRoles: [
          ROLES.DEVOPS,
          ROLES.ADMIN,
        ],
        label: t(
          "Carrier DLR Simulator",
          "कैरियर DLR सिम्युलेटर"
        ),
      },
    ],
  },

  {
    id: "support-feedback",
    icon: FaHeadset,
    allowedRoles:[
      ROLES.DEVOPS,
      ROLES.ADMIN,
      ROLES.RESELLER,
      ROLES.CLIENT,
      ROLES.MANAGER,
    ],
    label: t(
      "Support",
      "सहायता"
    ),

    submenu: [
      {
        id: "sup-feedbacks",
        icon: FaCommentDots,
        path: "/authorized/feedbacks",
        allowedRoles: [ROLES.DEVOPS,ROLES.ADMIN,],
        label: t(
          "Feedback Inbox",
          "फीडबैक इनबॉक्स"
        ),
      },

      {
        id: "sup-guidance",
        icon: FaHandsHelping,
        path: "/authorized/help-guidance",
        allowedRoles: [ROLES.DEVOPS,ROLES.ADMIN,],
        label: t(
          "Help Guidance",
          "हेल्प गाइडेंस"
        ),
      },

      {
        id: "sup-tutorials",
        icon: FaBookOpen,
        path: "/authorized/tutorials",
        allowedRoles: [ROLES.ADMIN, ROLES.RESELLER, ROLES.CLIENT, ROLES.MANAGER],
        label: t(
          "Video Tutorials",
          "वीडियो ट्यूटोरियल"
        ),
      },
    ],
  },
];

/* =========================================================
   FINAL DEFAULT SIDEBAR
========================================================= */

export const defaultSidebarMenus = [
  /* Dashboard */

  {
    id: "dashboard",
    icon: FaChartPie,
    path: "/authorized/dashboard",
    allowedRoles: TENANT_ROLES,
    label: t(
      "Dashboard",
      "डैशबोर्ड"
    ),
  },

  /*
   * CHANNELS
   *
   * WhatsApp
   * SMS
   * Email
   * RCS
   * Voice / OBD
   * Push
   */
  ...CHANNEL_GROUPS,

  /* Shared */
  ...SHARED_GROUPS,

  /* Admin */
  {
    id: "users-management",
    icon: FaUsers,
    path: "/authorized/users-management",
    allowedRoles: [
      ROLES.DEVOPS,
      ROLES.ADMIN,
      ROLES.RESELLER,
      ROLES.CLIENT,
    ],
    label: t(
      "Users Management",
      "यूज़र्स"
    ),
  },

  ...PLATFORM_GROUPS,
];

/* =========================================================
   PERMISSION CHECK
========================================================= */

export const isAllowed = (
  item,
  userRole,
  userPerms = []
) => {
  const role = normalizeRole(
    userRole
  );

  if (!role || !item) {
    return false;
  }

  /*
   * Disabled
   */
  if (item.isActive === false) {
    return false;
  }

  /*
   * =======================================================
   * CLIENT CHANNEL OVERRIDE
   *
   * CLIENT ALWAYS GETS THE FIVE MAIN CHANNELS.
   * =======================================================
   */

  if (
    role === ROLES.CLIENT &&
    CLIENT_ALWAYS_VISIBLE_CHANNELS.includes(
      String(item.id)
    )
  ) {
    return true;
  }

  /*
   * CLIENT CHANNEL CHILDREN
   *
   * If the child belongs to one of the five channels,
   * allow it too.
   */

  if (
    role === ROLES.CLIENT &&
    CHANNEL_PERMISSIONS.includes(
      normalizePermission(
        item.requiredPerm
      )
    )
  ) {
    return true;
  }

  /*
   * =======================================================
   * ROLE CHECK
   * =======================================================
   */

  const allowedRoles =
    normalizeRoles(
      item.allowedRoles
    );

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    return false;
  }

  /*
   * =======================================================
   * ADMIN / DEVOPS
   * =======================================================
   */

  if (
    ADMIN_ROLES.includes(role)
  ) {
    return true;
  }

  /*
   * =======================================================
   * PERMISSION CHECK
   * =======================================================
   */

  if (item.requiredPerm) {
    const permissions =
      normalizePermissions(
        userPerms
      );

    const required =
      normalizePermission(
        item.requiredPerm
      );

    if (
      !permissions.includes(
        required
      )
    ) {
      return false;
    }
  }

  return true;
};

/* =========================================================
   FILTER MENU
========================================================= */

export const filterMenu = (
  menu,
  userRole,
  userPerms = []
) => {
  if (!Array.isArray(menu)) {
    return [];
  }

  return menu.reduce(
    (result, item) => {
      /*
       * Parent check
       */
      if (
        !isAllowed(
          item,
          userRole,
          userPerms
        )
      ) {
        return result;
      }

      /*
       * Group
       */
      if (
        Array.isArray(
          item.submenu
        )
      ) {
        const visibleChildren =
          item.submenu.filter(
            (child) =>
              isAllowed(
                child,
                userRole,
                userPerms
              )
          );

        /*
         * Empty group should not show.
         */
        if (
          visibleChildren.length === 0
        ) {
          return result;
        }

        result.push({
          ...item,

          icon: resolveIcon(
            item.icon
          ),

          label: resolveLabel(
            item.label,
            item.id
          ),

          submenu:
            visibleChildren.map(
              (child) => ({
                ...child,

                icon: resolveIcon(
                  child.icon
                ),

                label: resolveLabel(
                  child.label,
                  child.id
                ),
              })
            ),
        });

        return result;
      }

      /*
       * Leaf
       */
      if (!item.path) {
        return result;
      }

      result.push({
        ...item,

        icon: resolveIcon(
          item.icon
        ),

        label: resolveLabel(
          item.label,
          item.id
        ),
      });

      return result;
    },
    []
  );
};

/* =========================================================
   MENU OVERRIDE HELPERS
========================================================= */

const getId = (item) =>
  String(
    item?.id ??
      item?._id ??
      ""
  ).trim();

const getOrder = (
  value,
  fallback
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

/* =========================================================
   MERGE DB OVERRIDES
========================================================= */

export const mergeMenuOverrides = (
  baseMenu,
  overrides = []
) => {
  if (!Array.isArray(baseMenu)) {
    return [];
  }

  const rows = Array.isArray(
    overrides
  )
    ? overrides
    : [];

  const byId = new Map();

  const register = (row) => {
    const id = getId(row);

    if (id) {
      byId.set(id, row);
    }

    if (
      Array.isArray(row?.submenu)
    ) {
      row.submenu.forEach(register);
    }
  };

  rows.forEach(register);

  const mergeItem = (
    item,
    index
  ) => {
    const override =
      byId.get(
        String(item.id)
      );

    const merged = {
      ...item,

      icon: resolveIcon(
        override?.icon ??
          item.icon
      ),

      label: resolveLabel(
        override?.label ??
          item.label,
        item.id
      ),

      order: getOrder(
        override?.order,
        getOrder(
          item.order,
          index
        )
      ),

      isActive:
        override?.isActive === false
          ? false
          : item.isActive !== false,

      allowedRoles:
        Array.isArray(
          override?.allowedRoles
        ) &&
        override.allowedRoles.length
          ? normalizeRoles(
              override.allowedRoles
            )
          : item.allowedRoles,

      requiredPerm:
        override?.requiredPerm !==
        undefined
          ? override.requiredPerm ||
            null
          : item.requiredPerm,
    };

    /*
     * Children
     */
    if (
      Array.isArray(
        item.submenu
      )
    ) {
      const existingIds =
        new Set(
          item.submenu.map(
            (child) =>
              String(child.id)
          )
        );

      let children =
        item.submenu
          .map(
            (child, childIndex) =>
              mergeItem(
                child,
                childIndex
              )
          )
          .filter(
            (child) =>
              child.isActive !==
              false
          );

      /*
       * DB-added children
       */
      const dbChildren =
        Array.isArray(
          override?.submenu
        )
          ? override.submenu
          : [];

      dbChildren.forEach(
        (child) => {
          const childId =
            getId(child);

          if (!childId) {
            return;
          }

          if (
            existingIds.has(
              childId
            )
          ) {
            return;
          }

          if (
            child.isActive === false
          ) {
            return;
          }

          if (!child.path) {
            return;
          }

          children.push({
            id: childId,

            icon: resolveIcon(
              child.icon,
              merged.icon
            ),

            path: child.path,

            order: getOrder(
              child.order,
              children.length
            ),

            label: resolveLabel(
              child.label ?? {
                en:
                  child.labelEn ??
                  child.name ??
                  childId,

                hi:
                  child.labelHi ??
                  child.labelEn ??
                  child.name ??
                  childId,
              },
              childId
            ),

            allowedRoles:
              Array.isArray(
                child.allowedRoles
              ) &&
              child.allowedRoles.length
                ? normalizeRoles(
                    child.allowedRoles
                  )
                : merged.allowedRoles,

            requiredPerm:
              child.requiredPerm ??
              null,

            isActive: true,
          });
        }
      );

      children.sort(
        (a, b) =>
          getOrder(a.order, 0) -
          getOrder(b.order, 0)
      );

      merged.submenu =
        children;
    }

    return merged;
  };

  const merged =
    baseMenu
      .map(
        (item, index) =>
          mergeItem(
            item,
            index
          )
      )
      .filter(
        (item) =>
          item.isActive !== false
      );

  merged.sort(
    (a, b) =>
      getOrder(a.order, 0) -
      getOrder(b.order, 0)
  );

  return merged;
};

/* =========================================================
   MENU DIAGNOSTICS
========================================================= */

export const getMenuDiagnostics = (
  baseMenu,
  overrides = []
) => {
  const knownIds =
    new Set();

  const walk = (items) => {
    if (!Array.isArray(items)) {
      return;
    }

    items.forEach((item) => {
      const id = getId(item);

      if (id) {
        knownIds.add(id);
      }

      if (
        Array.isArray(
          item.submenu
        )
      ) {
        walk(item.submenu);
      }
    });
  };

  walk(baseMenu);

  const overrideIds =
    new Set();

  const collect = (items) => {
    if (!Array.isArray(items)) {
      return;
    }

    items.forEach((item) => {
      const id = getId(item);

      if (id) {
        overrideIds.add(id);
      }

      if (
        Array.isArray(
          item.submenu
        )
      ) {
        collect(item.submenu);
      }
    });
  };

  collect(overrides);

  const orphans =
    [...overrideIds].filter(
      (id) =>
        !knownIds.has(id)
    );

  return {
    knownIds,
    orphans,
  };
};

/* =========================================================
   EXPORTS
========================================================= */

export {
  CHANNEL_GROUPS,
  PLATFORM_GROUPS,
  SHARED_GROUPS,
  ALL_ROLES,
  ADMIN_ROLES,
  TENANT_ROLES,
  CHANNEL_ROLES,
  CLIENT_ALWAYS_VISIBLE_CHANNELS,
};

export default defaultSidebarMenus;