<template>
  <teleport to="body">
    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`]"
          @click="removeToast(toast.id)"
        >
          <i :class="getIcon(toast.type)" class="toast-icon"></i>
          <span class="toast-message">{{ toast.message }}</span>
          <i class="bi bi-x toast-close"></i>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();

const getIcon = (type) => {
  const icons = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-x-circle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    info: 'bi bi-info-circle-fill',
  };
  return icons[type] || icons.info;
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  min-width: 300px;
  animation: slideIn 0.3s ease;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.toast-close {
  font-size: 18px;
  color: #666;
  flex-shrink: 0;
}

.toast-success {
  border-left: 4px solid #28a745;
}

.toast-success .toast-icon {
  color: #28a745;
}

.toast-error {
  border-left: 4px solid #e70d0c;
}

.toast-error .toast-icon {
  color: #e70d0c;
}

.toast-warning {
  border-left: 4px solid #ffc107;
}

.toast-warning .toast-icon {
  color: #ffc107;
}

.toast-info {
  border-left: 4px solid #17a2b8;
}

.toast-info .toast-icon {
  color: #17a2b8;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .toast-container {
    right: 12px;
    left: 12px;
    top: 12px;
  }

  .toast {
    min-width: unset;
  }
}
</style>
