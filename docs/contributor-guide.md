# Contributor guide

`pnpm gen` reads every YAML file, checks the schema, then writes:

- `packages/spec/src/generated/data.ts`
- `packages/spec/data/*.json`
- `c/include/wlt_spec.h`
- `c/src/wlt_spec.c`

Those outputs start with `GENERATED from spec/ - do not edit`. Firmware builds compile the C files as they are. They do not run Node.

TypeScript packages are built with tsup (ESM, CJS, and `d.ts`). Vitest aliases `@wifilabel/printer-spec` and `@wifilabel/transport` at the source so tests do not need a prior build. `pnpm typecheck` does need `pnpm build` first, and Turbo orders that.

Shared cases live in `test-vectors/`. The Vitest suite and `c/test/test_main.c` both read them. If you change a builder, update the JSON and the golden `.zpl` files together, then run `pnpm test`.

Host C tests:

```sh
cmake -S c -B c/build-host
cmake --build c/build-host
ctest --test-dir c/build-host --output-on-failure
```

Doc strings in the C tables are compiled only when `WLT_WITH_DOCS` is set. The default host build and the ESP-IDF example leave them out so the spec rodata stays small.

See `CONTRIBUTING.md` for the clean-room rule and the two good-first-issue shapes.
