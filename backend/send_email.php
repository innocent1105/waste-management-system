<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

function send_email($recieversAddress, $username, $message, $title, $app_name) {
    $mail = new PHPMailer(true);
    $system_email = "mugwadiinnocent@gmail.com";
    $system_name = "Waste Management System";
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $system_email;
        $mail->Password   = 'lbjb egwz qwad ascz'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom($system_email, $system_name);
        $mail->addAddress($recieversAddress, $username);

        $mail->isHTML(true); 
        $mail->Subject = $title;

        $mail->Body = $message;

        $mail->AltBody = "Hello $username, Welcome to $system_name. Your account creation is confirmed.";

        $mail->send();
        return true;
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Failed to confirm email. Please try another one."
        ]);
        exit();
    }
}

// $recieversAddress = "mugwadiinnocent@gmail.com";
// $username = "Innocent";
// send_email($recieversAddress, $username);

// exit();