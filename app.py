from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # Para permitir requisições cross-origin
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions, QueryOptions
from couchbase.auth import PasswordAuthenticator
from couchbase.exceptions import DocumentNotFoundException, CouchbaseException
import os
import logging

app = Flask(__name__)
CORS(app)  # Habilita CORS para todas as rotas

# Configuração do logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuração do Couchbase
try:
    couchbase_host = 'cb.gomnpmkp8tqp8d1t.cloud.couchbase.com'
    couchbase_bucket = os.environ.get('COUCHBASE_BUCKET', 'DevHealthy')
    couchbase_user = os.environ.get('COUCHBASE_USER', 'DevHealthy')
    couchbase_password = os.environ.get('COUCHBASE_PASSWORD', 'Bk01Tj02@')

    cluster = Cluster.connect(f'couchbases://{couchbase_host}',
                            ClusterOptions(PasswordAuthenticator(couchbase_user, couchbase_password)))
    bucket = cluster.bucket(couchbase_bucket)
    collection = bucket.default_collection()
    logger.info("Conectado ao Couchbase com sucesso!")
except CouchbaseException as e:
    logger.error("Erro ao conectar ao Couchbase: %s", e.__class__.__name__)
    logger.error("Detalhes do erro: %s", e)
    exit(1)  # Encerra a aplicação em caso de erro de conexão
except Exception as e:
    logger.error("Erro inesperado ao conectar ao Couchbase: %s", e)
    exit(1)  # Encerra a aplicação em caso de erro de conexão

# Rota de Teste
@app.route('/test', methods=['GET'])
def test():
    return "Conexão bem-sucedida!", 200

# Rota para página principal
@app.route('/')
def home():
    return render_template('home.html')

# Rota para página de cadastro de paciente
@app.route('/cadastrar_paciente')
def cadastro_page():
    return render_template('cadastrar_paciente.html')

# Rota para página de consulta de paciente
@app.route('/consultar_paciente')
def consulta_page():
    return render_template('consultar_paciente.html')

# Rota para página de criação de exame
@app.route('/criar_exame')
def criar_exame_page():
    return render_template('criar_exame.html')

# Rota para página de consulta de exame
@app.route('/consultar_exame')
def consultar_exame_page():
    return render_template('consultar_exame.html')

# Rota para cadastrar paciente
@app.route('/cadastrar-paciente', methods=['POST'])
def cadastrar_paciente():
    try:
        paciente = request.json
        document_id = f"paciente::{paciente['cpf']}"
        
        # Verifica se o paciente já existe
        try:
            collection.get(document_id)
            return jsonify({"error": "Paciente já cadastrado"}), 400
        except DocumentNotFoundException:
            # Adiciona o tipo do documento
            paciente['type'] = 'paciente'
            # Insere o novo paciente
            collection.insert(document_id, paciente)
            logger.info(f"Paciente cadastrado com sucesso: {paciente}")
            return jsonify({"message": "Paciente cadastrado com sucesso!"}), 201
    except CouchbaseException as e:
        logger.error("Erro ao cadastrar paciente: %s", e)
        return jsonify({"error": str(e)}), 500

# Rota para consultar pacientes
@app.route('/consultar-pacientes', methods=['GET'])
def consultar_pacientes():
    try:
        query = 'SELECT * FROM `DevHealthy` WHERE type = "paciente"'
        result = cluster.query(query)
        pacientes = [row for row in result]
        logger.info(f"Pacientes encontrados: {pacientes}")
        return jsonify(pacientes), 200
    except CouchbaseException as e:
        logger.error("Erro ao consultar pacientes: %s", e)
        return jsonify({"error": str(e)}), 500

# Rota para consultar paciente por CPF
@app.route('/consultar-paciente/<cpf>', methods=['GET'])
def consultar_paciente(cpf):
    try:
        document_id = f"paciente::{cpf}"
        result = collection.get(document_id)
        paciente = result.content_as[dict]
        logger.info(f"Paciente encontrado: {paciente}")
        return jsonify(paciente), 200
    except DocumentNotFoundException:
        logger.warning(f"Paciente não encontrado: {cpf}")
        return jsonify({"error": "Paciente não encontrado"}), 404
    except CouchbaseException as e:
        logger.error("Erro ao consultar paciente: %s", e)
        return jsonify({"error": str(e)}), 500

# Rota para criar exame
@app.route('/criar-exame', methods=['PUT'])
def criar_exame():
    try:
        exame = request.json
        paciente_id = exame['pacienteId']
        tipo_exame = exame['tipoExame']
        detalhes_exame = exame['detalhes']
        data_exame = exame['data']

        logger.info(f"Recebido exame para paciente {paciente_id}: {exame}")

        # Obter o documento do paciente
        document_id = f"paciente::{paciente_id}"
        result = collection.get(document_id)
        paciente = result.content_as[dict]

        # Adicionar o exame ao documento do paciente
        if 'exames' not in paciente:
            paciente['exames'] = []
        paciente['exames'].append({
            'tipo': tipo_exame,
            'data': data_exame,
            'detalhes': detalhes_exame
        })

        # Atualizar o documento do paciente
        collection.upsert(document_id, paciente)
        logger.info(f"Exame adicionado ao paciente: {paciente_id}")
        return jsonify({"message": "Exame criado com sucesso!"}), 201
    except DocumentNotFoundException:
        logger.warning(f"Paciente não encontrado: {paciente_id}")
        return jsonify({"error": "Paciente não encontrado"}), 404
    except CouchbaseException as e:
        logger.error("Erro ao criar exame: %s", e)
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error("Erro inesperado ao criar exame: %s", e)
        return jsonify({"error": str(e)}), 500

# Rota para consultar exames
@app.route('/consultar-exames', methods=['GET'])
def consultar_exames():
    try:
        query = 'SELECT * FROM `DevHealthy` WHERE type = "exame"'
        result = cluster.query(query)
        exames = [row for row in result]
        logger.info(f"Exames encontrados: {exames}")
        return jsonify(exames), 200
    except CouchbaseException as e:
        logger.error("Erro ao consultar exames: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/consultar-exames/<cpf>', methods=['GET'])
def consultar_exames_paciente(cpf):
    if not cluster:
        return jsonify({"error": "Conexão com banco de dados não estabelecida"}), 500
        
    try:
        query = f'SELECT * FROM `DevHealthy` WHERE type = "exame" AND cpf = "{cpf}"'
        result = cluster.query(query)
        exames = [row for row in result]
        logger.info(f"Exames encontrados para o paciente {cpf}: {exames}")
        return jsonify(exames), 200
    except CouchbaseException as e:
        logger.error("Erro ao consultar exames do paciente: %s", e)
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        logger.error("Erro inesperado ao consultar exames do paciente: %s", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/remover-exame/<cpf>/<data>', methods=['DELETE'])
def remover_exame(cpf, data):
    if not collection:
        return jsonify({"error": "Conexão com banco de dados não estabelecida"}), 500
        
    try:
        document_id = f"exame::{cpf}::{data}"
        
        try:
            collection.get(document_id)
        except DocumentNotFoundException:
            return jsonify({"error": "Exame não encontrado"}), 404

        collection.remove(document_id)
        return jsonify({"message": "Exame removido com sucesso"}), 200
    except CouchbaseException as e:
        return jsonify({"error": f"Erro no banco de dados: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Erro inesperado: {str(e)}"}), 500

# Rota para obter a lista de pacientes
@app.route('/obter-pacientes', methods=['GET'])
def obter_pacientes():
    try:
        query = 'SELECT META().id, nome, cpf FROM `DevHealthy` WHERE type = "paciente"'
        result = cluster.query(query)
        pacientes = [{'id': row['id'], 'nome': row['nome'], 'cpf': row['cpf']} for row in result]
        logger.info(f"Pacientes encontrados: {pacientes}")
        return jsonify(pacientes), 200
    except CouchbaseException as e:
        logger.error("Erro ao obter pacientes: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)