<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/utils/Response.php';
function requireAdmin(): int { session_name('srinidhi_admin'); session_start(['cookie_httponly' => true, 'cookie_secure' => env('SESSION_SECURE', 'false') === 'true', 'cookie_samesite' => 'Strict']); if (empty($_SESSION['admin_id'])) Response::error('Authentication required.', 401); return (int) $_SESSION['admin_id']; }
