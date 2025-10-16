<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import ToastNotification from './components/ToastNotification.vue';

const authStore = useAuthStore();

onMounted(() => {
  // Verifica se há token salvo
  if (authStore.token) {
    authStore.fetchUser().catch(() => {
      // Se falhar ao buscar usuário, faz logout
      authStore.logout();
    });
  }
});
</script>

<template>
  <div id="app">
    <router-view />
    <ToastNotification />
  </div>
</template>

<style>
/* Global styles movidos para style.css */
</style>
