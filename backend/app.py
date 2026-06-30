from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app) 


ARQUIVO_BD = os.path.join(os.path.dirname(__file__), 'usuarios.json')


def ler_usuarios():
    if not os.path.exists(ARQUIVO_BD):
        return []
    with open(ARQUIVO_BD, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def salvar_usuarios(usuarios):
    with open(ARQUIVO_BD, 'w', encoding='utf-8') as f:
        json.dump(usuarios, f, indent=4, ensure_ascii=False)

# === ROTA DE CADASTRO ===


@app.route('/api/cadastro', methods=['POST'])
def cadastrar():
    dados = request.json
    usuario = dados.get('usuario')
    email = dados.get('email')
    senha = dados.get('senha')

    usuarios = ler_usuarios()

    # Validação impede e-mails duplicados
    for u in usuarios:
        if u['email'] == email:
            return jsonify({"erro": "Este e-mail já está cadastrado!"}), 400

    # Armazena o novo usuário no array
    novo_usuario = {"usuario": usuario, "email": email, "senha": senha}
    usuarios.append(novo_usuario)
    salvar_usuarios(usuarios)

    return jsonify({"sucesso": "Conta criada com sucesso!"}), 201

# === ROTA DE LOGIN ===


@app.route('/api/login', methods=['POST'])
def login():
    dados = request.json
    email_ou_user = dados.get('email')
    senha = dados.get('senha')

    usuarios = ler_usuarios()

    # Varre o arquivo procurando as credenciais baterem
    for u in usuarios:
        if (u['email'] == email_ou_user or u['usuario'] == email_ou_user) and u['senha'] == senha:
            return jsonify({"sucesso": "Login autorizado!", "usuario": u['usuario']}), 200

    return jsonify({"erro": "Usuário ou senha incorretos!"}), 401


if __name__ == '__main__':
    app.run(port=5000, debug=True)
