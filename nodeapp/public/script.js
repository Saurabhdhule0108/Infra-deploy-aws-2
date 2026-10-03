"use strict";

/* =========================================================
   INFRADEPLOY AWS
   Final Frontend Controller
   - Cinematic motion
   - Technology explorer
   - Visual failover simulation
   - REAL /db health check
   - REAL /users CRUD
========================================================= */


/* =========================================================
   01. HELPERS
========================================================= */

const $ = (selector, scope = document) =>
    scope.querySelector(selector);

const $$ = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

const byId = (id) =>
    document.getElementById(id);

const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* =========================================================
   02. GLOBAL STATE
========================================================= */

let usersCache = [];
let pendingDeleteId = null;
let failoverSimulationActive = false;


/* =========================================================
   03. API HELPER
========================================================= */

async function apiRequest(url, options = {}) {
    const headers = {
        ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),
        ...(options.headers || {})
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    const contentType =
        response.headers.get("content-type") || "";

    let payload = {};

    if (contentType.includes("application/json")) {
        payload = await response.json();
    } else {
        const text = await response.text();

        payload = text
            ? { message: text }
            : {};
    }

    if (!response.ok) {
        throw new Error(
            payload?.message ||
            `Request failed with HTTP ${response.status}`
        );
    }

    return payload;
}


/* =========================================================
   04. MODAL HELPERS
========================================================= */

function openModal(modal) {
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
}


function closeModal(modal) {
    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");

    const openModalExists =
        $$(".modal-overlay").some(
            (item) => !item.classList.contains("hidden")
        );

    if (!openModalExists) {
        document.body.classList.remove("modal-open");
    }
}


/* =========================================================
   05. TOAST
========================================================= */

function showToast(type, title, message) {
    const container = byId("toastContainer");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type === "error" ? "error" : "success"}`;

    const icon =
        document.createElement("div");

    icon.className = "toast-icon";
    icon.textContent =
        type === "error" ? "!" : "✓";

    const copy =
        document.createElement("div");

    const heading =
        document.createElement("strong");

    heading.textContent = title;

    const paragraph =
        document.createElement("p");

    paragraph.textContent = message;

    copy.append(heading, paragraph);
    toast.append(icon, copy);

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(30px)";

        setTimeout(() => {
            toast.remove();
        }, 350);
    }, 4000);
}


/* =========================================================
   06. SCROLL PROGRESS + NAVBAR
========================================================= */

function updateScrollEffects() {
    const progress =
        byId("scrollProgress");

    const navbar =
        byId("navbar");

    const availableHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const percentage =
        availableHeight > 0
            ? (window.scrollY / availableHeight) * 100
            : 0;

    if (progress) {
        progress.style.width =
            `${Math.min(100, Math.max(0, percentage))}%`;
    }

    if (navbar) {
        navbar.classList.toggle(
            "scrolled",
            window.scrollY > 25
        );
    }
}


let scrollAnimationFrame = null;

window.addEventListener(
    "scroll",
    () => {
        if (scrollAnimationFrame) return;

        scrollAnimationFrame =
            requestAnimationFrame(() => {
                updateScrollEffects();
                scrollAnimationFrame = null;
            });
    },
    { passive: true }
);


/* =========================================================
   07. SCROLL REVEAL
========================================================= */

function initializeRevealAnimations() {
    const elements =
        $$(".reveal");

    if (
        prefersReducedMotion ||
        !("IntersectionObserver" in window)
    ) {
        elements.forEach(
            (element) =>
                element.classList.add("revealed")
        );

        return;
    }

    const observer =
        new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -60px 0px"
            }
        );

    elements.forEach(
        (element) => observer.observe(element)
    );
}


/* =========================================================
   08. PIPELINE ANIMATION
========================================================= */

function initializePipelineAnimation() {
    const pipeline =
        $(".pipeline-shell");

    if (!pipeline) return;

    if (
        prefersReducedMotion ||
        !("IntersectionObserver" in window)
    ) {
        pipeline.classList.add("pipeline-active");
        return;
    }

    const observer =
        new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    pipeline.classList.add("pipeline-active");
                    observer.disconnect();
                });
            },
            {
                threshold: 0.25
            }
        );

    observer.observe(pipeline);
}


/* =========================================================
   09. MOUSE GLOW
========================================================= */

function initializeMouseGlow() {
    const glow =
        byId("mouseGlow");

    if (
        !glow ||
        prefersReducedMotion ||
        window.matchMedia("(pointer: coarse)").matches
    ) {
        return;
    }

    let targetX =
        window.innerWidth / 2;

    let targetY =
        window.innerHeight / 2;

    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener(
        "pointermove",
        (event) => {
            targetX = event.clientX;
            targetY = event.clientY;
        },
        { passive: true }
    );

    function animateGlow() {
        currentX +=
            (targetX - currentX) * 0.08;

        currentY +=
            (targetY - currentY) * 0.08;

        glow.style.left =
            `${currentX}px`;

        glow.style.top =
            `${currentY}px`;

        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}


/* =========================================================
   10. HERO PARALLAX
========================================================= */

function initializeHeroParallax() {
    const hero =
        $(".hero");

    const stage =
        $(".cloud-stage");

    if (
        !hero ||
        !stage ||
        prefersReducedMotion ||
        window.matchMedia("(pointer: coarse)").matches
    ) {
        return;
    }

    hero.addEventListener(
        "pointermove",
        (event) => {
            const rect =
                hero.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) /
                rect.width -
                0.5;

            const y =
                (event.clientY - rect.top) /
                rect.height -
                0.5;

            stage.style.transform =
                `translate3d(${x * 12}px, ${y * 12}px, 0)`;
        }
    );

    hero.addEventListener(
        "pointerleave",
        () => {
            stage.style.transform = "";
        }
    );
}


/* =========================================================
   11. SMOOTH NAVIGATION
========================================================= */

function initializeNavigation() {
    $$('a[href^="#"]').forEach((link) => {
        link.addEventListener(
            "click",
            (event) => {
                const href =
                    link.getAttribute("href");

                if (!href || href === "#") return;

                const target =
                    document.querySelector(href);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior:
                        prefersReducedMotion
                            ? "auto"
                            : "smooth",
                    block: "start"
                });
            }
        );
    });
}


/* =========================================================
   12. TECHNOLOGY INFORMATION
========================================================= */

const technologyDetails = {

    github: {
        category: "SOURCE CONTROL",
        title: "GitHub",
        symbol: "GH",

        description:
            "GitHub stores the application code, Terraform infrastructure code and CI/CD workflow definitions.",

        why:
            "It gives the project version control and provides the repository events that start automation.",

        project:
            "A push to the main branch starts the normal deployment workflow. The failover workflow is triggered separately for resilience testing.",

        value:
            "Application code, infrastructure code and deployment automation remain version controlled together.",

        flow:
            "Developer → Git Push → GitHub Repository → GitHub Actions"
    },


    actions: {
        category: "CI/CD",
        title: "GitHub Actions",
        symbol: "CI",

        description:
            "GitHub Actions is the automation engine used to execute the project's deployment workflow.",

        why:
            "It automates infrastructure changes, container builds, deployment and verification.",

        project:
            "The workflow authenticates to AWS, runs Terraform, builds the Docker image, pushes it to ECR, deploys to both EC2 servers, configures Nginx and verifies the application.",

        value:
            "Deployment becomes repeatable instead of being performed manually server by server.",

        flow:
            "Push → Actions → AWS → Terraform → Docker → ECR → EC2"
    },


    oidc: {
        category: "IDENTITY",
        title: "GitHub OIDC",
        symbol: "ID",

        description:
            "OIDC provides federated authentication between GitHub Actions and AWS.",

        why:
            "GitHub can authenticate without storing permanent AWS access keys in repository secrets.",

        project:
            "The workflow requests an OIDC token and presents it to AWS while requesting the configured IAM role.",

        value:
            "AWS credentials used by the workflow are temporary rather than permanently stored credentials.",

        flow:
            "GitHub Workflow → OIDC Token → AWS STS"
    },


    sts: {
        category: "SECURITY TOKEN SERVICE",
        title: "AWS STS",
        symbol: "STS",

        description:
            "AWS Security Token Service issues temporary AWS credentials after the GitHub identity is successfully trusted.",

        why:
            "The workflow needs temporary authenticated AWS API access.",

        project:
            "STS validates the federated request and allows the configured IAM role to be assumed when its trust conditions match.",

        value:
            "Temporary credentials automatically expire and avoid permanent CI access keys.",

        flow:
            "OIDC Token → AssumeRoleWithWebIdentity → Temporary Credentials"
    },


    terraform: {
        category: "INFRASTRUCTURE AS CODE",
        title: "Terraform",
        symbol: "TF",

        description:
            "Terraform defines and manages the AWS infrastructure using Infrastructure as Code.",

        why:
            "Infrastructure becomes reproducible, reviewable and manageable from code.",

        project:
            "Terraform manages the VPC, subnets, Internet Gateway, routing, security groups, EC2 instances, ECR repository and RDS infrastructure.",

        value:
            "The same configuration describes the infrastructure Terraform expects AWS to contain.",

        flow:
            "Terraform Configuration → Provider → AWS APIs → Infrastructure"
    },


    s3: {
        category: "REMOTE STATE",
        title: "Amazon S3",
        symbol: "S3",

        description:
            "Amazon S3 stores the project's Terraform remote state.",

        why:
            "GitHub Actions and Terraform need a persistent state location rather than relying on one local computer.",

        project:
            "The S3 backend stores terraform.tfstate and uses Terraform's S3 lockfile mechanism to protect state operations.",

        value:
            "Terraform can track existing managed infrastructure across separate workflow runs.",

        flow:
            "Terraform → S3 Backend → State + Lock"
    },


    vpc: {
        category: "NETWORKING",
        title: "Amazon VPC",
        symbol: "VPC",

        description:
            "The VPC provides the isolated AWS network boundary for the project.",

        why:
            "Application servers and the database need controlled network connectivity.",

        project:
            "The VPC uses 10.0.0.0/16 with two public application subnets and two private database subnets across ap-south-1a and ap-south-1b.",

        value:
            "Networking is separated according to application and database responsibilities.",

        flow:
            "VPC → Public App Subnets + Private DB Subnets"
    },


    ec2: {
        category: "COMPUTE",
        title: "Amazon EC2",
        symbol: "EC2",

        description:
            "Two EC2 instances provide compute capacity for the Dockerized Node.js application.",

        why:
            "The project demonstrates two application servers across separate Availability Zones.",

        project:
            "App-1 runs in public subnet 10.0.1.0/24 in ap-south-1a. App-2 runs in public subnet 10.0.4.0/24 in ap-south-1b.",

        value:
            "Both servers run the same application image while App-2 can act as the Nginx backup application upstream.",

        flow:
            "ECR → App-1 Docker + App-2 Docker"
    },


    docker: {
        category: "CONTAINERIZATION",
        title: "Docker",
        symbol: "DK",

        description:
            "Docker packages the Node.js application and its dependencies into an application image.",

        why:
            "The same application artifact can be deployed consistently to both EC2 servers.",

        project:
            "GitHub Actions builds the image. Both EC2 servers pull and run the same image on port 8080.",

        value:
            "The runtime environment is defined by the image rather than manually recreated on every server.",

        flow:
            "Dockerfile → Image → ECR → EC2 Containers"
    },


    ecr: {
        category: "CONTAINER REGISTRY",
        title: "Amazon ECR",
        symbol: "ECR",

        description:
            "Amazon Elastic Container Registry stores the project's Docker application image.",

        why:
            "The deployment pipeline needs a private location from which EC2 can retrieve the application image.",

        project:
            "GitHub Actions builds and pushes the image to ECR. Both EC2 application servers then pull that image.",

        value:
            "Application image storage is separated from application execution.",

        flow:
            "GitHub Runner → ECR → EC2 Docker"
    },


    nginx: {
        category: "REVERSE PROXY",
        title: "Nginx",
        symbol: "NX",

        description:
            "Nginx is the public reverse proxy running on App-1.",

        why:
            "It accepts HTTP traffic on port 80 and forwards requests to the Node.js application upstream.",

        project:
            "The primary upstream is App-1 at 127.0.0.1:8080. App-2's private address on port 8080 is configured as the backup upstream.",

        value:
            "The project demonstrates application-level active-passive failover.",

        flow:
            "Browser → App-1 Nginx:80 → App-1:8080 | Backup App-2:8080"
    },


    rds: {
        category: "MANAGED DATABASE",
        title: "Amazon RDS",
        symbol: "RDS",

        description:
            "Amazon RDS provides the managed MySQL database used by the application.",

        why:
            "The application needs persistent relational data without running MySQL directly on an application EC2 server.",

        project:
            "The database uses private database networking. Its DB subnet group contains private subnets in two Availability Zones. The current RDS instance itself is Single-AZ.",

        value:
            "The database is separated from the public application layer and managed by AWS RDS.",

        flow:
            "Node.js → TCP 3306 → Private RDS MySQL"
    }
};


/* =========================================================
   13. TECHNOLOGY EXPLORER
========================================================= */

function initializeTechnologyExplorer() {
    const modal =
        byId("technologyModal");

    const closeButton =
        byId("closeTechnologyModal");

    const category =
        byId("techModalCategory");

    const title =
        byId("techModalTitle");

    const symbol =
        byId("techModalSymbol");

    const description =
        byId("techModalDescription");

    const why =
        byId("techModalWhy");

    const project =
        byId("techModalProject");

    const value =
        byId("techModalValue");

    const flow =
        byId("techModalFlow");

    $$(".tech-card").forEach((card) => {
        card.addEventListener(
            "click",
            () => {
                const key =
                    card.dataset.tech;

                const data =
                    technologyDetails[key];

                if (!data || !modal) return;

                if (category) {
                    category.textContent =
                        data.category;
                }

                if (title) {
                    title.textContent =
                        data.title;
                }

                if (symbol) {
                    symbol.textContent =
                        data.symbol;
                }

                if (description) {
                    description.textContent =
                        data.description;
                }

                if (why) {
                    why.textContent =
                        data.why;
                }

                if (project) {
                    project.textContent =
                        data.project;
                }

                if (value) {
                    value.textContent =
                        data.value;
                }

                if (flow) {
                    flow.textContent =
                        data.flow;
                }

                openModal(modal);
            }
        );
    });

    closeButton?.addEventListener(
        "click",
        () => closeModal(modal)
    );

    modal?.addEventListener(
        "click",
        (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        }
    );
}


/* =========================================================
   14. DATABASE STATUS UI
========================================================= */

function setDatabaseState(state) {
    const wrapper =
        byId("databaseState");

    const text =
        byId("databaseStatusText");

    if (!wrapper || !text) return;

    wrapper.classList.remove(
        "connected",
        "error",
        "checking"
    );

    if (state === "checking") {
        wrapper.classList.add("checking");
        text.textContent = "CHECKING...";
    }

    if (state === "connected") {
        wrapper.classList.add("connected");
        text.textContent = "CONNECTED";
    }

    if (state === "error") {
        wrapper.classList.add("error");
        text.textContent = "CONNECTION ERROR";
    }

    if (state === "unchecked") {
        text.textContent = "NOT CHECKED";
    }
}


function setDatabaseConnectionBadge(
    state,
    label
) {
    const badge =
        byId("databaseConnectionBadge");

    if (!badge) return;

    badge.classList.remove(
        "connected",
        "error",
        "checking"
    );

    if (state) {
        badge.classList.add(state);
    }

    const dot =
        document.createElement("span");

    badge.replaceChildren(
        dot,
        document.createTextNode(` ${label}`)
    );
}


/* =========================================================
   15. REAL DATABASE CHECK
========================================================= */

async function checkDatabaseHealth(
    showResult = true
) {
    const button =
        byId("databaseHealthButton");

    const originalText =
        button?.innerHTML;

    setDatabaseState("checking");

    setDatabaseConnectionBadge(
        "checking",
        "CHECKING RDS"
    );

    if (button) {
        button.disabled = true;
        button.innerHTML =
            "Checking Database...";
    }

    try {
        const result =
            await apiRequest("/db");

        if (
            result?.status &&
            result.status !== "success"
        ) {
            throw new Error(
                result.message ||
                "Database connection failed."
            );
        }

        setDatabaseState("connected");

        setDatabaseConnectionBadge(
            "connected",
            "RDS CONNECTED"
        );

        if (showResult) {
            showDatabaseResult(
                true,
                result?.message ||
                "Connected to Amazon RDS MySQL."
            );
        }

        return true;
    } catch (error) {
        setDatabaseState("error");

        setDatabaseConnectionBadge(
            "error",
            "RDS UNAVAILABLE"
        );

        if (showResult) {
            showDatabaseResult(
                false,
                error.message
            );
        }

        return false;
    } finally {
        if (button) {
            button.disabled = false;

            button.innerHTML =
                originalText ||
                "Check Database";
        }
    }
}


/* =========================================================
   16. DATABASE RESULT MODAL
========================================================= */

function showDatabaseResult(
    success,
    message
) {
    const modal =
        byId("databaseModal");

    const modalCard =
        modal?.querySelector(
            ".database-result-modal"
        );

    const icon =
        byId("databaseResultIcon");

    const title =
        byId("databaseResultTitle");

    const resultMessage =
        byId("databaseResultMessage");

    if (!modal) return;

    modalCard?.classList.remove(
        "success",
        "error"
    );

    modalCard?.classList.add(
        success ? "success" : "error"
    );

    if (icon) {
        icon.textContent =
            success ? "DB" : "!";
    }

    if (title) {
        title.textContent =
            success
                ? "RDS Connection Verified"
                : "Database Connection Failed";
    }

    if (resultMessage) {
        resultMessage.textContent =
            message;
    }

    openModal(modal);
}


/* =========================================================
   17. DATABASE BUTTONS
========================================================= */

function initializeDatabaseHealth() {
    const button =
        byId("databaseHealthButton");

    const heroButton =
        byId("heroDatabaseButton");

    const modal =
        byId("databaseModal");

    const closeButton =
        byId("closeDatabaseModal");

    button?.addEventListener(
        "click",
        () => checkDatabaseHealth(true)
    );

    heroButton?.addEventListener(
        "click",
        () => {
            const section =
                byId("database");

            section?.scrollIntoView({
                behavior:
                    prefersReducedMotion
                        ? "auto"
                        : "smooth"
            });

            setTimeout(
                () => checkDatabaseHealth(true),
                prefersReducedMotion
                    ? 0
                    : 550
            );
        }
    );

    closeButton?.addEventListener(
        "click",
        () => closeModal(modal)
    );

    modal?.addEventListener(
        "click",
        (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        }
    );

    /*
       IMPORTANT:
       We deliberately DO NOT call /db here.

       Database status stays NOT CHECKED
       until the user performs a real check.
    */
}


/* =========================================================
   18. USER DATA EXTRACTION
========================================================= */

function extractUsers(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.users)) {
        return payload.users;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    return [];
}


/* =========================================================
   19. LOAD USERS
========================================================= */

async function loadUsers() {
    const tableBody =
        byId("usersTableBody");

    if (!tableBody) return;

    try {
        const payload =
            await apiRequest("/users");

        usersCache =
            extractUsers(payload);

        renderUsers(usersCache);
    } catch (error) {
        usersCache = [];

        renderUsers([]);

        showToast(
            "error",
            "Unable to load users",
            error.message
        );
    }
}


/* =========================================================
   20. FORMAT DATE
========================================================= */

function formatDate(value) {
    if (!value) return "—";

    const date =
        new Date(value);

    if (
        Number.isNaN(date.getTime())
    ) {
        return String(value);
    }

    return date.toLocaleString();
}


/* =========================================================
   21. RENDER USERS SAFELY
========================================================= */

function renderUsers(users) {
    const tableBody =
        byId("usersTableBody");

    const count =
        byId("userCount");

    const empty =
        byId("emptyState");

    if (!tableBody) return;

    tableBody.replaceChildren();

    if (count) {
        count.textContent =
            String(users.length);
    }

    if (users.length === 0) {
        empty?.classList.remove("hidden");
        return;
    }

    empty?.classList.add("hidden");

    users.forEach((user) => {
        const row =
            document.createElement("tr");

        const idCell =
            document.createElement("td");

        const nameCell =
            document.createElement("td");

        const emailCell =
            document.createElement("td");

        const dateCell =
            document.createElement("td");

        const actionsCell =
            document.createElement("td");

        idCell.textContent =
            `#${user.id}`;

        nameCell.textContent =
            user.name ?? "";

        emailCell.textContent =
            user.email ?? "";

        dateCell.textContent =
            formatDate(user.created_at);

        const actions =
            document.createElement("div");

        actions.className =
            "table-actions";

        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className =
            "table-button edit";

        editButton.textContent =
            "Edit";

        editButton.dataset.action =
            "edit";

        editButton.dataset.id =
            String(user.id);

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className =
            "table-button delete";

        deleteButton.textContent =
            "Delete";

        deleteButton.dataset.action =
            "delete";

        deleteButton.dataset.id =
            String(user.id);

        actions.append(
            editButton,
            deleteButton
        );

        actionsCell.appendChild(actions);

        row.append(
            idCell,
            nameCell,
            emailCell,
            dateCell,
            actionsCell
        );

        tableBody.appendChild(row);
    });
}


/* =========================================================
   22. CREATE USER
========================================================= */

async function createUser(event) {
    event.preventDefault();

    const form =
        byId("userForm");

    const nameInput =
        byId("name");

    const emailInput =
        byId("email");

    const button =
        byId("submitButton");

    const name =
        nameInput?.value.trim();

    const email =
        emailInput?.value.trim();

    if (!name || !email) {
        showToast(
            "error",
            "Missing information",
            "Enter both a name and email address."
        );

        return;
    }

    const originalText =
        button?.innerHTML;

    try {
        if (button) {
            button.disabled = true;
            button.innerHTML =
                "Creating...";
        }

        const result =
            await apiRequest(
                "/users",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name,
                        email
                    })
                }
            );

        form?.reset();

        showToast(
            "success",
            "Record created",
            result?.message ||
            "The user was stored in RDS MySQL."
        );

        await loadUsers();
    } catch (error) {
        showToast(
            "error",
            "Create failed",
            error.message
        );
    } finally {
        if (button) {
            button.disabled = false;

            button.innerHTML =
                originalText ||
                "Add User";
        }
    }
}


/* =========================================================
   23. OPEN EDIT MODAL
========================================================= */

function openEditUser(id) {
    const user =
        usersCache.find(
            (item) =>
                String(item.id) ===
                String(id)
        );

    if (!user) {
        showToast(
            "error",
            "User not found",
            "The selected record is no longer available."
        );

        return;
    }

    const idInput =
        byId("editUserId");

    const nameInput =
        byId("editName");

    const emailInput =
        byId("editEmail");

    if (idInput) {
        idInput.value =
            user.id;
    }

    if (nameInput) {
        nameInput.value =
            user.name ?? "";
    }

    if (emailInput) {
        emailInput.value =
            user.email ?? "";
    }

    openModal(
        byId("editModal")
    );

    setTimeout(
        () => nameInput?.focus(),
        100
    );
}


/* =========================================================
   24. UPDATE USER
========================================================= */

async function updateUser(event) {
    event.preventDefault();

    const id =
        byId("editUserId")?.value;

    const name =
        byId("editName")?.value.trim();

    const email =
        byId("editEmail")?.value.trim();

    if (!id || !name || !email) {
        showToast(
            "error",
            "Missing information",
            "Name and email are required."
        );

        return;
    }

    try {
        const result =
            await apiRequest(
                `/users/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        name,
                        email
                    })
                }
            );

        closeModal(
            byId("editModal")
        );

        showToast(
            "success",
            "Record updated",
            result?.message ||
            "The RDS record was updated."
        );

        await loadUsers();
    } catch (error) {
        showToast(
            "error",
            "Update failed",
            error.message
        );
    }
}


/* =========================================================
   25. DELETE MODAL
========================================================= */

function openDeleteUser(id) {
    const user =
        usersCache.find(
            (item) =>
                String(item.id) ===
                String(id)
        );

    if (!user) {
        showToast(
            "error",
            "User not found",
            "The selected record is no longer available."
        );

        return;
    }

    pendingDeleteId =
        user.id;

    const name =
        byId("deleteUserName");

    if (name) {
        name.textContent =
            user.name;
    }

    openModal(
        byId("deleteModal")
    );
}


/* =========================================================
   26. DELETE USER
========================================================= */

async function deleteUser() {
    if (
        pendingDeleteId === null
    ) {
        return;
    }

    const button =
        byId("confirmDelete");

    const originalText =
        button?.textContent;

    try {
        if (button) {
            button.disabled = true;
            button.textContent =
                "Deleting...";
        }

        const result =
            await apiRequest(
                `/users/${encodeURIComponent(
                    pendingDeleteId
                )}`,
                {
                    method: "DELETE"
                }
            );

        pendingDeleteId = null;

        closeModal(
            byId("deleteModal")
        );

        showToast(
            "success",
            "Record deleted",
            result?.message ||
            "The record was removed from RDS."
        );

        await loadUsers();
    } catch (error) {
        showToast(
            "error",
            "Delete failed",
            error.message
        );
    } finally {
        if (button) {
            button.disabled = false;

            button.textContent =
                originalText ||
                "Delete User";
        }
    }
}


/* =========================================================
   27. CRUD INITIALIZATION
========================================================= */

function initializeUserManagement() {
    const form =
        byId("userForm");

    const editForm =
        byId("editUserForm");

    const table =
        byId("usersTableBody");

    const editModal =
        byId("editModal");

    const deleteModal =
        byId("deleteModal");

    form?.addEventListener(
        "submit",
        createUser
    );

    editForm?.addEventListener(
        "submit",
        updateUser
    );

    table?.addEventListener(
        "click",
        (event) => {
            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) return;

            const id =
                button.dataset.id;

            if (
                button.dataset.action ===
                "edit"
            ) {
                openEditUser(id);
            }

            if (
                button.dataset.action ===
                "delete"
            ) {
                openDeleteUser(id);
            }
        }
    );

    byId("closeEditModal")
        ?.addEventListener(
            "click",
            () => closeModal(editModal)
        );

    byId("cancelEdit")
        ?.addEventListener(
            "click",
            () => closeModal(editModal)
        );

    byId("cancelDelete")
        ?.addEventListener(
            "click",
            () => {
                pendingDeleteId = null;
                closeModal(deleteModal);
            }
        );

    byId("confirmDelete")
        ?.addEventListener(
            "click",
            deleteUser
        );

    editModal?.addEventListener(
        "click",
        (event) => {
            if (event.target === editModal) {
                closeModal(editModal);
            }
        }
    );

    deleteModal?.addEventListener(
        "click",
        (event) => {
            if (event.target === deleteModal) {
                closeModal(deleteModal);
            }
        }
    );
}


/* =========================================================
   28. FAILOVER LOG
========================================================= */

function renderFailoverLog(lines) {
    const container =
        byId("failoverLog");

    if (!container) return;

    container.replaceChildren();

    lines.forEach(
        (message, index) => {
            const line =
                document.createElement("p");

            const number =
                document.createElement("span");

            number.textContent =
                `[${String(index + 1).padStart(2, "0")}]`;

            line.append(
                number,
                document.createTextNode(
                    ` ${message}`
                )
            );

            container.appendChild(line);
        }
    );
}


/* =========================================================
   29. FAILOVER VISUAL SIMULATION
========================================================= */

function initializeFailoverSimulation() {
    const demo =
        byId("failoverDemo");

    const button =
        byId("simulateFailureButton");

    const title =
        byId("failoverTitle");

    const appOne =
        byId("failoverAppOne");

    const appTwo =
        byId("failoverAppTwo");

    const appOneState =
        byId("appOneState");

    const simulationStatus =
        byId("simulationStatus");

    const primaryRoute =
        $(".route-primary", demo || document);

    const secondaryRoute =
        $(".route-secondary", demo || document);

    const appTwoState =
        appTwo?.querySelector(
            ".component-state"
        );

    if (!button || !demo) return;

    function renderNormalState() {
        failoverSimulationActive = false;

        demo.classList.remove(
            "failure-mode"
        );

        primaryRoute?.classList.add(
            "active"
        );

        secondaryRoute?.classList.remove(
            "active"
        );

        if (appOneState) {
            appOneState.textContent =
                "PRIMARY ACTIVE";
        }

        if (appTwoState) {
            appTwoState.textContent =
                "BACKUP READY";
        }

        if (title) {
            title.textContent =
                "Normal operation";
        }

        if (simulationStatus) {
            simulationStatus.textContent =
                "NORMAL";
        }

        button.textContent =
            "Simulate App-1 Failure";

        renderFailoverLog([
            "Browser traffic reaches the App-1 public Nginx endpoint.",
            "Nginx sends application requests to App-1 on 127.0.0.1:8080.",
            "App-2 remains ready as the backup application upstream.",
            "This visualization does not modify AWS resources."
        ]);
    }


    function renderFailureState() {
        failoverSimulationActive = true;

        demo.classList.add(
            "failure-mode"
        );

        primaryRoute?.classList.remove(
            "active"
        );

        secondaryRoute?.classList.add(
            "active"
        );

        if (appOneState) {
            appOneState.textContent =
                "SIMULATED DOWN";
        }

        if (appTwoState) {
            appTwoState.textContent =
                "ACTIVE BACKUP";
        }

        if (title) {
            title.textContent =
                "Backup application path active";
        }

        if (simulationStatus) {
            simulationStatus.textContent =
                "FAILOVER";
        }

        button.textContent =
            "Restore App-1";

        renderFailoverLog([
            "Browser continues requesting the App-1 public Nginx endpoint.",
            "The visualization marks the App-1 Node.js upstream unavailable.",
            "Nginx switches application traffic to App-2 over the private VPC network on port 8080.",
            "The real failover workflow separately tests this behavior against AWS.",
            "This browser simulation does not stop, start or modify any AWS resource."
        ]);
    }


    button.addEventListener(
        "click",
        () => {
            if (failoverSimulationActive) {
                renderNormalState();

                showToast(
                    "success",
                    "Simulation restored",
                    "The visual architecture returned to the normal App-1 primary path."
                );
            } else {
                renderFailureState();

                showToast(
                    "success",
                    "Failover visualized",
                    "The diagram now shows App-2 serving as the backup application upstream."
                );
            }
        }
    );

    renderNormalState();
}


/* =========================================================
   30. ACTIVE NAVIGATION
========================================================= */

function initializeActiveNavigation() {
    const sections =
        $$("main section[id]");

    const links =
        $$('.nav-links a[href^="#"]');

    if (
        !sections.length ||
        !links.length ||
        !("IntersectionObserver" in window)
    ) {
        return;
    }

    const observer =
        new IntersectionObserver(
            (entries) => {
                entries.forEach(
                    (entry) => {
                        if (!entry.isIntersecting) {
                            return;
                        }

                        links.forEach(
                            (link) => {
                                const active =
                                    link.getAttribute("href") ===
                                    `#${entry.target.id}`;

                                link.classList.toggle(
                                    "active",
                                    active
                                );

                                link.style.color =
                                    active
                                        ? "var(--cyan)"
                                        : "";
                            }
                        );
                    }
                );
            },
            {
                rootMargin:
                    "-35% 0px -55% 0px",
                threshold: 0
            }
        );

    sections.forEach(
        (section) =>
            observer.observe(section)
    );
}


/* =========================================================
   31. ESCAPE KEY
========================================================= */

function initializeKeyboardControls() {
    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key !== "Escape") {
                return;
            }

            [
                "technologyModal",
                "databaseModal",
                "editModal",
                "deleteModal"
            ].forEach(
                (id) =>
                    closeModal(byId(id))
            );
        }
    );
}


/* =========================================================
   32. START APPLICATION
========================================================= */

async function initializeApplication() {
    updateScrollEffects();

    initializeRevealAnimations();
    initializePipelineAnimation();
    initializeMouseGlow();
    initializeHeroParallax();
    initializeNavigation();
    initializeTechnologyExplorer();
    initializeDatabaseHealth();
    initializeUserManagement();
    initializeFailoverSimulation();
    initializeActiveNavigation();
    initializeKeyboardControls();

    /*
       CRUD records are loaded from the real API.

       We intentionally do NOT call /db automatically.
       The database health panel remains NOT CHECKED until
       the user clicks one of the database-check buttons.
    */
    await loadUsers();
}


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication
    );
} else {
    initializeApplication();
}