<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProfileController {
    private $conn;
    private $user_id;

    public function __construct($user_id) {
        $database = new Database();
        $this->conn = $database->getConnection();
        $this->user_id = $user_id;
    }

    public function getProfile() {
        // user_id is already set via constructor
        $user_id = $this->user_id;

        try {
            // Get Basic User Info (PK: user_id)
            $stmt = $this->conn->prepare("SELECT user_id, name, email FROM users WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                // Correct Signature: send($success, $message, $data, $code)
                Response::send(false, 'User not found', [], 404);
                return;
            }

            // Get Extended Profile
            $stmtProfile = $this->conn->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
            $stmtProfile->execute([$user_id]);
            $profile = $stmtProfile->fetch(PDO::FETCH_ASSOC);

            // Merge data
            $data = [
                'user' => $user,
                'profile' => $profile ? $profile : null 
            ];

            Response::send(true, 'Profile retrieved successfully', $data, 200);

        } catch (PDOException $e) {
            Response::send(false, 'Database error: ' . $e->getMessage(), [], 500);
        }
    }

    public function updateProfile() {
        $user_id = $this->user_id;
        $data = json_decode(file_get_contents("php://input"), true);

        // Check for Password Update Action
        if (isset($data['action']) && $data['action'] === 'change_password') {
             $this->changePassword($user_id, $data);
             return;
        }

        // Fields for User Account
        $name = isset($data['name']) ? trim($data['name']) : null;
        $email = isset($data['email']) ? trim($data['email']) : null;

        // Fields for Extended Profile
        $monthly_income = isset($data['monthly_income']) ? $data['monthly_income'] : 0;
        $average_expense = isset($data['average_expense']) ? $data['average_expense'] : 0;
        $risk_appetite = isset($data['risk_appetite']) ? $data['risk_appetite'] : 'moderate';
        $financial_goals = isset($data['financial_goals']) ? $data['financial_goals'] : '';

        try {
            $this->conn->beginTransaction();

            // 1. Update User Account (Name/Email) if provided
            if ($name || $email) {
                $updates = [];
                $params = [];
                
                if ($name) {
                    $updates[] = "name = :name";
                    $params[':name'] = $name;
                }
                if ($email) {
                    $updates[] = "email = :email";
                    $params[':email'] = $email;
                }

                if (!empty($updates)) {
                    $params[':uid'] = $user_id;
                    // PK: user_id
                    $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE user_id = :uid";
                    $stmtUser = $this->conn->prepare($sql);
                    $stmtUser->execute($params);
                }
            }

            // 2. Check/Update Profile
            $checkStmt = $this->conn->prepare("SELECT profile_id FROM user_profiles WHERE user_id = ?");
            $checkStmt->execute([$user_id]);
            $exists = $checkStmt->fetch();

            if ($exists) {
                $query = "UPDATE user_profiles 
                          SET monthly_income = :income, 
                              average_expense = :expense, 
                              risk_appetite = :risk, 
                              financial_goals = :goals 
                          WHERE user_id = :uid";
            } else {
                $query = "INSERT INTO user_profiles (user_id, monthly_income, average_expense, risk_appetite, financial_goals) 
                          VALUES (:uid, :income, :expense, :risk, :goals)";
            }

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':uid', $user_id);
            $stmt->bindParam(':income', $monthly_income);
            $stmt->bindParam(':expense', $average_expense);
            $stmt->bindParam(':risk', $risk_appetite);
            $stmt->bindParam(':goals', $financial_goals);
            $stmt->execute();

            $this->conn->commit();
            Response::send(true, 'Profile updated successfully', [], 200);

        } catch (PDOException $e) {
            $this->conn->rollBack();
            Response::send(false, 'Database error: ' . $e->getMessage(), [], 500);
        }
    }

    private function changePassword($user_id, $data) {
        $current = $data['current_password'] ?? '';
        $new = $data['new_password'] ?? '';

        if (!$current || !$new) {
            Response::send(false, 'Current and New Password required', [], 400);
            return;
        }

        try {
            // Verify Current (PK: user_id)
            $stmt = $this->conn->prepare("SELECT password FROM users WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($current, $user['password'])) {
                 Response::send(false, 'Current password incorrect', [], 401);
                 return;
            }

            // Update (PK: user_id)
            $hash = password_hash($new, PASSWORD_DEFAULT);
            $upd = $this->conn->prepare("UPDATE users SET password = ? WHERE user_id = ?");
            $upd->execute([$hash, $user_id]);

            Response::send(true, 'Password updated successfully', [], 200);
        } catch (PDOException $e) {
            Response::send(false, 'Database error: ' . $e->getMessage(), [], 500);
        }
    }
}
