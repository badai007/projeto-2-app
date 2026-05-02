package com.todo.auth;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class AuthHandler implements HttpHandler {
  private final AuthService authService;

  public AuthHandler(AuthService authService) {
    this.authService = authService;
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    addCorsHeaders(exchange);

    String method = exchange.getRequestMethod();

    if ("OPTIONS".equalsIgnoreCase(method)) {
      exchange.sendResponseHeaders(204, -1);
      return;
    }

    if (!"POST".equalsIgnoreCase(method)) {
      sendJson(exchange, 405, "{\"success\":false,\"message\":\"Metodo nao permitido.\"}");
      return;
    }

    String requestBody = readRequestBody(exchange.getRequestBody());
    String identifier = JsonUtil.extractStringValue(requestBody, "identifier");
    String password = JsonUtil.extractStringValue(requestBody, "password");

    AuthResult authResult = authService.authenticate(identifier, password);

    if (!authResult.success()) {
      sendJson(exchange, 401, "{\"success\":false,\"message\":\"" + JsonUtil.escape(authResult.message()) + "\"}");
      return;
    }

    User user = authResult.user();

    String responseBody = "{"
      + "\"success\":true,"
      + "\"message\":\"" + JsonUtil.escape(authResult.message()) + "\","
      + "\"redirectUrl\":\"../index/index.html\","
      + "\"token\":\"" + JsonUtil.escape(authResult.token()) + "\","
      + "\"user\":{"
      + "\"name\":\"" + JsonUtil.escape(user.name()) + "\","
      + "\"email\":\"" + JsonUtil.escape(user.email()) + "\","
      + "\"username\":\"" + JsonUtil.escape(user.username()) + "\""
      + "}"
      + "}";

    sendJson(exchange, 200, responseBody);
  }

  private void addCorsHeaders(HttpExchange exchange) {
    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
    exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
    exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
  }

  private String readRequestBody(InputStream requestBodyStream) throws IOException {
    byte[] bodyBytes = requestBodyStream.readAllBytes();
    return new String(bodyBytes, StandardCharsets.UTF_8);
  }

  private void sendJson(HttpExchange exchange, int statusCode, String responseBody) throws IOException {
    byte[] responseBytes = responseBody.getBytes(StandardCharsets.UTF_8);
    exchange.sendResponseHeaders(statusCode, responseBytes.length);

    try (OutputStream outputStream = exchange.getResponseBody()) {
      outputStream.write(responseBytes);
    }
  }
}
