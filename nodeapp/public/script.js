"use strict";


/* =========================================================
   INFRADEPLOY AWS
   CINEMATIC FRONTEND EXPERIENCE

   IMPORTANT
   ---------------------------------------------------------
   - /db is a REAL backend request.
   - /users CRUD is REAL backend/RDS interaction.
   - Failover Lab is ONLY a browser visualization.
   - No frontend control modifies AWS infrastructure.
========================================================= */


/* =========================================================
   01. HELPERS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const byId = (id) =>
    document.getElementById(id);

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


/* =========================================================
   02. APPLICATION STATE
========================================================= */

let usersCache = [];

let pendingDeleteId = null;

let failoverSimulationActive = false;

let pipelineTimer = null;

let ticking = false;


/* =========================================================
   03. TECHNOLOGY CONTENT
========================================================= */

const technologyData = {

    github: {
        category: "SOURCE CONTROL",
        symbol: "GH",
        title: "GitHub",
        description:
            "GitHub stores the application, Terraform configuration and CI/CD workflow used by this infrastructure project.",
        why:
            "It provides version control and a central repository for the source code and infrastructure configuration.",
        project:
            "A push to the main branch can trigger the deployment workflow.",
        value:
            "Code changes and infrastructure changes can follow the same controlled version history.",
        flow:
            "Developer → GitHub Repository → GitHub Actions"
    },

    actions: {
        category: "CI/CD AUTOMATION",
        symbol: "CI",
        title: "GitHub Actions",
        description:
            "GitHub Actions is the automation engine used to run the deployment workflow for this project.",
        why:
            "Infrastructure and application deployment should be repeatable instead of relying on manual steps.",
        project:
            "The workflow authenticates to AWS, runs Terraform, builds the Docker image, pushes it to ECR and deploys the application to EC2.",
        value:
            "One pipeline coordinates infrastructure and application delivery.",
        flow:
            "Push → Workflow → Terraform → Docker → ECR → EC2"
    },

    oidc: {
        category: "FEDERATED IDENTITY",
        symbol: "ID",
        title: "GitHub OIDC",
        description:
            "OIDC allows GitHub Actions to prove its workload identity to AWS without storing long-lived AWS access keys in the repository.",
        why:
            "Long-lived credentials create unnecessary credential-management risk.",
        project:
            "GitHub requests an OIDC token containing information about the repository and workflow identity.",
        value:
            "AWS authentication is based on temporary workload identity rather than permanent repository access keys.",
        flow:
            "GitHub → OIDC Token → AWS Trust Policy"
    },

    sts: {
        category: "TEMPORARY CREDENTIALS",
        symbol: "STS",
        title: "AWS STS",
        description:
            "AWS Security Token Service provides temporary credentials after the GitHub identity is allowed to assume the configured IAM role.",
        why:
            "AWS API calls require authenticated credentials.",
        project:
            "STS evaluates the role assumption request and returns temporary session credentials when the trust conditions match.",
        value:
            "Credentials are temporary and scoped to the assumed role session.",
        flow:
            "OIDC Token → STS → Assume Role → Temporary Credentials"
    },

    terraform: {
        category: "INFRASTRUCTURE AS CODE",
        symbol: "TF",
        title: "Terraform",
        description:
            "Terraform describes and manages the AWS infrastructure as code.",
        why:
            "Infrastructure should be reproducible, reviewable and version controlled.",
        project:
            "Terraform manages the VPC, subnets, routing, security groups, EC2 instances, ECR repository and RDS resources.",
        value:
            "The configuration represents the intended infrastructure state and Terraform calculates the required changes.",
        flow:
            "Configuration → Plan → Apply → AWS APIs"
    },

    s3: {
        category: "REMOTE TERRAFORM STATE",
        symbol: "S3",
        title: "Amazon S3",
        description:
            "Amazon S3 stores the project's Terraform state remotely.",
        why:
            "Terraform needs state information to understand resources it already manages.",
        project:
            "The Terraform backend uses an S3 bucket in ap-south-1 with state locking enabled.",
        value:
            "Remote state is available to the CI/CD workflow instead of depending on one local machine.",
        flow:
            "Terraform → S3 Backend → terraform.tfstate"
    },

    vpc: {
        category: "NETWORKING",
        symbol: "NW",
        title: "Amazon VPC",
        description:
            "The VPC provides the isolated AWS network containing the application and database resources.",
        why:
            "Cloud resources need controlled addressing, routing and security boundaries.",
        project:
            "The project uses a 10.0.0.0/16 VPC with public application subnets and private database subnets across two Availability Zones.",
        value:
            "Application and database networking can be separated while still communicating privately inside the VPC.",
        flow:
            "VPC → Public App Subnets + Private DB Subnets"
    },

    ec2: {
        category: "COMPUTE",
        symbol: "EC2",
        title: "Amazon EC2",
        description:
            "Two Ubuntu EC2 instances provide compute capacity for the containerized Node.js application.",
        why:
            "The application needs compute resources on which Docker containers can run.",
        project:
            "App-1 runs the primary application and Nginx. App-2 runs the same application and acts as the Nginx backup upstream.",
        value:
            "Two application servers allow this project to demonstrate application-level active-passive routing.",
        flow:
            "ECR Image → App-1 + App-2 → Docker :8080"
    },

    docker: {
        category: "CONTAINERIZATION",
        symbol: "DK",
        title: "Docker",
        description:
            "Docker packages the Node.js application and its runtime dependencies into a portable image.",
        why:
            "The application should run using the same packaged environment on both application servers.",
        project:
            "GitHub Actions builds one application image and both EC2 instances run that image.",
        value:
            "Deployment becomes consistent and independent of manually configuring the Node.js runtime on each server.",
        flow:
            "Source → Dockerfile → Image → Container"
    },

    ecr: {
        category: "CONTAINER REGISTRY",
        symbol: "ECR",
        title: "Amazon ECR",
        description:
            "Amazon Elastic Container Registry stores the Docker image built by the deployment workflow.",
        why:
            "The EC2 application servers need a registry from which they can retrieve the application image.",
        project:
            "GitHub Actions pushes the built image to the infra-deploy-aws-app ECR repository.",
        value:
            "The application image is stored inside AWS and can be pulled during deployment.",
        flow:
            "GitHub Actions → ECR → EC2"
    },

    nginx: {
        category: "REVERSE PROXY",
        symbol: "NX",
        title: "Nginx",
        description:
            "Nginx is the public application entry point on App-1 and performs application-level active-passive routing.",
        why:
            "The browser uses port 80 while the Node.js containers listen on port 8080.",
        project:
            "Nginx sends traffic to App-1 localhost:8080 first and uses App-2 private-IP:8080 as the configured backup.",
        value:
            "If the primary Node.js application on App-1 becomes unavailable, Nginx can route application traffic to App-2.",
        flow:
            "Browser :80 → Nginx → App-1 :8080 → Backup App-2 :8080"
    },

    rds: {
        category: "MANAGED DATABASE",
        symbol: "DB",
        title: "Amazon RDS MySQL",
        description:
            "Amazon RDS provides the managed MySQL database used by the Node.js application.",
        why:
            "Application data needs persistent storage independent of the EC2 containers.",
        project:
            "RDS is private, belongs to the DB subnet group and accepts MySQL traffic from the EC2 security group on port 3306.",
        value:
            "Application compute and persistent database storage remain separate infrastructure layers.",
        flow:
            "Node.js → EC2 Security Group → RDS Security Group :3306 → MySQL"
    }
};


/* =========================================================
   04. API REQUEST HELPER
========================================================= */

async function apiRequest(url, options = {}) {

    const requestOptions = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    const response =
        await fetch(url, requestOptions);

    let payload = null;

    try {
        payload =
            await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        throw new Error(
            payload?.message ||
            `Request failed with status ${response.status}`
        );
    }

    return payload;
}


/* =========================================================
   05. MODAL HELPERS
========================================================= */

function openModal(modal) {

    if (!modal) return;

    modal.classList.remove("hidden");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal(modal) {

    if (!modal) return;

    modal.classList.add("hidden");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    const anotherModalOpen =
        $$(".modal-overlay").some(
            (item) =>
                !item.classList.contains("hidden")
        );

    if (!anotherModalOpen) {
        document.body.classList.remove(
            "modal-open"
        );
    }
}


/* =========================================================
   06. TOAST NOTIFICATIONS
========================================================= */

function showToast(
    type,
    title,
    message
) {

    const container =
        byId("toastContainer");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type === "error" ? "error" : ""}`;


    const icon =
        document.createElement("div");

    icon.className =
        "toast-icon";

    icon.textContent =
        type === "error"
            ? "!"
            : "✓";


    const copy =
        document.createElement("div");


    const heading =
        document.createElement("strong");

    heading.textContent =
        title;


    const paragraph =
        document.createElement("p");

    paragraph.textContent =
        message;


    copy.append(
        heading,
        paragraph
    );

    toast.append(
        icon,
        copy
    );

    container.appendChild(toast);


    window.setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateX(40px)";

            window.setTimeout(
                () => toast.remove(),
                350
            );

        },
        4200
    );
}


/* =========================================================
   07. SCROLL EFFECTS
========================================================= */

function updateScrollEffects() {

    const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop;

    const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const progress =
        documentHeight > 0
            ? (scrollTop / documentHeight) * 100
            : 0;


    const progressBar =
        byId("scrollProgress");

    if (progressBar) {
        progressBar.style.width =
            `${Math.min(progress, 100)}%`;
    }


    const navbar =
        byId("navbar");

    navbar?.classList.toggle(
        "scrolled",
        scrollTop > 40
    );


    ticking = false;
}


function requestScrollUpdate() {

    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(
        updateScrollEffects
    );
}


/* =========================================================
   08. REVEAL ANIMATIONS
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
                element.classList.add(
                    "revealed"
                )
        );

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

                        entry.target.classList.add(
                            "revealed"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }
                );

            },
            {
                threshold: 0.12,
                rootMargin:
                    "0px 0px -70px 0px"
            }
        );


    elements.forEach(
        (element) =>
            observer.observe(element)
    );
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
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {
        return;
    }


    let targetX =
        window.innerWidth / 2;

    let targetY =
        window.innerHeight / 2;

    let currentX =
        targetX;

    let currentY =
        targetY;


    document.addEventListener(
        "pointermove",
        (event) => {

            targetX =
                event.clientX;

            targetY =
                event.clientY;
        },
        {
            passive: true
        }
    );


    function animateGlow() {

        currentX +=
            (targetX - currentX) * 0.09;

        currentY +=
            (targetY - currentY) * 0.09;


        glow.style.left =
            `${currentX}px`;

        glow.style.top =
            `${currentY}px`;


        window.requestAnimationFrame(
            animateGlow
        );
    }


    animateGlow();
}


/* =========================================================
   10. HERO PARALLAX
========================================================= */

function initializeHeroParallax() {

    if (
        prefersReducedMotion ||
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {
        return;
    }


    const hero =
        byId("home");

    const stage =
        $(".cloud-stage");

    const words =
        $$(".hero-word");

    if (
        !hero ||
        !stage
    ) {
        return;
    }


    hero.addEventListener(
        "pointermove",
        (event) => {

            const bounds =
                hero.getBoundingClientRect();

            const normalizedX =
                (
                    event.clientX -
                    bounds.left
                ) /
                bounds.width -
                0.5;

            const normalizedY =
                (
                    event.clientY -
                    bounds.top
                ) /
                bounds.height -
                0.5;


            stage.style.transform =
                `
                perspective(1200px)
                rotateY(${normalizedX * 7}deg)
                rotateX(${normalizedY * -5}deg)
                translate3d(
                    ${normalizedX * 10}px,
                    ${normalizedY * 8}px,
                    0
                )
                `;


            words.forEach(
                (word, index) => {

                    const strength =
                        (index + 1) * 5;

                    word.style.transform =
                        `translateX(${normalizedX * strength}px)`;
                }
            );
        }
    );


    hero.addEventListener(
        "pointerleave",
        () => {

            stage.style.transform = "";

            words.forEach(
                (word) => {
                    word.style.transform = "";
                }
            );
        }
    );
}


/* =========================================================
   11. CARD DEPTH
========================================================= */

function initializeCardDepth() {

    if (
        prefersReducedMotion ||
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {
        return;
    }


    const cards =
        $$(
            ".tech-card, .project-feature"
        );


    cards.forEach(
        (card) => {

            card.addEventListener(
                "pointermove",
                (event) => {

                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        (
                            event.clientX -
                            rect.left
                        ) /
                        rect.width;

                    const y =
                        (
                            event.clientY -
                            rect.top
                        ) /
                        rect.height;


                    const rotateY =
                        (x - 0.5) * 7;

                    const rotateX =
                        (0.5 - y) * 6;


                    card.style.transform =
                        `
                        perspective(900px)
                        rotateX(${rotateX}deg)
                        rotateY(${rotateY}deg)
                        translateY(-8px)
                        `;
                }
            );


            card.addEventListener(
                "pointerleave",
                () => {
                    card.style.transform = "";
                }
            );
        }
    );
}


/* =========================================================
   12. SMOOTH INTERNAL NAVIGATION
========================================================= */

function initializeNavigation() {

    $$('a[href^="#"]').forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const href =
                        link.getAttribute("href");

                    if (
                        !href ||
                        href === "#"
                    ) {
                        return;
                    }


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
        }
    );
}


/* =========================================================
   13. ACTIVE NAVIGATION
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
   14. PIPELINE ANIMATION
========================================================= */

function initializePipelineAnimation() {

    const section =
        byId("pipeline");

    const nodes =
        $$(".pipeline-node");

    if (
        !section ||
        !nodes.length
    ) {
        return;
    }


    if (prefersReducedMotion) {

        nodes.forEach(
            (node) =>
                node.classList.add(
                    "pipeline-active"
                )
        );

        return;
    }


    let started = false;


    function startSequence() {

        if (started) return;

        started = true;

        let activeIndex = 0;


        const activateNode = () => {

            nodes.forEach(
                (node, index) => {

                    node.classList.toggle(
                        "pipeline-active",
                        index === activeIndex
                    );
                }
            );


            activeIndex =
                (activeIndex + 1) %
                nodes.length;
        };


        activateNode();


        pipelineTimer =
            window.setInterval(
                activateNode,
                900
            );
    }


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                (entries) => {

                    if (
                        entries.some(
                            (entry) =>
                                entry.isIntersecting
                        )
                    ) {

                        startSequence();

                        observer.disconnect();
                    }
                },
                {
                    threshold: 0.25
                }
            );

        observer.observe(section);

    } else {

        startSequence();
    }
}


/* =========================================================
   15. TECHNOLOGY EXPLORER
========================================================= */

function populateTechnologyModal(key) {

    const data =
        technologyData[key];

    if (!data) return;


    const mappings = {
        techModalCategory:
            data.category,

        techModalTitle:
            data.title,

        techModalSymbol:
            data.symbol,

        techModalDescription:
            data.description,

        techModalWhy:
            data.why,

        techModalProject:
            data.project,

        techModalValue:
            data.value,

        techModalFlow:
            data.flow
    };


    Object.entries(mappings).forEach(
        ([id, value]) => {

            const element =
                byId(id);

            if (element) {
                element.textContent =
                    value;
            }
        }
    );
}


function initializeTechnologyExplorer() {

    const modal =
        byId("technologyModal");

    const closeButton =
        byId("closeTechnologyModal");


    $$(".tech-card[data-tech]").forEach(
        (card) => {

            card.addEventListener(
                "click",
                () => {

                    const key =
                        card.dataset.tech;

                    populateTechnologyModal(
                        key
                    );

                    openModal(modal);
                }
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
}


/* =========================================================
   16. DATABASE VISUAL STATE
========================================================= */

function setDatabaseVisualState(
    state,
    text
) {

    const status =
        byId("databaseState");

    const statusText =
        byId("databaseStatusText");

    const badge =
        byId("databaseConnectionBadge");


    if (status) {

        status.classList.remove(
            "checking",
            "connected",
            "error"
        );

        status.classList.add(state);
    }


    if (statusText) {
        statusText.textContent =
            text;
    }


    if (badge) {

        badge.classList.remove(
            "connected",
            "error"
        );


        if (state === "connected") {

            badge.classList.add(
                "connected"
            );

            badge.innerHTML =
                "<span></span> CONNECTED";

        } else if (state === "error") {

            badge.classList.add(
                "error"
            );

            badge.innerHTML =
                "<span></span> CONNECTION FAILED";

        } else {

            badge.innerHTML =
                "<span></span> CHECKING";
        }
    }
}


/* =========================================================
   17. DATABASE RESULT MODAL
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
        success
            ? "success"
            : "error"
    );


    if (icon) {
        icon.textContent =
            success
                ? "✓"
                : "!";
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
   18. REAL DATABASE HEALTH CHECK
========================================================= */

async function checkDatabaseHealth(
    showResultModal = true
) {

    const button =
        byId("databaseHealthButton");

    const originalContent =
        button?.innerHTML;


    try {

        if (button) {

            button.disabled = true;

            button.innerHTML =
                "Testing Connection...";
        }


        setDatabaseVisualState(
            "checking",
            "CHECKING..."
        );


        const result =
            await apiRequest("/db");


        const message =
            result?.message ||
            "Connected to Amazon RDS MySQL";


        setDatabaseVisualState(
            "connected",
            "CONNECTED"
        );


        showToast(
            "success",
            "Database connected",
            message
        );


        if (showResultModal) {
            showDatabaseResult(
                true,
                message
            );
        }


        return true;

    } catch (error) {

        setDatabaseVisualState(
            "error",
            "CONNECTION FAILED"
        );


        showToast(
            "error",
            "Database check failed",
            error.message
        );


        if (showResultModal) {
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
                originalContent ||
                "Test Connection";
        }
    }
}


/* =========================================================
   19. DATABASE BUTTONS
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
        () =>
            checkDatabaseHealth(true)
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


            window.setTimeout(
                () =>
                    checkDatabaseHealth(
                        true
                    ),
                prefersReducedMotion
                    ? 0
                    : 650
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
       Do NOT automatically call /db.

       "NOT CHECKED" means exactly that.

       The website reports CONNECTED only after
       the user performs a real backend request.
    */
}


/* =========================================================
   20. USER DATA EXTRACTION
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
   21. LOAD REAL USERS
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
   22. DATE FORMATTING
========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }


    return date.toLocaleString();
}


/* =========================================================
   23. RENDER USERS SAFELY
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

        empty?.classList.remove(
            "hidden"
        );

        return;
    }


    empty?.classList.add(
        "hidden"
    );


    users.forEach(
        (user) => {

            const row =
                document.createElement(
                    "tr"
                );


            const idCell =
                document.createElement(
                    "td"
                );

            const nameCell =
                document.createElement(
                    "td"
                );

            const emailCell =
                document.createElement(
                    "td"
                );

            const dateCell =
                document.createElement(
                    "td"
                );

            const actionsCell =
                document.createElement(
                    "td"
                );


            idCell.textContent =
                `#${user.id}`;

            nameCell.textContent =
                user.name ?? "";

            emailCell.textContent =
                user.email ?? "";

            dateCell.textContent =
                formatDate(
                    user.created_at
                );


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "action-buttons";


            const editButton =
                document.createElement(
                    "button"
                );

            editButton.type =
                "button";

            editButton.className =
                "action-button edit";

            editButton.textContent =
                "Edit";

            editButton.dataset.action =
                "edit";

            editButton.dataset.id =
                String(user.id);


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "action-button delete";

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

            actionsCell.appendChild(
                actions
            );


            row.append(
                idCell,
                nameCell,
                emailCell,
                dateCell,
                actionsCell
            );


            tableBody.appendChild(row);
        }
    );
}


/* =========================================================
   24. CREATE USER
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


    if (
        !name ||
        !email
    ) {

        showToast(
            "error",
            "Missing information",
            "Enter both a name and email address."
        );

        return;
    }


    const originalContent =
        button?.innerHTML;


    try {

        if (button) {

            button.disabled = true;

            button.innerHTML =
                "Writing to RDS...";
        }


        const result =
            await apiRequest(
                "/users",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
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
                originalContent ||
                "Create User";
        }
    }
}


/* =========================================================
   25. OPEN EDIT MODAL
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


    window.setTimeout(
        () =>
            nameInput?.focus(),
        100
    );
}


/* =========================================================
   26. UPDATE USER
========================================================= */

async function updateUser(event) {

    event.preventDefault();


    const id =
        byId("editUserId")?.value;

    const name =
        byId("editName")
            ?.value
            .trim();

    const email =
        byId("editEmail")
            ?.value
            .trim();


    if (
        !id ||
        !name ||
        !email
    ) {

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

                    body:
                        JSON.stringify({
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
   27. OPEN DELETE MODAL
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
   28. DELETE USER
========================================================= */

async function deleteUser() {

    if (
        pendingDeleteId === null
    ) {
        return;
    }


    const button =
        byId("confirmDelete");

    const originalContent =
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


        pendingDeleteId =
            null;


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
                originalContent ||
                "Delete User";
        }
    }
}


/* =========================================================
   29. CRUD INITIALIZATION
========================================================= */

function initializeUserManagement() {

    const form =
        byId("userForm");

    const editForm =
        byId("editUserForm");

    const tableBody =
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


    tableBody?.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );

            if (!button) return;


            const id =
                button.dataset.id;

            const action =
                button.dataset.action;


            if (action === "edit") {
                openEditUser(id);
            }


            if (action === "delete") {
                openDeleteUser(id);
            }
        }
    );


    byId("closeEditModal")
        ?.addEventListener(
            "click",
            () =>
                closeModal(
                    editModal
                )
        );


    byId("cancelEdit")
        ?.addEventListener(
            "click",
            () =>
                closeModal(
                    editModal
                )
        );


    byId("cancelDelete")
        ?.addEventListener(
            "click",
            () => {

                pendingDeleteId =
                    null;

                closeModal(
                    deleteModal
                );
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

            if (
                event.target ===
                editModal
            ) {

                closeModal(
                    editModal
                );
            }
        }
    );


    deleteModal?.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                deleteModal
            ) {

                pendingDeleteId =
                    null;

                closeModal(
                    deleteModal
                );
            }
        }
    );
}


/* =========================================================
   30. FAILOVER LAB
========================================================= */

function initializeFailoverSimulation() {

    const demo =
        byId("failoverDemo");

    const button =
        byId("simulateFailureButton");

    const title =
        byId("failoverTitle");

    const status =
        byId("simulationStatus");

    const appOne =
        byId("failoverAppOne");

    const appTwo =
        byId("failoverAppTwo");

    const appOneState =
        byId("appOneState");

    const log =
        byId("failoverLog");

    const primaryRoute =
        $(".route-primary");

    const secondaryRoute =
        $(".route-secondary");


    if (
        !demo ||
        !button
    ) {
        return;
    }


    function renderLog(lines) {

        if (!log) return;


        log.replaceChildren();


        lines.forEach(
            (line, index) => {

                const paragraph =
                    document.createElement(
                        "p"
                    );

                const number =
                    document.createElement(
                        "span"
                    );

                number.textContent =
                    String(index + 1)
                        .padStart(
                            2,
                            "0"
                        );


                paragraph.appendChild(
                    number
                );

                paragraph.append(
                    document.createTextNode(
                        line
                    )
                );


                log.appendChild(
                    paragraph
                );
            }
        );
    }


    function renderNormalState() {

        failoverSimulationActive =
            false;


        demo.classList.remove(
            "failure-mode"
        );


        primaryRoute?.classList.add(
            "active"
        );

        secondaryRoute?.classList.remove(
            "active"
        );


        if (title) {
            title.textContent =
                "Normal operation";
        }


        if (status) {
            status.textContent =
                "NORMAL";
        }


        if (appOneState) {
            appOneState.textContent =
                "PRIMARY ACTIVE";
        }


        const appTwoState =
            appTwo?.querySelector(
                ".component-state"
            );

        if (appTwoState) {
            appTwoState.textContent =
                "BACKUP READY";
        }


        button.textContent =
            "Simulate App-1 Failure";


        renderLog([
            "Browser reaches App-1 Nginx on public port 80.",
            "Nginx sends traffic to App-1 Node.js on localhost:8080.",
            "App-2 remains ready as the configured backup upstream.",
            "The browser simulation does not modify any AWS resource."
        ]);
    }


    function renderFailureState() {

        failoverSimulationActive =
            true;


        demo.classList.add(
            "failure-mode"
        );


        primaryRoute?.classList.remove(
            "active"
        );

        secondaryRoute?.classList.add(
            "active"
        );


        if (title) {
            title.textContent =
                "Primary application unavailable";
        }


        if (status) {
            status.textContent =
                "BACKUP PATH ACTIVE";
        }


        if (appOneState) {
            appOneState.textContent =
                "SIMULATED DOWN";
        }


        const appTwoState =
            appTwo?.querySelector(
                ".component-state"
            );

        if (appTwoState) {
            appTwoState.textContent =
                "SERVING TRAFFIC";
        }


        button.textContent =
            "Restore Normal State";


        renderLog([
            "App-1 Node.js on localhost:8080 is visualized as unavailable.",
            "The primary Nginx upstream is no longer shown as serving traffic.",
            "The backup path to App-2 private-IP:8080 becomes active.",
            "The public entry remains App-1 Nginx in this application-level design.",
            "This is a browser visualization only; failover-test.yml performs the controlled real test."
        ]);
    }


    button.addEventListener(
        "click",
        () => {

            if (
                failoverSimulationActive
            ) {

                renderNormalState();


                showToast(
                    "success",
                    "Normal path restored",
                    "The visualization returned to App-1 as the primary application upstream."
                );

            } else {

                renderFailureState();


                showToast(
                    "success",
                    "Failover visualized",
                    "The diagram now shows Nginx using App-2 as the backup application upstream."
                );
            }
        }
    );


    renderNormalState();
}


/* =========================================================
   31. DATABASE VISUAL REACTION
========================================================= */

function initializeDatabaseMotion() {

    if (
        prefersReducedMotion
    ) {
        return;
    }


    const panel =
        $(".database-health-panel");

    const core =
        $(".database-core");


    if (
        !panel ||
        !core ||
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {
        return;
    }


    panel.addEventListener(
        "pointermove",
        (event) => {

            const rect =
                panel.getBoundingClientRect();

            const x =
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width -
                0.5;

            const y =
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height -
                0.5;


            core.style.transform =
                `
                translate3d(
                    ${x * 10}px,
                    ${y * 10}px,
                    0
                )
                rotateY(${x * 7}deg)
                rotateX(${y * -7}deg)
                `;
        }
    );


    panel.addEventListener(
        "pointerleave",
        () => {

            core.style.transform = "";
        }
    );
}


/* =========================================================
   32. ARCHITECTURE TRAFFIC EMPHASIS
========================================================= */

function initializeArchitectureAnimation() {

    const section =
        byId("architecture");

    if (
        !section ||
        prefersReducedMotion ||
        !("IntersectionObserver" in window)
    ) {
        return;
    }


    const paths =
        $$(".traffic-path", section);


    const observer =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        paths.forEach(
                            (path, index) => {

                                window.setTimeout(
                                    () => {

                                        path.style.filter =
                                            "drop-shadow(0 0 7px currentColor)";

                                        window.setTimeout(
                                            () => {

                                                path.style.filter =
                                                    "";
                                            },
                                            900
                                        );

                                    },
                                    index * 350
                                );
                            }
                        );


                        observer.disconnect();
                    }
                );

            },
            {
                threshold: 0.25
            }
        );


    observer.observe(section);
}


/* =========================================================
   33. KEYBOARD CONTROLS
========================================================= */

function initializeKeyboardControls() {

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            [
                "technologyModal",
                "databaseModal",
                "editModal",
                "deleteModal"
            ].forEach(
                (id) =>
                    closeModal(
                        byId(id)
                    )
            );


            pendingDeleteId =
                null;
        }
    );
}


/* =========================================================
   34. VISIBILITY CLEANUP
========================================================= */

function initializeVisibilityHandling() {

    document.addEventListener(
        "visibilitychange",
        () => {

            /*
               Browsers already throttle animations in
               background tabs. This hook is intentionally
               lightweight and reserved for future animation
               cleanup if the experience grows.
            */

            if (
                document.visibilityState ===
                "visible"
            ) {
                updateScrollEffects();
            }
        }
    );
}


/* =========================================================
   35. START APPLICATION
========================================================= */

async function initializeApplication() {

    updateScrollEffects();


    window.addEventListener(
        "scroll",
        requestScrollUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        requestScrollUpdate,
        {
            passive: true
        }
    );


    initializeRevealAnimations();

    initializeMouseGlow();

    initializeHeroParallax();

    initializeCardDepth();

    initializeNavigation();

    initializeActiveNavigation();

    initializePipelineAnimation();

    initializeTechnologyExplorer();

    initializeDatabaseHealth();

    initializeDatabaseMotion();

    initializeUserManagement();

    initializeFailoverSimulation();

    initializeArchitectureAnimation();

    initializeKeyboardControls();

    initializeVisibilityHandling();


    /*
       Load the actual users table from the API.

       This DOES NOT mark the /db health check as
       CONNECTED.

       Database health remains NOT CHECKED until
       the user explicitly presses the database
       connection button.
    */

    await loadUsers();
}


/* =========================================================
   36. BOOT
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication
    );

} else {

    initializeApplication();
}