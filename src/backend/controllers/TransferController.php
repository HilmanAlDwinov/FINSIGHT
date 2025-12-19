<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

class TransferController {
    private $conn;
    private $user_id;

    public function __construct($user_id) {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->user_id = $user_id;
    }

    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        // Validation
        if (!isset($data->from_wallet_id) || !isset($data->to_wallet_id) || !isset($data->amount)) {
            Response::send(400, false, 'Incomplete data. Source, destination, and amount required.');
            return;
        }

        if ($data->amount <= 0) {
            Response::send(400, false, 'Amount must be greater than 0.');
            return;
        }

        if ($data->from_wallet_id == $data->to_wallet_id) {
            Response::send(400, false, 'Cannot transfer to the same wallet.');
            return;
        }

        try {
            $this->conn->beginTransaction();

            // 1. Check Source Wallet Balance & Ownership
            $stmtFrom = $this->conn->prepare("SELECT balance FROM wallets WHERE wallet_id = ? AND user_id = ?");
            $stmtFrom->execute([$data->from_wallet_id, $this->user_id]);
            $walletFrom = $stmtFrom->fetch(PDO::FETCH_ASSOC);

            if (!$walletFrom) {
                $this->conn->rollBack();
                Response::send(404, false, 'Source wallet not found.');
                return;
            }

            if ($walletFrom['balance'] < $data->amount) {
                $this->conn->rollBack();
                Response::send(400, false, 'Insufficient balance in source wallet.');
                return;
            }

            // 2. Check Destination Wallet Ownership
            $stmtTo = $this->conn->prepare("SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?");
            $stmtTo->execute([$data->to_wallet_id, $this->user_id]);
            if ($stmtTo->rowCount() == 0) {
                $this->conn->rollBack();
                Response::send(404, false, 'Destination wallet not found.');
                return;
            }

            // 3. Deduct from Source
            // Use arithmetic update for concurrency safety
            $updateFrom = $this->conn->prepare("UPDATE wallets SET balance = balance - :amount WHERE wallet_id = :id");
            $updateFrom->execute([':amount' => $data->amount, ':id' => $data->from_wallet_id]);

            // 4. Add to Destination
            $updateTo = $this->conn->prepare("UPDATE wallets SET balance = balance + :amount WHERE wallet_id = :id");
            $updateTo->execute([':amount' => $data->amount, ':id' => $data->to_wallet_id]);

            // 5. Record Transfer Log
            // Check if 'notes' exists, else default to empty string
            $notes = isset($data->notes) ? $data->notes : '';
            
            $logQuery = "INSERT INTO wallet_transfers (user_id, from_wallet_id, to_wallet_id, amount, notes) 
                         VALUES (:uid, :from_id, :to_id, :amount, :notes)";
            $stmtLog = $this->conn->prepare($logQuery);
            $stmtLog->execute([
                ':uid' => $this->user_id,
                ':from_id' => $data->from_wallet_id,
                ':to_id' => $data->to_wallet_id,
                ':amount' => $data->amount,
                ':notes' => $notes
            ]);

            $this->conn->commit();
            Response::send(201, true, 'Transfer successful.');

        } catch (Exception $e) {
            $this->conn->rollBack();
            Response::send(500, false, 'Transfer failed: ' . $e->getMessage());
        }
    }
}
