#ifndef JSON_MIN_H
#define JSON_MIN_H

typedef struct jval jval;

struct jval {
  int type; /* 0 null, 1 bool, 2 number, 3 string, 4 array, 5 object */
  int boolean;
  long number;
  char *string;
  jval *items;
  char **keys;
  int length;
};

jval *json_parse(const char *text);
void json_free(jval *value);
const jval *json_get(const jval *object, const char *key);
const jval *json_at(const jval *array, int index);
const char *json_str(const jval *value);
long json_long(const jval *value);
int json_bool(const jval *value);

#endif
