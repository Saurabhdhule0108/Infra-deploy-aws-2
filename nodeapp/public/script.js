"use strict";

/* =========================================================
   INFRASTRUCTURE DEPLOYMENT ON AWS
   FRONTEND APPLICATION
========================================================= */


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {
    users: [],
    editingUserId: null,
    deletingUserId: null
};


/* =========================================================
   PROJECT SERVICE INFORMATION
========================================================= */

const serviceInformation = {
    terraform: {
        icon: "T",
        category: "INFRASTRUCTURE AS CODE",
        title: "Terraform",
        description:
            "Terraform defines and manages the AWS infrastructure used by this project through Infrastructure as Code.",
        role:
            "Terraform creates and manages the custom VPC, subnets, routing, security groups, two EC2 application servers, Amazon ECR and Amazon RDS infrastructure.",
        flow:
            "Terraform Files → Init → Validate → Plan → Apply → AWS APIs",
        facts: [
            ["Provider", "AWS"],
            ["State", "Amazon S3"],
            ["Locking", "S3 Lockfile"],
            ["Region", "ap-south-1"]
        ]
    },

    github: {
        icon: "GH",
        category: "CI/CD AUTOMATION",
        title: "GitHub Actions",
        description:
            "GitHub Actions controls the automated infrastructure and application deployment workflow.",
        role:
            "A push to the main branch starts the deployment workflow. The workflow authenticates with AWS, runs Terraform, manages infrastructure state, builds the Docker image, pushes it to ECR, deploys the application and verifies the result.",
        flow:
            "Git Push → OIDC → Terraform → Docker Build → ECR → EC2 → Verify",
        facts: [
            ["Workflow", "deploy.yml"],
            ["Trigger", "Push to main"],
            ["Authentication", "OIDC"],
            ["Failover Test", "Separate Workflow"]
        ]
    },

    oidc: {
        icon: "ID",
        category: "CLOUD AUTHENTICATION",
        title: "GitHub OIDC + AWS STS",
        description:
            "OIDC allows GitHub Actions to authenticate with AWS without storing long-term AWS access keys in GitHub.",
        role:
            "GitHub provides an OIDC token and identifies the IAM role it wants to assume. AWS STS validates the request against the role trust policy and returns temporary AWS credentials when the conditions match.",
        flow:
            "GitHub Actions → OIDC Token → AWS STS → IAM Role → Temporary Credentials",
        facts: [
            ["Credentials", "Temporary"],
            ["AWS Service", "STS"],
            ["Authorization", "IAM Role"],
            ["Long-Term Keys", "Not Required"]
        ]
    },

    docker: {
        icon: "D",
        category: "APPLICATION CONTAINER",
        title: "Docker",
        description:
            "Docker packages the Node.js application and its dependencies into a consistent application image.",
        role:
            "GitHub Actions builds the image from the Dockerfile. Both EC2 application servers pull the same image and run the Node.js application inside Docker containers.",
        flow:
            "Node.js Source → Dockerfile → Docker Image → ECR → EC2 Containers",
        facts: [
            ["Runtime", "Node.js"],
            ["Application Port", "8080"],
            ["Servers", "App-1 + App-2"],
            ["Registry", "Amazon ECR"]
        ]
    },

    ecr: {
        icon: "ECR",
        category: "CONTAINER REGISTRY",
        title: "Amazon ECR",
        description:
            "Amazon Elastic Container Registry stores the Docker application image used by the deployment.",
        role:
            "The CI/CD workflow builds and pushes the application image to ECR. Docker running on both EC2 servers authenticates with ECR, pulls the image and starts the application container.",
        flow:
            "Docker Build → Tag Image → Push ECR → EC2 Pull → Docker Run",
        facts: [
            ["Type", "Container Registry"],
            ["Image Scanning", "Enabled"],
            ["Image Use", "Both EC2 Servers"],
            ["Runs Containers", "No"]
        ]
    },

    ec2: {
        icon: "EC2",
        category: "APPLICATION COMPUTE",
        title: "Amazon EC2",
        description:
            "Two Amazon EC2 instances provide the compute layer for the Dockerized application.",
        role:
            "App-1 is deployed in ap-south-1a and acts as the primary application server and Nginx host. App-2 is deployed in ap-south-1b and runs the backup application backend.",
        flow:
            "ECR Image → App-1 :8080 + Nginx :80 → App-2 Backup :8080",
        facts: [
            ["App-1 AZ", "ap-south-1a"],
            ["App-2 AZ", "ap-south-1b"],
            ["Instance Type", "t3.micro"],
            ["Application Port", "8080"]
        ]
    },

    rds: {
        icon: "RDS",
        category: "MANAGED DATABASE",
        title: "Amazon RDS MySQL",
        description:
            "Amazon RDS provides the managed relational database used by the Node.js application.",
        role:
            "The MySQL database is not publicly accessible. Both application servers connect through the private VPC network, and the RDS Security Group allows MySQL traffic from the EC2 Security Group.",
        flow:
            "Node.js Application → EC2 Security Group → TCP 3306 → RDS MySQL",
        facts: [
            ["Engine", "MySQL"],
            ["Database", "appdb"],
            ["Port", "3306"],
            ["Public Access", "Disabled"]
        ]
    },

    nginx: {
        icon: "N",
        category: "REVERSE PROXY",
        title: "Nginx",
        description:
            "Nginx provides the public application entry point and active-passive backend routing.",
        role:
            "Nginx runs on App-1 and receives HTTP traffic on port 80. The App-1 Node.js container is the primary backend, while App-2 is configured as the backup backend through its private IP address.",
        flow:
            "Client :80 → Nginx → App-1 :8080 → App-2 :8080 (Backup)",
        facts: [
            ["Public Port", "80"],
            ["Primary", "App-1"],
            ["Backup", "App-2"],
            ["Backend Port", "8080"]
        ]
    }
};


/* =========================================================
   DOM REFERENCES
========================================================= */

const elements = {
    navigation: document.getElementById("navigation"),
    mobileMenuButton: document.getElementById("mobileMenuButton"),

    globalStatusDot: document.getElementById("globalStatusDot"),
    globalStatusText: document.getElementById("globalStatusText"),

    dbHealthBadge: document.getElementById("dbHealthBadge"),
    dbStatusDescription: document.getElementById("dbStatusDescription"),
    connectionStatus: document.getElementById("connectionStatus"),

    usersTableBody: document.getElementById("usersTableBody"),
    userCount: document.getElementById("userCount"),

    usersLoadingState: document.getElementById("usersLoadingState"),
    usersEmptyState: document.getElementById("usersEmptyState"),
    usersErrorState: document.getElementById("usersErrorState"),
    usersErrorMessage: document.getElementById("usersErrorMessage"),

    openCreateUser: document.getElementById("openCreateUser"),
    emptyCreateUser: document.getElementById("emptyCreateUser"),
    retryUsers: document.getElementById("retryUsers"),

    serviceModal: document.getElementById("serviceModal"),
    closeServiceModal: document.getElementById("closeServiceModal"),
    serviceModalIcon: document.getElementById("serviceModalIcon"),
    serviceModalCategory: document.getElementById("serviceModalCategory"),
    serviceModalTitle: document.getElementById("serviceModalTitle"),
    serviceModalDescription: document.getElementById("serviceModalDescription"),
    serviceModalRole: document.getElementById("serviceModalRole"),
    serviceModalFlow: document.getElementById("serviceModalFlow"),
    serviceModalFacts: document.getElementById("serviceModalFacts"),

    userModal: document.getElementById("userModal"),
    closeUserModal: document.getElementById("closeUserModal"),
    userModalTitle: document.getElementById("userModalTitle"),
    userModalDescription: document.getElementById("userModalDescription"),

    userForm: document.getElementById("userForm"),
    editingUserId: document.getElementById("editingUserId"),
    userName: document.getElementById("userName"),
    userEmail: document.getElementById("userEmail"),
    nameError: document.getElementById("nameError"),
    emailError: document.getElementById("emailError"),
    userFormMessage: document.getElementById("userFormMessage"),
    saveUserButton: document.getElementById("saveUserButton"),
    saveUserButtonText: document.getElementById("saveUserButtonText"),
    cancelUserForm: document.getElementById("cancelUserForm"),

    deleteModal: document.getElementById("deleteModal"),
    deleteUserName: document.getElementById("deleteUserName"),
    cancelDelete: document.getElementById("cancelDelete"),
    confirmDelete: document.getElementById("confirmDelete"),

    toastContainer: document.getElementById("toastContainer")
};


/* =========================================================
   DATABASE HEALTH
========================================================= */

async function checkDatabaseHealth() {
    setDatabaseCheckingState();

    try {
        const response = await fetch("/db", {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Database health check failed");
        }

        const data = await response.json();

        if (data.status !== "success") {
            throw new Error(data.message || "Database connection failed");
        }

        setDatabaseHealthyState(data.message);
    } catch (error) {
        console.error("Database health check error:", error);
        setDatabaseErrorState();
    }
}


function setDatabaseCheckingState() {
    elements.dbHealthBadge.className = "health-badge checking";
    elements.dbHealthBadge.innerHTML = "<i></i>Checking";

    elements.dbStatusDescription.textContent =
        "Checking live connectivity between the application and Amazon RDS MySQL.";

    elements.connectionStatus.className = "connection-status";

    elements.connectionStatus.innerHTML = `
        <span class="connection-dot"></span>
        <div>
            <strong>Checking connection</strong>
            <small>GET /db</small>
        </div>
    `;

    elements.globalStatusDot.className = "status-dot";
    elements.globalStatusText.textContent = "Checking system";
}


function setDatabaseHealthyState(message) {
    elements.dbHealthBadge.className = "health-badge healthy";
    elements.dbHealthBadge.innerHTML = "<i></i>Connected";

    elements.dbStatusDescription.textContent =
        message || "Application connected successfully to Amazon RDS MySQL.";

    elements.connectionStatus.className = "connection-status connected";

    elements.connectionStatus.innerHTML = `
        <span class="connection-dot"></span>
        <div>
            <strong>Connected to RDS</strong>
            <small>MySQL connection healthy</small>
        </div>
    `;

    elements.globalStatusDot.className = "status-dot online";
    elements.globalStatusText.textContent = "System operational";
}


function setDatabaseErrorState() {
    elements.dbHealthBadge.className = "health-badge error";
    elements.dbHealthBadge.innerHTML = "<i></i>Unavailable";

    elements.dbStatusDescription.textContent =
        "The application cannot currently connect to Amazon RDS MySQL.";

    elements.connectionStatus.className = "connection-status error";

    elements.connectionStatus.innerHTML = `
        <span class="connection-dot"></span>
        <div>
            <strong>Database unavailable</strong>
            <small>Check application connectivity</small>
        </div>
    `;

    elements.globalStatusDot.className = "status-dot offline";
    elements.globalStatusText.textContent = "Database unavailable";
}


/* =========================================================
   USERS
========================================================= */

async function loadUsers() {
    showUsersState("loading");

    try {
        const response = await fetch("/users", {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            cache: "no-store"
        });

        if (!response.ok) {
            const errorData = await safeReadJson(response);

            throw new Error(
                errorData.message || "Failed to retrieve users"
            );
        }

        const users = await response.json();

        if (!Array.isArray(users)) {
            throw new Error("Unexpected users response");
        }

        state.users = users;

        renderUsers();
    } catch (error) {
        console.error("Load users error:", error);

        state.users = [];

        elements.userCount.textContent = "0";
        elements.usersErrorMessage.textContent =
            error.message || "The application could not read the database.";

        showUsersState("error");
    }
}


function renderUsers() {
    elements.usersTableBody.innerHTML = "";
    elements.userCount.textContent = String(state.users.length);

    if (state.users.length === 0) {
        showUsersState("empty");
        return;
    }

    const fragment = document.createDocumentFragment();

    state.users.forEach((user) => {
        const row = document.createElement("tr");

        const initials = getInitials(user.name);
        const createdDate = formatDate(user.created_at);

        row.innerHTML = `
            <td>
                <span class="user-id">#${escapeHtml(String(user.id))}</span>
            </td>

            <td>
                <div class="user-cell">
                    <div class="user-avatar">${escapeHtml(initials)}</div>
                    <strong>${escapeHtml(user.name)}</strong>
                </div>
            </td>

            <td class="email-cell">
                ${escapeHtml(user.email)}
            </td>

            <td class="date-cell">
                ${escapeHtml(createdDate)}
            </td>

            <td>
                <div class="table-actions">
                    <button
                        class="icon-button edit-user"
                        type="button"
                        data-user-id="${escapeHtml(String(user.id))}"
                        aria-label="Edit ${escapeHtml(user.name)}"
                    >
                        Edit
                    </button>

                    <button
                        class="icon-button delete delete-user"
                        type="button"
                        data-user-id="${escapeHtml(String(user.id))}"
                        aria-label="Delete ${escapeHtml(user.name)}"
                    >
                        Delete
                    </button>
                </div>
            </td>
        `;

        fragment.appendChild(row);
    });

    elements.usersTableBody.appendChild(fragment);

    showUsersState("table");
}


function showUsersState(mode) {
    elements.usersLoadingState.classList.add("hidden");
    elements.usersEmptyState.classList.add("hidden");
    elements.usersErrorState.classList.add("hidden");

    if (mode === "loading") {
        elements.usersLoadingState.classList.remove("hidden");
    }

    if (mode === "empty") {
        elements.usersEmptyState.classList.remove("hidden");
    }

    if (mode === "error") {
        elements.usersErrorState.classList.remove("hidden");
    }
}


/* =========================================================
   CREATE / EDIT USER
========================================================= */

function openCreateUserModal() {
    state.editingUserId = null;

    resetUserForm();

    elements.userModalTitle.textContent = "Create User";
    elements.userModalDescription.textContent =
        "Create a new record in the Amazon RDS MySQL database.";

    elements.saveUserButtonText.textContent = "Create User";

    openModal(elements.userModal);

    window.setTimeout(() => {
        elements.userName.focus();
    }, 100);
}


function openEditUserModal(userId) {
    const user = state.users.find(
        (item) => Number(item.id) === Number(userId)
    );

    if (!user) {
        showToast(
            "User not found",
            "The selected database record is no longer available.",
            "error"
        );

        return;
    }

    state.editingUserId = Number(user.id);

    resetUserForm();

    elements.editingUserId.value = String(user.id);
    elements.userName.value = user.name;
    elements.userEmail.value = user.email;

    elements.userModalTitle.textContent = "Update User";
    elements.userModalDescription.textContent =
        `Update database record #${user.id}.`;

    elements.saveUserButtonText.textContent = "Save Changes";

    openModal(elements.userModal);

    window.setTimeout(() => {
        elements.userName.focus();
    }, 100);
}


async function handleUserSubmit(event) {
    event.preventDefault();

    clearFormErrors();

    const name = elements.userName.value.trim();
    const email = elements.userEmail.value.trim();

    if (!validateUserForm(name, email)) {
        return;
    }

    const editing = state.editingUserId !== null;

    setUserFormLoading(true);

    try {
        const endpoint = editing
            ? `/users/${state.editingUserId}`
            : "/users";

        const method = editing ? "PUT" : "POST";

        const response = await fetch(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                name,
                email
            })
        });

        const data = await safeReadJson(response);

        if (!response.ok) {
            throw new Error(
                data.message ||
                (editing
                    ? "Failed to update user"
                    : "Failed to create user")
            );
        }

        closeModal(elements.userModal);

        showToast(
            editing ? "User updated" : "User created",
            data.message ||
                (editing
                    ? "The RDS record was updated successfully."
                    : "The new record was stored in Amazon RDS."),
            "success"
        );

        await loadUsers();
        await checkDatabaseHealth();
    } catch (error) {
        console.error("Save user error:", error);

        showUserFormError(
            error.message || "Unable to save the database record."
        );
    } finally {
        setUserFormLoading(false);
    }
}


function validateUserForm(name, email) {
    let valid = true;

    if (!name) {
        elements.userName.classList.add("invalid");
        elements.nameError.textContent = "Name is required.";
        valid = false;
    }

    if (!email) {
        elements.userEmail.classList.add("invalid");
        elements.emailError.textContent = "Email is required.";
        valid = false;
    } else if (!isValidEmail(email)) {
        elements.userEmail.classList.add("invalid");
        elements.emailError.textContent = "Enter a valid email address.";
        valid = false;
    }

    return valid;
}


function resetUserForm() {
    elements.userForm.reset();
    elements.editingUserId.value = "";

    clearFormErrors();

    elements.userFormMessage.className = "form-message hidden";
    elements.userFormMessage.textContent = "";

    setUserFormLoading(false);
}


function clearFormErrors() {
    elements.userName.classList.remove("invalid");
    elements.userEmail.classList.remove("invalid");

    elements.nameError.textContent = "";
    elements.emailError.textContent = "";
}


function showUserFormError(message) {
    elements.userFormMessage.textContent = message;
    elements.userFormMessage.className = "form-message error";
}


function setUserFormLoading(loading) {
    elements.saveUserButton.disabled = loading;

    if (loading) {
        elements.saveUserButtonText.textContent =
            state.editingUserId !== null
                ? "Saving..."
                : "Creating...";
    } else {
        elements.saveUserButtonText.textContent =
            state.editingUserId !== null
                ? "Save Changes"
                : "Create User";
    }
}


/* =========================================================
   DELETE USER
========================================================= */

function openDeleteModal(userId) {
    const user = state.users.find(
        (item) => Number(item.id) === Number(userId)
    );

    if (!user) {
        showToast(
            "User not found",
            "The selected record is no longer available.",
            "error"
        );

        return;
    }

    state.deletingUserId = Number(user.id);

    elements.deleteUserName.textContent = user.name;
    elements.confirmDelete.disabled = false;
    elements.confirmDelete.textContent = "Delete User";

    openModal(elements.deleteModal);
}


async function deleteUser() {
    if (state.deletingUserId === null) {
        return;
    }

    const userId = state.deletingUserId;

    elements.confirmDelete.disabled = true;
    elements.confirmDelete.textContent = "Deleting...";

    try {
        const response = await fetch(`/users/${userId}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json"
            }
        });

        const data = await safeReadJson(response);

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete user"
            );
        }

        closeModal(elements.deleteModal);

        state.deletingUserId = null;

        showToast(
            "User deleted",
            data.message ||
                "The record was removed from Amazon RDS.",
            "success"
        );

        await loadUsers();
    } catch (error) {
        console.error("Delete user error:", error);

        showToast(
            "Delete failed",
            error.message || "Unable to delete the database record.",
            "error"
        );

        elements.confirmDelete.disabled = false;
        elements.confirmDelete.textContent = "Delete User";
    }
}


/* =========================================================
   SERVICE MODAL
========================================================= */

function openServiceInformation(serviceKey) {
    const service = serviceInformation[serviceKey];

    if (!service) {
        return;
    }

    elements.serviceModalIcon.textContent = service.icon;
    elements.serviceModalCategory.textContent = service.category;
    elements.serviceModalTitle.textContent = service.title;
    elements.serviceModalDescription.textContent = service.description;
    elements.serviceModalRole.textContent = service.role;
    elements.serviceModalFlow.textContent = service.flow;

    elements.serviceModalFacts.innerHTML = "";

    service.facts.forEach(([label, value]) => {
        const fact = document.createElement("div");

        fact.className = "modal-fact";

        fact.innerHTML = `
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
        `;

        elements.serviceModalFacts.appendChild(fact);
    });

    openModal(elements.serviceModal);
}


/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(modal) {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
}


function closeModal(modal) {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");

    if (
        elements.serviceModal.classList.contains("hidden") &&
        elements.userModal.classList.contains("hidden") &&
        elements.deleteModal.classList.contains("hidden")
    ) {
        document.body.classList.remove("modal-open");
    }
}


/* =========================================================
   TOAST
========================================================= */

function showToast(title, message, type = "success") {
    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <div class="toast-icon">
            ${type === "error" ? "!" : "✓"}
        </div>

        <div>
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

    elements.toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(12px)";

        window.setTimeout(() => {
            toast.remove();
        }, 220);
    }, 3500);
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {
    elements.mobileMenuButton.addEventListener("click", () => {
        const open = elements.navigation.classList.toggle("open");

        elements.mobileMenuButton.setAttribute(
            "aria-expanded",
            String(open)
        );
    });

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            elements.navigation.classList.remove("open");

            elements.mobileMenuButton.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });

    setupSectionObserver();
}


function setupSectionObserver() {
    const sections = document.querySelectorAll(".section-anchor");
    const links = document.querySelectorAll(".nav-link");

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const sectionId = entry.target.id;

                links.forEach((link) => {
                    const target = link.getAttribute("href");

                    link.classList.toggle(
                        "active",
                        target === `#${sectionId}`
                    );
                });
            });
        },
        {
            rootMargin: "-30% 0px -60% 0px",
            threshold: 0
        }
    );

    sections.forEach((section) => observer.observe(section));
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {
    document.querySelectorAll("[data-service]").forEach((button) => {
        button.addEventListener("click", () => {
            openServiceInformation(button.dataset.service);
        });
    });


    elements.openCreateUser.addEventListener(
        "click",
        openCreateUserModal
    );

    elements.emptyCreateUser.addEventListener(
        "click",
        openCreateUserModal
    );

    elements.retryUsers.addEventListener(
        "click",
        loadUsers
    );


    elements.usersTableBody.addEventListener("click", (event) => {
        const editButton = event.target.closest(".edit-user");
        const deleteButton = event.target.closest(".delete-user");

        if (editButton) {
            openEditUserModal(editButton.dataset.userId);
            return;
        }

        if (deleteButton) {
            openDeleteModal(deleteButton.dataset.userId);
        }
    });


    elements.userForm.addEventListener(
        "submit",
        handleUserSubmit
    );


    elements.closeServiceModal.addEventListener("click", () => {
        closeModal(elements.serviceModal);
    });

    elements.closeUserModal.addEventListener("click", () => {
        closeModal(elements.userModal);
    });

    elements.cancelUserForm.addEventListener("click", () => {
        closeModal(elements.userModal);
    });

    elements.cancelDelete.addEventListener("click", () => {
        state.deletingUserId = null;
        closeModal(elements.deleteModal);
    });

    elements.confirmDelete.addEventListener(
        "click",
        deleteUser
    );


    [
        elements.serviceModal,
        elements.userModal,
        elements.deleteModal
    ].forEach((backdrop) => {
        backdrop.addEventListener("click", (event) => {
            if (event.target !== backdrop) {
                return;
            }

            if (backdrop === elements.deleteModal) {
                state.deletingUserId = null;
            }

            closeModal(backdrop);
        });
    });


    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (!elements.deleteModal.classList.contains("hidden")) {
            state.deletingUserId = null;
            closeModal(elements.deleteModal);
            return;
        }

        if (!elements.userModal.classList.contains("hidden")) {
            closeModal(elements.userModal);
            return;
        }

        if (!elements.serviceModal.classList.contains("hidden")) {
            closeModal(elements.serviceModal);
        }
    });


    elements.userName.addEventListener("input", () => {
        elements.userName.classList.remove("invalid");
        elements.nameError.textContent = "";
    });

    elements.userEmail.addEventListener("input", () => {
        elements.userEmail.classList.remove("invalid");
        elements.emailError.textContent = "";
    });
}


/* =========================================================
   UTILITIES
========================================================= */

async function safeReadJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}


function getInitials(name) {
    if (!name) {
        return "U";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}


function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

async function initializeApplication() {
    setupNavigation();
    setupEventListeners();

    await Promise.all([
        checkDatabaseHealth(),
        loadUsers()
    ]);
}


document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);