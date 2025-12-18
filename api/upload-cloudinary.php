<?php
// api/upload-cloudinary.php
header('Content-Type: application/json');

$CLOUDINARY_CLOUD_NAME = 'TU_CLOUD_NAME';
$CLOUDINARY_API_KEY = 'TU_API_KEY';
$CLOUDINARY_API_SECRET = 'TU_API_SECRET'; // ¡NUNCA lo expongas en el frontend!

if(empty($_FILES["image"])) {
    echo json_encode(['success' => false, 'error' => 'No se recibió ninguna imagen.']);
    exit;
}

// Configuración básica
$imageTmpPath = $_FILES['image']['tmp_name'];
$publicId = 'localstore_' . time() . '_' . uniqid(); // Nombre único para la imagen

// 1. Crear la cadena para firmar (requerida para subidas autenticadas)
$timestamp = time();
$signatureString = "public_id={$publicId}&timestamp={$timestamp}" . $CLOUDINARY_API_SECRET;
$signature = sha1($signatureString); // Genera la firma SHA1

// 2. Preparar los datos para enviar a Cloudinary
$postData = [
    'file' => new CURLFile($imageTmpPath),
    'api_key' => $CLOUDINARY_API_KEY,
    'timestamp' => $timestamp,
    'public_id' => $publicId,
    'signature' => $signature
];

// 3. Realizar la petición a la API de Cloudinary
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$CLOUDINARY_CLOUD_NAME}/image/upload");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$responseData = json_decode($response, true);

if($httpCode == 200 && isset($responseData['secure_url'])) {
    // Éxito: devuelve la URL segura de la imagen
    echo json_encode([
        'success' => true,
        'link' => $responseData['secure_url'] // Ej: https://res.cloudinary.com/.../image.jpg
    ]);
} else {
    // Error
    $errorMsg = $responseData['error']['message'] ?? 'Error al subir la imagen a Cloudinary.';
    echo json_encode([
        'success' => false,
        'error' => $errorMsg
    ]);
}
?>
