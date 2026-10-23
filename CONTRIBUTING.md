# Contributing

## Good first issues

- Add a printer profile under `spec/printers/`. Copy an existing file, set `verified: false`, and leave `usb.productIds` empty until a device report includes them.
- Add one SGD key under `spec/sgd/settings/`. The filename is the key. Link `zplEquivalent` only when a ZPL command id already exists.

A printer report issue (model, firmware, and `~HI` output) is the usual source for those profiles.

## Rules for spec text

Write the explanation yourself. At least 40 words, plus a one-line summary. Each entry needs a `sourceRef` on `https://docs.zebra.com/`. Command names, parameter letters, and numeric ranges are facts. Do not paste programming-guide sentences or tables.

`seeAlso` must name another command id in the same language. Ranges that were not measured on hardware stay unverified. Do not invent a dpi when identification does not say one.

## Check

```sh
pnpm i
pnpm gen
pnpm lint
pnpm typecheck
pnpm test
```

Run `pnpm gen` twice before you open a pull request. The second run is a drift check: `git diff` on the generated files should be empty.

Generated files start with `GENERATED from spec/ - do not edit`. Change the YAML and regenerate.

C builders and parsers must not call `malloc`. Tests may allocate. Host tests and the TypeScript tests read `test-vectors/`.
