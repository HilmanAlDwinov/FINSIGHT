<?php
// src/backend/controllers/AiController.php
require_once __DIR__ . '/../services/OpenAIService.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AiController {
    private $openAIService;
    private $userId;

    public function __construct() {
        $this->openAIService = new OpenAIService();
    }

    public function chat() {
        // Validate authentication
        $authMiddleware = new AuthMiddleware();
        $userData = $authMiddleware->validateToken();
        $this->userId = $userData['user_id'];

        $input = json_decode(file_get_contents('php://input'), true);
        $userMessage = $input['message'] ?? '';
        $context = $input['context'] ?? null;
        $history = $input['conversation_history'] ?? [];

        if (empty($userMessage)) {
            Response::send(false, "Message cannot be empty", [], 400);
            return;
        }

        try {
            // Build Prompt
            $systemPrompt = "You are FINSIGHT AI, a helpful and friendly financial advisor.
            Use the provided context associated with the user to answer questions.
            Keep answers concise (under 200 words) and actionable.
            Format using Markdown (bold, lists).
            IMPORTANT: Always use 'IDR' (Rupiah) for currency. Example: 'IDR 500.000'. Never use symbol '$'.
            If data is missing, ask the user politely.";

            if ($context) {
                $contextStr = json_encode($context);
                $systemPrompt .= "\n\nUser Financial Context: " . $contextStr;
            }

            // Prepare messages array
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt]
            ];

            // Add history (limit last 5 turns to save tokens)
            foreach (array_slice($history, -5) as $msg) {
                if (isset($msg['role']) && isset($msg['content'])) {
                    $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
                }
            }

            // Add current message
            $messages[] = ['role' => 'user', 'content' => $userMessage];

            $result = $this->openAIService->getChatCompletion($messages);

            $reply = $result['choices'][0]['message']['content'] ?? "Maaf, saya tidak dapat memproses permintaan Anda saat ini.";

            Response::send(true, "Success", ['response' => $reply], 200);

        } catch (Exception $e) {
            error_log("AI Error: " . $e->getMessage());
            // Log the specific error for debugging
            if (strpos($e->getMessage(), 'Missing OpenAI API Key') !== false) {
                error_log("OpenAI API Key issue detected - check environment configuration");
            }
            Response::send(false, "AI Service Error: " . $e->getMessage(), [], 500);
        }
    }
}
