FROM node:alpine3.16
RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash supervisor \
    && sed -i 's/bin\/ash/bin\/bash/g' /etc/passwd \
    && mkdir -p /app/www \
    && rm -rf /tmp/* /var/cache/apk/*

COPY ./.docker/etc/supervisord.conf /etc/supervisor/supervisord.conf

WORKDIR /app/www

CMD ["supervisord", "--nodaemon", "--configuration", "/etc/supervisor/supervisord.conf"]