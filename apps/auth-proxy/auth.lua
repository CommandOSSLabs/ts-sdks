local jwt = require "resty.jwt"

local secret = os.getenv("JWT_SECRET")
if not secret then
    ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR
    ngx.say('{"error": "JWT_SECRET is not set"}')
    return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

local upstream_url = os.getenv("UPSTREAM_URL")
if not upstream_url then
    ngx.status = ngx.HTTP_INTERNAL_SERVER_ERROR
    ngx.say('{"error": "UPSTREAM_URL is not set"}')
    return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

-- 1. Get the Authorization header
local auth_header = ngx.var.http_authorization
if not auth_header then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say('{"error": "Missing Authorization header"}')
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- 2. Extract the token from "Bearer <token>"
local _, _, token = string.find(auth_header, "Bearer%s+(.+)")
if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say('{"error": "Invalid token format"}')
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- 3. Verify the JWT
local jwt_obj = jwt:verify(secret, token)
if not jwt_obj.verified then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say('{"error": "' .. (jwt_obj.reason or "invalid token") .. '"}')
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

-- 4. Optional: Pass user info to backend via headers
ngx.req.set_header("X-User-ID", jwt_obj.payload.sub)
