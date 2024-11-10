document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formBuscarPaciente").addEventListener("submit", buscarPaciente);
    document.getElementById("formEditarPaciente").addEventListener("submit", editarPaciente);
});

function buscarPaciente(event) {
    event.preventDefault();

    const cpf = document.getElementById('cpfBuscar').value;

    fetch(`/consultar-paciente/${encodeURIComponent(cpf)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('mensagem').textContent = data.error;
                document.getElementById('formEditarPaciente').style.display = 'none';
            } else {
                document.getElementById('nomePaciente').value = data.nome;
                document.getElementById('dataNascimento').value = data.dataNascimento;
                document.getElementById('sexoPaciente').value = data.sexo;
                document.getElementById('ruaPaciente').value = data.endereco.rua;
                document.getElementById('numeroPaciente').value = data.endereco.numero;
                document.getElementById('cidadePaciente').value = data.endereco.cidade;
                document.getElementById('estadoPaciente').value = data.endereco.estado;
                document.getElementById('cepPaciente').value = data.endereco.cep;

                document.getElementById('formEditarPaciente').style.display = 'block';
                document.getElementById('mensagem').textContent = '';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar paciente:', error);
            document.getElementById('mensagem').textContent = 'Erro ao buscar paciente';
        });
}

function editarPaciente(event) {
    event.preventDefault();

    const cpf = document.getElementById('cpfBuscar').value;
    const paciente = {
        nome: document.getElementById('nomePaciente').value,
        dataNascimento: document.getElementById('dataNascimento').value,
        sexo: document.getElementById('sexoPaciente').value,
        endereco: {
            rua: document.getElementById('ruaPaciente').value,
            numero: document.getElementById('numeroPaciente').value,
            cidade: document.getElementById('cidadePaciente').value,
            estado: document.getElementById('estadoPaciente').value,
            cep: document.getElementById('cepPaciente').value,
        }
    };

    fetch(`/editar-paciente/${encodeURIComponent(cpf)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paciente)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('mensagem').textContent = data.message || data.error;
    })
    .catch(error => {
        console.error('Erro ao editar paciente:', error);
        document.getElementById('mensagem').textContent = 'Erro ao editar paciente';
    });
}