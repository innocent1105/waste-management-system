<?php
include "send_email.php";
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'connection.php';

$input = file_get_contents("php://input");
$data = json_decode($input, true);
$app_name = "Waste Management System"; 

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

$full_name = $data['full_name'] ?? '';
$email     = $data['email'] ?? '';
$phone     = $data['phone'] ?? '';
$password  = $data['password'] ?? '';
$role      = $data['role'] ?? 'BUYER';

if (empty($full_name) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill in all required fields"]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "This email is already registered"]);
        exit;
    }

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
                .content { padding: 40px; line-height: 1.6; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
                .button { display: inline-block; padding: 15px 30px; background-color: #121212; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: bold; margin-top: 25px; }
                h1 { font-size: 24px; margin: 0; color: #ffffff; letter-spacing: -1px; }
                p { font-size: 16px; color: #444; }
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
                            <h2 style='margin-top:0;'>Hello $full_name,</h2>
                            <p>Welcome to the future of retail. Your account has been successfully created and is ready for use.</p>
                        
                            <h1>$token</h1>

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

    $title = 'Welcome to ' . $app_name . ' - Account Confirmed';

    send_email($email, $full_name, $message, $title, $app_name);


    $sql = "INSERT INTO otp_token (token, email, type, status) 
            VALUES (:token, :email, :type, :status)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':token'    => $token,
        ':email'   => $email,
        ':type'    => "signup",
        ':status'   => "active",
    ]);





    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $user_id = "USR_" . bin2hex(random_bytes(16)); 

    $sql = "INSERT INTO users (user_id, full_name, email, password_hash, phone, role) 
            VALUES (:user_id, :name, :email, :pass, :phone, :role)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':user_id' => $user_id,
        ':name'    => $full_name,
        ':email'   => $email,
        ':pass'    => $password_hash,
        ':phone'   => $phone,
        ':role'    => $role
    ]);


    if ($result) {
        echo json_encode([
            "success" => true, 
            "message" => "Registration successful!",
            "user_id" => $user_id
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Database error: " . $e->getMessage()
    ]);
}