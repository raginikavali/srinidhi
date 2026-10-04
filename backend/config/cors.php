<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = array_filter([env('APP_ORIGIN', 'http://localhost:5173'), 'http://localhost:5173', 'http://127.0.0.1:5173']);
if (in_array($origin, $allowed, true)) { header("Access-Control-Allow-Origin: $origin"); header('Access-Control-Allow-Credentials: true'); header('Vary: Origin'); }
header('Access-Control-Allow-Headers: Content-Type, Authorization'); header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS'); header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
