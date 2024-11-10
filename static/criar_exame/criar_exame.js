document.addEventListener("DOMContentLoaded", function () {
    carregarPacientes();

    document.getElementById("formCriarExame").addEventListener("submit", function(event) {
        event.preventDefault();
        criarExame();
    });

    document.getElementById("selectPaciente").addEventListener("change", function() {
        const selectedOption = this.options[this.selectedIndex];
        const cpfPaciente = selectedOption.getAttribute('data-cpf');
        document.getElementById('cpfPaciente').textContent = cpfPaciente ? `CPF: ${cpfPaciente}` : '';
    });
});

function carregarPacientes() {
    fetch('/obter-pacientes')
        .then(response => response.json())
        .then(data => {
            const selectPaciente = document.getElementById('selectPaciente');
            selectPaciente.innerHTML = '<option value="">Selecione um paciente</option>'; // Limpa as opções anteriores

            data.forEach(paciente => {
                const option = document.createElement('option');
                option.value = paciente.id;
                option.textContent = paciente.nome;
                option.setAttribute('data-cpf', paciente.cpf);
                selectPaciente.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar pacientes:', error);
        });
}

function criarExame() {
    const pacienteId = document.getElementById('selectPaciente').value;
    const tipoExame = document.getElementById('tipoExame').value;
    const detalhes = document.getElementById('detalhes').value;
    const data = document.getElementById('dataExame').value;

    const exame = {
        pacienteId,
        tipoExame,
        detalhes,
        data
    };

    fetch('/criar-exame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(exame)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('mensagem').textContent = data.message || data.error;
        if (data.success) {
            document.getElementById('mensagem').textContent = 'Exame criado com sucesso!';
            resetForm();
        } else {
            document.getElementById('mensagem').textContent = 'Erro ao criar exame.';
        }
    })
    .catch(error => {
        console.error('Erro ao criar exame:', error);
        document.getElementById('mensagem').textContent = 'Erro ao criar exame.';
    });
}

function resetForm() {
    document.getElementById('formCriarExame').reset();
    document.getElementById('cpfPaciente').textContent = '';
    document.getElementById('selectPaciente').selectedIndex = 0;
}

function mostrarFormularioExame() {
    const tipoExame = document.getElementById('tipoExame').value;
    const formExameContainer = document.getElementById('formExameContainer');
    formExameContainer.innerHTML = ''; // Limpa o formulário anterior

    if (tipoExame === 'Sangue') {
        formExameContainer.innerHTML = `
            <label for="hemoglobina">Hemoglobina:</label>
            <input type="text" id="hemoglobina" name="hemoglobina" required>
            <label for="leucocitos">Leucócitos:</label>
            <input type="text" id="leucocitos" name="leucocitos" required>
        `;
    } else if (tipoExame === 'Urina') {
        formExameContainer.innerHTML = `
            <label for="ph">pH:</label>
            <input type="text" id="ph" name="ph" required>
            <label for="densidade">Densidade:</label>
            <input type="text" id="densidade" name="densidade" required>
        `;
    } else if (tipoExame === 'Raio-X') {
        formExameContainer.innerHTML = `
            <label for="regiao">Região:</label>
            <input type="text" id="regiao" name="regiao" required>
            <label for="observacoes">Observações:</label>
            <textarea id="observacoes" name="observacoes" required></textarea>
        `;
    } else if (tipoExame === 'Ultrassom') {
        formExameContainer.innerHTML = `
            <label for="regiao">Região:</label>
            <input type="text" id="regiao" name="regiao" required>
            <label for="observacoes">Observações:</label>
            <textarea id="observacoes" name="observacoes" required></textarea>
        `;
    } else if (tipoExame === 'Eletrocardiograma') {
        formExameContainer.innerHTML = `
            <label for="frequencia">Frequência Cardíaca:</label>
            <input type="text" id="frequencia" name="frequencia" required>
            <label for="ritmo">Ritmo:</label>
            <input type="text" id="ritmo" name="ritmo" required>
        `;
    }
}

function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    menu.classList.toggle('active');
}
