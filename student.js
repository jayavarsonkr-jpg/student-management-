const form = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const search = document.getElementById("search");

let students = [];

async function loadStudents() {
    try {
        const response = await fetch("api.php");
        if (!response.ok) throw new Error("Unable to load students");

        students = await response.json();
        displayStudents();
    } catch (error) {
        alert(error.message);
    }
}

function displayStudents() {
    const keyword = search.value.toLowerCase();

    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(keyword) ||
        student.id.toLowerCase().includes(keyword) ||
        student.department.toLowerCase().includes(keyword)
    );

    studentList.innerHTML = "";

    filtered.forEach(student => {
        const row = document.createElement("tr");

        const values = [
            student.id,
            student.name,
            student.department,
            student.email,
            student.marks
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit";
        editButton.addEventListener("click", () => editStudent(student.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";
        deleteButton.addEventListener("click", () => deleteStudent(student.id));

        actions.append(editButton, deleteButton);
        row.appendChild(actions);

        studentList.appendChild(row);
    });
}

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("studentId").value;

    const student = {
        name: document.getElementById("name").value.trim(),
        department: document.getElementById("department").value.trim(),
        email: document.getElementById("email").value.trim(),
        marks: Number(document.getElementById("marks").value)
    };

    if (!student.name || !student.department ||
        !student.email || !Number.isInteger(student.marks) ||
        student.marks < 0 || student.marks > 100) {
        alert("Please enter valid student details.");
        return;
    }

    try {
        const response = await fetch("api.php", {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(id ? { ...student, id } : student)
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Operation failed");

        form.reset();
        document.getElementById("studentId").value = "";
        document.getElementById("formTitle").textContent = "Add New Student";
        document.getElementById("submitBtn").textContent = "Add Student";

        loadStudents();
    } catch (error) {
        alert(error.message);
    }
});

function editStudent(id) {
    const student = students.find(s => s.id === id);

    if (!student) return;

    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("department").value = student.department;
    document.getElementById("email").value = student.email;
    document.getElementById("marks").value = student.marks;

    document.getElementById("formTitle").textContent = "Update Student";
    document.getElementById("submitBtn").textContent = "Update Student";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch("api.php", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Delete failed");

        loadStudents();
    } catch (error) {
        alert(error.message);
    }
}

search.addEventListener("input", displayStudents);

loadStudents();