function bytesPerRow(widthDots: number): number {
  return Math.ceil(widthDots / 8);
}

function assertBitmap(bitmap: Uint8Array, widthDots: number, heightDots: number): number {
  if (widthDots <= 0 || heightDots <= 0) throw new Error("bitmap size must be positive");
  const expected = bytesPerRow(widthDots) * heightDots;
  if (bitmap.length < expected)
    throw new Error(`bitmap is ${bitmap.length} bytes, need ${expected}`);
  return expected;
}

function hexBytes(bitmap: Uint8Array, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++)
    out += (bitmap[i] ?? 0).toString(16).toUpperCase().padStart(2, "0");
  return out;
}

/** Wrap a 1-bit bitmap as a ZPL `^GFA` format. Caller frees nothing; the result is a new buffer. */
export function wrapZplGfa(bitmap: Uint8Array, widthDots: number, heightDots: number): Uint8Array {
  const expected = assertBitmap(bitmap, widthDots, heightDots);
  const bpr = bytesPerRow(widthDots);
  const text = `^XA\n^PW${widthDots}\n^LL${heightDots}\n^FO0,0^GFA,${expected},${expected},${bpr},${hexBytes(bitmap, expected)}^FS\n^XZ\n`;
  return new TextEncoder().encode(text);
}

/** Wrap a 1-bit bitmap as an EPL2 `GW` job. The image bytes are raw, not hex. */
export function wrapEplGw(bitmap: Uint8Array, widthDots: number, heightDots: number): Uint8Array {
  const expected = assertBitmap(bitmap, widthDots, heightDots);
  const bpr = bytesPerRow(widthDots);
  const head = new TextEncoder().encode(`\r\nN\r\nGW0,0,${bpr},${heightDots},`);
  const tail = new TextEncoder().encode("\r\nP1\r\n");
  const out = new Uint8Array(head.length + expected + tail.length);
  out.set(head, 0);
  out.set(bitmap.subarray(0, expected), head.length);
  out.set(tail, head.length + expected);
  return out;
}

/**
 * Wrap a 1-bit bitmap as a TSPL `BITMAP` job.
 * The size line is the 4x6 shipping page used by the firmware helper.
 */
export function wrapTsplBitmap(
  bitmap: Uint8Array,
  widthDots: number,
  heightDots: number,
): Uint8Array {
  const expected = assertBitmap(bitmap, widthDots, heightDots);
  const bpr = bytesPerRow(widthDots);
  const head = new TextEncoder().encode(`SIZE 4,6\r\nCLS\r\nBITMAP 0,0,${bpr},${heightDots},0,`);
  const tail = new TextEncoder().encode("\r\nPRINT 1\r\n");
  const out = new Uint8Array(head.length + expected + tail.length);
  out.set(head, 0);
  out.set(bitmap.subarray(0, expected), head.length);
  out.set(tail, head.length + expected);
  return out;
}
