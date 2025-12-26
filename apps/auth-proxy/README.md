# OpenResty JWT Reverse Proxy

A high-performance reverse proxy built with **OpenResty** and **Lua** designed to add a security layer to private backend services. This proxy validates JSON Web Tokens (JWT) at the edge before traffic ever reaches your application.

## 🚀 Architecture

1. **Client** sends a request with an `Authorization: Bearer <token>` header.
2. **OpenResty** (this service) intercepts the request.
3. **Lua (in-memory)** validates the JWT signature using your `JWT_SECRET`.
4. **If valid:** The request is proxied to the configured `UPSTREAM_URL`.
5. **If invalid:** A `401 Unauthorized` is returned immediately, protecting your backend from load.

---

## 🛠 Setup & Deployment

### 1. Environment Variables

You must set the following variable in your Railway project settings for this service:

| Variable | Description |
| --- | --- |
| `JWT_SECRET` | The secret key used to sign and verify your tokens. |
| `UPSTREAM_URL` | The URL of the backend service to proxy requests to (e.g., `http://my-backend-service:3000`). |

### 2. Deployment

Since the `Dockerfile` is included, Railway will automatically detect and build the OpenResty environment with the `lua-resty-jwt` library installed via LuaRocks.

---

## 🔒 Usage

### Required Header

All requests must include the JWT in the following format:

```http
Authorization: Bearer <your_jwt_token>
```

### Backend Integration

When a request is successfully validated, this proxy forwards the request to your backend and injects the following header:

* `X-User-ID`: Contains the `sub` (subject) claim from the JWT payload.

You can use this header in your web server to identify the user without re-verifying the token.

---

## ⚡ Performance Benefits

* **No Sidecars:** Validation happens inside the Nginx worker process.
* **Low Latency:** Eliminates the extra network hop usually required for auth services.
* **Zero-Trust:** Your backend web server can remain completely private (no public domain), accessible only through this authenticated gateway.

---

## 🧪 Testing with Node.js

If you need to generate a token to test the proxy, you can use this snippet:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { sub: '1234567890', name: 'John Doe' }, 
  process.env.JWT_SECRET, 
  { algorithm: 'HS256' }
);

console.log(`Bearer ${token}`);

```
