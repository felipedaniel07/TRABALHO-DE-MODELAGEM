// Configurações iniciais - todas as horas disponíveis
const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00'
];

// Elementos do DOM
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const bookingForm = document.getElementById('booking-form');
const modal = document.getElementById('confirmation-modal');
const bookingDetails = document.getElementById('booking-details');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const authButtons = document.getElementById('auth-buttons');
const userProfile = document.getElementById('user-profile');
const userName = document.getElementById('user-name');

// Função simples de hash para senhas (apenas para demonstração)
function simpleHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

// Função para verificar se usuário está logado
function isLoggedIn() {
    const session = JSON.parse(localStorage.getItem('currentSession'));
    return session && session.expires > Date.now();
}

// Função para obter usuário atual
function getCurrentUser() {
    const session = JSON.parse(localStorage.getItem('currentSession'));
    if (session && session.expires > Date.now()) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.find(user => user.email === session.email);
    }
    return null;
}

// Função para atualizar UI baseada no estado de autenticação
function updateAuthUI() {
    const user = getCurrentUser();
    if (user) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'block';
        userName.textContent = user.name;
        
        // Mostrar a visualização de agendamentos para usuários logados
        document.getElementById('logged-in-view').style.display = 'block';
        document.getElementById('logged-out-view').style.display = 'none';
    } else {
        authButtons.style.display = 'block';
        userProfile.style.display = 'none';
        
        // Mostrar a visualização de agendamentos para usuários não logados
        document.getElementById('logged-in-view').style.display = 'none';
        document.getElementById('logged-out-view').style.display = 'block';
    }
}

// Função para abrir modal de login
function openLoginModal() {
    loginModal.style.display = 'block';
}

// Função para fechar modal de login
function closeLoginModal() {
    loginModal.style.display = 'none';
    document.getElementById('login-form').reset();
}

// Função para abrir modal de registro
function openRegisterModal() {
    registerModal.style.display = 'block';
}

// Função para fechar modal de registro
function closeRegisterModal() {
    registerModal.style.display = 'none';
    document.getElementById('register-form').reset();
}

// Função para alternar entre login e registro
function switchToRegister() {
    closeLoginModal();
    openRegisterModal();
}

// Função para alternar entre registro e login
function switchToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('currentSession');
    updateAuthUI();
    alert('Você saiu da sua conta.');
}

// Função para verificar autenticação antes de abrir modal de agendamentos
function checkAuthAndOpenViewModal() {
    if (!isLoggedIn()) {
        alert('Por favor, faça login para ver seus agendamentos.');
        openLoginModal();
        return;
    }
    openViewModal();
}

function togglePasswordVisibility(inputId) {
    const inputField = document.getElementById(inputId);
    const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
    inputField.setAttribute('type', type);
}

// Função para abrir modal de visualização de agendamentos
function openViewModal() {
    const user = getCurrentUser();
    if (user) {
        searchAppointmentsMain();
    }
}

// Event listeners para formulários de autenticação
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('remember-me');
    
    loginUser(email, password, rememberMe);
});

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');
    
    registerUser(name, email, phone, password, confirmPassword);
});

// Função para registrar usuário
function registerUser(name, email, phone, password, confirmPassword) {
    // Validações básicas
    if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }
    
    if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    // Verificar se email já existe
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(user => user.email === email)) {
        alert('Este email já está cadastrado!');
        return;
    }
    
    // Criar novo usuário
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password: simpleHash(password), // Hash da senha
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Conta criada com sucesso! Faça login para continuar.');
    closeRegisterModal();
    openLoginModal();
}

// Função para fazer login
function loginUser(email, password, rememberMe) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === simpleHash(password));
    
    if (!user) {
        alert('Email ou senha incorretos!');
        return;
    }
    
    // Criar sessão
    const session = {
        email: user.email,
        expires: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (2 * 60 * 60 * 1000) // 30 dias ou 2 horas
    };
    
    localStorage.setItem('currentSession', JSON.stringify(session));
    updateAuthUI();
    closeLoginModal();
    
    alert(`Bem-vindo de volta, ${user.name}!`);
}

// Fechar modais de autenticação ao clicar fora
window.addEventListener('click', function(e) {
    if (e.target === loginModal) {
        closeLoginModal();
    }
    if (e.target === registerModal) {
        closeRegisterModal();
    }
});

// Adicionar máscara de telefone no formulário de registro
document.getElementById('register-phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
        value = value.replace(/(\d{0,2})/, '($1');
    }
    
    e.target.value = value;
});

// Atualizar UI quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    populateTimeSlots();
    updateAuthUI();
});

// Configurar data mínima como hoje
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

// Função para preencher horários disponíveis
function populateTimeSlots() {
    timeSelect.innerHTML = '<option value="">Selecione um horário</option>';
    
    availableTimes.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}

// Função para rolar até uma seção
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}

// Função para validar se é dia útil
function isWeekday(date) {
    const day = new Date(date).getDay();
    return day !== 0 && day !== 6; // 0 = Domingo, 6 = Sábado
}

// Event listener para mudança de data
dateInput.addEventListener('change', function() {
    const selectedDate = this.value;
    
    if (!selectedDate) {
        timeSelect.innerHTML = '<option value="">Selecione um horário</option>';
        return;
    }
    
    if (!isWeekday(selectedDate)) {
        alert('Desculpe, não atendemos aos domingos e sábados.');
        this.value = '';
        timeSelect.innerHTML = '<option value="">Selecione um horário</option>';
        return;
    }
    
    populateTimeSlots();
});

// Garantir que os horários sejam carregados quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    populateTimeSlots();
});

// Event listener para envio do formulário
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Coletar dados do formulário
    const formData = new FormData(bookingForm);
    const bookingInfo = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        barber: formData.get('barber'),
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        notes: formData.get('notes')
    };
    
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!bookingInfo.name || !bookingInfo.phone || !bookingInfo.barber || 
        !bookingInfo.service || !bookingInfo.date || !bookingInfo.time) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Mostrar modal de confirmação
    showConfirmationModal(bookingInfo);
});

// Função para mostrar modal de confirmação
function showConfirmationModal(bookingInfo) {
    const formattedDate = new Date(bookingInfo.date).toLocaleDateString('pt-BR');
    
    bookingDetails.innerHTML = `
        <div class="booking-summary">
            <p><strong>Nome:</strong> ${bookingInfo.name}</p>
            <p><strong>Telefone:</strong> ${bookingInfo.phone}</p>
            <p><strong>Barbeiro:</strong> ${bookingInfo.barber}</p>
            <p><strong>Serviço:</strong> ${bookingInfo.service}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Horário:</strong> ${bookingInfo.time}</p>
            ${bookingInfo.notes ? `<p><strong>Observações:</strong> ${bookingInfo.notes}</p>` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Função para fechar modal
function closeModal() {
    modal.style.display = 'none';
}

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Adicionar máscara de telefone
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
        value = value.replace(/(\d{0,2})/, '($1');
    }
    
    e.target.value = value;
});

// Função para salvar agendamentos no localStorage
function saveAppointment(appointment) { 
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Check for overlapping appointments
    const isConflict = appointments.some(app => 
        app.date === appointment.date && app.time === appointment.time
    );
    
    if (isConflict) {
        alert('Já existe um agendamento para este horário. Por favor, escolha outro horário.');
        return;
    }
    
    appointment.id = Date.now();
    
    // Associar agendamento com usuário logado, se houver
    const user = getCurrentUser();
    if (user) {
        appointment.userEmail = user.email;
    }
    
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Função para buscar agendamentos por telefone
function searchAppointments() {
    const phone = document.getElementById('search-phone').value.replace(/\D/g, '');
    const appointmentsList = document.getElementById('appointments-list');
    
    if (!phone) {
        alert('Por favor, digite seu telefone');
        return;
    }
    
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const userAppointments = appointments.filter(app => 
        app.phone.replace(/\D/g, '') === phone
    );
    
    displayAppointments(userAppointments);
}

// Função para exibir agendamentos com opções de editar e cancelar
function displayAppointments(appointments) {
    const appointmentsList = document.getElementById('appointments-list');
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p class="no-appointments">Nenhum agendamento encontrado. Faça seu primeiro agendamento!</p>';
        return;
    }
    
    appointmentsList.innerHTML = appointments.map(appointment => `
        <div class="appointment-card" data-id="${appointment.id}">
            <h3>${appointment.service}</h3>
            <div class="appointment-details">
                <div class="appointment-detail">
                    <strong>Barbeiro:</strong> ${appointment.barber}
                </div>
                <div class="appointment-detail">
                    <strong>Data:</strong> ${new Date(appointment.date).toLocaleDateString('pt-BR')}
                </div>
                <div class="appointment-detail">
                    <strong>Horário:</strong> ${appointment.time}
                </div>
                <div class="appointment-detail">
                    <strong>Cliente:</strong> ${appointment.name}
                </div>
                <div class="appointment-detail">
                    <strong>Telefone:</strong> ${appointment.phone}
                </div>
                ${appointment.notes ? `<div class="appointment-detail"><strong>Observações:</strong> ${appointment.notes}</div>` : ''}
            </div>
            <div class="appointment-actions">
                <button class="edit-btn" onclick="editAppointment(${appointment.id})">Editar</button>
                <button class="cancel-btn" onclick="cancelAppointment(${appointment.id})">Cancelar</button>
            </div>
        </div>
    `).join('');
}

// Função para editar agendamento
function editAppointment(id) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const appointment = appointments.find(app => app.id === id);
    
    if (!appointment) return;
    
    // Preencher formulário com dados do agendamento
    document.getElementById('name').value = appointment.name;
    document.getElementById('phone').value = appointment.phone;
    document.getElementById('barber').value = appointment.barber;
    document.getElementById('service').value = appointment.service;
    document.getElementById('date').value = appointment.date;
    document.getElementById('time').value = appointment.time;
    document.getElementById('notes').value = appointment.notes || '';
    
    // Remover agendamento antigo sem mostrar confirmação
    appointments = appointments.filter(app => app.id !== id);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Rolar para o formulário de agendamento
    scrollToSection('agendar');
}

// Função para cancelar agendamento
function cancelAppointment(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments = appointments.filter(app => app.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Atualizar lista de agendamentos
        const phone = document.getElementById('search-phone').value.replace(/\D/g, '');
        if (phone) {
            searchAppointments();
        } else {
            displayAppointments([]);
        }
        
        alert('Agendamento cancelado com sucesso!');
    }
}

// Função para buscar agendamentos na seção principal
function searchAppointmentsMain() {
    const user = getCurrentUser();
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    let userAppointments = [];
    
    if (user) {
        // Buscar por email do usuário logado
        userAppointments = appointments.filter(app => 
            app.userEmail === user.email
        );
    } else {
        // Buscar por telefone (para usuários não logados)
        const phone = document.getElementById('search-phone-main').value.replace(/\D/g, '');
        if (!phone) {
            alert('Por favor, digite seu telefone');
            return;
        }
        userAppointments = appointments.filter(app => 
            app.phone.replace(/\D/g, '') === phone
        );
    }
    
    if (userAppointments.length === 0) {
        alert('Nenhum agendamento encontrado.');
        return;
    }
    
    // Mostrar modal com as informações
    showAppointmentInfoModal(userAppointments);
}

// Função para mostrar modal com informações do agendamento
function showAppointmentInfoModal(appointments) {
    const modal = document.getElementById('appointment-info-modal');
    const detailsDiv = document.getElementById('appointment-info-details');
    
    let html = '';
    
    if (appointments.length === 0) {
        html = '<p class="no-appointments">Nenhum agendamento encontrado.</p>';
    } else {
        html = '<div class="appointments-grid">';
        appointments.forEach(appointment => {
            const formattedDate = new Date(appointment.date).toLocaleDateString('pt-BR');
            html += `
                <div class="appointment-square" data-id="${appointment.id}">
                    <div class="appointment-header">
                        <h3>${appointment.service}</h3>
                        <span class="appointment-status">Confirmado</span>
                    </div>
                    <div class="appointment-info-grid">
                        <div class="info-item">
                            <strong>Cliente:</strong>
                            <span>${appointment.name}</span>
                        </div>
                        <div class="info-item">
                            <strong>Telefone:</strong>
                            <span>${appointment.phone}</span>
                        </div>
                        <div class="info-item">
                            <strong>Profissional:</strong>
                            <span>${appointment.barber}</span>
                        </div>
                        <div class="info-item">
                            <strong>Data:</strong>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="info-item">
                            <strong>Horário:</strong>
                            <span>${appointment.time}</span>
                        </div>
                        <div class="info-item">
                            <strong>Valor:</strong>
                            <span class="price">${getServicePrice(appointment.service)}</span>
                        </div>
                        ${appointment.notes ? `
                        <div class="info-item full-width">
                            <strong>Observações:</strong>
                            <span>${appointment.notes}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="appointment-actions">
                        <button class="edit-btn" onclick="editAppointmentFromModal(${appointment.id})">Editar</button>
                        <button class="cancel-btn" onclick="cancelAppointmentFromModal(${appointment.id})">Cancelar</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    detailsDiv.innerHTML = html;
    modal.style.display = 'block';
}

// Função para editar agendamento a partir do modal
function editAppointmentFromModal(id) {
    closeAppointmentInfoModal();
    editAppointment(id);
}

// Função para cancelar agendamento a partir do modal
function cancelAppointmentFromModal(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments = appointments.filter(app => app.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Recarregar a lista de agendamentos
        const user = getCurrentUser();
        if (user) {
            searchAppointmentsMain();
        } else {
            const phone = document.getElementById('search-phone-main').value.replace(/\D/g, '');
            if (phone) {
                searchAppointmentsMain();
            }
        }
        
        alert('Agendamento cancelado com sucesso!');
    }
}

// Função auxiliar para obter preço do serviço
function getServicePrice(service) {
    const prices = {
        'Corte Tradicional': 'R$ 35',
        'Degradê': 'R$ 40',
        'Barba': 'R$ 30',
        'Combo Completo': 'R$ 70'
    };
    return prices[service] || 'R$ 0';
}

// Função para fechar modal de informações
function closeAppointmentInfoModal() {
    const modal = document.getElementById('appointment-info-modal');
    modal.style.display = 'none';
}

// Adicionar máscara de telefone no campo de busca principal
document.getElementById('search-phone-main').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else {
        value = value.replace(/(\d{0,2})/, '($1');
    }
    
    e.target.value = value;
});

// Fechar modal ao clicar fora
window.addEventListener('click', function(e) {
    const modal = document.getElementById('appointment-info-modal');
    if (e.target === modal) {
        closeAppointmentInfoModal();
    }
});

// Modificar o evento de envio do formulário para salvar no localStorage
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Coletar dados do formulário
    const formData = new FormData(bookingForm);
    const bookingInfo = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        barber: formData.get('barber'),
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time'),
        notes: formData.get('notes')
    };
    
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!bookingInfo.name || !bookingInfo.phone || !bookingInfo.barber || 
        !bookingInfo.service || !bookingInfo.date || !bookingInfo.time) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Salvar agendamento
    saveAppointment(bookingInfo);
    
    // Mostrar modal de confirmação
    showConfirmationModal(bookingInfo);
    
    // Limpar formulário após confirmação
    bookingForm.reset();
});

// Animação suave ao rolar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        scrollToSection(this.getAttribute('href').substring(1));
    });
});
