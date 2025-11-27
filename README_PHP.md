# API de Mercado Pago - PHP

## Descripción
API migrada desde Node.js a PHP usando el SDK oficial de Mercado Pago.

## Requisitos
- PHP 7.4 o superior
- Composer

## Instalación

### 1. Instalar Composer (si no lo tienes)
```bash
# En macOS con Homebrew
brew install composer

# O descargar directamente
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
```

### 2. Instalar dependencias
```bash
composer install
```

## Uso

### Servidor PHP incorporado
```bash
php -S localhost:3000 code.php
```

### Con Apache/Nginx
Configura el servidor web para apuntar al archivo `code.php` como punto de entrada.

## Rutas disponibles

### GET /
Mensaje de bienvenida

### POST /webhooks/mercadopago
Webhook para recibir notificaciones de Mercado Pago

**Body ejemplo:**
```json
{
  "data": {
    "id": "PREAPPROVAL_ID"
  }
}
```

### GET /api/getapp/:id
Obtener información de suscripción usando path parameter

**Ejemplo:**
```
GET http://localhost:3000/api/getapp/2c9380847e9b451c017ea1bd70ba0219
```

### GET /api/getapp?id=:id
Obtener información de suscripción usando query parameter

**Ejemplo:**
```
GET http://localhost:3000/api/getapp?id=2c9380847e9b451c017ea1bd70ba0219
```

## Características

- ✅ SDK oficial de Mercado Pago para PHP
- ✅ CORS habilitado
- ✅ Logging de todas las peticiones
- ✅ Manejo de errores
- ✅ Routing simple sin frameworks

## Configuración

Reemplaza el access token en `code.php`:
```php
MercadoPagoConfig::setAccessToken("TU_ACCESS_TOKEN_AQUI");
```

## Logs

Los logs se escriben en el error log de PHP. Para verlos:
```bash
tail -f /var/log/php-errors.log
```

O al ejecutar con el servidor incorporado, verás los logs en la consola.
