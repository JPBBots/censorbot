# Filter list.

Keyed by `language`.json (ex; en.json)

Example of a filter file:

```json
{
  "regex": ["list", "of", "bypasses"]
}
```

For example;

```json
{
  "test": ["testa"]
}
```

Will censor `test` but not `testa`.

Filters are privated to prevent direct bot replication. But you're welcome to make your own!