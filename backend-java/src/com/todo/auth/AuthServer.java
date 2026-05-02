package com.todo.auth;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;

public class AuthServer {
  private static final int PORT = 8080;

  public static void main(String[] args) throws IOException {
    InMemoryUserRepository userRepository = new InMemoryUserRepository();
    AuthService authService = new AuthService(userRepository);

    HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
    server.createContext("/auth/login", new AuthHandler(authService));
    server.setExecutor(null);
    server.start();

    System.out.println("Servidor Java iniciado em http://localhost:" + PORT);
    System.out.println("Endpoint de login: POST /auth/login");
    System.out.println("Usuario de teste: maria@email.com | senha: abc123");
    System.out.println("Usuario alternativo: joao | senha: 123456");
  }
}
