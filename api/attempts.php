<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
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
$action = trim((string) ($input['action'] ?? ''));

try {
    if ($action === 'save_attempt') {
        $userId = (int) ($input['user_id'] ?? 0);
        $examId = trim((string) ($input['exam_id'] ?? ''));
        $score = (float) ($input['score'] ?? 0);
        $totalQuestions = (int) ($input['total_questions'] ?? 0);
        $correctCount = (int) ($input['correct_count'] ?? 0);
        $wrongCount = (int) ($input['wrong_count'] ?? 0);
        $unansweredCount = (int) ($input['unanswered_count'] ?? 0);
        $answers = is_array($input['answers'] ?? null) ? $input['answers'] : [];

        if ($userId <= 0 || $examId === '') {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Thiếu thông tin người dùng hoặc đề thi.']);
            exit;
        }

        $pdo->beginTransaction();

        $insertAttempt = $pdo->prepare(
            'INSERT INTO attempts (user_id, exam_id, score, total_questions, correct_count, wrong_count, unanswered_count, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())'
        );
        $insertAttempt->execute([
            $userId,
            $examId,
            number_format($score, 2, '.', ''),
            $totalQuestions,
            $correctCount,
            $wrongCount,
            $unansweredCount,
        ]);

        $attemptId = (int) $pdo->lastInsertId();
        $insertAnswer = $pdo->prepare(
            'INSERT INTO attempt_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)'
        );

        foreach ($answers as $item) {
            $questionId = trim((string) ($item['question_id'] ?? ''));
            if ($questionId === '') {
                continue;
            }

            $selectedAnswer = $item['selected_answer'] ?? null;
            if ($selectedAnswer === null || $selectedAnswer === '') {
                $selectedAnswer = null;
            } else {
                $selectedAnswer = (int) $selectedAnswer;
            }

            $isCorrect = ((int) ($item['is_correct'] ?? 0)) === 1 ? 1 : 0;
            $insertAnswer->execute([$attemptId, $questionId, $selectedAnswer, $isCorrect]);
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Lưu bài làm thành công.',
            'attempt_id' => $attemptId,
            'attempt' => [
                'id' => $attemptId,
                'exam_id' => $examId,
                'score' => number_format($score, 2, '.', ''),
                'total_questions' => $totalQuestions,
                'correct_count' => $correctCount,
                'wrong_count' => $wrongCount,
                'unanswered_count' => $unansweredCount,
            ],
        ]);
        exit;
    }

    if ($action === 'get_attempts') {
        $userId = (int) ($input['user_id'] ?? 0);
        if ($userId <= 0) {
            echo json_encode(['success' => true, 'attempts' => []]);
            exit;
        }

        $query = $pdo->prepare(
            'SELECT a.id, a.exam_id, e.title AS exam_title, a.score, a.total_questions, a.correct_count, a.wrong_count, a.unanswered_count, a.submitted_at
             FROM attempts a
             INNER JOIN exams e ON e.id = a.exam_id
             WHERE a.user_id = ?
             ORDER BY a.submitted_at DESC'
        );
        $query->execute([$userId]);

        echo json_encode([
            'success' => true,
            'attempts' => $query->fetchAll(),
        ]);
        exit;
    }

    if ($action === 'get_attempt_detail') {
        $userId = (int) ($input['user_id'] ?? 0);
        $attemptId = (int) ($input['attempt_id'] ?? 0);

        if ($attemptId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Thiếu mã bài làm.']);
            exit;
        }

        $attemptStmt = $pdo->prepare(
            'SELECT a.id, a.user_id, a.exam_id, e.title AS exam_title, a.score, a.total_questions, a.correct_count, a.wrong_count, a.unanswered_count, a.submitted_at
             FROM attempts a
             INNER JOIN exams e ON e.id = a.exam_id
             WHERE a.id = ? AND a.user_id = ?'
        );
        $attemptStmt->execute([$attemptId, $userId]);
        $attempt = $attemptStmt->fetch();

        if (!$attempt) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Không tìm thấy bài làm.']);
            exit;
        }

        $answersStmt = $pdo->prepare(
            'SELECT aa.question_id, aa.selected_answer, aa.is_correct, q.content, q.options, q.correct_answer, q.explanation
             FROM attempt_answers aa
             INNER JOIN questions q ON q.id = aa.question_id
             WHERE aa.attempt_id = ?
             ORDER BY aa.question_id ASC'
        );
        $answersStmt->execute([$attemptId]);
        $answerRows = $answersStmt->fetchAll();

        $questions = [];
        $answers = [];

        foreach ($answerRows as $row) {
            $questions[] = [
                'id' => $row['question_id'],
                'content' => $row['content'],
                'options' => json_decode((string) $row['options'], true) ?? [],
                'correctAnswer' => (int) $row['correct_answer'],
                'explanation' => $row['explanation'],
            ];
            $answers[] = $row['selected_answer'] === null ? null : (int) $row['selected_answer'];
        }

        echo json_encode([
            'success' => true,
            'attempt' => $attempt,
            'questions' => $questions,
            'answers' => $answers,
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Hành động không hợp lệ.']);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi khi lưu dữ liệu bài làm.',
        'debug' => $error->getMessage(),
    ]);
}
