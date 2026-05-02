package com.todo.auth;

public record AuthResult(boolean success, String message, String token, User user) {
  public static AuthResult success(User user, String token, String message) {
    return new AuthResult(true, message, token, user);
  }

  public static AuthResult failure(String message) {
    return new AuthResult(false, message, null, null);
  }
}
