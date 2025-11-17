// Test script for authentication and appointment system
console.log('🧪 Iniciando testes do sistema de autenticação...');

// Função para limpar dados de teste
function clearTestData() {
    localStorage.removeItem('users');
    localStorage.removeItem('currentSession');
    localStorage.removeItem('appointments');
    console.log('🗑️ Dados de teste limpos');
}

// Função para testar registro de usuário
function testUserRegistration() {
    console.log('\n📝 Testando registro de usuário...');
    clearTestData();
    
    // Simular registro
    const name = 'João Teste';
    const email = 'joao@teste.com';
    const phone = '(11) 99999-9999';
    const password = 'senha123';
    
    // Chamar função de registro
    registerUser(name, email, phone, password, password);
    
    // Verificar se usuário foi salvo
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (user && user.name === name && user.phone === phone) {
        console.log('✅ Registro de usuário: OK');
        return true;
    } else {
        console.log('❌ Registro de usuário: FALHOU');
        return false;
    }
}

// Função para testar login
function testUserLogin() {
    console.log('\n🔐 Testando login de usuário...');
    
    const email = 'joao@teste.com';
    const password = 'senha123';
    
    // Chamar função de login
    loginUser(email, password, false);
    
    // Verificar se sessão foi criada
    const session = JSON.parse(localStorage.getItem('currentSession'));
    
    if (session && session.email === email && session.expires > Date.now()) {
        console.log('✅ Login de usuário: OK');
        return true;
    } else {
        console.log('❌ Login de usuário: FALHOU');
        return false;
    }
}

// Função para testar agendamento com usuário logado
function testAppointmentWithLoggedUser() {
    console.log('\n📅 Testando agendamento com usuário logado...');
    
    // Criar agendamento de teste
    const appointment = {
        name: 'João Teste',
        phone: '(11) 99999-9999',
        barber: 'João Silva',
        service: 'Corte Tradicional',
        date: '2024-01-15',
        time: '10:00',
        notes: 'Teste de agendamento'
    };
    
    // Salvar agendamento
    saveAppointment(appointment);
    
    // Verificar se agendamento foi salvo com email do usuário
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const userAppointment = appointments.find(app => app.name === 'João Teste');
    
    if (userAppointment && userAppointment.userEmail === 'joao@teste.com') {
        console.log('✅ Agendamento com usuário logado: OK');
        return true;
    } else {
        console.log('❌ Agendamento com usuário logado: FALHOU');
        return false;
    }
}

// Função para testar busca de agendamentos por email (usuário logado)
function testAppointmentSearchByEmail() {
    console.log('\n🔍 Testando busca de agendamentos por email...');
    
    // Chamar função de busca (deve usar email automaticamente)
    const user = getCurrentUser();
    if (!user) {
        console.log('❌ Usuário não está logado para teste');
        return false;
    }
    
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const userAppointments = appointments.filter(app => app.userEmail === user.email);
    
    if (userAppointments.length > 0) {
        console.log('✅ Busca por email: OK -', userAppointments.length, 'agendamento(s) encontrado(s)');
        return true;
    } else {
        console.log('❌ Busca por email: FALHOU - Nenhum agendamento encontrado');
        return false;
    }
}

// Função para testar logout
function testLogout() {
    console.log('\n🚪 Testando logout...');
    
    logout();
    
    const session = JSON.parse(localStorage.getItem('currentSession'));
    const user = getCurrentUser();
    
    if (!session && !user) {
        console.log('✅ Logout: OK');
        return true;
    } else {
        console.log('❌ Logout: FALHOU');
        return false;
    }
}

// Função para testar agendamento sem usuário logado
function testAppointmentWithoutLogin() {
    console.log('\n📅 Testando agendamento sem usuário logado...');
    
    // Criar agendamento de teste
    const appointment = {
        name: 'Maria Teste',
        phone: '(11) 88888-8888',
        barber: 'Pedro Santos',
        service: 'Degradê',
        date: '2024-01-16',
        time: '14:00',
        notes: 'Teste sem login'
    };
    
    // Salvar agendamento
    saveAppointment(appointment);
    
    // Verificar se agendamento foi salvo sem email de usuário
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const userAppointment = appointments.find(app => app.name === 'Maria Teste');
    
    if (userAppointment && !userAppointment.userEmail) {
        console.log('✅ Agendamento sem login: OK');
        return true;
    } else {
        console.log('❌ Agendamento sem login: FALHOU');
        return false;
    }
}

// Função para testar busca de agendamentos por telefone (usuário não logado)
function testAppointmentSearchByPhone() {
    console.log('\n🔍 Testando busca de agendamentos por telefone...');
    
    // Simular busca por telefone
    const phone = '(11) 88888-8888';
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const userAppointments = appointments.filter(app => 
        app.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')
    );
    
    if (userAppointments.length > 0) {
        console.log('✅ Busca por telefone: OK -', userAppointments.length, 'agendamento(s) encontrado(s)');
        return true;
    } else {
        console.log('❌ Busca por telefone: FALHOU - Nenhum agendamento encontrado');
        return false;
    }
}

// Executar todos os testes
function runAllTests() {
    console.log('🚀 Executando todos os testes...\n');
    
    let passed = 0;
    let total = 7;
    
    if (testUserRegistration()) passed++;
    if (testUserLogin()) passed++;
    if (testAppointmentWithLoggedUser()) passed++;
    if (testAppointmentSearchByEmail()) passed++;
    if (testLogout()) passed++;
    if (testAppointmentWithoutLogin()) passed++;
    if (testAppointmentSearchByPhone()) passed++;
    
    console.log('\n📊 RESULTADO DOS TESTES:');
    console.log(`✅ ${passed}/${total} testes passaram`);
    
    if (passed === total) {
        console.log('🎉 Todos os testes passaram! O sistema está funcionando corretamente.');
    } else {
        console.log('⚠️  Alguns testes falharam. Verifique o código.');
    }
    
    return passed === total;
}

// Executar testes quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛠️  Testes carregados. Use runAllTests() para executar.');
    
    // Adicionar botão de teste à página
    const testButton = document.createElement('button');
    testButton.textContent = 'Executar Testes';
    testButton.style.position = 'fixed';
    testButton.style.top = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '1000';
    testButton.style.padding = '10px 20px';
    testButton.style.backgroundColor = '#007bff';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '5px';
    testButton.style.cursor = 'pointer';
    testButton.onclick = runAllTests;
    
    document.body.appendChild(testButton);
});
