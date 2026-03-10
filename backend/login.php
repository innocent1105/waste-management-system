<?php
include "send_email.php";
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'connection.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);
$app_name = "Waste Management System"; 

if (!$data || !isset($data['email'])) {
    echo json_encode(["success" => false, "message" => "Email is required"]);
    exit;
}

$email = $data['email'];

try {
    $stmt = $pdo->prepare("SELECT full_name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(["success" => false, "message" => "No account found with this email"]);
        exit;
    }

    $full_name = $user['full_name'];

    function generate_otp($length = 6) {
        $otp = "";
        for ($i = 0; $i < $length; $i++) {
            $otp .= random_int(0, 9);
        }
        return $otp;
    }

    $token = generate_otp(6);

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
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
                h1 { font-size: 24px; margin: 0; color: #ffffff; letter-spacing: -1px; }
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
                            <h2 style='margin-top:0;'>Welcome Back, $full_name</h2>
                            <p>Use the code below to sign in to your account. This code will expire in 15 minutes.</p>
                            <div class='otp-box'>$token</div>
                            <p>If you did not request this code, please secure your account.</p>
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

    $title = 'Your Login Code - ' . $app_name;

    send_email($email, $full_name, $message, $title, $app_name);

    $expireOld = $pdo->prepare("UPDATE otp_token SET status = 'expired' WHERE email = ? AND type = 'login'");
    $expireOld->execute([$email]);

    $sql = "INSERT INTO otp_token (token, email, type, status) 
            VALUES (:token, :email, :type, :status)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':token'  => $token,
        ':email'  => $email,
        ':type'   => "login",
        ':status' => "active",
    ]);

    echo json_encode([
        "success" => true, 
        "message" => "OTP sent successfully to your email."
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Database error: " . $e->getMessage()
    ]);
}