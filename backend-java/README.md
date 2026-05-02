# Backend Java puro

Backend de login sem framework, usando apenas classes da JDK.

## O que ele faz

- sobe um servidor HTTP em `http://localhost:8080`
- recebe `POST /auth/login`
- aceita `identifier` como usuario ou email
- valida a senha
- responde JSON para o frontend decidir o proximo passo

## Como executar

No PowerShell, rode:

```powershell
.\backend-java\run-backend.bat
```

## Usuarios de teste

- `maria@email.com` com senha `abc123`
- `maria` com senha `abc123`
- `joao@email.com` com senha `123456`
- `joao` com senha `123456`

## Payload esperado

```json
{
  "identifier": "maria@email.com",
  "password": "abc123"
}
```

## Resposta de sucesso

```json
{
  "success": true,
  "message": "Login realizado com sucesso.",
  "redirectUrl": "../index/index.html",
  "token": "token-maria-...",
  "user": {
    "name": "Maria",
    "email": "maria@email.com",
    "username": "maria"
  }
}
```

## Proximo passo recomendado

Trocar `InMemoryUserRepository` por uma implementacao com banco quando voce quiser ligar esse login na tabela `users`.
