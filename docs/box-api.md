# WiFiLabel box HTTP API

The browser client in `@wifilabel/box-client` calls a box on the local network. Firmware can implement this later. The browser sends `fetch(url, { targetAddressSpace: "local" })`, which shows Chrome's Local Network Access prompt (Chrome 142 and newer).

Base URL: `http://<ip>` or `http://wifilabel-xxxx.local`. HTTPS is not used for the box itself. The page that calls it is HTTPS.

## POST /api/raw

Send printer bytes and return the printer's reply.

- Request: `Content-Type: application/octet-stream`. Body is the raw bytes (ZPL, SGD, or status query).
- Response: `200` with `Content-Type: application/octet-stream`. Body is the reply bytes. An empty body means the printer did not answer.
- Do not log the body. It can contain label text.

## GET /api/info

- Response: `200` JSON. Suggested fields: `name` (for example `wifilabel-ab12`) and `firmware`.
- Do not include serial numbers or Wi-Fi passwords.

## CORS and the local-network preflight

Answer `OPTIONS` for both paths with `204` and:

- `Access-Control-Allow-Origin`: the request `Origin`, or `*`
- `Access-Control-Allow-Methods`: `GET, POST, OPTIONS`
- `Access-Control-Allow-Headers`: `content-type`
- `Access-Control-Allow-Private-Network`: `true`
- `Access-Control-Max-Age`: `600`
- `Vary`: `Origin, Access-Control-Request-Private-Network`

Chrome sends `Access-Control-Request-Private-Network: true` on the preflight when the page sets `targetAddressSpace: "local"`. The allow-private-network response header is required or the browser blocks the call.

Repeat `Access-Control-Allow-Origin` and `Access-Control-Allow-Private-Network: true` on `GET` and `POST` responses, not only on `OPTIONS`.

Keep this API on the LAN. There is no authentication in this contract.
