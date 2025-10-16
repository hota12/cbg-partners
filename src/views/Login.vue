<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="../../public/logo.svg" alt="CBG Certificadora" class="login-logo" />
          <p>Faça login para acessar o sistema</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">
              <i class="bi bi-envelope"></i>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              v-model="form.email"
              placeholder="seu@email.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">
              <i class="bi bi-lock"></i>
              Senha
            </label>
            <div class="password-input">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                placeholder="••••••••"
                required
                :disabled="loading"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :disabled="loading"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            <i class="bi bi-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <ButtonLoader
            type="submit"
            variant="primary"
            :loading="loading"
            class="login-btn"
          >
            <i class="bi bi-box-arrow-in-right"></i>
            Entrar
          </ButtonLoader>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import ButtonLoader from '../components/ButtonLoader.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: '',
});

const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await authStore.login(form.value.email, form.value.password);
    
    if (result.success) {
      router.push('/');
    } else {
      errorMessage.value = result.message;
    }
  } catch (error) {
    errorMessage.value = 'Erro ao fazer login. Tente novamente.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(/path6.svg) right 32px top 32px / 40% auto no-repeat, 
              linear-gradient(251deg, #001e66 3.88%, #000a38 91.63%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: white;
  border-radius: 8px;
  padding: 48px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-logo {
  height: 40px;
  width: auto;
  margin-bottom: 24px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #001e66;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 15px;
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-group label i {
  color: #e70d0c;
  font-size: 16px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  font-family: 'Red Hat Text', sans-serif;
}

.form-group input:focus {
  outline: none;
  border-color: #e70d0c;
  box-shadow: 0 0 0 3px rgba(231, 13, 12, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #e70d0c;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c00;
  font-size: 14px;
}

.error-message i {
  font-size: 18px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  font-size: 16px;
}

@media (max-width: 576px) {
  .login-card {
    padding: 32px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-logo {
    height: 50px;
  }
}
</style>
