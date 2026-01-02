<?php
/**
 * Health Check Endpoint for FINSIGHT API
 * This endpoint is used by Nagios to monitor API health
 * 
 * Returns HTTP 200 if all systems are operational
 * Returns HTTP 500 if there are critical issues
 */

header('Content-Type: application/json');

$health = [
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => []
];

$allHealthy = true;

// Check 1: Database Connection
try {
    require_once __DIR__ . '/../utils/Database.php';
    $db = Database::getInstance()->getConnection();
    
    if ($db) {
        $health['checks']['database'] = [
            'status' => 'healthy',
            'message' => 'Database connection successful'
        ];
    } else {
        throw new Exception('Database connection failed');
    }
} catch (Exception $e) {
    $health['checks']['database'] = [
        'status' => 'unhealthy',
        'message' => $e->getMessage()
    ];
    $allHealthy = false;
}

// Check 2: File System (writable directories)
$uploadDir = __DIR__ . '/../../uploads';
if (is_writable($uploadDir)) {
    $health['checks']['filesystem'] = [
        'status' => 'healthy',
        'message' => 'File system is writable'
    ];
} else {
    $health['checks']['filesystem'] = [
        'status' => 'warning',
        'message' => 'Upload directory is not writable'
    ];
}

// Check 3: PHP Version
$phpVersion = phpversion();
if (version_compare($phpVersion, '7.4', '>=')) {
    $health['checks']['php'] = [
        'status' => 'healthy',
        'message' => "PHP version: $phpVersion"
    ];
} else {
    $health['checks']['php'] = [
        'status' => 'warning',
        'message' => "PHP version $phpVersion is outdated"
    ];
}

// Check 4: Required Extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'curl'];
$missingExtensions = [];

foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

if (empty($missingExtensions)) {
    $health['checks']['extensions'] = [
        'status' => 'healthy',
        'message' => 'All required PHP extensions are loaded'
    ];
} else {
    $health['checks']['extensions'] = [
        'status' => 'unhealthy',
        'message' => 'Missing extensions: ' . implode(', ', $missingExtensions)
    ];
    $allHealthy = false;
}

// Set overall status
if (!$allHealthy) {
    $health['status'] = 'unhealthy';
    http_response_code(500);
} else {
    http_response_code(200);
}

echo json_encode($health, JSON_PRETTY_PRINT);
