document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formBuscarExames").addEventListener("submit", function(event) {
        event.preventDefault();
        buscarExames();
    });
    document.getElementById("formEditarExame").addEventListener("submit", function(event) {
        event.preventDefault();
        editarExame();
    });
});

function buscarExames() {
    const cpf = document.getElementById('cpfBuscar').value;
    fetch(`/api/consultar-exames/${cpf}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('mensagem').textContent = data.error;
                document.getElementById('seletorExames').style.display = 'none';
                document.getElementById('formEditarExame').style.display = 'none';
            } else {
                const exameSelecionado = document.getElementById('exameSelecionado');
                exameSelecionado.innerHTML = '';
                data.forEach(exame => {
                    const option = document.createElement('option');
                    option.value = exame.id;  // Certifique-se de que o valor é o documentId
                    option.textContent = `${exame.tipo} - ${new Date(exame.data).toLocaleString()}`;
                    exameSelecionado.appendChild(option);
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
                document.getElementById('formEditarExame').style.display = 'none';
            } else {
                document.getElementById('tipoExame').value = data.tipo;
                document.getElementById('dataExame').value = new Date(data.data).toISOString().slice(0, 16);

                const detalhesExame = document.getElementById('detalhesExame');
                detalhesExame.innerHTML = '';

                if (data.tipo === 'Sangue') {
                    detalhesExame.innerHTML = `
                        <label for="hemoglobina">Hemoglobina:</label>
                        <input type="text" id="hemoglobina" value="${data.detalhes.hemoglobina || ''}">
                        <label for="leucocitos">Leucócitos:</label>
                        <input type="text" id="leucocitos" value="${data.detalhes.leucocitos || ''}">
                    `;
                } else if (data.tipo === 'Urina') {
                    detalhesExame.innerHTML = `
                        <label for="ph">pH:</label>
                        <input type="text" id="ph" value="${data.detalhes.ph || ''}">
                        <label for="densidade">Densidade:</label>
                        <input type="text" id="densidade" value="${data.detalhes.densidade || ''}">
                    `;
                } else if (data.tipo === 'Eletrocardiograma') {
                    detalhesExame.innerHTML = `
                        <label for="frequenciaCardiaca">Frequência Cardíaca:</label>
                        <input type="text" id="frequenciaCardiaca" value="${data.detalhes.frequenciaCardiaca || ''}">
                        <label for="ritmo">Ritmo:</label>
                        <input type="text" id="ritmo" value="${data.detalhes.ritmo || ''}">
                    `;
                } else if (data.tipo === 'Raio-X' || data.tipo === 'Ultrassom') {
                    detalhesExame.innerHTML = `
                        <label for="observacoes">Observações:</label>
                        <input type="text" id="observacoes" value="${data.detalhes.observacoes || ''}">
                        <label for="regiao">Região:</label>
                        <input type="text" id="regiao" value="${data.detalhes.regiao || ''}">
                    `;
                }

                document.getElementById('formEditarExame').style.display = 'block';
                document.getElementById('mensagem').textContent = '';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar exame:', error);
            document.getElementById('mensagem').textContent = 'Erro ao buscar exame';
        });
}

function editarExame() {
    const documentId = document.getElementById('exameSelecionado').value;
    const tipoExame = document.getElementById('tipoExame').value;
    const exame = {
        tipo: tipoExame,
        data: new Date(document.getElementById('dataExame').value).toISOString(),
        detalhes: {}
    };

    if (tipoExame === 'Sangue') {
        exame.detalhes.hemoglobina = document.getElementById('hemoglobina').value;
        exame.detalhes.leucocitos = document.getElementById('leucocitos').value;
    } else if (tipoExame === 'Urina') {
        exame.detalhes.ph = document.getElementById('ph').value;
        exame.detalhes.densidade = document.getElementById('densidade').value;
    } else if (tipoExame === 'Eletrocardiograma') {
        exame.detalhes.frequenciaCardiaca = document.getElementById('frequenciaCardiaca').value;
        exame.detalhes.ritmo = document.getElementById('ritmo').value;
    } else if (tipoExame === 'Raio-X' || tipoExame === 'Ultrassom') {
        exame.detalhes.observacoes = document.getElementById('observacoes').value;
        exame.detalhes.regiao = document.getElementById('regiao').value;
    }

    fetch(`/editar-exame/${encodeURIComponent(documentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exame)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('mensagem').textContent = data.error;
        } else {
            document.getElementById('mensagem').textContent = 'Exame atualizado com sucesso!';
        }
    })
    .catch(error => {
        console.error('Erro ao editar exame:', error);
        document.getElementById('mensagem').textContent = 'Erro ao editar exame';
    });
}