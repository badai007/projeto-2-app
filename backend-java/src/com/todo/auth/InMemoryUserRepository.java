package com.todo.auth;

import java.util.List;

public class InMemoryUserRepository {
  private final List<User> users = List.of(
    new User("maria", "Maria", "maria@email.com", "abc123"),
    new User("joao", "Joao", "joao@email.com", "123456")
  );

  public User findByIdentifier(String identifier) {
    for (User user : users) {
      if (user.username().equalsIgnoreCase(identifier) || user.email().equalsIgnoreCase(identifier)) {
        return user;
      }
    }

    return null;
  }
}
