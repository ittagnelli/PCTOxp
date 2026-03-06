FROM php:8.2-apache-bookworm

WORKDIR /var/www/html

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions pdo_mysql pdo_sqlite zip

RUN a2enmod rewrite

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY ./apache/vhost.conf /etc/apache2/sites-available/000-default.conf

COPY . /var/www/html/

RUN if [ -f login/composer.json ]; then \
    cd login && composer install --no-interaction --optimize-autoloader; \
    fi
