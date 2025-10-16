<template>
  <div class="estatisticas-page">
    <AppHeader />
    
    <div class="container">
      <div class="page-header">
        <div>
          <h1>Estatísticas</h1>
          <p>Visualize dados e métricas dos parceiros</p>
        </div>
      </div>

      <LoadingOverlay :show="loading" />

      <!-- Cards de Totais -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e70d0c20; color: #e70d0c;">
            <i class="bi bi-people"></i>
          </div>
          <div class="stat-content">
            <h3>{{ auditores.length }}</h3>
            <p>Total de Parceiros</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #28a74520; color: #28a745;">
            <i class="bi bi-person-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ aptosCount }}</h3>
            <p>Aptos para Auditoria</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #17a2b820; color: #17a2b8;">
            <i class="bi bi-file-earmark-text"></i>
          </div>
          <div class="stat-content">
            <h3>{{ normas.length }}</h3>
            <p>Normas Cadastradas</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #6c757d20; color: #6c757d;">
            <i class="bi bi-geo-alt"></i>
          </div>
          <div class="stat-content">
            <h3>{{ estadosCount }}</h3>
            <p>Estados com Parceiros</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #007bff20; color: #007bff;">
            <i class="bi bi-person-badge"></i>
          </div>
          <div class="stat-content">
            <h3>{{ revisoresCount }}</h3>
            <p>Revisores Ativos</p>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>
            <i class="bi bi-bar-chart"></i>
            Parceiros por Norma
          </h3>
          <div class="chart-container">
            <Bar :data="chartNormasData" :options="chartOptions" />
          </div>
        </div>

        <div class="chart-card">
          <h3>
            <i class="bi bi-geo-alt"></i>
            Parceiros por Estado (Top 10)
          </h3>
          <div class="chart-container">
            <Bar :data="chartEstadosData" :options="chartOptions" />
          </div>
        </div>

        <div class="chart-card">
          <h3>
            <i class="bi bi-person-check"></i>
            Parceiros por Status
          </h3>
          <div class="chart-container">
            <Doughnut :data="chartStatusData" :options="doughnutOptions" />
          </div>
        </div>

        <div class="chart-card">
          <h3>
            <i class="bi bi-person-badge"></i>
            Revisores vs Não Revisores
          </h3>
          <div class="chart-container">
            <Doughnut :data="chartRevisoresData" :options="doughnutOptions" />
          </div>
        </div>
      </div>

      <!-- Gráfico de NACEs (full width) -->
      <div class="chart-card chart-full">
        <h3>
          <i class="bi bi-bookmark"></i>
          Parceiros por NACE (Top 15)
        </h3>
        <div class="chart-container-large">
          <Bar :data="chartNacesData" :options="chartOptionsHorizontal" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuditoresStore } from '../stores/auditores';
import { useNormasStore } from '../stores/normas';
import { useNacesStore } from '../stores/naces';
import AppHeader from '../components/AppHeader.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const auditoresStore = useAuditoresStore();
const normasStore = useNormasStore();
const nacesStore = useNacesStore();

const loading = ref(false);

const auditores = computed(() => auditoresStore.auditores);
const normas = computed(() => normasStore.normas);
const naces = computed(() => nacesStore.naces);

// Contadores para cards
const aptosCount = computed(() => {
  return auditores.value.filter(a => a.auditorStatus === 'aptoAuditoria').length;
});

const estadosCount = computed(() => {
  const estados = new Set(auditores.value.map(a => a.estado).filter(Boolean));
  return estados.size;
});

const revisoresCount = computed(() => {
  return auditores.value.filter(a => a.revisor === true).length;
});

// Função para abreviar nomes de normas
const abreviarNorma = (norma) => {
  return norma
    .replace(/^ISO\/IEC\s*/i, '')
    .replace(/^ISO\s*/i, '')
    .split(/[\s-]/)[0];
};

// Função para obter label de status
const getStatusLabel = (status) => {
  if (!status) return 'Sem Status';
  const labels = {
    aptoAuditoria: 'Apto Auditoria',
    emFormacao: 'Em Formação',
    primeiraAuditoria: 'Primeira Auditoria',
    auditorInativo: 'Auditor Inativo',
  };
  return labels[status] || status;
};

// Dados dos gráficos
const chartNormasData = computed(() => {
  const normaCount = {};
  
  auditores.value.forEach(auditor => {
    auditor.Normas?.forEach(norma => {
      const normaObj = normas.value.find(n => String(n.id) === String(norma.normaId));
      if (normaObj) {
        const abrev = abreviarNorma(normaObj.norma);
        normaCount[abrev] = (normaCount[abrev] || 0) + 1;
      }
    });
  });

  return {
    labels: Object.keys(normaCount),
    datasets: [{
      label: 'Parceiros',
      data: Object.values(normaCount),
      backgroundColor: '#e70d0c',
      borderColor: '#c00b0a',
      borderWidth: 1,
    }]
  };
});

const chartEstadosData = computed(() => {
  const estadoCount = {};
  
  auditores.value.forEach(auditor => {
    if (auditor.estado) {
      estadoCount[auditor.estado] = (estadoCount[auditor.estado] || 0) + 1;
    }
  });

  const sorted = Object.entries(estadoCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return {
    labels: sorted.map(([estado]) => estado),
    datasets: [{
      label: 'Parceiros',
      data: sorted.map(([, count]) => count),
      backgroundColor: '#e70d0c',
      borderColor: '#c00b0a',
      borderWidth: 1,
    }]
  };
});

const chartStatusData = computed(() => {
  const statusCount = {
    'Sem Status': 0,
    'Apto Auditoria': 0,
    'Em Formação': 0,
    'Primeira Auditoria': 0,
    'Auditor Inativo': 0,
  };
  
  auditores.value.forEach(auditor => {
    const label = getStatusLabel(auditor.auditorStatus);
    statusCount[label] = (statusCount[label] || 0) + 1;
  });

  return {
    labels: Object.keys(statusCount),
    datasets: [{
      data: Object.values(statusCount),
      backgroundColor: [
        '#6c757d', // Sem Status (cinza)
        '#28a745', // Apto Auditoria (verde)
        '#ffc107', // Em Formação (amarelo)
        '#17a2b8', // Primeira Auditoria (azul)
        '#dc3545', // Auditor Inativo (vermelho)
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  };
});

const chartRevisoresData = computed(() => {
  const revisores = auditores.value.filter(a => a.revisor === true).length;
  const naoRevisores = auditores.value.length - revisores;

  return {
    labels: ['Revisores', 'Não Revisores'],
    datasets: [{
      data: [revisores, naoRevisores],
      backgroundColor: [
        '#007bff', // Azul para revisores
        '#6c757d', // Cinza para não revisores
      ],
      borderWidth: 2,
      borderColor: '#fff',
    }]
  };
});

const chartNacesData = computed(() => {
  const naceCount = {};
  
  auditores.value.forEach(auditor => {
    auditor.Nace?.forEach(nace => {
      const naceObj = naces.value.find(n => String(n.id) === String(nace.naceId));
      if (naceObj) {
        const label = `${naceObj.nace}`;
        naceCount[label] = (naceCount[label] || 0) + 1;
      }
    });
  });

  const sorted = Object.entries(naceCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  return {
    labels: sorted.map(([nace]) => nace),
    datasets: [{
      label: 'Parceiros',
      data: sorted.map(([, count]) => count),
      backgroundColor: '#17a2b8',
      borderColor: '#138496',
      borderWidth: 1,
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      left: 5,
      right: 5,
      top: 5,
      bottom: 5
    }
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        font: {
          size: 10
        }
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      }
    }
  }
};

const chartOptionsHorizontal = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 0,
      bottom: 0
    }
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      }
    },
    y: {
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        minRotation: 0,
        font: {
          size: 11
        }
      }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 10,
        font: {
          size: 11
        }
      }
    },
  },
};

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      auditoresStore.fetchAuditores(),
      normasStore.fetchNormas(),
      nacesStore.fetchNaces(),
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.estatisticas-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 32px 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #001e66;
  margin: 0 0 4px 0;
}

.page-header p {
  font-size: 15px;
  color: #666;
  margin: 0;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.stat-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-card.chart-full {
  grid-column: 1 / -1;
}

.chart-card h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.chart-container {
  height: 300px;
  position: relative;
  overflow: hidden;
}

.chart-container-large {
  height: 500px;
  position: relative;
  overflow: hidden;
}

/* Responsividade */
@media (max-width: 1400px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .stat-content h3 {
    font-size: 24px;
  }

  .chart-container {
    height: 250px;
  }

  .chart-container-large {
    height: 400px;
  }
}
</style>
