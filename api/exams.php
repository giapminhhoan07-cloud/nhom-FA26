<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require __DIR__ . '/database.php';

$examId = trim((string) ($_GET['id'] ?? ''));
try {
    if ($examId !== '') {
        $examStmt = $pdo->prepare("SELECT e.id, e.title, e.subject_id AS subjectId, s.name AS subjectName, e.year, e.exam_type AS type, CASE e.exam_type WHEN 'minh-hoa' THEN 'Đề minh họa' WHEN 'thi-thu' THEN 'Đề thi thử' WHEN 'on-tap' THEN 'Đề ôn tập' WHEN 'thpt' THEN 'Tốt nghiệp THPT' ELSE e.exam_type END AS typeName, e.difficulty, CASE e.difficulty WHEN 'easy' THEN 'Cơ bản' WHEN 'hard' THEN 'Khá khó' ELSE 'Trung bình' END AS difficultyName, e.duration_minutes AS durationMinutes, e.description, e.featured FROM exams e INNER JOIN subjects s ON s.id = e.subject_id WHERE e.id = ? LIMIT 1");
        $examStmt->execute([$examId]);
        $exam = $examStmt->fetch();
        if (!$exam) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Không tìm thấy đề thi.']);
            exit;
        }
        $questionsStmt = $pdo->prepare('SELECT q.id, q.content, q.options, q.correct_answer AS correctAnswer, q.explanation, q.image_url FROM questions q INNER JOIN exam_questions eq ON eq.question_id = q.id WHERE eq.exam_id = ? ORDER BY eq.question_order ASC');
        $questionsStmt->execute([$examId]);
        $exam['questions'] = array_map(static function (array $question): array { $question['options'] = json_decode((string) $question['options'], true) ?? []; $question['correctAnswer'] = (int) $question['correctAnswer']; return $question; }, $questionsStmt->fetchAll());
        $exam['questionCount'] = count($exam['questions']);
        echo json_encode(['success' => true, 'exam' => $exam]);
        exit;
    }

    $query = $pdo->query("SELECT e.id, e.title, e.subject_id AS subjectId, s.name AS subjectName, e.year, e.exam_type AS type, CASE e.exam_type WHEN 'minh-hoa' THEN 'Đề minh họa' WHEN 'thi-thu' THEN 'Đề thi thử' WHEN 'on-tap' THEN 'Đề ôn tập' WHEN 'thpt' THEN 'Tốt nghiệp THPT' ELSE e.exam_type END AS typeName, e.difficulty, CASE e.difficulty WHEN 'easy' THEN 'Cơ bản' WHEN 'hard' THEN 'Khá khó' ELSE 'Trung bình' END AS difficultyName, e.duration_minutes AS durationMinutes, e.description, e.featured, COUNT(eq.question_id) AS questionCount FROM exams e INNER JOIN subjects s ON s.id = e.subject_id LEFT JOIN exam_questions eq ON eq.exam_id = e.id GROUP BY e.id, e.title, e.subject_id, s.name, e.year, e.exam_type, e.difficulty, e.duration_minutes, e.description, e.featured, e.created_at ORDER BY e.created_at DESC, e.title ASC");
    echo json_encode(['success' => true, 'exams' => $query->fetchAll()]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Không thể tải kho đề thi.']);
}