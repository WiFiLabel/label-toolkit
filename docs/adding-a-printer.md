# Adding a printer

1. Copy `spec/printers/zp450.yaml` to `spec/printers/<id>.yaml`. The id is lowercase with hyphens.
2. Set `displayName`, `languages`, and the dpi values you can cite. If the head might be 203 or 300, list both and say so in `notes`.
3. Set `maxWidthDots`, `speed`, and `darkness` from a docs page or a printer report. Keep `verified: false`.
4. Set `usb.vendorId` to `2655` and `usb.productIds` to `[]`.
5. Write a `summary` and an `explain` of at least 40 words in your own sentences. Point `sourceRef` at a `docs.zebra.com` page for that model or for the language it speaks.
6. Run `pnpm gen`. The lint fails if the explanation is short or the link is off-site.

A useful report includes the model string, the firmware string, and the raw `~HI` reply. Open the printer-report issue template for that.
