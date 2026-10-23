# ESC/POS

ESC/POS command entries are not in this release. When they are added, each file uses the same command schema as the other languages (`spec/schema/command.schema.json`) with `language: escpos`.

Receipt printers and the Dymo raster family need their own bitmap wrappers. They are intentionally absent until a profile covers a real model. Keep `language` as the discriminator so one codegen path can emit them later.
