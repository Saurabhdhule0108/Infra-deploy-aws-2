"use strict";

/* ============================================================
   INFRADEPLOY AWS
   script.js

   Handles:
   - Header scroll effect
   - Scroll reveal animations
   - Hero entrance animation
   - Cursor glow
   - Technology information modal
   - Real /db connection check
   - Notifications
   - Keyboard accessibility
============================================================ */


/* ============================================================
   01. DOM ELEMENTS
============================================================ */

const siteHeader = document.getElementById("siteHeader");
const cursorGlow = document.getElementById("cursorGlow");

const revealElements = document.querySelectorAll(".reveal");
const revealTextElements = document.querySelectorAll(".reveal-text");

const technologyButtons = document.querySelectorAll(".technology-row");

const technologyModal = document.getElementById("technologyModal");
const modalTitle = document.getElementById("modalTitle");
const modalLabel = document.getElementById("modalLabel");
const modalDescription = document.getElementById("modalDescription");
const modalRole = document.getElementById("modalRole");
const modalReason = document.getElementById("modalReason");

const modalCloseElements = document.querySelectorAll("[data-close-modal]");

const checkDatabaseButton =
  document.getElementById("checkDatabaseButton");

const databaseResult =
  document.getElementById("databaseResult");

const notification =
  document.getElementById("notification");

const notificationLabel =
  document.getElementById("notificationLabel");

const notificationMessage =
  document.getElementById("notificationMessage");


/* ============================================================
   02. HEADER SCROLL EFFECT
============================================================ */

function updateHeader() {
  if (!siteHeader) {
    return;
  }

  if (window.scrollY > 40) {
    siteHeader.classList.add("scrolled");
  } else {
    siteHeader.classList.remove("scrolled");
  }
}


window.addEventListener(
  "scroll",
  updateHeader,
  { passive: true }
);

updateHeader();


/* ============================================================
   03. HERO ENTRANCE
============================================================ */

window.addEventListener("DOMContentLoaded", () => {

  const heroRevealElements =
    document.querySelectorAll("#home .reveal");

  const heroTextElements =
    document.querySelectorAll("#home .reveal-text");


  setTimeout(() => {

    heroRevealElements.forEach((element, index) => {

      setTimeout(() => {
        element.classList.add("visible");
      }, index * 120);

    });

  }, 100);


  setTimeout(() => {

    heroTextElements.forEach((element, index) => {

      setTimeout(() => {
        element.classList.add("visible");
      }, index * 130);

    });

  }, 220);

});


/* ============================================================
   04. SCROLL REVEAL
============================================================ */

const revealObserver = new IntersectionObserver(
  (entries, observer) => {

    entries.forEach((entry) => {

      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("visible");

      observer.unobserve(entry.target);

    });

  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -60px 0px"
  }
);


revealElements.forEach((element) => {

  /*
     Hero elements are handled separately so the opening
     animation feels intentional.
  */

  if (!element.closest("#home")) {
    revealObserver.observe(element);
  }

});


revealTextElements.forEach((element) => {

  if (!element.closest("#home")) {
    revealObserver.observe(element);
  }

});


/* ============================================================
   05. CURSOR GLOW
============================================================ */

const supportsHover =
  window.matchMedia("(hover: hover)").matches;


if (supportsHover && cursorGlow) {

  let mouseX = 0;
  let mouseY = 0;

  let glowX = 0;
  let glowY = 0;


  window.addEventListener(
    "mousemove",
    (event) => {

      mouseX = event.clientX;
      mouseY = event.clientY;

      cursorGlow.style.opacity = "1";

    },
    { passive: true }
  );


  document.addEventListener("mouseleave", () => {
    cursorGlow.style.opacity = "0";
  });


  document.addEventListener("mouseenter", () => {
    cursorGlow.style.opacity = "1";
  });


  function animateGlow() {

    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;

    cursorGlow.style.transform =
      `translate(${glowX - 180}px, ${glowY - 180}px)`;

    requestAnimationFrame(animateGlow);

  }


  requestAnimationFrame(animateGlow);

}


/* ============================================================
   06. TECHNOLOGY INFORMATION

   These descriptions explain how each technology is used
   specifically inside this project.
============================================================ */

const technologyInformation = {

  terraform: {

    label: "INFRASTRUCTURE AS CODE",

    title: "Terraform",

    description:
      "Terraform defines and manages the AWS infrastructure as code. " +
      "In this project it creates resources such as the VPC, subnets, " +
      "route configuration, security groups, EC2 instances, Amazon ECR " +
      "and Amazon RDS. Terraform state is stored remotely in Amazon S3 " +
      "with S3 state locking enabled.",

    role:
      "Creates and manages AWS infrastructure.",

    reason:
      "Repeatable infrastructure, version-controlled configuration and automated deployments."

  },


  github: {

    label: "CI / CD AUTOMATION",

    title: "GitHub Actions",

    description:
      "GitHub Actions is the CI/CD automation platform used by this project. " +
      "The normal deployment workflow authenticates to AWS, runs Terraform, " +
      "builds the Docker image, pushes it to Amazon ECR and deploys the " +
      "application to both EC2 application servers.",

    role:
      "Automates infrastructure and application deployment.",

    reason:
      "A Git push can trigger a repeatable deployment process without performing each step manually."

  },


  oidc: {

    label: "SECURE AWS AUTHENTICATION",

    title: "OIDC + IAM",

    description:
      "GitHub Actions authenticates to AWS through OpenID Connect. " +
      "GitHub provides an OIDC token, AWS STS validates the trusted identity " +
      "and conditions on the IAM role, and temporary AWS credentials are " +
      "issued for the workflow. This avoids storing long-lived AWS access " +
      "keys in the GitHub repository.",

    role:
      "Allows GitHub Actions to assume the AWS IAM role.",

    reason:
      "Temporary credentials are safer than storing permanent AWS access keys in CI/CD secrets."

  },


  docker: {

    label: "CONTAINERIZATION",

    title: "Docker",

    description:
      "The Node.js and Express application is packaged as a Docker image. " +
      "The same image is deployed to App-1 and App-2, giving both application " +
      "servers a consistent runtime environment and application version.",

    role:
      "Packages and runs the Node.js application.",

    reason:
      "Provides a consistent application environment across both EC2 servers."

  },


  ecr: {

    label: "CONTAINER REGISTRY",

    title: "Amazon ECR",

    description:
      "Amazon Elastic Container Registry stores the Docker image built by " +
      "GitHub Actions. During deployment, the image is pushed to ECR and " +
      "then pulled onto both EC2 application servers before the containers run.",

    role:
      "Stores the project's Docker images.",

    reason:
      "Provides an AWS-integrated private container registry for the deployment pipeline."

  },


  ec2: {

    label: "APPLICATION COMPUTE",

    title: "Amazon EC2",

    description:
      "Two EC2 instances run the same Dockerized Node.js application. " +
      "App-1 is located in the public subnet in ap-south-1a and App-2 is " +
      "located in another public subnet in ap-south-1b. App-2 acts as the " +
      "backup application target for the Nginx configuration on App-1.",

    role:
      "Runs the containerized application.",

    reason:
      "Provides compute capacity while allowing the project to demonstrate application-level failover across two Availability Zones."

  },


  nginx: {

    label: "REVERSE PROXY + FAILOVER",

    title: "Nginx",

    description:
      "Nginx runs on App-1 and listens for public HTTP traffic on port 80. " +
      "Its primary upstream is the local App-1 Node.js container on " +
      "127.0.0.1:8080. App-2 is configured as the backup upstream using " +
      "its private VPC address on port 8080.",

    role:
      "Public reverse proxy and application-level failover controller.",

    reason:
      "Routes normal traffic to App-1 and can use App-2 when the primary application process becomes unavailable."

  },


  rds: {

    label: "PRIVATE DATABASE",

    title: "RDS + MySQL",

    description:
      "Amazon RDS provides the managed MySQL database for the application. " +
      "The DB subnet group contains private subnets in ap-south-1a and " +
      "ap-south-1b. The current database deployment is Single-AZ. " +
      "The RDS security group allows MySQL traffic on port 3306 from the " +
      "EC2 application security group.",

    role:
      "Stores persistent application data.",

    reason:
      "Uses a managed relational database while keeping direct public database access disabled."

  },


  networking: {

    label: "AWS NETWORKING",

    title: "VPC + Networking",

    description:
      "The project uses a custom VPC with CIDR 10.0.0.0/16. " +
      "App-1 uses public subnet 10.0.1.0/24 in ap-south-1a and App-2 " +
      "uses public subnet 10.0.4.0/24 in ap-south-1b. The RDS subnet " +
      "group uses private subnets 10.0.2.0/24 and 10.0.3.0/24. " +
      "Security groups control communication between the application " +
      "and database layers.",

    role:
      "Provides network isolation and controlled communication.",

    reason:
      "Separates public application resources from the private database layer and controls traffic with security groups."

  }

};


/* ============================================================
   07. OPEN TECHNOLOGY MODAL
============================================================ */

function openTechnologyModal(technologyKey) {

  const technology =
    technologyInformation[technologyKey];


  if (!technology || !technologyModal) {
    return;
  }


  modalLabel.textContent =
    technology.label;

  modalTitle.textContent =
    technology.title;

  modalDescription.textContent =
    technology.description;

  modalRole.textContent =
    technology.role;

  modalReason.textContent =
    technology.reason;


  technologyModal.classList.add("active");

  technologyModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add("modal-open");


  const closeButton =
    technologyModal.querySelector(".modal-close");

  if (closeButton) {
    closeButton.focus();
  }

}


/* ============================================================
   08. CLOSE TECHNOLOGY MODAL
============================================================ */

function closeTechnologyModal() {

  if (!technologyModal) {
    return;
  }


  technologyModal.classList.remove("active");

  technologyModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove("modal-open");

}


/* ============================================================
   09. TECHNOLOGY BUTTON EVENTS
============================================================ */

technologyButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const technologyKey =
      button.dataset.tech;

    openTechnologyModal(technologyKey);

  });

});


modalCloseElements.forEach((element) => {

  element.addEventListener(
    "click",
    closeTechnologyModal
  );

});


document.addEventListener("keydown", (event) => {

  if (
    event.key === "Escape" &&
    technologyModal &&
    technologyModal.classList.contains("active")
  ) {

    closeTechnologyModal();

  }

});


/* ============================================================
   10. NOTIFICATION SYSTEM
============================================================ */

let notificationTimer;


function showNotification(
  message,
  type = "success",
  label = "DATABASE"
) {

  if (!notification) {
    return;
  }


  clearTimeout(notificationTimer);


  notification.classList.remove(
    "success",
    "error"
  );


  notification.classList.add(type);


  if (notificationLabel) {
    notificationLabel.textContent = label;
  }


  if (notificationMessage) {
    notificationMessage.textContent = message;
  }


  notification.classList.add("show");


  notificationTimer = setTimeout(() => {

    notification.classList.remove("show");

  }, 4500);

}


/* ============================================================
   11. DATABASE RESULT DISPLAY
============================================================ */

function setDatabaseStatus(
  state,
  message
) {

  if (!databaseResult) {
    return;
  }


  const indicator =
    databaseResult.querySelector(
      ".result-indicator"
    );


  const text =
    databaseResult.querySelector(
      "strong"
    );


  if (indicator) {

    indicator.classList.remove(
      "idle",
      "loading",
      "success",
      "error"
    );

    indicator.classList.add(state);

  }


  if (text) {
    text.textContent = message;
  }

}


/* ============================================================
   12. EXTRACT A SAFE MESSAGE FROM /db RESPONSE

   We do not display credentials, hostnames or internal secrets.
============================================================ */

function getDatabaseSuccessMessage(data) {

  if (!data) {
    return "Database connection successful";
  }


  /*
     If the existing backend provides a simple message/status,
     we can use it.

     We intentionally do NOT dump the entire response into the
     browser because the backend response may later contain
     information that should not be displayed.
  */

  const possibleMessage =
    data.message ||
    data.status;


  if (
    typeof possibleMessage === "string" &&
    possibleMessage.trim().length > 0 &&
    possibleMessage.length <= 120
  ) {

    return possibleMessage;

  }


  return "Database connection successful";

}


/* ============================================================
   13. REAL DATABASE CONNECTION CHECK

   IMPORTANT:
   This calls the existing Express /db endpoint.

   Nothing here creates a fake "connected" status.
============================================================ */

async function checkDatabaseConnection() {

  if (!checkDatabaseButton) {
    return;
  }


  const originalButtonHTML =
    checkDatabaseButton.innerHTML;


  checkDatabaseButton.disabled = true;

  checkDatabaseButton.innerHTML = `
    <span>CHECKING...</span>
    <span class="button-arrow">↗</span>
  `;


  setDatabaseStatus(
    "loading",
    "Checking database connection..."
  );


  try {

    const controller =
      new AbortController();


    const timeoutId =
      setTimeout(() => {

        controller.abort();

      }, 10000);


    const response =
      await fetch("/db", {

        method: "GET",

        headers: {
          "Accept": "application/json"
        },

        cache: "no-store",

        signal: controller.signal

      });


    clearTimeout(timeoutId);


    /*
       First read the response as text.

       This is more defensive than calling response.json()
       immediately because the backend might return plain text,
       JSON, or an HTML error page.
    */

    const responseText =
      await response.text();


    let responseData = null;


    if (responseText) {

      try {

        responseData =
          JSON.parse(responseText);

      } catch {

        responseData = {
          message: responseText
        };

      }

    }


    if (!response.ok) {

      throw new Error(
        `Database endpoint returned HTTP ${response.status}`
      );

    }


    const successMessage =
      getDatabaseSuccessMessage(responseData);


    setDatabaseStatus(
      "success",
      successMessage
    );


    showNotification(
      successMessage,
      "success",
      "DATABASE CONNECTED"
    );


  } catch (error) {

    console.error(
      "Database connection check failed:",
      error
    );


    let errorMessage =
      "Database connection check failed";


    if (error.name === "AbortError") {

      errorMessage =
        "Database check timed out";

    }


    setDatabaseStatus(
      "error",
      errorMessage
    );


    showNotification(
      errorMessage,
      "error",
      "DATABASE ERROR"
    );


  } finally {

    checkDatabaseButton.disabled = false;

    checkDatabaseButton.innerHTML =
      originalButtonHTML;

  }

}


if (checkDatabaseButton) {

  checkDatabaseButton.addEventListener(
    "click",
    checkDatabaseConnection
  );

}


/* ============================================================
   14. SMOOTH INTERNAL NAVIGATION
============================================================ */

const internalLinks =
  document.querySelectorAll(
    'a[href^="#"]'
  );


internalLinks.forEach((link) => {

  link.addEventListener(
    "click",
    (event) => {

      const targetId =
        link.getAttribute("href");


      if (
        !targetId ||
        targetId === "#"
      ) {
        return;
      }


      const target =
        document.querySelector(targetId);


      if (!target) {
        return;
      }


      event.preventDefault();


      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }
  );

});


/* ============================================================
   15. SUBTLE HERO PARALLAX

   Desktop only.
============================================================ */

const heroOrbit =
  document.querySelector(".hero-orbit");


if (
  heroOrbit &&
  supportsHover &&
  !window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
) {

  window.addEventListener(
    "scroll",
    () => {

      const scrollPosition =
        window.scrollY;


      /*
         Only animate while the hero is nearby.
         This avoids unnecessary work later on the page.
      */

      if (scrollPosition < window.innerHeight * 1.3) {

        const movement =
          scrollPosition * 0.08;


        heroOrbit.style.marginTop =
          `${movement}px`;

      }

    },
    { passive: true }
  );

}


/* ============================================================
   16. ACTIVE NAVIGATION SECTION

   Highlights the navigation item for the section currently
   visible on screen.
============================================================ */

const navigationLinks =
  document.querySelectorAll(
    ".desktop-nav a"
  );


const navigationSections =
  document.querySelectorAll(
    "#infrastructure, " +
    "#pipeline, " +
    "#architecture, " +
    "#database, " +
    "#failover, " +
    "#technologies"
  );


const navigationObserver =
  new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) {
          return;
        }


        const currentId =
          entry.target.id;


        navigationLinks.forEach(
          (link) => {

            const linkTarget =
              link
                .getAttribute("href")
                .replace("#", "");


            if (linkTarget === currentId) {

              link.style.color =
                "var(--white)";

            } else {

              link.style.color = "";

            }

          }
        );

      });

    },

    {
      rootMargin:
        "-35% 0px -55% 0px",

      threshold: 0
    }

  );


navigationSections.forEach(
  (section) => {

    navigationObserver.observe(section);

  }
);


/* ============================================================
   17. VISIBILITY PERFORMANCE

   Pause some decorative motion when the browser tab is hidden.
============================================================ */

document.addEventListener(
  "visibilitychange",
  () => {

    if (document.hidden) {

      document.documentElement.classList.add(
        "page-hidden"
      );

    } else {

      document.documentElement.classList.remove(
        "page-hidden"
      );

    }

  }
);


/* ============================================================
   18. INITIALIZATION MESSAGE

   Only visible in browser developer console.
============================================================ */

console.log(
  "%cInfraDeploy AWS",
  "color:#00D6C9;font-size:20px;font-weight:bold;"
);

console.log(
  "Frontend initialized successfully."
);