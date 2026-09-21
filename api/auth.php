<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Phương thức không hợp lệ.']);
    exit;
}

require __DIR__ . '/database.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? '';
$email = strtolower(trim((string) ($input['email'] ?? '')));
$password = (string) ($input['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập email và mật khẩu hợp lệ.']);
    exit;
}

if ($action === 'register') {
    $name = trim((string) ($input['name'] ?? ''));
    if ($name === '' || strlen($password) < 6) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Tên và mật khẩu tối thiểu 6 ký tự là bắt buộc.']);
        exit;
    }

    $check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $check->execute([$email]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email này đã được đăng ký.']);
        exit;
    }

    $insert = $pdo->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    $insert->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), 'user']);
    $user = ['id' => (int) $pdo->lastInsertId(), 'name' => $name, 'email' => $email, 'role' => 'user'];
    echo json_encode(['success' => true, 'message' => 'Tạo tài khoản thành công.', 'user' => $user]);
    exit;
}

if ($action === 'login') {
    $query = $pdo->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
    $query->execute([$email]);
    $user = $query->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Email hoặc mật khẩu chưa chính xác.']);
        exit;
    }

    unset($user['password_hash']);
    echo json_encode(['success' => true, 'message' => 'Chào mừng trở lại!', 'user' => $user]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Yêu cầu không hợp lệ.']);
