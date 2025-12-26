<?php
// src/backend/services/OpenAIService.php

class OpenAIService {
    private $apiKey;
    private $baseUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct() {
        $this->apiKey = getenv('OPENAI_API_KEY');
        if (!$this->apiKey && isset($_ENV['OPENAI_API_KEY'])) {
            $this->apiKey = $_ENV['OPENAI_API_KEY'];
        }
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
        
        // Disable SSL verification for local dev if needed (better to fix certificate, but for speed:)
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            throw new Exception('Curl error: ' . curl_error($ch));
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
