const API_URL = 'https://finance-tracker-backend-production-8318.up.railway.app/api';

// ========================================
// TOGGLE BETWEEN LOGIN AND REGISTER
// ========================================

function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const toggleText = document.getElementById('toggleFormText');
    
    if (loginForm.classList.contains('hidden')) {
        // Show login
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        formTitle.textContent = 'Bienvenido de nuevo';
        formSubtitle.textContent = 'Gestiona tus finanzas de forma inteligente';
        toggleText.innerHTML = '¿No tienes una cuenta? <a onclick="toggleForm()" class="text-primary font-semibold hover:underline decoration-primary/50 underline-offset-4 cursor-pointer">Regístrate</a>';
    } else {
        // Show register
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        formTitle.textContent = 'Crear cuenta';
        formSubtitle.textContent = 'Comienza a gestionar tus finanzas hoy';
        toggleText.innerHTML = '¿Ya tienes una cuenta? <a onclick="toggleForm()" class="text-primary font-semibold hover:underline decoration-primary/50 underline-offset-4 cursor-pointer">Inicia sesión</a>';
    }
    
    // Clear message
    hideMessage();
}

// ========================================
// PASSWORD VISIBILITY TOGGLE
// ========================================

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('.material-symbols-outlined');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility';
    }
}

// ========================================
// MESSAGES
// ========================================

function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    
    let bgColor, textColor, icon;
    
    if (type === 'success') {
        bgColor = 'bg-green-100 dark:bg-green-900/30';
        textColor = 'text-green-800 dark:text-green-200';
        icon = 'check_circle';
    } else if (type === 'error') {
        bgColor = 'bg-red-100 dark:bg-red-900/30';
        textColor = 'text-red-800 dark:text-red-200';
        icon = 'error';
    } else {
        bgColor = 'bg-blue-100 dark:bg-blue-900/30';
        textColor = 'text-blue-800 dark:text-blue-200';
        icon = 'info';
    }
    
    messageBox.className = `message flex items-center gap-3 p-4 rounded-xl ${bgColor} ${textColor}`;
    messageBox.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <p class="text-sm font-medium flex-1">${message}</p>
    `;
    messageBox.classList.remove('hidden');
    
    // Auto-hide after 5 seconds for info/success
    if (type !== 'error') {
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 5000);
    }
}

function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.classList.add('hidden');
}

// ========================================
// LOGIN
// ========================================

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validación
    if (!email || !password) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor ingresa un email válido', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar token en localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userEmail', data.user.email);
            
            showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        } else {
            showMessage(data.error || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión. Verifica que el servidor esté corriendo.', 'error');
    }
}

// ========================================
// REGISTER
// ========================================

async function handleRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const sheetId = document.getElementById('registerSheetId').value.trim();
    
    // Validación
    if (!name || !email || !password || !sheetId) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor ingresa un email válido', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, sheetId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.', 'success');
            
            // Switch to login form after 2 seconds
            setTimeout(() => {
                toggleForm();
                document.getElementById('loginEmail').value = email;
            }, 2000);
        } else {
            showMessage(data.error || 'Error al crear la cuenta', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión. Verifica que el servidor esté corriendo.', 'error');
    }
}

// ========================================
// HELPERS
// ========================================

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showSheetIdHelp() {
    showMessage(
        'Para obtener tu Google Sheet ID: 1) Crea una nueva hoja de cálculo en Google Sheets, 2) Copia el ID de la URL (la parte entre /d/ y /edit), 3) Comparte la hoja con el email de servicio de la app (te lo proporcionará el administrador), 4) Pégalo aquí.',
        'info'
    );
}

// ========================================
// ENTER KEY SUPPORT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Login form - Enter to submit
    document.getElementById('loginEmail').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Register form - Enter to submit
    document.getElementById('registerName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
    
    document.getElementById('registerEmail').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
    
    document.getElementById('registerPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
    
    document.getElementById('registerSheetId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
});