<?php
// src/backend/services/OpenAIService.php

class OpenAIService {
    private $apiKey;
    private $baseUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct() {
        // Try multiple methods to get the API key
        $this->apiKey = $this->getApiKey();
    }

    private function getApiKey() {
        // Method 1: getenv
        $key = getenv('OPENAI_API_KEY');
        if ($key !== false && !empty(trim($key))) {
            return trim($key);
        }

        // Method 2: $_ENV
        if (isset($_ENV['OPENAI_API_KEY']) && !empty(trim($_ENV['OPENAI_API_KEY']))) {
            return trim($_ENV['OPENAI_API_KEY']);
        }

        // Method 3: $_SERVER
        if (isset($_SERVER['OPENAI_API_KEY']) && !empty(trim($_SERVER['OPENAI_API_KEY']))) {
            return trim($_SERVER['OPENAI_API_KEY']);
        }

        // Method 4: Superglobal $_ENV as array
        $env = parse_ini_string(file_get_contents(__DIR__ . '/../../.env'));
        if ($env && isset($env['OPENAI_API_KEY']) && !empty(trim($env['OPENAI_API_KEY']))) {
            return trim($env['OPENAI_API_KEY']);
        }

        return null;
    }

    public function getChatCompletion($messages, $model = 'gpt-3.5-turbo') {
        if (empty($this->apiKey)) {
            throw new Exception("Missing OpenAI API Key");
        }

        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ];

        $data = [
            'model' => $model,
            'messages' => $messages,
            'temperature' => 0.7
        ];

        $ch = curl_init($this->baseUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        // For production, you should verify SSL certificates
        // For local development, we might need to disable verification depending on environment
        if (getenv('APP_ENV') === 'production') {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        } else {
            // For local development
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new Exception('Curl error: ' . $error);
        }

        curl_close($ch);

        if ($httpCode !== 200) {
            $error = json_decode($response, true);
            $msg = $error['error']['message'] ?? 'Unknown OpenAI Error';
            throw new Exception("OpenAI API Error ($httpCode): $msg");
        }

        return json_decode($response, true);
    }
}
