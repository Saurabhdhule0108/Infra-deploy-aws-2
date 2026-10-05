# ☁️ Infra Deploy AWS

<div align="center">

## 🚀 Automated AWS Infrastructure, CI/CD & Application Resilience

**Terraform • GitHub Actions • AWS • Docker • ECR • EC2 • RDS • Nginx**

<br>

![Terraform](https://img.shields.io/badge/Terraform-Infrastructure_as_Code-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Cloud_Infrastructure-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerization-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Application-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-RDS_Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Active--Passive-009639?style=for-the-badge&logo=nginx&logoColor=white)

<br>

### Infrastructure as Code • Secure OIDC Authentication • Automated Deployment • Private Database • Active-Passive Failover

</div>

---

# ✨ Project Overview

**Infra-deploy-aws-2** is an end-to-end AWS infrastructure and CI/CD project that automates the provisioning, deployment, database connectivity, and resilience testing of a containerized Node.js application.

The project uses **Terraform** to provision AWS infrastructure and **GitHub Actions** to automate deployment.

GitHub Actions securely authenticates with AWS using **GitHub OIDC, IAM, and AWS STS**, eliminating the need to store long-lived AWS access keys.

The application is packaged using **Docker**, stored in **Amazon ECR**, and deployed to **two EC2 application servers located in different Availability Zones**.

A private **Amazon RDS MySQL** database provides persistent application data, while **Nginx** implements an active-passive application routing mechanism between the two application servers.

A separate automated failover workflow verifies that the application continues operating through the backup server if the primary application container becomes unavailable.

---

# 🎯 What This Project Includes

| Area | Implementation |
|---|---|
| ☁️ Cloud | AWS |
| 🏗️ Infrastructure as Code | Terraform |
| 🌐 Networking | VPC + Public & Private Subnets |
| 🌍 Availability Zones | `ap-south-1a` + `ap-south-1b` |
| 🖥️ Application Servers | 2 × EC2 |
| 🐳 Containerization | Docker |
| 📦 Container Registry | Amazon ECR |
| 🗄️ Database | Amazon RDS MySQL |
| 🔀 Reverse Proxy | Nginx |
| 🛡️ Resilience | Active-Passive Application Failover |
| ⚙️ CI/CD | GitHub Actions |
| 🔐 Authentication | GitHub OIDC + IAM + AWS STS |
| 💾 Terraform State | Amazon S3 Remote Backend |
| 🔄 Resource Automation | EC2 + RDS Lifecycle Handling |
| 🧪 Testing | Automated Deployment & Failover Verification |

---

# 🏗️ Architecture Overview

```text
                              ┌──────────────────────┐
                              │      DEVELOPER       │
                              └──────────┬───────────┘
                                         │
                                      git push
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │        GitHub        │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │    GitHub Actions    │
                              │        CI/CD         │
                              └─────┬──────────┬─────┘
                                    │          │
                                  OIDC       Docker
                                    │          │
                                    ▼          ▼
                              ┌───────────┐ ┌───────────┐
                              │ AWS STS   │ │Amazon ECR │
                              └─────┬─────┘ └─────┬─────┘
                                    │             │
                                    └──────┬──────┘
                                           │
                                           ▼
┌────────────────────────────────── AWS VPC ──────────────────────────────────┐
│                                                                            │
│   ┌────────────────────────┐          ┌────────────────────────┐            │
│   │ PUBLIC SUBNET          │          │ PUBLIC SUBNET          │            │
│   │ ap-south-1a            │          │ ap-south-1b            │            │
│   │                        │          │                        │            │
│   │  ┌──────────────────┐  │          │  ┌──────────────────┐  │            │
│   │  │ EC2 APP-1        │  │          │  │ EC2 APP-2        │  │            │
│   │  │                  │  │          │  │                  │  │            │
│   │  │ Nginx :80        │──┼─────────►│  │ Node.js :8080    │  │            │
│   │  │       ↓          │  │ Private  │  │                  │  │            │
│   │  │ Node.js :8080    │  │ Network  │  │ BACKUP           │  │            │
│   │  │ PRIMARY          │  │          │  └────────┬─────────┘  │            │
│   │  └────────┬─────────┘  │          └───────────┼────────────┘            │
│   └───────────┼────────────┘                      │                         │
│               │                                   │                         │
│               └────────────────┬──────────────────┘                         │
│                                │ TCP 3306                                   │
│                                ▼                                            │
│                 ┌──────────────────────────────┐                            │
│                 │      PRIVATE DB LAYER        │                            │
│                 │                              │                            │
│                 │ Private Subnet - AZ 1        │                            │
│                 │ Private Subnet - AZ 2        │                            │
│                 │             │                │                            │
│                 │             ▼                │                            │
│                 │        Amazon RDS            │                            │
│                 │          MySQL               │                            │
│                 │                              │                            │
│                 │   Public Access: DISABLED    │                            │
│                 └──────────────────────────────┘                            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

# 🌐 AWS Network Design

The project uses a custom VPC:

```text
10.0.0.0/16
```

Resources are distributed across **two AWS Availability Zones**.

| Subnet | CIDR | Availability Zone | Purpose |
|---|---|---|---|
| Public Subnet 1 | `10.0.1.0/24` | `ap-south-1a` | EC2 App-1 |
| Public Subnet 2 | `10.0.4.0/24` | `ap-south-1b` | EC2 App-2 |
| Private DB Subnet 1 | `10.0.2.0/24` | `ap-south-1a` | RDS DB Subnet Group |
| Private DB Subnet 2 | `10.0.3.0/24` | `ap-south-1b` | RDS DB Subnet Group |

The public subnets use an **Internet Gateway and public route table** for internet connectivity.

The database subnets remain private.

> **Important:** A NAT Gateway is not required for normal EC2 → RDS communication because both resources communicate privately inside the same VPC.

---

# 🖥️ Application Layer

Two EC2 instances host the application.

### 🟢 App-1 — Primary

```text
Availability Zone: ap-south-1a
Role: Primary Application Server
Node.js: Port 8080
Nginx: Port 80
```

### 🟡 App-2 — Backup

```text
Availability Zone: ap-south-1b
Role: Backup Application Server
Node.js: Port 8080
```

Both servers run the **same Docker image** from Amazon ECR.

This keeps the runtime environment consistent across both application servers.

---

# 🔀 Nginx Active-Passive Routing

App-1 acts as the current public entry point.

Nginx runs on App-1 and listens on port:

```text
80
```

The Node.js containers listen on:

```text
8080
```

### Normal Traffic

```text
                 USER
                   │
                   ▼
            App-1 Public IP
                   │
                 :80
                   │
                   ▼
                NGINX
                   │
                   ▼
          🟢 PRIMARY BACKEND
             App-1 :8080
                   │
                   ▼
               RDS MySQL
```

### Application Failover

```text
                 USER
                   │
                   ▼
            App-1 Public IP
                   │
                   ▼
                NGINX
                   │
          Primary unavailable
                   │
                   ▼
          🟡 BACKUP BACKEND
        App-2 Private IP :8080
                   │
                   ▼
               RDS MySQL
```

Nginx therefore provides **application-level active-passive routing**.

App-2 does not need to be accessed through its public IP for failover. Nginx communicates with App-2 using its **private VPC IP address**.

---

# 🗄️ Private RDS MySQL Database

The application uses **Amazon RDS MySQL** for persistent data.

```text
       App-1                     App-2
          │                         │
          │                         │
          └───────────┬─────────────┘
                      │
                  TCP :3306
                      │
                      ▼
              RDS Security Group
                      │
                      ▼
                Amazon RDS
                   MySQL
                      │
               Private Subnets
```

### Database Design

- 🔒 RDS is deployed inside private subnets
- 🚫 Public access is disabled
- 🔐 MySQL access is controlled using security groups
- 🖥️ Both application servers can connect to the database
- 💾 Database storage is encrypted
- 🌍 DB subnet group contains private subnets from two AZs
- 🔌 MySQL communication uses port `3306`

The application provides database functionality through endpoints such as:

```text
/db
/users
```

---

# 🐳 Docker & Amazon ECR

The Node.js application is packaged as a Docker image.

```text
          Node.js Application
                   │
                   ▼
             Docker Build
                   │
                   ▼
              Docker Image
                   │
                   ▼
              Amazon ECR
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
       App-1              App-2
          │                 │
          ▼                 ▼
       Docker              Docker
          │                 │
          └──── Same ───────┘
               Image
```

GitHub Actions builds the image once, pushes it to ECR, and deploys the same image to both EC2 instances.

Containers use:

```text
--restart unless-stopped
```

to provide container restart behavior when appropriate.

---

# 🔐 Secure AWS Authentication — GitHub OIDC

The project does **not use long-lived AWS access keys for GitHub Actions authentication**.

Instead:

```text
GitHub Actions
      │
      │ OIDC Token
      ▼
AWS OIDC Identity Provider
      │
      ▼
IAM Role Trust Policy
      │
      ▼
AWS STS
      │
      │ Temporary Credentials
      ▼
AWS Resources
```

### How It Works

1. GitHub Actions requests an OIDC token.
2. GitHub specifies the AWS IAM role it wants to assume.
3. AWS STS validates the token against the IAM role trust policy.
4. If the conditions match, STS allows the workflow to assume the role.
5. Temporary AWS credentials are issued.
6. GitHub Actions uses those credentials to interact with AWS.

This avoids storing permanent AWS access keys inside GitHub.

---

# ⚙️ Automated CI/CD Pipeline

The main deployment workflow is:

```text
.github/workflows/deploy.yml
```

A push to the `main` branch automatically starts the pipeline.

```text
                         GIT PUSH
                            │
                            ▼
                     GitHub Actions
                            │
                            ▼
                       OIDC Token
                            │
                            ▼
                      IAM Role / STS
                            │
                            ▼
                    Terraform Init
                            │
                            ▼
                  Terraform Validate
                            │
                            ▼
                    Terraform Plan
                            │
                            ▼
                    Terraform Apply
                            │
                            ▼
                 Read Terraform Outputs
                            │
                            ▼
                     Check RDS State
                            │
               ┌────────────┴────────────┐
               │                         │
           AVAILABLE                  STOPPED
               │                         │
               │                     Start RDS
               │                         │
               └────────────┬────────────┘
                            ▼
                  Wait for RDS Available
                            │
                            ▼
                   Start EC2 Instances
                            │
                            ▼
                  Wait for EC2 Running
                            │
                            ▼
                Discover Current EC2 IPs
                            │
                            ▼
                     Docker Build
                            │
                            ▼
                     Push to ECR
                            │
                            ▼
                 Deploy Image to App-1
                            +
                 Deploy Image to App-2
                            │
                            ▼
                  Verify Both Containers
                            │
                            ▼
                   Configure Nginx
                            │
                            ▼
                 Verify Public Website
                            │
                            ▼
                    Verify Database
                            │
                            ▼
                  ✅ DEPLOYMENT PASSED
                            │
                            ▼
                    Stop Both EC2s
```

---

# 🔄 Automated Resource Lifecycle

The workflows can work with resources that have been stopped to reduce unnecessary lab runtime.

## RDS Lifecycle

```text
                 CHECK RDS
                    │
      ┌─────────────┼──────────────┐
      ▼             ▼              ▼
 AVAILABLE       STOPPED        STOPPING
      │             │              │
      │          Start RDS       Wait
      │             │              │
      │             │           Start RDS
      └─────────────┴──────┬───────┘
                           │
                           ▼
                    Wait Until
                     AVAILABLE
```

The workflow therefore does not require RDS to be manually started before deployment or failover testing.

## EC2 Lifecycle

The workflows also:

```text
Check EC2 State
       │
       ▼
Start if Required
       │
       ▼
Wait Until Running
       │
       ▼
Discover Fresh Public IP
       │
       ▼
Continue Deployment
```

Because EC2 public IP addresses can change after stop/start, the workflow dynamically retrieves the **current public IP addresses**.

No Elastic IP is required for this lab design.

---

# 🧪 Automated Failover Test

A separate workflow is used for resilience testing:

```text
.github/workflows/failover-test.yml
```

It is manually triggered using:

```text
workflow_dispatch
```

This keeps **normal deployment** and **failure testing** separate.

### Failover Test

```text
                START TEST
                    │
                    ▼
           Ensure RDS Available
                    │
                    ▼
           Start App-1 + App-2
                    │
                    ▼
         Verify Application Servers
                    │
                    ▼
              Verify Nginx
                    │
                    ▼
          ┌────────────────────┐
          │      PHASE 1       │
          │ Normal Operation   │
          │ App-1 Healthy  ✅  │
          └─────────┬──────────┘
                    │
                    ▼
          ┌────────────────────┐
          │      PHASE 2       │
          │ Stop App-1 Node.js │
          │ Container      ❌  │
          └─────────┬──────────┘
                    │
                    ▼
          Confirm App-1 :8080
                is DOWN
                    │
                    ▼
          ┌────────────────────┐
          │      PHASE 3       │
          │ Nginx Failover     │
          │ App-2          ✅  │
          └─────────┬──────────┘
                    │
                    ▼
            Same Public URL
                 Works
                    │
                    ▼
             /db Works  ✅
                    │
                    ▼
          ┌────────────────────┐
          │      PHASE 4       │
          │ Restore App-1      │
          └─────────┬──────────┘
                    │
                    ▼
             Verify Recovery
                    │
                    ▼
             🟢 TEST PASSED
```

The test proves:

```text
App-1 Node.js fails
        ↓
Nginx detects primary failure
        ↓
Nginx routes to App-2
        ↓
App-2 serves the application
        ↓
App-2 connects to RDS
        ↓
App-1 is restored
        ↓
Application recovers
```

---

# 🔒 Security Design

| Security Area | Implementation |
|---|---|
| 🔐 AWS Authentication | GitHub OIDC |
| ⏱️ AWS Credentials | Temporary STS credentials |
| 🗄️ Database | Private RDS |
| 🔌 Database Access | EC2 SG → RDS SG on `3306` |
| 🔑 DB Password | GitHub Secret |
| 💾 Terraform State | Remote Amazon S3 backend |
| 🔀 App-1 → App-2 | Private VPC networking |
| 💽 RDS Storage | Encryption enabled |
| 🚫 RDS Public Access | Disabled |

> [!NOTE]
> SSH is currently exposed for the GitHub-hosted deployment workflow because GitHub-hosted runners connect to the EC2 instances using SSH.
>
> A production architecture should avoid broadly exposed SSH and use a more secure management/deployment mechanism such as AWS Systems Manager or private runners.

---

# 💾 Terraform Remote State

Terraform state is stored remotely in **Amazon S3** instead of only on the local machine.

```text
Terraform
    │
    ▼
Amazon S3
    │
    ├── terraform.tfstate
    │
    └── State Lock
```

The backend provides:

- Centralized Terraform state
- State persistence
- State locking
- Safer automated CI/CD execution
- Protection against simultaneous Terraform state modifications

---

# 📂 Project Structure

```text
Infra-deploy-aws-2/
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── failover-test.yml
│
├── terraform/
│   ├── main.tf
│   ├── rds.tf
│   ├── variables.tf
│   └── .terraform.lock.hcl
│
├── nodeapp/
│   ├── public/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   │
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
│
├── .gitignore
└── README.md
```

---

# 🔑 GitHub Variables & Secrets

## Repository Variables

```text
AWS_AMI_ID
AWS_KEY_NAME
AWS_ROLE_ARN
```

## Repository Secrets

```text
DB_PASSWORD
EC2_SSH_PRIVATE_KEY
```

Sensitive credentials are not hardcoded directly into the repository.

---

# ▶️ Running the Project

### Push a Change

```bash
git status
git add .
git commit -m "Update project documentation"
git push origin main
```

A push to `main` automatically triggers:

```text
deploy.yml
```

### Run a Failover Test

From GitHub:

```text
Actions
   ↓
Active-Passive Failover Test
   ↓
Run workflow
```

The separate failover workflow verifies application resilience and leaves the environment available for inspection after the test.

---

# 📊 Skills Demonstrated

<div align="center">

| ☁️ AWS & Networking | ⚙️ DevOps & Automation | 🛡️ Reliability & Security |
|---|---|---|
| VPC | Terraform | Active-Passive Routing |
| Public Subnets | GitHub Actions | Failover Testing |
| Private Subnets | Docker | Health Verification |
| EC2 | Amazon ECR | GitHub OIDC |
| RDS MySQL | Terraform Remote State | AWS STS |
| Security Groups | Resource Lifecycle | Private Database |
| Internet Gateway | CI/CD | Multi-AZ App Placement |

</div>

### End-to-End Knowledge

```text
Source Code
    ↓
Version Control
    ↓
CI/CD
    ↓
Secure Authentication
    ↓
Infrastructure as Code
    ↓
AWS Networking
    ↓
Containerization
    ↓
Application Deployment
    ↓
Private Database
    ↓
Reverse Proxy
    ↓
Failover
    ↓
Automated Verification
```

---

# ⚠️ Current Architecture Boundary

> [!IMPORTANT]
> This project demonstrates **application-level active-passive failover**.
>
> It should not be described as complete infrastructure-level high availability.

Nginx currently runs on **App-1**, and App-1 is also the public entry point.

### If App-1's Node.js Container Fails

```text
               Nginx
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
 App-1 Node.js         App-2 Node.js
      ❌                    ✅
                             
                    FAILOVER WORKS
```

### If the Entire App-1 EC2 Instance Fails

```text
Internet
   │
   ▼
App-1 EC2
   │
 Nginx
   │
   ❌
```

The public entry point is also lost.

Documenting this limitation demonstrates the difference between **application-level failover** and **infrastructure-level high availability**.

---

# 🚀 Production Evolution

A production-oriented architecture could evolve toward:

```text
                           INTERNET
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Application         │
                   │ Load Balancer       │
                   └──────────┬──────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
        ┌─────────────────┐       ┌─────────────────┐
        │     App-1       │       │     App-2       │
        │                 │       │                 │
        │ Private Subnet  │       │ Private Subnet  │
        │ AZ-1            │       │ AZ-2            │
        └────────┬────────┘       └────────┬────────┘
                 │                         │
                 └────────────┬────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   RDS Multi-AZ   │
                    └──────────────────┘
```

### Possible Production Improvements

| Current Project | Production Evolution |
|---|---|
| Nginx on App-1 | Application Load Balancer |
| Public EC2 servers | Private application subnets |
| Two managed EC2 instances | Auto Scaling Group |
| Single-AZ RDS instance | RDS Multi-AZ |
| HTTP | HTTPS + ACM |
| Public IP | Route 53 DNS |
| SSH deployment | AWS Systems Manager / private runner |
| Basic verification | CloudWatch monitoring + alarms |
| Broad CI/CD IAM permissions | Least-privilege IAM policies |
| Single environment | Dev / Stage / Production environments |

---

# 🏆 Complete Project Flow

```text
                         👨‍💻 DEVELOPER
                              │
                           Git Push
                              │
                              ▼
                         🐙 GitHub
                              │
                              ▼
                     ⚙️ GitHub Actions
                              │
                              ▼
                       🔐 OIDC Token
                              │
                              ▼
                      AWS IAM + STS
                              │
                              ▼
                        🌍 Terraform
                              │
                              ▼
                    ☁️ AWS Infrastructure
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
           🖥️ EC2          🐳 ECR          🗄️ RDS
              │                               ▲
              ▼                               │
           🐳 Docker                          │
              │                               │
              ▼                               │
           🔀 Nginx                           │
              │                               │
       ┌──────┴──────┐                        │
       ▼             ▼                        │
    🟢 App-1      🟡 App-2 ──────────────────┘
     PRIMARY        BACKUP
       │
       ▼
   🧪 Automated
   Health Checks
       │
       ▼
   🛡️ Failover Test
       │
       ▼
     ✅ GREEN
```

---

# 🎯 Final Project Summary

**Infra-deploy-aws-2** demonstrates the complete journey of an application from source code to an automated AWS deployment.

It brings together:

**Infrastructure as Code** → **Cloud Networking** → **Secure Authentication** → **CI/CD** → **Containers** → **Private Database Connectivity** → **Reverse Proxy** → **Application Failover** → **Automated Testing**

The project was built as a hands-on cloud infrastructure engineering project to develop practical understanding of how different AWS and DevOps technologies work **together**, rather than using each service independently.

---

<div align="center">

## ☁️ From Code to Cloud

### `Terraform` • `AWS` • `GitHub Actions` • `Docker` • `ECR` • `EC2` • `RDS` • `Nginx`

**Build Infrastructure → Deploy Application → Connect Database → Test Failure → Recover Automatically**

<br>

### 🚀 Infrastructure • Automation • Security • Resilience

</div>