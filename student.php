<?php

header("Content-Type: application/json");

$file = __DIR__ . "/students.json";

function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function getStudents($file) {
    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function saveStudents($file, $students) {
    $json = json_encode($students, JSON_PRETTY_PRINT);

    if ($json === false ||
        file_put_contents($file, $json, LOCK_EX) === false) {
        respond(["error" => "Unable to save student records"], 500);
    }
}

$method = $_SERVER["REQUEST_METHOD"];

if (!file_exists($file)) {
    respond(["error" => "Student data file not found"], 500);
}

$students = getStudents($file);

if ($method === "GET") {
    respond($students);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond(["error" => "Invalid JSON data"], 400);
}

// Add student
if ($method === "POST") {

    $name = trim($data["name"] ?? "");
    $department = trim($data["department"] ?? "");
    $email = trim($data["email"] ?? "");
    $marks = $data["marks"] ?? null;

    if ($name === "" || $department === "" ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        !is_numeric($marks) || !is_int($marks) ||
        $marks < 0 || $marks > 100) {
        respond(["error" => "Invalid student details"], 422);
    }

    $student = [
        "id" => "STU" . strtoupper(bin2hex(random_bytes(4))),
        "name" => $name,
        "department" => $department,
        "email" => $email,
        "marks" => $marks
    ];

    $students[] = $student;

    saveStudents($file, $students);

    respond(["message" => "Student added successfully",
             "student" => $student], 201);
}

// Update student
if ($method === "PUT") {

    $id = $data["id"] ?? "";

    foreach ($students as &$student) {
        if ($student["id"] === $id) {

            $name = trim($data["name"] ?? "");
            $department = trim($data["department"] ?? "");
            $email = trim($data["email"] ?? "");
            $marks = $data["marks"] ?? null;

            if ($name === "" || $department === "" ||
                !filter_var($email, FILTER_VALIDATE_EMAIL) ||
                !is_int($marks) || $marks < 0 || $marks > 100) {
                respond(["error" => "Invalid student details"], 422);
            }

            $student["name"] = $name;
            $student["department"] = $department;
            $student["email"] = $email;
            $student["marks"] = $marks;

            unset($student);

            saveStudents($file, $students);

            respond(["message" => "Student updated successfully"]);
        }
    }

    unset($student);

    respond(["error" => "Student not found"], 404);
}

// Delete student
if ($method === "DELETE") {

    $id = $data["id"] ?? "";

    $oldCount = count($students);

    $students = array_values(array_filter(
        $students,
        fn($student) => $student["id"] !== $id
    ));

    if (count($students) === $oldCount) {
        respond(["error" => "Student not found"], 404);
    }

    saveStudents($file, $students);

    respond(["message" => "Student deleted successfully"]);
}

respond(["error" => "Method not allowed"], 405);

?>