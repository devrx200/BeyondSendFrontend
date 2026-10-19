import React from "react";
import { toast as rtToast, ToastContainer as RTToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

// Attach Swal to window so any component calling Swal.fire() directly never throws ReferenceError
if (typeof window !== "undefined") {
  window.Swal = Swal;
}

export { Swal };

/**
 * Universal dynamic toast notification interface powered by react-toastify.
 * Configured to display on bottom-right with smooth animations and hover controls.
 */
const defaultToastOptions = {
  position: "bottom-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored",
};

export const toast = Object.assign(
  (msg, options = {}) => rtToast(msg, { ...defaultToastOptions, ...options }),
  {
    success: (msg, options = {}) =>
      rtToast.success(msg, { ...defaultToastOptions, ...options }),
    error: (msg, options = {}) =>
      rtToast.error(msg, { ...defaultToastOptions, ...options }),
    warning: (msg, options = {}) =>
      rtToast.warning(msg, { ...defaultToastOptions, ...options }),
    warn: (msg, options = {}) =>
      rtToast.warn(msg, { ...defaultToastOptions, ...options }),
    info: (msg, options = {}) =>
      rtToast.info(msg, { ...defaultToastOptions, ...options }),
    dismiss: (id) => rtToast.dismiss(id),
    isActive: (id) => rtToast.isActive(id),
    update: (id, options) => rtToast.update(id, options),
    done: (id) => rtToast.done(id),
    promise: (promise, msgs, options) =>
      rtToast.promise(promise, msgs, { ...defaultToastOptions, ...options }),
    remove: (id) => rtToast.dismiss(id),
  }
);

/**
 * Backward-compatible hook for components that destructure { toasts, toast } = useToast()
 */
export const useToast = () => {
  return {
    toasts: [],
    toast,
  };
};

/**
 * Singleton Guarded ToastContainer:
 * Ensures only ONE instance is ever rendered into the DOM,
 * positioned at bottom-right with smooth, responsive behavior.
 */
let isContainerMounted = false;

export const ToastContainer = (props) => {
  const [canRender, setCanRender] = React.useState(false);

  React.useEffect(() => {
    if (!isContainerMounted) {
      isContainerMounted = true;
      setCanRender(true);
      return () => {
        isContainerMounted = false;
      };
    }
  }, []);

  if (!canRender) return null;

  return (
    <RTToastContainer
      position="bottom-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      style={{ zIndex: 9999999 }}
      {...props}
    />
  );
};

/* ── wpSwal helpers (Modern SaaS Pro dialogs) ────────────────────── */
export const wpSwal = {
  confirm: async (title, text = "", confirmLabel = "Confirm", cancelLabel = "Cancel", actionType = "auto") => {
    let type = actionType;
    if (type === "auto") {
      const lower = `${title} ${text} ${confirmLabel}`.toLowerCase();
      if (
        lower.includes("delete") ||
        lower.includes("remove") ||
        lower.includes("reset") ||
        lower.includes("reject") ||
        lower.includes("revoke") ||
        lower.includes("destroy")
      ) {
        type = "danger";
      } else if (
        lower.includes("approve") ||
        lower.includes("restore") ||
        lower.includes("activate") ||
        lower.includes("unlock") ||
        lower.includes("success")
      ) {
        type = "success";
      } else {
        type = "primary";
      }
    }

    const confirmClass =
      type === "danger"
        ? "adm-swal-btn-danger"
        : type === "success"
        ? "adm-swal-btn-success"
        : "adm-swal-btn-primary";

    const iconType = type === "danger" ? "warning" : type === "success" ? "question" : "info";

    const r = await Swal.fire({
      customClass: {
        popup: "adm-swal-popup",
        title: "adm-swal-title",
        htmlContainer: "adm-swal-html",
        actions: "adm-swal-actions",
        confirmButton: confirmClass,
        cancelButton: "adm-swal-btn-cancel",
      },
      buttonsStyling: false,
      icon: iconType,
      title,
      html: text ? `<div style="font-size:13.5px;line-height:1.55;color:#475569;">${text}</div>` : undefined,
      showCancelButton: true,
      confirmButtonText: confirmLabel,
      cancelButtonText: cancelLabel,
      reverseButtons: true,
      focusCancel: true,
      backdrop: "rgba(15, 23, 42, 0.45)",
    });

    return r.isConfirmed;
  },

  alert: async (title, text = "", icon = "info") => {
    await Swal.fire({
      customClass: {
        popup: "adm-swal-popup",
        title: "adm-swal-title",
        htmlContainer: "adm-swal-html",
        actions: "adm-swal-actions",
        confirmButton: "adm-swal-btn-primary",
      },
      buttonsStyling: false,
      icon,
      title,
      html: text ? `<div style="font-size:13.5px;line-height:1.55;color:#475569;">${text}</div>` : undefined,
      confirmButtonText: "Okay",
      backdrop: "rgba(15, 23, 42, 0.45)",
    });
  },

  prompt: async (title, inputPlaceholder = "", initialValue = "", confirmLabel = "Save") => {
    const r = await Swal.fire({
      customClass: {
        popup: "adm-swal-popup",
        title: "adm-swal-title",
        htmlContainer: "adm-swal-html",
        actions: "adm-swal-actions",
        confirmButton: "adm-swal-btn-primary",
        cancelButton: "adm-swal-btn-cancel",
        input: "adm-swal-input",
      },
      buttonsStyling: false,
      title,
      input: "text",
      inputValue: initialValue,
      inputPlaceholder,
      showCancelButton: true,
      confirmButtonText: confirmLabel,
      cancelButtonText: "Cancel",
      reverseButtons: true,
      backdrop: "rgba(15, 23, 42, 0.45)",
    });

    return r.isConfirmed ? r.value : null;
  },
};

export default toast;
