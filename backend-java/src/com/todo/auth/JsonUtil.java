package com.todo.auth;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class JsonUtil {
  private JsonUtil() {
  }

  public static String extractStringValue(String json, String fieldName) {
    String patternValue = "\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*\"((?:\\\\.|[^\\\\\"])*)\"";
    Pattern pattern = Pattern.compile(patternValue);
    Matcher matcher = pattern.matcher(json);

    if (!matcher.find()) {
      return null;
    }

    return unescape(matcher.group(1));
  }

  public static String escape(String value) {
    if (value == null) {
      return "";
    }

    return value
      .replace("\\", "\\\\")
      .replace("\"", "\\\"")
      .replace("\n", "\\n")
      .replace("\r", "\\r");
  }

  private static String unescape(String value) {
    return value
      .replace("\\\"", "\"")
      .replace("\\n", "\n")
      .replace("\\r", "\r")
      .replace("\\\\", "\\");
  }
}
