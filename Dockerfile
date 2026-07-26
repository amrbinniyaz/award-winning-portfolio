# Static site served by nginx.
#
# Dokploy's built-in `static` build type serves the files but sets no
# compression and no cache headers, which PageSpeed flags directly. This image
# exists purely so nginx.conf can supply both.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

# Config files live in the build context but should not be web-servable.
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/.dockerignore

EXPOSE 80
