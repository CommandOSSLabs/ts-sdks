FROM openresty/openresty:1.25.3.1-2-alpine-fat

# Install the JWT library
RUN opm get SkyLothar/lua-resty-jwt

# Copy our configuration
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY auth.lua /usr/local/openresty/lua/auth.lua

# Standard OpenResty port
EXPOSE 80
