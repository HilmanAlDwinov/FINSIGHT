<?php
// Test script to verify OpenAI API key loading

// Load environment variables
require_once __DIR__ . '/utils/DotEnv.php';
DotEnv::load(__DIR__ . '/../../.env');

echo "Testing OpenAI API Key loading...\n";

// Test different methods of getting the key
$key1 = getenv('OPENAI_API_KEY');
echo "getenv('OPENAI_API_KEY'): " . ($key1 ? 'FOUND' : 'NOT FOUND') . "\n";

$key2 = $_ENV['OPENAI_API_KEY'] ?? null;
echo "\$_ENV['OPENAI_API_KEY']: " . ($key2 ? 'FOUND' : 'NOT FOUND') . "\n";

$key3 = $_SERVER['OPENAI_API_KEY'] ?? null;
echo "\$_SERVER['OPENAI_API_KEY']: " . ($key3 ? 'FOUND' : 'NOT FOUND') . "\n";

$env = parse_ini_string(file_get_contents(__DIR__ . '/../../.env'));
$key4 = $env['OPENAI_API_KEY'] ?? null;
echo "parse_ini_string: " . ($key4 ? 'FOUND' : 'NOT FOUND') . "\n";

// Test the OpenAIService
require_once __DIR__ . '/services/OpenAIService.php';

try {
    $service = new OpenAIService();
    $reflection = new ReflectionClass($service);
    $property = $reflection->getProperty('apiKey');
    $property->setAccessible(true);
    $apiKey = $property->getValue($service);
    
    echo "\nOpenAIService API Key: " . ($apiKey ? 'LOADED SUCCESSFULLY' : 'FAILED TO LOAD') . "\n";
    if ($apiKey) {
        echo "Key length: " . strlen($apiKey) . " characters\n";
        echo "Key preview: " . substr($apiKey, 0, 10) . "...\n";
    }
} catch (Exception $e) {
    echo "Error creating OpenAIService: " . $e->getMessage() . "\n";
}

echo "\nEnvironment variables check completed.\n";