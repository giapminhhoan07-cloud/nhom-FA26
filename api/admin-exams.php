<?php
declare(strict_types=1);

session_start();
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

$sessionUser = $_SESSION['user'] ?? null;
if (!$sessionUser || ($sessionUser['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Chỉ quản trị viên mới có quyền quản lý đề thi.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = trim((string) ($input['action'] ?? ''));

function validateExamPayload(array $input): array
{
    $id = trim((string) ($input['id'] ?? ''));
    $title = trim((string) ($input['title'] ?? ''));
    $subjectId = trim((string) ($input['subject_id'] ?? ''));
    $year = (int) ($input['year'] ?? 0);
    $examType = trim((string) ($input['exam_type'] ?? ''));
    $difficulty = trim((string) ($input['difficulty'] ?? 'medium'));
    $duration = (int) ($input['duration_minutes'] ?? 0);
    $description = trim((string) ($input['description'] ?? ''));
    $questions = $input['questions'] ?? [];

    if (!preg_match('/^[a-z0-9-]{3,100}$/', $id) || $title === '' || $subjectId === '' || $year < 2000 || $examType === '' || $duration <= 0 || !is_array($questions) || count($questions) === 0) {
        throw new InvalidArgumentException('Vui lòng nhập đủ thông tin đề và ít nhất một câu hỏi hợp lệ.');
    }
    if (!in_array($difficulty, ['easy', 'medium', 'hard'], true)) {
        throw new InvalidArgumentException('Mức độ đề thi không hợp lệ.');
    }

    $normalizedQuestions = [];
    foreach ($questions as $index => $question) {
        $questionId = trim((string) ($question['id'] ?? ($id . '-q' . ($index + 1))));
        $content = trim((string) ($question['content'] ?? ''));
        $options = $question['options'] ?? [];
        $correctAnswer = (int) ($question['correct_answer'] ?? $question['correctAnswer'] ?? -1);
        $explanation = trim((string) ($question['explanation'] ?? ''));
        $imageUrl = trim((string) ($question['image_url'] ?? $question['imageUrl'] ?? ''));
        if (!preg_match('/^[a-zA-Z0-9-]{2,50}$/', $questionId) || $content === '' || !is_array($options) || count($options) < 2 || $correctAnswer < 0 || $correctAnswer >= count($options)) {
            throw new InvalidArgumentException('Câu hỏi số ' . ($index + 1) . ' chưa đúng định dạng.');
        }
        $normalizedQuestions[] = ['id' => $questionId, 'content' => $content, 'options' => array_values($options), 'correct_answer' => $correctAnswer, 'explanation' => $explanation, 'image_url' => $imageUrl];
    }

    return compact('id', 'title', 'subjectId', 'year', 'examType', 'difficulty', 'duration', 'description', 'normalizedQuestions');
}

try {
    if ($action === 'list') {
        $query = $pdo->query('SELECT e.id, e.title, e.subject_id, s.name AS subject_name, e.year, e.exam_type, e.difficulty, e.duration_minutes, e.description, e.featured, COUNT(eq.question_id) AS question_count FROM exams e INNER JOIN subjects s ON s.id = e.subject_id LEFT JOIN exam_questions eq ON eq.exam_id = e.id GROUP BY e.id, e.title, e.subject_id, s.name, e.year, e.exam_type, e.difficulty, e.duration_minutes, e.description, e.featured, e.created_at ORDER BY e.created_at DESC, e.title ASC');
        echo json_encode(['success' => true, 'exams' => $query->fetchAll()]);
        exit;
    }

    if ($action === 'get') {
        $examId = trim((string) ($input['id'] ?? ''));
        $examStmt = $pdo->prepare('SELECT id, title, subject_id, year, exam_type, difficulty, duration_minutes, description, featured FROM exams WHERE id = ? LIMIT 1');
        $examStmt->execute([$examId]);
        $exam = $examStmt->fetch();
        if (!$exam) {
            throw new RuntimeException('Không tìm thấy đề thi.');
        }
        $questionStmt = $pdo->prepare('SELECT q.id, q.content, q.options, q.correct_answer, q.explanation, q.image_url FROM questions q INNER JOIN exam_questions eq ON eq.question_id = q.id WHERE eq.exam_id = ? ORDER BY eq.question_order ASC');
        $questionStmt->execute([$examId]);
        $exam['questions'] = array_map(static function (array $question): array {
            $question['options'] = json_decode((string) $question['options'], true) ?? [];
            return $question;
        }, $questionStmt->fetchAll());
        echo json_encode(['success' => true, 'exam' => $exam]);
        exit;
    }

    if ($action === 'delete') {
        $examId = trim((string) ($input['id'] ?? ''));
        if ($examId === '') {
            throw new InvalidArgumentException('Thiếu mã đề thi.');
        }
        $delete = $pdo->prepare('DELETE FROM exams WHERE id = ?');
        $delete->execute([$examId]);
        echo json_encode(['success' => true, 'message' => 'Đã xóa đề thi.']);
        exit;
    }

    if (in_array($action, ['create', 'update'], true)) {
        $exam = validateExamPayload($input);
        $pdo->beginTransaction();
        if ($action === 'create') {
            $stmt = $pdo->prepare('INSERT INTO exams (id, title, subject_id, year, exam_type, difficulty, duration_minutes, description, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$exam['id'], $exam['title'], $exam['subjectId'], $exam['year'], $exam['examType'], $exam['difficulty'], $exam['duration'], $exam['description'], (int) ($input['featured'] ?? 0)]);
        } else {
            $stmt = $pdo->prepare('UPDATE exams SET title = ?, subject_id = ?, year = ?, exam_type = ?, difficulty = ?, duration_minutes = ?, description = ?, featured = ? WHERE id = ?');
            $stmt->execute([$exam['title'], $exam['subjectId'], $exam['year'], $exam['examType'], $exam['difficulty'], $exam['duration'], $exam['description'], (int) ($input['featured'] ?? 0), $exam['id']]);
            $pdo->prepare('DELETE FROM exam_questions WHERE exam_id = ?')->execute([$exam['id']]);
        }
        $questionStmt = $pdo->prepare('INSERT INTO questions (id, content, options, correct_answer, explanation, image_url) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content), options = VALUES(options), correct_answer = VALUES(correct_answer), explanation = VALUES(explanation), image_url = VALUES(image_url)');
        $linkStmt = $pdo->prepare('INSERT INTO exam_questions (exam_id, question_id, question_order) VALUES (?, ?, ?)');
        foreach ($exam['normalizedQuestions'] as $index => $question) {
            $questionStmt->execute([$question['id'], $question['content'], json_encode($question['options'], JSON_UNESCAPED_UNICODE), $question['correct_answer'], $question['explanation'], $question['image_url']]);
            $linkStmt->execute([$exam['id'], $question['id'], $index + 1]);
        }
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => $action === 'create' ? 'Đã tải đề thi lên.' : 'Đã cập nhật đề thi.']);
        exit;
    }

    throw new InvalidArgumentException('Hành động không hợp lệ.');
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code($error instanceof InvalidArgumentException ? 422 : 500);
    echo json_encode(['success' => false, 'message' => $error->getMessage()]);
}