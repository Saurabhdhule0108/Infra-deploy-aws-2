<div align="center">

<img src="docs/assets/hero-animation.svg"
     alt="Infrastructure Deployment on AWS"
     width="100%">

<br>

# Infrastructure Deployment on AWS

### ☁️ Infrastructure as Code • CI/CD • Containers • Private Database • Application Resilience

<br>

![Terraform](https://img.shields.io/badge/Terraform-Infrastructure_as_Code-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Cloud-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Application-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-RDS-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Active--Passive-009639?style=for-the-badge&logo=nginx&logoColor=white)

<br>

**`BUILD` → `DEPLOY` → `VERIFY` → `FAILOVER` → `RECOVER`**

</div>

---

## 🌌 Project Overview

**Infrastructure Deployment on AWS** is an end-to-end cloud infrastructure and CI/CD project designed to demonstrate practical AWS and infrastructure engineering concepts.

Instead of manually creating servers and deploying an application, the project automates the complete journey from **source code to running AWS infrastructure**.

The solution combines:

> 🌍 **Terraform** for Infrastructure as Code  
> ⚙️ **GitHub Actions** for CI/CD automation  
> 🔐 **GitHub OIDC + AWS STS** for temporary AWS credentials  
> 🐳 **Docker** for application containerization  
> 📦 **Amazon ECR** for container image storage  
> 🖥️ **Two EC2 application servers across two Availability Zones**  
> 🗄️ **Private Amazon RDS MySQL** for persistent application data  
> 🔀 **Nginx** for active-passive application routing  
> 🔄 **Automated EC2 and RDS lifecycle handling**  
> 🧪 **Dedicated failover testing** for application resilience

### ⚡ One Project — Complete Cloud Delivery

```text
Source Code
     ↓
GitHub
     ↓
GitHub Actions
     ↓
OIDC + AWS STS
     ↓
Terraform
     ↓
AWS Infrastructure
     ↓
Docker Build
     ↓
Amazon ECR
     ↓
EC2 App-1 + App-2
     ↓
Nginx Active-Passive Routing
     ↓
Private RDS MySQL
     ↓
Health + Failover Verification
```

---

# 🏗️ Cloud Architecture

<div align="center">

<img src="docs/assets/architecture.svg"
     alt="Infrastructure Deployment on AWS Architecture"
     width="100%">

</div>

The infrastructure is deployed in the AWS **Asia Pacific (Mumbai) — `ap-south-1`** region.

The architecture separates the project into several responsibilities:

| Layer | Responsibility |
|---|---|
| 🐙 GitHub | Source-code management |
| ⚙️ GitHub Actions | CI/CD automation |
| 🔐 OIDC + STS | Secure temporary AWS authentication |
| 🌍 Terraform | AWS infrastructure provisioning |
| 💾 Amazon S3 | Remote Terraform state + locking |
| 📦 Amazon ECR | Docker image registry |
| 🖥️ EC2 App-1 | Primary application server + Nginx |
| 🖥️ EC2 App-2 | Backup application server |
| 🗄️ Amazon RDS | Private MySQL database |

---

# ⚡ Technology Stack

| Technology | Purpose |
|---|---|
| **Git** | Version control |
| **GitHub** | Repository and source-code management |
| **GitHub Actions** | CI/CD automation |
| **GitHub OIDC** | Passwordless GitHub → AWS authentication |
| **AWS IAM** | AWS authorization and role permissions |
| **AWS STS** | Temporary AWS credentials |
| **Terraform** | Infrastructure as Code |
| **HCL** | Terraform configuration language |
| **Amazon S3** | Remote Terraform state and locking |
| **Amazon VPC** | Isolated cloud network |
| **Amazon EC2** | Application compute |
| **Amazon ECR** | Docker image registry |
| **Amazon RDS** | Managed MySQL database |
| **Docker** | Application containerization |
| **Nginx** | Reverse proxy and active-passive routing |
| **Node.js / Express** | Application backend |
| **MySQL** | Relational database engine |

---

# 🌐 AWS Network Design

The project uses a dedicated custom VPC:

```text
10.0.0.0/16
```

The infrastructure is distributed across **two Availability Zones**.

| Network | CIDR | Availability Zone | Purpose |
|---|---|---|---|
| 🌍 Public Subnet 1 | `10.0.1.0/24` | `ap-south-1a` | EC2 App-1 |
| 🌍 Public Subnet 2 | `10.0.4.0/24` | `ap-south-1b` | EC2 App-2 |
| 🔒 Private DB Subnet 1 | `10.0.2.0/24` | `ap-south-1a` | RDS DB subnet group |
| 🔒 Private DB Subnet 2 | `10.0.3.0/24` | `ap-south-1b` | RDS DB subnet group |

### Network Layout

```text
                        INTERNET
                            │
                            ▼
                    Internet Gateway
                            │
                    Public Route Table
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
        Public Subnet 1             Public Subnet 2
         ap-south-1a                 ap-south-1b
              │                           │
              ▼                           ▼
          EC2 App-1                   EC2 App-2
          PRIMARY                     BACKUP
              │                           │
              └─────────────┬─────────────┘
                            │
                      Private VPC
                         Traffic
                            │
                            ▼
                       RDS MySQL
                  Publicly Accessible
                           NO
```

### 💡 Why No NAT Gateway for RDS?

The application servers and RDS communicate using **private VPC networking**.

EC2 → RDS traffic does not need to travel through the public internet, so a NAT Gateway is not required simply for the application to communicate with the database.

---

# 🖥️ Application Servers

Two EC2 instances host the application.

### 🟢 EC2 App-1 — Primary

```text
Availability Zone : ap-south-1a
Subnet            : 10.0.1.0/24
Role              : Primary Application Server
Nginx             : Port 80
Node.js Container : Port 8080
```

### 🟡 EC2 App-2 — Backup

```text
Availability Zone : ap-south-1b
Subnet            : 10.0.4.0/24
Role              : Backup Application Server
Node.js Container : Port 8080
```

Both servers run the **same Docker image**, helping maintain a consistent application environment.

---

# 🔀 Active-Passive Application Routing

Nginx runs on **App-1** and acts as the public reverse proxy.

### Normal Traffic

```text
Internet
   │
   ▼
App-1 Public IP :80
   │
   ▼
Nginx
   │
   ▼
App-1 Node.js
127.0.0.1:8080
   │
   ▼
RDS MySQL
```

### Primary Application Failure

If the App-1 Node.js container becomes unavailable:

```text
Internet
   │
   ▼
SAME App-1 Public IP
   │
   ▼
Nginx
   │
   ├──── App-1 :8080 ❌
   │
   └──── App-2 Private IP :8080 ✅
                              │
                              ▼
                         RDS MySQL
```

App-2 is marked as the **backup backend** in the Nginx upstream configuration.

The EC2 security group allows the application servers to communicate privately on port `8080`.

---

# 🗄️ Private Database Layer

The project uses **Amazon RDS for MySQL**.

```text
        EC2 APPLICATION SECURITY GROUP
                    │
                    │ TCP :3306
                    ▼
             RDS SECURITY GROUP
                    │
                    ▼
              AMAZON RDS MYSQL
                    │
            PUBLIC ACCESS: NO
```

### Database Characteristics

- 🔒 Located inside private DB subnets
- 🚫 Not publicly accessible
- 🔌 MySQL traffic on port `3306`
- 🛡️ Database access allowed from the application EC2 security group
- 💾 Encrypted storage
- 🌍 DB subnet group spans two Availability Zones
- 🖥️ Accessible by both application servers
- 🔑 Database password supplied through GitHub Secrets

Application database functionality includes endpoints such as:

```text
/db
/users
```

> The DB subnet group spans two Availability Zones, while the current RDS database instance itself remains **Single-AZ**. RDS Multi-AZ is listed later as a production improvement.

---

# 🔐 Secure GitHub → AWS Authentication

<div align="center">

<img src="docs/assets/oidc-flow.svg"
     alt="GitHub OIDC and AWS STS Authentication Flow"
     width="100%">

</div>

The project does **not require long-lived AWS access keys to be stored in GitHub**.

The authentication flow is:

```text
GitHub Actions
      │
      │ requests
      ▼
GitHub OIDC Token
      │
      │ + IAM Role ARN
      ▼
AWS STS
      │
      │ checks
      ▼
IAM Role Trust Policy
      │
      ▼
Conditions Match
      │
      ▼
Temporary AWS Credentials
      │
      ▼
Authenticated AWS API Calls
```

GitHub tells AWS which IAM role it wants to assume by providing the **IAM Role ARN**.

AWS STS validates the GitHub OIDC token against that role's trust policy.

When the trust conditions match, STS provides temporary AWS credentials to the workflow.

---

# 🌍 Infrastructure as Code with Terraform

Terraform creates and manages the project's AWS infrastructure.

### Terraform-Managed Infrastructure

```text
AWS
│
├── VPC
│
├── Internet Gateway
│
├── Public Route Table
│
├── Public Subnet 1
│
├── Public Subnet 2
│
├── Private DB Subnet 1
│
├── Private DB Subnet 2
│
├── EC2 Security Group
│
├── RDS Security Group
│
├── EC2 App-1
│
├── EC2 App-2
│
├── Amazon ECR
│
├── RDS DB Subnet Group
└── RDS MySQL
```

### Terraform Execution Flow

```text
terraform init
      ↓
terraform validate
      ↓
terraform plan
      ↓
terraform apply
```

### Remote Terraform State

Terraform uses an **Amazon S3 backend** for remote state.

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

Remote state allows the automated CI/CD workflow to work against a centralized infrastructure state instead of relying on a local state file.

---

# 🐳 Container Delivery

<div align="center">

<img src="docs/assets/container-flow.svg"
     alt="Docker and Amazon ECR Container Delivery Pipeline"
     width="100%">

</div>

The application is packaged once and deployed consistently to both EC2 servers.

### Container Flow

```text
Node.js Application
        │
        ▼
Dockerfile
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
        ├──────────────┐
        ▼              ▼
     App-1          App-2
     Docker         Docker
        │              │
        └──── SAME ─────┘
             IMAGE
```

The Node.js containers listen on:

```text
8080
```

Nginx listens publicly on:

```text
80
```

The application containers use:

```text
--restart unless-stopped
```

to provide container restart behavior when appropriate.

---

# ⚙️ Automated CI/CD Pipeline

The primary deployment workflow is:

```text
.github/workflows/deploy.yml
```

A push to the `main` branch starts the CI/CD pipeline.

### 🚀 Deployment Journey

```text
Developer Push
      │
      ▼
GitHub Actions
      │
      ▼
GitHub OIDC
      │
      ▼
AWS STS
      │
      ▼
Temporary Credentials
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
Check / Start RDS
      │
      ▼
Wait for RDS
      │
      ▼
Start App-1 + App-2
      │
      ▼
Discover Current IP Addresses
      │
      ▼
Wait for Docker
      │
      ▼
Build Docker Image
      │
      ▼
Push Image → Amazon ECR
      │
      ▼
Deploy Same Image → Both EC2s
      │
      ▼
Verify App-1
      │
      ▼
Verify App-2
      │
      ▼
Verify Private App-1 → App-2 Connection
      │
      ▼
Install / Configure Nginx
      │
      ▼
Verify Public Application
      │
      ▼
Verify /db
      │
      ▼
          ✅ GREEN
      │
      ▼
Stop Both EC2 Instances
```

---

# 🌐 Dynamic EC2 IP Discovery

The project does not depend on Elastic IP addresses.

When stopped EC2 instances start again, their public IP addresses can change.

The CI/CD workflow therefore:

```text
Start EC2
   ↓
Wait Until Running
   ↓
Query AWS
   ↓
Discover Current Public IP
   ↓
Use New IP for Deployment
```

This allows the deployment workflow to continue without manually updating an EC2 public IP in GitHub every time the instances restart.

---

# 🤖 Automated Resource Lifecycle

The workflows understand the state of the infrastructure before attempting deployment or testing.

### 🗄️ RDS Lifecycle

```text
Check RDS State
       │
       ├── AVAILABLE ───────────────► Continue
       │
       ├── STOPPED ──► Start ──────► Wait
       │
       ├── STARTING ────────────────► Wait
       │
       └── STOPPING ─► Wait ─► Start ─► Wait
                                           │
                                           ▼
                                     RDS AVAILABLE
```

This means the database does not have to be manually started before every workflow.

### 🖥️ EC2 Lifecycle

The deployment workflow also starts the application instances when required and waits for them before continuing.

```text
Check Instances
      ↓
Start Required EC2s
      ↓
Wait
      ↓
Discover Fresh IPs
      ↓
Deploy
```

After a successful normal deployment, both EC2 application instances are stopped to help control lab costs.

---

# 🧪 Automated Failover Testing

<div align="center">

<img src="docs/assets/failover-flow.svg"
     alt="Active-Passive Application Failover Test"
     width="100%">

</div>

Application resilience is tested using a separate workflow:

```text
.github/workflows/failover-test.yml
```

It is intentionally separate from normal deployment and is manually started using:

```text
workflow_dispatch
```

### Failover Test Phases

```text
PHASE 1
Normal Operation
     │
     ▼
App-1 Healthy
Website Healthy
Database Healthy
     │
     ▼
PHASE 2
Stop ONLY App-1 Node.js Container
     │
     ▼
Confirm App-1 :8080 is DOWN
     │
     ▼
PHASE 3
Request SAME Public URL
     │
     ▼
Nginx Detects Primary Failure
     │
     ▼
Traffic → App-2
     │
     ▼
Website Healthy ✅
     │
     ▼
/db Through App-2 ✅
     │
     ▼
PHASE 4
Restart App-1 Container
     │
     ▼
Verify Recovery
     │
     ▼
🏆 FAILOVER TEST PASSED
```

### What the Test Proves

The test verifies:

```text
App-1 Application Failure
           ↓
Nginx Failover
           ↓
App-2 Application
           ↓
Private RDS Connection
           ↓
Application Still Available
           ↓
App-1 Recovery
```

After the dedicated failover test, the EC2 instances remain running so the environment can be inspected or demonstrated.

---

# 🛡️ Security Design

| Security Area | Implementation |
|---|---|
| 🔐 GitHub → AWS | GitHub OIDC |
| 🔑 AWS Credentials | Temporary AWS STS credentials |
| 🗄️ Database | Private RDS |
| 🚫 Public RDS Access | Disabled |
| 🔌 Database Traffic | EC2 SG → RDS SG on `3306` |
| 🔑 Database Password | GitHub Secret |
| 🌐 Server-to-Server | Private VPC networking |
| 💾 Terraform State | Remote Amazon S3 backend |
| 🔒 RDS Storage | Encryption enabled |

> [!NOTE]
> Public SSH access is currently used because GitHub-hosted runners connect to the EC2 application servers during deployment.
>
> This is acceptable for the current learning/lab architecture, but a production environment should use a more restrictive deployment mechanism such as **AWS Systems Manager** and least-privilege network access.

---

# 📂 Repository Structure

```text
Infra-deploy-aws-2/
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── failover-test.yml
│
├── docs/
│   └── assets/
│       ├── hero-animation.svg
│       ├── architecture.svg
│       ├── oidc-flow.svg
│       ├── container-flow.svg
│       └── failover-flow.svg
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

# 🔑 GitHub Configuration

### Repository Variables

```text
AWS_AMI_ID
AWS_KEY_NAME
AWS_ROLE_ARN
```

### Repository Secrets

```text
DB_PASSWORD
EC2_SSH_PRIVATE_KEY
```

Sensitive credentials are not committed directly into the repository.

---

# ▶️ Deployment

A normal project change follows:

```bash
git status
git add .
git commit -m "Update project"
git push origin main
```

The push triggers:

```text
deploy.yml
```

automatically.

### Normal Pipeline

```text
PUSH
 │
 ▼
PROVISION
 │
 ▼
BUILD
 │
 ▼
DEPLOY
 │
 ▼
VERIFY
 │
 ▼
GREEN
```

The failover workflow can then be run independently when resilience testing is required.

---

# 📊 What This Project Demonstrates

<div align="center">

| ☁️ AWS | ⚙️ DevOps | 🌐 Networking | 🛡️ Reliability |
|---|---|---|---|
| EC2 | Terraform | VPC | Active-Passive |
| RDS | GitHub Actions | Subnets | Failover Testing |
| ECR | Docker | Route Tables | Health Checks |
| IAM / STS | CI/CD | Security Groups | Recovery |
| S3 | OIDC | Private Networking | Multi-AZ App Placement |

</div>

### End-to-End Engineering Flow

```text
CODE
 ↓
VERSION CONTROL
 ↓
CI/CD
 ↓
AUTHENTICATION
 ↓
INFRASTRUCTURE AS CODE
 ↓
AWS NETWORKING
 ↓
CONTAINER DELIVERY
 ↓
APPLICATION
 ↓
PRIVATE DATABASE
 ↓
REVERSE PROXY
 ↓
FAILOVER
 ↓
RECOVERY
```

---

# ⚠️ Architecture Boundary

> [!IMPORTANT]
> The current architecture demonstrates **application-level active-passive failover**.
>
> It does **not** claim complete infrastructure-level high availability.

This distinction is important.

Nginx currently runs on **EC2 App-1**, and App-1 is also the public application entry point.

### Scenario 1 — App-1 Container Failure

```text
              Nginx ✅
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
 App-1 Node ❌      App-2 Node ✅
                       BACKUP
```

The application can continue through App-2.

### Scenario 2 — Complete App-1 Failure

```text
Internet
   │
   ▼
App-1 EC2 ❌
   │
   └── Nginx ❌
```

The public entry point is lost.

Therefore, the current design proves **application failover**, while complete host-level high availability remains a production improvement.

---

# 🚀 Production Evolution

A production-oriented evolution could use:

```text
                         INTERNET
                             │
                             ▼
                  APPLICATION LOAD BALANCER
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        PRIVATE APP SUBNET        PRIVATE APP SUBNET
          ap-south-1a               ap-south-1b
                │                         │
                ▼                         ▼
             APP-1                     APP-2
                │                         │
                └────────────┬────────────┘
                             │
                             ▼
                        RDS MULTI-AZ
```

| Current Architecture | Production Evolution |
|---|---|
| App-1/Nginx entry point | Application Load Balancer |
| Two individually managed EC2s | Auto Scaling Group |
| Public application EC2s | Private application subnets |
| SSH-based deployment | AWS Systems Manager |
| HTTP | HTTPS + AWS Certificate Manager |
| Dynamic public IP | Route 53 DNS + Load Balancer |
| Single-AZ RDS | RDS Multi-AZ |
| Workflow health tests | CloudWatch metrics + alarms |
| Broad CI/CD permissions | Least-privilege IAM |
| Single environment | Development / Staging / Production |

---

# 🏆 Infrastructure Deployment on AWS

<div align="center">

### `CODE → AUTOMATE → PROVISION → CONTAINERIZE → DEPLOY → FAILOVER → RECOVER`

<br>

**AWS** • **Terraform** • **GitHub Actions** • **OIDC** • **STS** • **Docker** • **ECR** • **EC2** • **RDS** • **Nginx**

<br>

> **Infrastructure is not just created.**
>
> **It is automated, deployed, tested, failed intentionally, and recovered.**

<br>

### ☁️ Built to demonstrate practical Cloud & Infrastructure Engineering

</div>