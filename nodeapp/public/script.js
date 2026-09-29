// =========================================================
// DOM ELEMENTS
// =========================================================

const userForm = document.getElementById("userForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const submitButton = document.getElementById("submitButton");

const usersTableBody = document.getElementById("usersTableBody");
const userCount = document.getElementById("userCount");
const emptyState = document.getElementById("emptyState");

const databaseStatusText = document.getElementById("databaseStatusText");
const databaseStatusBadge = document.getElementById("databaseStatusBadge");
const databaseConnectionBadge = document.getElementById(
    "databaseConnectionBadge"
);
const databaseHealthButton = document.getElementById(
    "databaseHealthButton"
);

const editModal = document.getElementById("editModal");
const editUserForm = document.getElementById("editUserForm");
const editUserId = document.getElementById("editUserId");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const closeEditModal = document.getElementById("closeEditModal");
const cancelEdit = document.getElementById("cancelEdit");

const deleteModal = document.getElementById("deleteModal");
const deleteUserName = document.getElementById("deleteUserName");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

const toastContainer = document.getElementById("toastContainer");

let users = [];
let deleteUserId = null;

// =========================================================
// API HELPER
// =========================================================

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(
            data?.message || `Request failed with status ${response.status}`
        );
    }

    return data;
}

// =========================================================
// DATABASE HEALTH
// =========================================================

async function checkDatabaseHealth(showNotification = false) {
    try {
        const data = await apiRequest("/db");

        databaseStatusText.textContent = "Connected";

        databaseStatusBadge.className =
            "status-indicator status-online";

        databaseStatusBadge.innerHTML =
            "<span></span> CONNECTED";

        databaseConnectionBadge.className =
            "database-connected-badge connected";

        databaseConnectionBadge.innerHTML =
            "<span></span> RDS CONNECTED";

        if (showNotification) {
            showToast(data.message, "success");
        }
    } catch (error) {
        databaseStatusText.textContent = "Disconnected";

        databaseStatusBadge.className =
            "status-indicator status-error";

        databaseStatusBadge.innerHTML =
            "<span></span> ERROR";

        databaseConnectionBadge.className =
            "database-connected-badge disconnected";

        databaseConnectionBadge.innerHTML =
            "<span></span> CONNECTION ERROR";

        if (showNotification) {
            showToast(error.message, "error");
        }
    }
}

// =========================================================
// LOAD USERS
// =========================================================

async function loadUsers() {
    try {
        users = await apiRequest("/users");

        renderUsers();
    } catch (error) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-loading">
                    Unable to load database records.
                </td>
            </tr>
        `;

        showToast(error.message, "error");
    }
}

// =========================================================
// RENDER USERS
// =========================================================

function renderUsers() {
    userCount.textContent = users.length;

    if (users.length === 0) {
        usersTableBody.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    usersTableBody.innerHTML = users
        .map((user) => {
            return `
                <tr>
                    <td class="table-id">
                        #${escapeHtml(String(user.id))}
                    </td>

                    <td class="user-name">
                        ${escapeHtml(user.name)}
                    </td>

                    <td class="user-email">
                        ${escapeHtml(user.email)}
                    </td>

                    <td>
                        ${formatDate(user.created_at)}
                    </td>

                    <td>
                        <div class="action-buttons">

                            <button
                                class="action-button"
                                type="button"
                                onclick="openEditUser(${Number(user.id)})"
                            >
                                Edit
                            </button>

                            <button
                                class="action-button delete"
                                type="button"
                                onclick="openDeleteUser(${Number(user.id)})"
                            >
                                Delete
                            </button>

                        </div>
                    </td>
                </tr>
            `;
        })
        .join("");
}

// =========================================================
// CREATE USER
// =========================================================

userForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) {
        showToast("Name and email are required.", "error");
        return;
    }

    setButtonLoading(submitButton, true, "Creating...");

    try {
        const data = await apiRequest("/users", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email
            })
        });

        userForm.reset();

        showToast(data.message, "success");

        await loadUsers();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        setButtonLoading(submitButton, false, "+ Add User");
    }
});

// =========================================================
// OPEN EDIT MODAL
// =========================================================

window.openEditUser = function (id) {
    const user = users.find(
        (currentUser) => Number(currentUser.id) === Number(id)
    );

    if (!user) {
        showToast("User not found.", "error");
        return;
    }

    editUserId.value = user.id;
    editName.value = user.name;
    editEmail.value = user.email;

    editModal.classList.remove("hidden");

    setTimeout(() => {
        editName.focus();
    }, 50);
};

// =========================================================
// CLOSE EDIT MODAL
// =========================================================

function closeEditUserModal() {
    editModal.classList.add("hidden");
    editUserForm.reset();
}

closeEditModal.addEventListener("click", closeEditUserModal);
cancelEdit.addEventListener("click", closeEditUserModal);

editModal.addEventListener("click", (event) => {
    if (event.target === editModal) {
        closeEditUserModal();
    }
});

// =========================================================
// UPDATE USER
// =========================================================

editUserForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = editUserId.value;
    const name = editName.value.trim();
    const email = editEmail.value.trim();

    if (!name || !email) {
        showToast("Name and email are required.", "error");
        return;
    }

    try {
        const data = await apiRequest(`/users/${id}`, {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email
            })
        });

        closeEditUserModal();

        showToast(data.message, "success");

        await loadUsers();
    } catch (error) {
        showToast(error.message, "error");
    }
});

// =========================================================
// OPEN DELETE MODAL
// =========================================================

window.openDeleteUser = function (id) {
    const user = users.find(
        (currentUser) => Number(currentUser.id) === Number(id)
    );

    if (!user) {
        showToast("User not found.", "error");
        return;
    }

    deleteUserId = user.id;
    deleteUserName.textContent = user.name;

    deleteModal.classList.remove("hidden");
};

// =========================================================
// CLOSE DELETE MODAL
// =========================================================

function closeDeleteUserModal() {
    deleteModal.classList.add("hidden");

    deleteUserId = null;
}

cancelDelete.addEventListener("click", closeDeleteUserModal);

deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
        closeDeleteUserModal();
    }
});

// =========================================================
// DELETE USER
// =========================================================

confirmDelete.addEventListener("click", async () => {
    if (!deleteUserId) {
        return;
    }

    try {
        const data = await apiRequest(
            `/users/${deleteUserId}`,
            {
                method: "DELETE"
            }
        );

        closeDeleteUserModal();

        showToast(data.message, "success");

        await loadUsers();
    } catch (error) {
        showToast(error.message, "error");
    }
});

// =========================================================
// DATABASE STATUS BUTTON
// =========================================================

databaseHealthButton.addEventListener("click", async () => {
    await checkDatabaseHealth(true);
});

// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeEditUserModal();
        closeDeleteUserModal();
    }
});

// =========================================================
// TOAST NOTIFICATIONS
// =========================================================

function showToast(message, type = "success") {
    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

// =========================================================
// BUTTON LOADING STATE
// =========================================================

function setButtonLoading(button, loading, text) {
    button.disabled = loading;
    button.textContent = text;

    if (loading) {
        button.style.opacity = "0.7";
        button.style.cursor = "wait";
    } else {
        button.style.opacity = "";
        button.style.cursor = "";
    }
}

// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    }).format(date);
}

// =========================================================
// HTML ESCAPING
// =========================================================

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =========================================================
// INITIALIZE DASHBOARD
// =========================================================

async function initializeDashboard() {
    await Promise.all([
        checkDatabaseHealth(),
        loadUsers()
    ]);
}

initializeDashboard();