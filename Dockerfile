# Usa un'immagine PHP con Apache
FROM php:8.2-apache

# Imposta la directory di lavoro
WORKDIR /var/www/html

# Copia tutti i file del progetto dentro il container
COPY . /var/www/html/

# Imposta ServerName per evitare l'avviso
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Configura Apache per puntare alla pagina corretta
RUN echo '<Directory /var/www/html/bacheca_x_tutti>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n\
DocumentRoot /var/www/html/bacheca_x_tutti\n\
DirectoryIndex bacheca_xtutti.html\n' \
> /etc/apache2/sites-available/000-default.conf

# Abilita mod_rewrite (utile per PHP dinamico)
RUN a2enmod rewrite
