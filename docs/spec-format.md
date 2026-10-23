# Spec format

YAML files under `spec/` are validated by the JSON Schemas in `spec/schema/` (draft 2020-12) and by extra checks in `codegen/src/gen.ts`.

## Commands

`spec/zpl/commands/<id>.yaml` and `spec/epl2/commands/<id>.yaml`.

EPL uses two letters that differ only by case. On a case-insensitive disk, name those files `q-width.yaml` and `Q-length.yaml`. The `id` field stays `q` or `Q`. A filename must equal the id, or start with the id and a hyphen.

Required fields include `prefix`, `joiner` (`""` or `","`), `params`, `risk` (`safe`, `caution`, `destructive`), `explain` (40 words or more), `summary`, `seeAlso`, `models`, and `sourceRef`.

`sourceRef` must start with `https://docs.zebra.com/`.

## SGD

`spec/sgd/settings/<key>.yaml`. The filename is the full key, including dots. `access` is a list of `getvar`, `setvar`, and `do`. `readOnly` settings cannot include `setvar`. Integer settings need a `range`. Enum and bool settings need `values`. `zplEquivalent` is a ZPL command id or null.

## Status and printers

`spec/status/{hs,hqes,hi}.yaml` describes reply framing. `spec/printers/<id>.yaml` is a profile. Leave `verified: false` until someone measures that model. USB `vendorId` for Zebra is `2655` (`0x0A5F`). Leave `productIds` empty until a report includes them.

`spec/tspl/` and `spec/escpos/` are stubs. Do not invent ranges there.
