// =========================================================
// ELEMENTS
// =========================================================

const databaseStatus =
    document.getElementById("database-status");

const databaseMessage =
    document.getElementById("database-message");

const databaseCheckButton =
    document.getElementById("database-check");

const heroDatabaseCheckButton =
    document.getElementById("hero-db-check");

const userForm =
    document.getElementById("user-form");

const createUserButton =
    document.getElementById("create-user-button");

const formMessage =
    document.getElementById("form-message");

const usersContainer =
    document.getElementById("users-container");

const refreshUsersButton =
    document.getElementById("refresh-users");


// =========================================================
// DATABASE STATUS
// =========================================================

async function checkDatabase() {

    databaseStatus.className =
        "status-value checking";

    databaseStatus.innerHTML =
        "<span></span>CHECKING";

    databaseMessage.textContent =
        "Testing application → Amazon RDS connection...";

    try {

        const response = await fetch("/db", {
            method: "GET",
            cache: "no-store"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Database unavailable"
            );
        }

        databaseStatus.className =
            "status-value success";

        databaseStatus.innerHTML =
            "<span></span>CONNECTED";

        databaseMessage.textContent =
            data.message ||
            "Connected to Amazon RDS MySQL";

    } catch (error) {

        databaseStatus.className =
            "status-value error";

        databaseStatus.innerHTML =
            "<span></span>UNAVAILABLE";

        databaseMessage.textContent =
            "Unable to connect to Amazon RDS MySQL.";

    }

}


// =========================================================
// CREATE USER
// =========================================================

async function createUser(event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();


    formMessage.className = "form-message";
    formMessage.textContent = "";


    if (!name || !email) {

        formMessage.className =
            "form-message error";

        formMessage.textContent =
            "Please enter both name and email.";

        return;
    }


    createUserButton.disabled = true;
    createUserButton.innerHTML =
        "Creating user... <span>↗</span>";


    try {

        const response = await fetch("/users", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email
            })

        });


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to create user"
            );
        }


        formMessage.className =
            "form-message success";

        formMessage.textContent =
            `✓ ${data.user.name} stored successfully in RDS.`;


        userForm.reset();


        await loadUsers();


    } catch (error) {

        formMessage.className =
            "form-message error";

        formMessage.textContent =
            error.message;

    } finally {

        createUserButton.disabled = false;

        createUserButton.innerHTML =
            "Create User <span>↗</span>";

    }

}


// =========================================================
// LOAD USERS
// =========================================================

async function loadUsers() {

    usersContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">◇</div>
            <strong>Loading users</strong>
            <span>Reading records from Amazon RDS...</span>
        </div>
    `;


    try {

        const response = await fetch("/users", {
            method: "GET",
            cache: "no-store"
        });


        const users = await response.json();


        if (!response.ok) {
            throw new Error(
                users.message ||
                "Unable to retrieve users"
            );
        }


        if (!Array.isArray(users) || users.length === 0) {

            usersContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">◇</div>
                    <strong>No users yet</strong>
                    <span>
                        Create your first record in Amazon RDS.
                    </span>
                </div>
            `;

            return;
        }


        usersContainer.innerHTML = "";


        users.forEach((user) => {

            const row =
                document.createElement("div");

            row.className = "user-row";


            const id =
                document.createElement("span");

            id.className = "user-id";

            id.textContent =
                `#${String(user.id).padStart(2, "0")}`;


            const name =
                document.createElement("span");

            name.className = "user-name";

            name.textContent =
                user.name;


            const email =
                document.createElement("span");

            email.className = "user-email";

            email.textContent =
                user.email;


            row.appendChild(id);
            row.appendChild(name);
            row.appendChild(email);


            usersContainer.appendChild(row);

        });


    } catch (error) {

        usersContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">!</div>
                <strong>Unable to load users</strong>
                <span>
                    Check the application and database connection.
                </span>
            </div>
        `;

    }

}


// =========================================================
// EVENT LISTENERS
// =========================================================

databaseCheckButton.addEventListener(
    "click",
    checkDatabase
);


heroDatabaseCheckButton.addEventListener(
    "click",
    () => {

        document
            .getElementById("system")
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        checkDatabase();

    }
);


userForm.addEventListener(
    "submit",
    createUser
);


refreshUsersButton.addEventListener(
    "click",
    loadUsers
);


// =========================================================
// INITIAL PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await checkDatabase();

        await loadUsers();

    }
);