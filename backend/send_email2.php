<?php
// 1. Error Reporting (Useful for debugging live servers)
ini_set('display_errors', 1);
error_reporting(E_ALL);

/**
 * PATH CONFIGURATION
 * We are manually loading the classes because the Composer autoloader 
 * is failing to find the classes in your custom directory structure.
 */
$basePath = dirname(__DIR__) . '/vendor/phpmailer/phpmailer/src/';

// Check if files exist before requiring to avoid another Fatal Error
if (file_exists($basePath . 'PHPMailer.php')) {
    require $basePath . 'Exception.php';
    require $basePath . 'PHPMailer.php';
    require $basePath . 'SMTP.php';
} else {
    // If this fails, your 'vendor' folder is not in /public_html/vendor/
    die(json_encode([
        "success" => false, 
        "message" => "PHPMailer source files not found in: " . $basePath
    ]));
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function send_email($recieversAddress, $username, $message, $title, $app_name) {
    $mail = new PHPMailer(true);
    
    // System Config
    $system_email = "system@textiepro.xyz";
    $system_name = "Waste Management System";

    try {
        // --- Server Settings ---
        $mail->isSMTP();
        $mail->SMTPDebug = 0;
        $mail->Host = 'serv5.infrasu.com'; // IMPORTANT
        $mail->SMTPAuth = true;
        $mail->Username = 'system@textiepro.xyz';
        $mail->Password = '4WNJhr(r536D.n';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // --- Recipients ---
        $mail->setFrom($system_email, $system_name);
        $mail->addAddress($recieversAddress, $username);

        // --- Content ---
        $mail->isHTML(true); 
        $mail->Subject = $title;
        $mail->Body    = $message;
        $mail->AltBody = strip_tags($message); // Plain text version for non-HTML mail clients

        $mail->send();
        return true;

    } catch (Exception $e) {
        // If it fails, return the actual PHPMailer error message
        echo json_encode([
            "success" => false,
            "message" => "Mail Error: " . $mail->ErrorInfo
        ]);
        exit();
    }
}