import { ref } from 'vue';

const toasts = ref([]);
let idCounter = 0;

export function useToast() {
  const showToast = (message, type = 'success') => {
    const id = idCounter++;
    const toast = { id, message, type };
    toasts.value.push(toast);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message) => showToast(message, 'success');
  const error = (message) => showToast(message, 'error');
  const warning = (message) => showToast(message, 'warning');
  const info = (message) => showToast(message, 'info');

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
