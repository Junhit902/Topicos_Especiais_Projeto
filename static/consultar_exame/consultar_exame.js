document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formConsultarExame").addEventListener("submit", consultarExame);
    document.getElementById("consultaPaciente").addEventListener("input", buscarSugestoesPacientes);
    document.getElementById("botao_buscar").addEventListener("click", consultarExame); // Garante que o botão "Buscar exame" funcione
});

function buscarSugestoesPacientes(event) {
    const consulta = event.target.value;

    if (consulta.length >= 2) { // Buscar sugestões quando houver pelo menos 2 caracteres
        fetch(`/sugestoes-pacientes?consulta=${encodeURIComponent(consulta)}`)
            .then(response => response.json())
            .then(data => {
                const datalist = document.getElementById('sugestoesPacientes');
                datalist.innerHTML = ''; // Limpa as sugestões anteriores

                data.forEach(paciente => {
                    const option = document.createElement('option');
                    option.value = `${paciente.nome} - ${paciente.cpf}`;
                    datalist.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar sugestões de pacientes:', error);
            });
    }
}

function consultarExame(event) {
    // Previne o envio do formulário se necessário
    if (event) {
        event.preventDefault();
    }

    const consulta = document.getElementById('consultaPaciente').value;
    const tbody = document.querySelector('#resultadoConsulta tbody');
    tbody.innerHTML = ''; // Limpa os resultados anteriores

    if (!consulta.trim()) {
        document.getElementById('mensagem').textContent = "Por favor, insira um nome ou CPF válido.";
        return;
    }

    fetch(`/api/consultar-exames/${consulta}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('mensagem').textContent = data.error;
            } else {
                document.getElementById('mensagem').textContent = ''; // Limpa a mensagem de erro
                if (data.length === 0) {
                    document.getElementById('mensagem').textContent = 'Nenhum exame encontrado.';
                } else {
                    data.forEach(exame => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${consulta}</td> <!-- O CPF ou Nome -->
                            <td>${exame.DevHealthy.pacienteId}</td> <!-- Paciente ID -->
                            <td>${exame.DevHealthy.tipo}</td>
                            <td>${new Date(exame.DevHealthy.data).toLocaleDateString()}</td>
                            <td>
                                <div>Observações: ${exame.DevHealthy.detalhes.observacoes || 'N/A'}</div>
                                <div>Região: ${exame.DevHealthy.detalhes.regiao || 'N/A'}</div>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
        })
        .catch(error => {
            console.error('Erro ao consultar exames:', error);
            document.getElementById('mensagem').textContent = 'Erro ao consultar exames';
        });
}


function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (menuId === 'offcanvasMenu') {
        menu.classList.toggle('show');
    } else {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
}
