<?php

declare(strict_types=1);

function body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);

    return is_array($data)
        ? array_map(
            fn($v) => is_string($v) ? trim(strip_tags($v)) : $v,
            $data
        )
        : [];
}

function requireFields(array $data, array $fields): void
{
    $errors = [];

    foreach ($fields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            $errors[$field] = 'This field is required.';
        }
    }

    if ($errors) {
        Response::error(
            'Please correct the highlighted fields.',
            400,
            $errors
        );
    }
}

// Restricted to Gmail addresses only, per requirement.
function validEmail(string $email): bool
{
    $email = trim($email);

    if ($email === '' || mb_strlen($email) > 190) {
        return false;
    }

    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        return false;
    }

    return (bool) preg_match('/^[^\s@]+@gmail\.com$/i', $email);
}

function validEnquiry(array $data): array
{
    $errors = [];

    if (!preg_match('/^[\p{L} ]{2,60}$/u', $data['name'] ?? '')) {
        $errors['name'] = 'Enter a valid name (2-60 letters).';
    }

    if (!validEmail($data['email'] ?? '')) {
        $errors['email'] = 'Please use a Gmail address (e.g. name@gmail.com).';
    }

    if (
        !preg_match(
            '/^(?:\+91[ -]?)?[6-9]\d{9}$/',
            preg_replace('/\s+/', '', $data['phone'] ?? '')
        )
    ) {
        $errors['phone'] = 'Enter a valid Indian mobile number.';
    }

    if (
        mb_strlen($data['subject'] ?? '') < 3 ||
        mb_strlen($data['subject'] ?? '') > 100
    ) {
        $errors['subject'] = 'Subject must be 3-100 characters.';
    }

    if (
        mb_strlen($data['message'] ?? '') < 10 ||
        mb_strlen($data['message'] ?? '') > 1000
    ) {
        $errors['message'] = 'Message must be 10-1000 characters.';
    }

    if ($errors) {
        Response::error(
            'Please correct the highlighted fields.',
            422,
            $errors
        );
    }

    return $data;
}

// Validates a single uploaded image from $_FILES['image'].
// Checks the real image type, file size, and returns a safe random filename.
function validImageUpload(?array $file): string
{
    if (
        !$file ||
        ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE
    ) {
        Response::error(
            'Please choose an image to upload.',
            422,
            ['image' => 'An image file is required.']
        );
    }

    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        Response::error(
            'The image failed to upload.',
            422,
            ['image' => 'Upload failed, please try again.']
        );
    }

    if (
        !isset($file['tmp_name']) ||
        !is_uploaded_file($file['tmp_name'])
    ) {
        Response::error(
            'Invalid image upload.',
            422,
            ['image' => 'Invalid uploaded file.']
        );
    }

    $maxBytes = 5 * 1024 * 1024;

    if (($file['size'] ?? 0) > $maxBytes) {
        Response::error(
            'The image is too large.',
            422,
            ['image' => 'Image must be 5MB or smaller.']
        );
    }

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];

    /*
     * First try FileInfo if it is available.
     * If FileInfo is not available, use getimagesize()
     * so "Class finfo not found" will not occur.
     */
    $mime = null;

    if (function_exists('mime_content_type')) {
        $mime = @mime_content_type($file['tmp_name']);
    }

    if (
        !$mime &&
        extension_loaded('fileinfo') &&
        class_exists('finfo')
    ) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = @$finfo->file($file['tmp_name']);
    }

    if (!$mime) {
        $imageInfo = @getimagesize($file['tmp_name']);

        if (
            $imageInfo !== false &&
            isset($imageInfo['mime'])
        ) {
            $mime = $imageInfo['mime'];
        }
    }

    if (!isset($allowed[$mime])) {
        Response::error(
            'Unsupported image type.',
            422,
            ['image' => 'Only JPG, PNG or WEBP images are allowed.']
        );
    }

    return bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
}