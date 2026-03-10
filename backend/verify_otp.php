<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'connection.php';
include "send_email.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? '';
$token = $data['otp'] ?? '';
$app_name = "Waste Management System"; 

if (empty($email) || empty($token)) {
    echo json_encode(["success" => false, "message" => "Email and OTP are required"]);
    exit;
}

try {

    $stmt = $pdo->prepare("
        SELECT id FROM otp_token 
        WHERE email = ? 
        AND token = ? 
        AND status = 'active' 
        AND created_at >= NOW() - INTERVAL 30 MINUTE
        ORDER BY created_at DESC LIMIT 1
    ");
    $stmt->execute([$email, $token]);
    $otp_record = $stmt->fetch();

    if ($otp_record) {
        $updateToken = $pdo->prepare("UPDATE otp_token SET status = 'expired' WHERE id = ?");
        $updateToken->execute([$otp_record['id']]);


$current_time = date("F j, Y, g:i a");
$user_ip = $_SERVER['REMOTE_ADDR']; 

$message = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
            .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #121212; border-radius: 8px; overflow: hidden; margin-top: 40px; }
            .header { background-color: #121212; padding: 40px; text-align: center; }
            .content { padding: 40px; text-align: center; line-height: 1.6; }
            .otp-box { font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px dashed #121212; margin: 20px 0; display: inline-block; }
            .security-details { background: #fff5f5; border-radius: 6px; padding: 15px; margin-top: 20px; text-align: left; border: 1px solid #ffe3e3; }
            .security-details p { margin: 5px 0; font-size: 13px; color: #c53030; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
            h1 { font-size: 24px; margin: 0; color: #ffffff; letter-spacing: -1px; }
            h2 { font-size: 20px; color: #121212; }
            .alert-text { color: #888; font-size: 14px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <center class='wrapper'>
            <table class='main'>
                <tr>
                    <td class='header'>
                        <h1>$app_name</h1>
                    </td>
                </tr>
                <tr>
                    <td class='content'>
                        <h2 style='margin-top:0;'>New Login Attempt Detected</h2>
                        <p class='alert-text'>A new sign-in attempt was made for your account <strong>$email</strong>.</p>
                        
                        <p>If this was you, use the verification code below to complete your login:</p>
                        <div class='otp-box'>$token</div>
                        
                        <div class='security-details'>
                            <p><strong>Time:</strong> $current_time</p>
                            <p><strong>IP Address:</strong> $user_ip</p>
                            <p style='margin-top:10px; font-style: italic;'>If you didn't attempt to log in, someone may have your email address. We recommend changing your security settings immediately.</p>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class='footer'>
                        &copy; " . date("Y") . " $app_name. All rights reserved.<br>
                        Lusaka, Zambia.
                    </td>
                </tr>
            </table>
        </center>
    </body>
    </html>";

        
        
        $title = 'Login Activity - ' . $app_name;

        send_email($email, "", $message, $title, $app_name);



        $is_admin = false;


        $stmt = $pdo->prepare("
            SELECT * FROM users WHERE email = ? 
        ");
        $stmt->execute([$email]);
        $stmt_result = $stmt->fetch();

        $user_id = "";
        if($stmt_result){
            $is_admin = $stmt_result['role'];
            $user_id = $stmt_result['user_id'];
        }


        $title = "Login Successful";
        $msg = "New Login attemp. If this was not you, send a report immediately.";
        $type = "success"; 
        $status = "unread";

        $sql = "INSERT INTO notifications (user_id, title, message, is_read) 
                VALUES (:uid, :title, :msg, :status)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'uid'    => $user_id,
            'title'  => $title,
            'msg'    => $msg,
            'status' => $status
        ]);




        echo json_encode([
            "success" => true,
            "ecom_auth_key" => $user_id,
            "role" => $is_admin,
            "message" => "Verification successful!"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Invalid or expired verification code."
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Database error: " . $e->getMessage()
    ]);
}