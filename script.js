// Variáveis globais
let nameCounter = 1;
const tarefas = [
    'corredor-feminino',
    'terreo', 
    'corredor-masculino',
    'cobertura',
    'lixo'
];

// Função para adicionar novo campo de nome
function addNameField() {
    const namesContainer = document.getElementById('namesContainer');
    const newNameGroup = document.createElement('div');
    newNameGroup.className = 'name-input-group';
    
    newNameGroup.innerHTML = `
        <input type="text" class="name-input" placeholder="Digite o nome da pessoa" required>
        <button type="button" class="remove-btn" onclick="removeName(this)">×</button>
    `;
    
    // Adiciona animação de entrada
    newNameGroup.style.opacity = '0';
    newNameGroup.style.transform = 'translateX(-30px)';
    
    namesContainer.appendChild(newNameGroup);
    
    // Anima a entrada do novo campo
    setTimeout(() => {
        newNameGroup.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        newNameGroup.style.opacity = '1';
        newNameGroup.style.transform = 'translateX(0)';
    }, 10);
    
    // Foca no novo campo
    setTimeout(() => {
        newNameGroup.querySelector('.name-input').focus();
    }, 300);
    
    nameCounter++;
    updateRemoveButtons();
}

// Função para remover campo de nome
function removeName(button) {
    const nameGroup = button.parentElement;
    const namesContainer = document.getElementById('namesContainer');
    
    // Só permite remover se houver mais de um campo
    if (namesContainer.children.length > 1) {
        // Adiciona classe de animação de saída
        nameGroup.classList.add('removing');
        
        // Remove o elemento após a animação
        setTimeout(() => {
            nameGroup.remove();
            updateRemoveButtons();
        }, 300);
    } else {
        // Shake animation se tentar remover o último campo
        nameGroup.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            nameGroup.style.animation = '';
        }, 500);
    }
}

// Função para atualizar visibilidade dos botões de remover
function updateRemoveButtons() {
    const namesContainer = document.getElementById('namesContainer');
    const nameGroups = namesContainer.querySelectorAll('.name-input-group');
    
    nameGroups.forEach((group, index) => {
        const removeBtn = group.querySelector('.remove-btn');
        if (nameGroups.length > 1) {
            removeBtn.style.display = 'flex';
        } else {
            removeBtn.style.display = 'none';
        }
    });
}

// Função para embaralhar array (Fisher-Yates shuffle)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Função para obter nomes válidos
function obterNomes() {
    const nameInputs = document.querySelectorAll('.name-input');
    const nomes = [];
    
    nameInputs.forEach(input => {
        const nome = input.value.trim();
        if (nome) {
            nomes.push(nome);
        }
    });
    
    return nomes;
}

// Função para validar entrada
function validarEntrada() {
    const nomes = obterNomes();
    
    if (nomes.length === 0) {
        mostrarErro('Por favor, adicione pelo menos um nome!');
        return false;
    }
    
    // Verifica nomes duplicados
    const nomesUnicos = new Set(nomes);
    if (nomesUnicos.size !== nomes.length) {
        mostrarErro('Por favor, remova nomes duplicados!');
        return false;
    }
    
    return true;
}

// Função para mostrar erro
function mostrarErro(mensagem) {
    // Remove erro anterior se existir
    const erroAnterior = document.querySelector('.error-message');
    if (erroAnterior) {
        erroAnterior.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin: 10px 0;
        text-align: center;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(238, 90, 82, 0.3);
        animation: shake 0.5s ease-in-out;
    `;
    errorDiv.textContent = mensagem;
    
    const buttonsContainer = document.querySelector('.buttons-container');
    buttonsContainer.parentNode.insertBefore(errorDiv, buttonsContainer);
    
    // Remove a mensagem após 3 segundos
    setTimeout(() => {
        errorDiv.style.transition = 'all 0.3s ease';
        errorDiv.style.opacity = '0';
        errorDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

// Função para realizar o sorteio
function realizarSorteio() {
    if (!validarEntrada()) {
        return;
    }
    
    const nomes = obterNomes();
    const completeBtn = document.querySelector('.complete-btn');
    
    // Adiciona efeito de loading
    completeBtn.classList.add('loading');
    completeBtn.textContent = 'Sorteando...';
    completeBtn.disabled = true;
    
    setTimeout(() => {
        try {
            const resultado = executarSorteio(nomes);
            mostrarResultados(resultado);
            
            // Scroll suave para os resultados
            setTimeout(() => {
                document.getElementById('resultsSection').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 500);
            
        } catch (error) {
            mostrarErro('Erro ao realizar sorteio. Tente novamente.');
            console.error('Erro no sorteio:', error);
        } finally {
            completeBtn.classList.remove('loading');
            completeBtn.textContent = 'Concluir!';
            completeBtn.disabled = false;
        }
    }, 1500); // Delay para mostrar o loading
}

// Função principal do sorteio
function executarSorteio(nomes) {
    const resultado = {
        sabado: {},
        domingo: {}
    };
    
    // Sorteio para sábado (completamente aleatório)
    const nomesSabado = shuffleArray(nomes);
    tarefas.forEach((tarefa, index) => {
        resultado.sabado[tarefa] = nomesSabado[index % nomesSabado.length];
    });
    
    // Sorteio para domingo (evita repetir pessoas do sábado quando possível)
    const pessoasSabado = Object.values(resultado.sabado);
    const pessoasDisponiveis = nomes.filter(nome => !pessoasSabado.includes(nome));
    
    let nomesDomingo;
    if (pessoasDisponiveis.length >= tarefas.length) {
        // Há pessoas suficientes que não trabalharam no sábado
        nomesDomingo = shuffleArray(pessoasDisponiveis);
    } else if (pessoasDisponiveis.length > 0) {
        // Usa as pessoas disponíveis + algumas que já trabalharam
        const pessoasExtras = shuffleArray(nomes.filter(nome => pessoasSabado.includes(nome)));
        nomesDomingo = shuffleArray([...pessoasDisponiveis, ...pessoasExtras]);
    } else {
        // Todos trabalharam no sábado, embaralha novamente
        nomesDomingo = shuffleArray(nomes);
    }
    
    tarefas.forEach((tarefa, index) => {
        resultado.domingo[tarefa] = nomesDomingo[index % nomesDomingo.length];
    });
    
    return resultado;
}

// Função para mostrar os resultados
function mostrarResultados(resultado) {
    // Esconde a seção de entrada
    const inputSection = document.getElementById('inputSection');
    const resultsSection = document.getElementById('resultsSection');
    
    inputSection.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    inputSection.style.opacity = '0';
    inputSection.style.transform = 'translateY(-30px)';
    
    setTimeout(() => {
        inputSection.style.display = 'none';
        
        // Preenche os resultados
        tarefas.forEach(tarefa => {
            document.getElementById(`sabado-${tarefa}`).textContent = resultado.sabado[tarefa];
            document.getElementById(`domingo-${tarefa}`).textContent = resultado.domingo[tarefa];
        });
        
        // Mostra a seção de resultados
        resultsSection.style.display = 'block';
        resultsSection.style.opacity = '0';
        resultsSection.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            resultsSection.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            resultsSection.style.opacity = '1';
            resultsSection.style.transform = 'translateY(0)';
        }, 50);
        
    }, 500);
}

// Função para resetar o sorteio
function resetarSorteio() {
    const inputSection = document.getElementById('inputSection');
    const resultsSection = document.getElementById('resultsSection');
    
    // Esconde resultados
    resultsSection.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    resultsSection.style.opacity = '0';
    resultsSection.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        resultsSection.style.display = 'none';
        
        // Limpa os campos de entrada
        const nameInputs = document.querySelectorAll('.name-input');
        nameInputs.forEach(input => {
            input.value = '';
        });
        
        // Mostra a seção de entrada
        inputSection.style.display = 'block';
        inputSection.style.opacity = '0';
        inputSection.style.transform = 'translateY(-30px)';
        
        setTimeout(() => {
            inputSection.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            inputSection.style.opacity = '1';
            inputSection.style.transform = 'translateY(0)';
            
            // Foca no primeiro campo
            document.querySelector('.name-input').focus();
        }, 50);
        
    }, 500);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização
    updateRemoveButtons();
    
    // Enter key para adicionar campo ou realizar sorteio
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.classList.contains('name-input')) {
                if (activeElement.value.trim()) {
                    addNameField();
                }
            }
        }
    });
    
    // Animação de entrada inicial
    setTimeout(() => {
        document.querySelector('.container').style.opacity = '1';
    }, 100);
});

// Adiciona animação de shake ao CSS dinamicamente
const shakeKeyframes = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = shakeKeyframes;
document.head.appendChild(styleSheet);

// Função para adicionar efeitos de partículas (opcional)
function createParticle() {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: rgba(79, 172, 254, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: float 3s ease-out forwards;
    `;
    
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = window.innerHeight + 'px';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 3000);
}

// Adiciona keyframes para partículas
const particleKeyframes = `
@keyframes float {
    to {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
}
`;

const particleStyleSheet = document.createElement('style');
particleStyleSheet.textContent = particleKeyframes;
document.head.appendChild(particleStyleSheet);

// Cria partículas ocasionalmente
setInterval(createParticle, 2000);

