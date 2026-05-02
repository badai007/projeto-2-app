package com.todo.auth;

public class AuthService {
  private final InMemoryUserRepository userRepository;

  public AuthService(InMemoryUserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public AuthResult authenticate(String identifier, String password) {
    if (identifier == null || identifier.isBlank() || password == null || password.isBlank()) {
      return AuthResult.failure("Preencha usuario/email e senha.");
    }

    User user = userRepository.findByIdentifier(identifier.trim());

    if (user == null || !user.password().equals(password)) {
      return AuthResult.failure("Usuario/email ou senha invalidos.");
    }

    String token = "token-" + user.username() + "-" + System.currentTimeMillis();
    return AuthResult.success(user, token, "Login realizado com sucesso.");
  }
}
