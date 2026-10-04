<?php
declare(strict_types=1);
function env(string $key, string $default = ''): string { static $values; if ($values === null) { $values = []; $file = dirname(__DIR__) . '/.env'; if (is_file($file)) foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) { if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue; [$k, $v] = explode('=', $line, 2); $values[trim($k)] = trim($v, " \""); } } return $values[$key] ?? $_ENV[$key] ?? $default; }
function db(): PDO {
    static $pdo;
    if ($pdo instanceof PDO) return $pdo;
    $dsn = 'mysql:host=' . env('DB_HOST', '127.0.0.1') . ';dbname=' . env('DB_NAME', 'srinidhi_constructions') . ';charset=utf8mb4';
    try {
        $pdo = new PDO($dsn, env('DB_USER', 'root'), env('DB_PASSWORD'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        // Connection-level failure: almost always missing backend/.env, MySQL not
        // running, wrong credentials, or the database not yet created from schema.sql.
        error_log('DB CONNECTION FAILED (check backend/.env, that MySQL is running, and that schema.sql was imported): ' . $e->getMessage());
        throw new PDOException('connection:' . $e->getMessage(), (int) $e->getCode());
    }
    return $pdo;
}
