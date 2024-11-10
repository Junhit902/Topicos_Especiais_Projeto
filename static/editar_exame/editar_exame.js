document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formBuscarExames").addEventListener("submit", buscarExames);
    document.getElementById("formEditarExame").addEventListener("submit", editarExame);
});

function buscarExames(event) {
    event.preventDefault();

    const cpf = document.getElementById('cpfBuscar').value;

    fetch(`/consultar-exames/${encodeURIComponent(cpf)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('mensagem').textContent = data.error;
                document.getElementById('seletorExames').style.display = 'none';
                document.getElementById('formEditarExame').style.display = 'none';
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
                document.getElementById('formEditarExame').style.display = 'none';
            } else {
                document.getElementById('tipoExame').value = data.tipo;
                document.getElementById('dataExame').value = new Date(data.data).toISOString().slice(0, 16);
                document.getElementById('hemoglobina').value = data.detalhes.hemoglobina;
                document.getElementById('leucocitos').value = data.detalhes.leucocitos;

                document.getElementById('formEditarExame').style.display = 'block';
                document.getElementById('mensagem').textContent = '';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar exame:', error);
            document.getElementById('mensagem').textContent = 'Erro ao buscar exame';
        });
}

function editarExame(event) {
    event.preventDefault();

    const documentId = document.getElementById('exameSelecionado').value;
    const exame = {
        tipo: document.getElementById('tipoExame').value,
        data: new Date(document.getElementById('dataExame').value).toISOString(),
        detalhes: {
            hemoglobina: document.getElementById('hemoglobina').value,
            leucocitos: document.getElementById('leucocitos').value,
        }
    };

    fetch(`/editar-exame/${encodeURIComponent(documentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exame)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('mensagem').textContent = data.message || data.error;
    })
    .catch(error => {
        console.error('Erro ao editar exame:', error);
        document.getElementById('mensagem').textContent = 'Erro ao editar exame';
    });
}