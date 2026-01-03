const API_URL = 'http://localhost:3000/api';

async function saveTransaction() {
  // Obtener token de autenticación
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    showMessage('❌ Sesión expirada. Por favor inicia sesión nuevamente.', 'error');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 2000);
    return;
  }
  
  // Selectores por ID
  const type = document.querySelector('input[name="transaction-type"]:checked').value.toLowerCase();
  const concept = document.getElementById('concept').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const currency = document.getElementById('currency').value;
  const category = document.getElementById('category').value;
  const subcategory = document.getElementById('subcategory').value;
  const date = document.getElementById('date').value;

  // Validación básica
  if (!concept || concept.trim() === '') {
    showMessage('❌ El concepto es obligatorio', 'error');
    document.getElementById('concept').focus();
    return;
  }

  if (!amount || amount <= 0 || isNaN(amount)) {
    showMessage('❌ La cantidad debe ser mayor a 0', 'error');
    document.getElementById('amount').focus();
    return;
  }

  if (!category || category === '') {
    showMessage('❌ Debes seleccionar una categoría', 'error');
    document.getElementById('category').focus();
    return;
  }

  const transaction = {
    type,
    concept: concept.trim(),
    amount,
    currency,
    category,
    subcategory: subcategory.trim() || null,
    date: date || new Date().toISOString().split('T')[0],
  };

  console.log('📤 Enviando:', transaction);

  try {
    const saveButton = document.querySelector('.btn-save');
    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Guardando...';

    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` // ← ENVIAR TOKEN
      },
      body: JSON.stringify(transaction),
    });

    const data = await response.json();

    if (data.success) {
      showMessage('✅ Transacción guardada correctamente', 'success');
      resetForm();
    } else {
      if (response.status === 401) {
        showMessage('❌ Sesión expirada. Redirigiendo...', 'error');
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login.html';
        }, 2000);
      } else {
        showMessage('❌ Error: ' + data.error, 'error');
      }
    }

    saveButton.disabled = false;
    saveButton.innerHTML = '<span class="material-symbols-outlined">check</span> Guardar Transacción';

  } catch (error) {
    showMessage('❌ Sin conexión. Verifica que el backend esté corriendo.', 'error');
    console.error('Error:', error);
    
    const saveButton = document.querySelector('.btn-save');
    saveButton.disabled = false;
    saveButton.innerHTML = '<span class="material-symbols-outlined">check</span> Guardar Transacción';
  }
}

// Función de logout
function handleLogout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.clear();
    window.location.href = '/login.html';
  }
}

function resetForm() {
  document.querySelector('input[name="transaction-type"][value="Gasto"]').checked = true;
  document.getElementById('concept').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('subcategory').value = '';
  document.getElementById('category').selectedIndex = 0;
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMessage(message, type) {
  const existingMessages = document.querySelectorAll('.success-message, .error-message');
  existingMessages.forEach(msg => msg.remove());
  
  const messageEl = document.createElement('div');
  messageEl.className = type === 'success' ? 'success-message' : 'error-message';
  messageEl.textContent = message;
  document.body.appendChild(messageEl);
  
  setTimeout(() => {
    messageEl.style.animation = 'slideDown 0.3s ease-out reverse';
    setTimeout(() => messageEl.remove(), 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando FinanzApp...');
  
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  
  const saveButton = document.querySelector('button[class*="bg-primary"]');
  saveButton.classList.add('btn-save');
  saveButton.addEventListener('click', (e) => {
    e.preventDefault();
    saveTransaction();
  });

  document.getElementById('amount').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveTransaction();
  });

  console.log('✅ FinanzApp lista');
  console.log('📡 API URL:', API_URL);
});