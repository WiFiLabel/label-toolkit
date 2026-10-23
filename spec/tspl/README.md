# TSPL / TSPL2

TSPL command entries are not in this release. When they are added, each file uses the same command schema as ZPL and EPL2 (`spec/schema/command.schema.json`) with `language: tspl`.

The C helpers already wrap a packed bitmap as a TSPL2 `BITMAP` command (`wlt_wrap_tspl_bitmap`). A future YAML entry should describe that command and the `SIZE` / `CLS` / `PRINT` sequence around it.

Do not invent parameter ranges. Add a `sourceRef` on docs.zebra.com only when the page actually documents the behavior; TSC-family manuals are the usual source for TSPL and can be cited in `explain` once the schema allows a second reference.
