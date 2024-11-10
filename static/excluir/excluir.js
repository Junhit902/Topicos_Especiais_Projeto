document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formSelecionar").addEventListener("submit", selecionarOpcao);
    document.getElementById("formBuscarPaciente").addEventListener("submit", buscarPaciente);
    document.getElementById("formBuscarExames").addEventListener("submit", buscarExames);
    document.getElementById("botao_excluir_paciente").addEventListener("click", excluirPacienteEExames);
});

function selecionarOpcao(event) {
    event.preventDefault();
    const selecao = document.getElementById('selecao').value;
    document.getElementById('formExcluirPaciente').style.display = selecao === 'paciente' ? 'block' : 'none';
    document.getElementById('formExcluirExame').style.display = selecao === 'exame' ? 'block' : 'none';
}

function buscarPaciente(event) {
    event.preventDefault();
    const cpf = document.getElementById('cpfBuscar').value;

    fetch(`/consultar-paciente/${encodeURIComponent(cpf)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('mensagem').textContent = data.error;
                document.getElementById('dadosPaciente').innerHTML = '';
                document.getElementById('botao_excluir_paciente').style.display = 'none';
            } else {
                document.getElementById('dadosPaciente').innerHTML = `
                    <p>Nome: ${data.nome}</p>
                    <p>Data de Nascimento: ${data.dataNascimento}</p>
                    <p>Sexo: ${data.sexo}</p>
                    <p>Endereço: ${data.endereco.rua}, ${data.endereco.numero}, ${data.endereco.cidade}, ${data.endereco.estado}, ${data.endereco.cep}</p>
                `;
                document.getElementById('botao_excluir_paciente').style.display = 'block';
            }
        });
}

function excluirPacienteEExames() {
    const cpf = document.getElementById('cpfBuscar').value;

    fetch(`/excluir-paciente-e-exames/${encodeURIComponent(cpf)}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                document.getElementById('mensagem').textContent = 'Paciente e exames excluídos com sucesso.';
                document.getElementById('dadosPaciente').innerHTML = '';
                document.getElementById('botao_excluir_paciente').style.display = 'none';
            } else {
            }
        });
}

function excluirPaciente() {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) {
        return;
    }

    const cpf = document.getElementById('cpfBuscar').value;

    fetch(`/excluir-paciente/${encodeURIComponent(cpf)}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('mensagem').textContent = data.message || data.error;
        if (!data.error) {
            document.getElementById('dadosPaciente').innerHTML = '';
            document.getElementById('botao_excluir_paciente').style.display = 'none';
            document.getElementById('cpfBuscar').value = '';
            document.getElementById('selecao').value = '';
            document.getElementById('formExcluirPaciente').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Erro ao excluir paciente:', error);
        document.getElementById('mensagem').textContent = 'Erro ao excluir paciente';
    });
}

function buscarExames(event) {
    event.preventDefault();
    const cpf = document.getElementById('cpfBuscarExame').value;

    fetch(`/consultar-exames/${encodeURIComponent(cpf)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('mensagem').textContent = data.error;
                document.getElementById('seletorExames').style.display = 'none';
                document.getElementById('dadosExame').innerHTML = '';
                document.getElementById('botao_excluir_exame').style.display = 'none';
            } else {
                const seletorExames = document.getElementById('exameSelecionado');
                seletorExames.innerHTML = '';

                data.exames.forEach(exame => {
                    const option = document.createElement('option');
                    option.value = exame.documentId;
                    option.textContent = `${exame.tipo} - ${new Date(exame.data).toLocaleString()}`;
                    seletorExames.appendChild(option);
                });

                document.getElementById('seletorExames').style.display = 'block';
                document.getElementById('mensagem').textContent = '';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar exames:', error);
            document.getElementById('mensagem').textContent = 'Erro ao buscar exames';
        });
}

function selecionarExame() {
    const documentId = document.getElementById('exameSelecionado').value;

    fetch(`/consultar-exame/${encodeURIComponent(documentId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('mensagem').textContent = data.error;
                document.getElementById('dadosExame').innerHTML = '';
                document.getElementById('botao_excluir_exame').style.display = 'none';
            } else {
                let detalhesHtml = '';
                for (const [key, value] of Object.entries(data.detalhes)) {
                    detalhesHtml += `<p>${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}</p>`;
                }

                document.getElementById('dadosExame').innerHTML = `
                    <p>Tipo: ${data.tipo}</p>
                    <p>Data: ${new Date(data.data).toLocaleString()}</p>
                    ${detalhesHtml}
                `;
                document.getElementById('botao_excluir_exame').style.display = 'block';
                document.getElementById('mensagem').textContent = '';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar exame:', error);
            document.getElementById('mensagem').textContent = 'Erro ao buscar exame';
        });
}

function excluirExame() {
    if (!confirm('Tem certeza que deseja excluir este exame?')) {
        return;
    }

    const documentId = document.getElementById('exameSelecionado').value;

    fetch(`/excluir-exame/${encodeURIComponent(documentId)}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('mensagem').textContent = data.message || data.error;
        if (!data.error) {
            document.getElementById('dadosExame').innerHTML = '';
            document.getElementById('botao_excluir_exame').style.display = 'none';
            document.getElementById('cpfBuscarExame').value = '';
            document.getElementById('selecao').value = '';
            document.getElementById('seletorExames').style.display = 'none';
            document.getElementById('formExcluirExame').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Erro ao excluir exame:', error);
        document.getElementById('mensagem').textContent = 'Erro ao excluir exame';
    });
}