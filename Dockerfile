FROM php:8.2-apache

WORKDIR /var/www/html

# Abilita mod_rewrite
RUN a2enmod rewrite

# Installa estensioni per MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Copia configurazione Apache personalizzata
COPY ./apache/vhost.conf /etc/apache2/sites-available/000-default.conf

# Copia codice del progetto (solo per build iniziale: verrà sovrascritto dal volume)
COPY ./www /var/www/html/
