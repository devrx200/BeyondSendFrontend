import Swal from "sweetalert2";

/**
 * Centralized SweetAlert wrappers used across the admin panel.
 * Keeps the look-and-feel consistent and replaces native window.alert calls.
 */

const baseTheme = {
  buttonsStyling: true,
  customClass: {
    popup: "adm-swal-popup",
    confirmButton: "btn btn-primary adm-swal-btn-confirm",
    cancelButton: "btn btn-outline-secondary adm-swal-btn-cancel",
    denyButton: "btn btn-danger adm-swal-btn-deny"
  }
};

/**
 * Ask the user to confirm a destructive delete action.
 * Usage:
 *   const ok = await confirmDelete();
 *   if (!ok) return;
 *   await api.delete(...);
 */
export const confirmDelete = async (opts = {}) => {
  const {
    title = "Are you sure?",
    text = "This action cannot be undone.",
    confirmButtonText = "Yes, delete it",
    cancelButtonText = "Cancel"
  } = opts;

  const result = await Swal.fire({
    ...baseTheme,
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      ...baseTheme.customClass,
      confirmButton: "btn btn-danger adm-swal-btn-deny"
    }
  });

  return result.isConfirmed;
};

/**
 * Generic confirmation (non-destructive).
 */
export const confirmAction = async (opts = {}) => {
  const {
    title = "Please confirm",
    text = "",
    confirmButtonText = "Yes, continue",
    cancelButtonText = "Cancel",
    icon = "question"
  } = opts;

  const result = await Swal.fire({
    ...baseTheme,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true
  });

  return result.isConfirmed;
};

/** Success toast */
export const swalSuccess = (title = "Success", text = "") =>
  Swal.fire({
    ...baseTheme,
    title,
    text,
    icon: "success",
    timer: 1800,
    showConfirmButton: false
  });

/** Error toast */
export const swalError = (title = "Error", text = "") =>
  Swal.fire({
    ...baseTheme,
    title,
    text,
    icon: "error"
  });

/** Warning / validation alert (replacement for native alert) */
export const swalWarn = (title = "Notice", text = "") =>
  Swal.fire({
    ...baseTheme,
    title,
    text,
    icon: "warning"
  });

/** Info alert */
export const swalInfo = (title = "Information", text = "") =>
  Swal.fire({
    ...baseTheme,
    title,
    text,
    icon: "info"
  });

export default {
  confirmDelete,
  confirmAction,
  swalSuccess,
  swalError,
  swalWarn,
  swalInfo
};
