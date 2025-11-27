<?php

// Requerir el autoloader de Composer
require_once __DIR__ . '/vendor/autoload.php';

use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\PreApproval\PreApprovalClient;

// Configuración de headers para las respuestas JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurar Mercado Pago
MercadoPagoConfig::setAccessToken("TEST-4025359772954609-112511-4b508203309dc7f645c8d628e01add1d-65594592");
MercadoPagoConfig::setRuntimeEnviroment(MercadoPagoConfig::LOCAL);

// Crear instancia del cliente
$preApprovalClient = new PreApprovalClient();

// Middleware de logging
$timestamp = date('c');
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
error_log("[{$timestamp}] {$method} {$path}");

// Routing simple
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestUri = rtrim($requestUri, '/');

// Ruta: GET /
if ($requestUri === '' || $requestUri === '/') {
    echo json_encode(['message' => 'Bienvenido a la API']);
    exit();
}

// Ruta: POST /webhooks/mercadopago
if ($requestUri === '/webhooks/mercadopago' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener el body del request
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Obtener el ID de la suscripción
    $preapprovalId = $data['data']['id'] ?? null;
    
    error_log("Este es el ID de la solicitud: {$preapprovalId}");
    
    try {
        // Obtener información completa de la suscripción
        $preapproval = $preApprovalClient->get($preapprovalId);
        
        error_log("Datos de sub: " . json_encode($preapproval));
        
        // Lógica de negocio (Actualización de base de datos)
        error_log("Webhook de Suscripción recibido. ID: {$preapprovalId}");
        
    } catch (Exception $e) {
        error_log("Error al procesar webhook o buscar preapproval: " . $e->getMessage());
    }
    
    // Siempre responder con 200 OK
    http_response_code(200);
    exit();
}


// Ruta no encontrada
http_response_code(404);
echo json_encode(['error' => 'Ruta no encontrada']);
