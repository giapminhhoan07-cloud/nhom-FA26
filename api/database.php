<?php
declare(strict_types=1);

$host = '127.0.0.1';
$dbname = 'studysphere';
$username = 'root';
$password = '';

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $imageColumn = $pdo->query("SHOW COLUMNS FROM questions LIKE 'image_url'")->fetch();
    if (!$imageColumn) {
        $pdo->exec('ALTER TABLE questions ADD COLUMN image_url LONGTEXT NULL AFTER explanation');
    }
} catch (PDOException $error) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'Không thể kết nối cơ sở dữ liệu.']);
    exit;
}
