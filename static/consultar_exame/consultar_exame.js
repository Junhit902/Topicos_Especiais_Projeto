document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formConsultarExame").addEventListener("submit", consultarExame);
    document.getElementById("consultaPaciente").addEventListener("input", buscarSugestoesPacientes);
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
    event.preventDefault();

    const consulta = document.getElementById('consultaPaciente').value;

    fetch(`/exames-agendados?consulta=${encodeURIComponent(consulta)}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#resultadoConsulta tbody');
            tbody.innerHTML = ''; // Limpa os resultados anteriores

            if (data.length === 0) {
                document.getElementById('mensagem').textContent = 'Nenhum exame encontrado.';
            } else {
                document.getElementById('mensagem').textContent = '';
                data.forEach(exame => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${exame.paciente.nome}</td>
                        <td>${exame.paciente.cpf}</td>
                        <td>${exame.tipoExame}</td>
                        <td>${exame.dataExame}</td>
                        <td>
                            <div>Resultado: ${exame.resultado}</div>
                            <div>Data de Realização: ${exame.dataRealizacao}</div>
                            <div>Detalhes: ${JSON.stringify(exame.detalhes)}</div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        })
        .catch(error => {
            document.getElementById('mensagem').textContent = 'Erro ao consultar exame: ' + error;
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