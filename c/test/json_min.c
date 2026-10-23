#include "json_min.h"

#include <ctype.h>
#include <stdlib.h>
#include <string.h>

static const char *skip(const char *p) {
  while (*p == ' ' || *p == '\n' || *p == '\r' || *p == '\t') p++;
  return p;
}

static jval *make(int type) {
  jval *value = calloc(1, sizeof *value);
  if (value) value->type = type;
  return value;
}

static int push_item(jval *parent, jval *child, char *key) {
  int next = parent->length + 1;
  jval *items = realloc(parent->items, (size_t)next * sizeof *items);
  if (!items) return 0;
  parent->items = items;
  parent->items[parent->length] = *child;
  free(child);
  if (key) {
    char **keys = realloc(parent->keys, (size_t)next * sizeof *keys);
    if (!keys) return 0;
    parent->keys = keys;
    parent->keys[parent->length] = key;
  }
  parent->length = next;
  return 1;
}

static const char *parse_value(const char *p, jval **out);

static const char *parse_string(const char *p, char **out) {
  size_t cap = 32;
  size_t n = 0;
  char *buf = malloc(cap);
  if (!buf || *p != '"') return 0;
  p++;
  while (*p && *p != '"') {
    char ch = *p++;
    if (ch == '\\') {
      char esc = *p++;
      if (esc == 'n') ch = '\n';
      else if (esc == 'r') ch = '\r';
      else if (esc == 't') ch = '\t';
      else if (esc == 'u') {
        int i;
        ch = 0;
        for (i = 0; i < 4 && *p; i++) p++;
        continue;
      } else ch = esc;
    }
    if (n + 2 > cap) {
      cap *= 2;
      char *grown = realloc(buf, cap);
      if (!grown) {
        free(buf);
        return 0;
      }
      buf = grown;
    }
    buf[n++] = ch;
  }
  if (*p != '"') {
    free(buf);
    return 0;
  }
  buf[n] = '\0';
  *out = buf;
  return p + 1;
}

static const char *parse_value(const char *p, jval **out) {
  p = skip(p);
  if (*p == '"') {
    jval *value = make(3);
    if (!value) return 0;
    p = parse_string(p, &value->string);
    if (!p) {
      json_free(value);
      return 0;
    }
    *out = value;
    return p;
  }
  if (*p == '{') {
    jval *value = make(5);
    if (!value) return 0;
    p++;
    p = skip(p);
    if (*p == '}') {
      *out = value;
      return p + 1;
    }
    while (*p) {
      char *key = 0;
      jval *child = 0;
      p = skip(p);
      p = parse_string(p, &key);
      if (!p) {
        json_free(value);
        return 0;
      }
      p = skip(p);
      if (*p != ':') {
        free(key);
        json_free(value);
        return 0;
      }
      p = parse_value(p + 1, &child);
      if (!p || !push_item(value, child, key)) {
        free(key);
        json_free(child);
        json_free(value);
        return 0;
      }
      p = skip(p);
      if (*p == ',') {
        p++;
        continue;
      }
      if (*p == '}') {
        *out = value;
        return p + 1;
      }
      json_free(value);
      return 0;
    }
  }
  if (*p == '[') {
    jval *value = make(4);
    if (!value) return 0;
    p++;
    p = skip(p);
    if (*p == ']') {
      *out = value;
      return p + 1;
    }
    while (*p) {
      jval *child = 0;
      p = parse_value(p, &child);
      if (!p || !push_item(value, child, 0)) {
        json_free(child);
        json_free(value);
        return 0;
      }
      p = skip(p);
      if (*p == ',') {
        p++;
        continue;
      }
      if (*p == ']') {
        *out = value;
        return p + 1;
      }
      json_free(value);
      return 0;
    }
  }
  if (strncmp(p, "true", 4) == 0) {
    jval *value = make(1);
    if (!value) return 0;
    value->boolean = 1;
    *out = value;
    return p + 4;
  }
  if (strncmp(p, "false", 5) == 0) {
    jval *value = make(1);
    if (!value) return 0;
    *out = value;
    return p + 5;
  }
  if (strncmp(p, "null", 4) == 0) {
    jval *value = make(0);
    if (!value) return 0;
    *out = value;
    return p + 4;
  }
  if (*p == '-' || isdigit((unsigned char)*p)) {
    char *end = 0;
    jval *value = make(2);
    if (!value) return 0;
    value->number = strtol(p, &end, 10);
    if (end == p) {
      json_free(value);
      return 0;
    }
    *out = value;
    return end;
  }
  return 0;
}

jval *json_parse(const char *text) {
  jval *value = 0;
  const char *end = parse_value(skip(text), &value);
  if (!end) return 0;
  return value;
}

void json_free(jval *value) {
  int i;
  if (!value) return;
  free(value->string);
  for (i = 0; i < value->length; i++) {
    free(value->items[i].string);
    if (value->items[i].items || value->items[i].keys) {
      jval *child = malloc(sizeof *child);
      if (child) {
        *child = value->items[i];
        child->string = 0;
        json_free(child);
      }
    }
    if (value->keys) free(value->keys[i]);
  }
  free(value->items);
  free(value->keys);
  free(value);
}

const jval *json_get(const jval *object, const char *key) {
  int i;
  if (!object || object->type != 5 || !object->keys) return 0;
  for (i = 0; i < object->length; i++) {
    if (strcmp(object->keys[i], key) == 0) return &object->items[i];
  }
  return 0;
}

const jval *json_at(const jval *array, int index) {
  if (!array || array->type != 4 || index < 0 || index >= array->length) return 0;
  return &array->items[index];
}

const char *json_str(const jval *value) {
  if (!value || value->type != 3) return 0;
  return value->string;
}

long json_long(const jval *value) {
  if (!value || value->type != 2) return 0;
  return value->number;
}

int json_bool(const jval *value) {
  if (!value || value->type != 1) return 0;
  return value->boolean;
}
