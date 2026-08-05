import React, { useState, useCallback, useEffect, useRef } from "react";
import Swal from "sweetalert2";

const T = {
  green: "var(--wp-green,   #00a32a)",
  greenBg: "var(--wp-green-bg,#edfaef)",
  red: "var(--wp-red,     #d63638)",
  redBg: "var(--wp-red-bg,  #fcf0f1)",
  orange: "var(--wp-orange,  #dba617)",
  orangeBg: "var(--wp-orange-bg,#fcf9e8)",
  blue: "var(--wp-blue,    #2271b1)",
  blueBg: "var(--wp-blue-bg, #f0f6fc)",
  text: "var(--wp-text,    #1d2327)",
  textMid: "var(--wp-text-mid,#50575e)",
  line: "var(--wp-line,    #dcdcde)",
  white: "var(--wp-white,   #ffffff)",
  font: "var(--wp-font,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif)",
};

const ICONS = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const COLORS = {
  success: { bg: T.greenBg, border: T.green, icon: T.green },
  error: { bg: T.redBg, border: T.red, icon: T.red },
  warning: { bg: T.orangeBg, border: T.orange, icon: T.orange },
  info: { bg: T.blueBg, border: T.blue, icon: T.blue },
};

/* ── Single Toast Card ──────────────────────────────────────── */
const ToastCard = React.memo(({ id, type = "info", message, onRemove }) => {
  const c = COLORS[type] || COLORS.info;
  const [vis, setVis] = useState(false);
  const [out, setOut] = useState(false);

  useEffect(() => { const t = setTimeout(() => setVis(true), 12); return () => clearTimeout(t); }, []);

  const dismiss = useCallback(() => {
    setOut(true);
    setTimeout(() => onRemove(id), 300);
  }, [id, onRemove]);

  return (
    <div
      role="alert"
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: "#fff",
        border: `1px solid ${T.line}`,
        borderLeft: `4px solid ${c.border}`,
        borderRadius: 6,
        padding: "10px 14px 10px 12px",
        boxShadow: "0 4px 18px rgba(0,0,0,.13)",
        fontFamily: T.font,
        minWidth: 280, maxWidth: 380,
        transform: vis && !out ? "translateX(0)" : "translateX(48px)",
        opacity: vis && !out ? 1 : 0,
        transition: "transform .28s cubic-bezier(.21,1.02,.73,1), opacity .28s ease",
        willChange: "transform,opacity",
        pointerEvents: "auto",
      }}
    >
      {/* Icon circle */}
      <span style={{
        width: 28, height: 28, borderRadius: "50%",
        background: c.icon, color: "#fff",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, flexShrink: 0, lineHeight: 1,
      }}>
        {ICONS[type]}
      </span>

      {/* Message */}
      <span style={{ flex: 1, fontSize: 13, color: T.text, lineHeight: 1.4 }}>
        {message}
      </span>

      {/* Close */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: T.textMid, fontSize: 18, lineHeight: 1,
          padding: "2px 4px", marginLeft: 4, opacity: .55,
          transition: "opacity .15s", flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={e => (e.currentTarget.style.opacity = .55)}
      >
        ×
      </button>
    </div>
  );
});

/* ── Container ──────────────────────────────────────────────── */
export const ToastContainer = React.memo(({ toasts, onRemove }) => {
  if (!toasts?.length) return null;
  return (
    <div
      aria-label="Notifications"
      style={{
        position: "fixed", bottom: 24, right: 24,
        zIndex: 99999,
        display: "flex", flexDirection: "column", gap: 10,
        pointerEvents: "none",
      }}
    >
      {toasts.map(t => <ToastCard key={t.id} {...t} onRemove={onRemove} />)}
    </div>
  );
});

/* ── useToast hook ──────────────────────────────────────────── */
let _uid = 0;

export const useToast = (autoClose = 4500) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const add = useCallback((type, message) => {
    const id = ++_uid;
    setToasts(prev => [...prev, { id, type, message }]);
    if (autoClose > 0) {
      timers.current[id] = setTimeout(() => remove(id), autoClose);
    }
    return id;
  }, [autoClose, remove]);

  useEffect(() => {
    const ts = timers.current;
    return () => Object.values(ts).forEach(clearTimeout);
  }, []);

  const toast = {
    success: (msg) => add("success", msg),
    error: (msg) => add("error", msg),
    warning: (msg) => add("warning", msg),
    info: (msg) => add("info", msg),
    remove,
  };

  return { toasts, toast };
};

/* ── wpSwal helpers (Swal with WP theme) ────────────────────── */
const SWAL_BASE = {
  customClass: {
    popup: "wp-swal-popup",
    confirmButton: "wp-swal-btn-danger",
    cancelButton: "wp-swal-btn-cancel",
  },
  buttonsStyling: false,
  reverseButtons: true,
};

export const wpSwal = {
  confirm: async (title, text = "", confirmLabel = "Confirm", cancelLabel = "Cancel") => {
    const r = await Swal.fire({
      ...SWAL_BASE,
      icon: "warning", title,
      html: text ? `<span style="font-size:13px;color:#50575e">${text}</span>` : undefined,
      showCancelButton: true,
      confirmButtonText: confirmLabel,
      cancelButtonText: cancelLabel,
    });
    return r.isConfirmed;
  },

  ok: (title = "Done!") =>
    Swal.fire({ ...SWAL_BASE, icon: "success", title, timer: 1600, showConfirmButton: false }),

  error: (title = "Error", text = "") =>
    Swal.fire({
      ...SWAL_BASE, icon: "error", title,
      html: text ? `<span style="font-size:13px;color:#50575e">${text}</span>` : undefined,
    }),
};

export default useToast;
