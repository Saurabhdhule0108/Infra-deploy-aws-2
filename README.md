 <div align="center">

<img src="docs/assets/animations/cloud-engineering.svg" width="760" alt="Cloud Engineering Overview">

# AWS Infrastructure Deployment & Automation

### A Cloud Engineer Portfolio Project

**Infrastructure as Code · CI/CD · Networking · Containers · Database Automation · Resilience**

[![AWS](https://img.shields.io/badge/AWS-Cloud-232F3E?logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-Infrastructure_as_Code-7B42BC?logo=terraform&logoColor=white)](https://developer.hashicorp.com/terraform)
[![VPC](https://img.shields.io/badge/Amazon_VPC-Networking-232F3E?logo=amazonaws&logoColor=white)](https://aws.amazon.com/vpc/)
[![EC2](https://img.shields.io/badge/Amazon_EC2-Compute-FF9900?logo=amazonec2&logoColor=white)](https://aws.amazon.com/ec2/)
[![S3](https://img.shields.io/badge/Amazon_S3-Object_Storage-569A31?logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![RDS](https://img.shields.io/badge/Amazon_RDS-Managed_Database-527FFF?logo=amazonrds&logoColor=white)](https://aws.amazon.com/rds/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Automation-2088FF?logo=githubactions&logoColor=white)](https://docs.github.com/actions)
[![OIDC](https://img.shields.io/badge/OIDC-Federated_Authentication-4169E1?logo=openid&logoColor=white)](https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
[![IAM](https://img.shields.io/badge/AWS_IAM-Identity_and_Access-DD344C?logo=amazonaws&logoColor=white)](https://aws.amazon.com/iam/)
[![STS](https://img.shields.io/badge/AWS_STS-Temporary_Credentials-232F3E?logo=amazonaws&logoColor=white)](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html)
[![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![ECR](https://img.shields.io/badge/Amazon_ECR-Container_Registry-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/ecr/)
[![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-Web_Framework-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Ansible](https://img.shields.io/badge/Ansible-Configuration_Management-EE0000?logo=ansible&logoColor=white)](https://www.ansible.com/)

</div>

---

## 📌 Project Overview

This project demonstrates the provisioning, configuration, deployment, and operation of a cloud-based application on Amazon Web Services (AWS).

The application is built with Node.js and Express, packaged as a Docker container, and stored in Amazon Elastic Container Registry (Amazon ECR). Terraform provisions the AWS infrastructure, Ansible manages server configuration and deployment tasks, and GitHub Actions automates deployment and operational workflows.

The application connects to Amazon RDS for MySQL to create and retrieve persistent user records. Amazon S3 is integrated with RDS through application-server workflows that import CSV data into the database and export database records to CSV files in S3.

The project also includes an active-passive failover test that checks whether Nginx can route application traffic to the secondary application server when the primary application's container becomes unavailable.

Together, these components demonstrate Infrastructure as Code, configuration management, CI/CD, containerization, database integration, S3 data automation, identity and access management, and operational testing in one AWS project.

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| **Amazon Web Services (AWS)** | Cloud infrastructure and managed services |
| **Amazon VPC** | Network isolation and subnet organization |
| **Amazon EC2** | Hosts application containers and supporting services |
| **Amazon RDS for MySQL** | Managed relational database for persistent user records |
| **Amazon S3** | Stores CSV import files and exported database data |
| **Amazon ECR** | Private Docker image registry |
| **AWS IAM, OIDC and STS** | Identity federation, authentication, and access control |
| **Terraform** | Infrastructure as Code |
| **Ansible** | Server configuration and deployment tasks |
| **GitHub Actions** | CI/CD and operational workflow automation |
| **Docker** | Application containerization |
| **Node.js and Express** | Application runtime, web interface, and HTTP routes |
| **Nginx** | HTTP reverse proxy and application traffic routing |
| **MySQL** | Relational database engine used by RDS |

## 🎯 Project Objectives

- **Infrastructure as Code:** Provision and manage AWS resources through Terraform configuration.
- **Configuration Management:** Automate server configuration and deployment tasks using Ansible.
- **CI/CD Automation:** Build and deploy application images through GitHub Actions.
- **Containerization:** Package the Node.js application with Docker and store images in Amazon ECR.
- **Database Integration:** Connect the application to Amazon RDS for MySQL for persistent user data.
- **Data Automation:** Import CSV records from Amazon S3 into RDS and export database records back to S3.
- **Application Resilience:** Test application-level failover between two application servers.
- **Identity and Access Management:** Use GitHub OIDC federation and IAM permissions to control AWS access.
- **Operational Verification:** Check application health, database connectivity, data operations, and failover recovery through automated workflows.

## 🗂️ Project Structure

```text
Infra-deploy-aws-2/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── failover-test.yml
│       ├── s3-import.yml
│       └── s3-export.yml
├── ansible/
│   ├── ansible-deploy.yml
│   ├── ansible.cfg
│   ├── generate-inventory.sh
│   ├── prepare-ssh.sh
│   └── templates/
│       └── nginx.conf.j2
├── docs/
│   ├── assets/
│   │   └── animations/
│   │       ├── cloud-engineering.svg
│   │       ├── aws-architecture.svg
│   │       ├── terraform-provisioning.svg
│   │       ├── cicd-pipeline.svg
│   │       ├── docker-ecr-deployment.svg
│   │       ├── ansible-configuration.svg
│   │       ├── application-database.svg
│   │       ├── s3-rds-integration.svg
│   │       └── active-passive-failover.svg
│   └── screenshots/
│       ├── deployment-success.png
│       ├── ec2-infrastructure.png
│       ├── docker-ecr.png
│       ├── running-application.png
│       ├── application-rds.png
│       ├── s3-import-export.png
│       └── application-users.png
├── nodeapp/
│   ├── app.js
│   ├── Dockerfile
│   ├── package.json
│   └── public/
├── terraform/
│   ├── iam_s3.tf
│   ├── main.tf
│   ├── rds.tf
│   ├── variables.tf
│   └── .terraform.lock.hcl
├── users.csv
├── .gitignore
├── .gitattributes
└── README.md
```

*The structure above represents the expected project layout. Keep it aligned with the files actually committed to the repository.*

## ☁️ AWS Architecture

![AWS Architecture](docs/assets/animations/aws-architecture.svg)

The application runs on two EC2 instances within a custom VPC. The application tier connects to an Amazon RDS for MySQL database placed in private subnets. Amazon ECR stores the container image, while Amazon S3 stores the files used for data import and export.

Terraform provisions the infrastructure, Ansible configures the servers, and GitHub Actions coordinates deployment and operational workflows.

### Component responsibilities

| Component | Responsibility |
|---|---|
| **Amazon VPC** | Provides the project's isolated network. |
| **Public subnets** | Host the application EC2 instances. |
| **Private subnets** | Provide network placement for RDS. |
| **Amazon EC2** | Runs the application containers and supporting services. |
| **Security groups** | Control permitted network traffic between components. |
| **Amazon RDS for MySQL** | Stores persistent application user records. |
| **Amazon S3** | Stores CSV import files and exported database data. |
| **Amazon ECR** | Stores Docker images for deployment. |
| **AWS IAM** | Controls access to AWS resources. |
| **GitHub Actions** | Automates deployment, data operations, and failover testing. |

![EC2 Infrastructure](docs/screenshots/ec2-infrastructure.png)

## 🏗️ Terraform Infrastructure

![Terraform Infrastructure Provisioning](docs/assets/animations/terraform-provisioning.svg)

Terraform manages the AWS infrastructure through configuration files, reducing the need to create and maintain resources manually in the AWS console.

The configuration covers the VPC, subnets, networking, security groups, EC2 resources, RDS, and relevant IAM permissions.

### Remote state management

Terraform state is stored in an Amazon S3 backend.

- **S3 bucket:** `infra-deploy-aws-2-terraform-state-2026`
- **State key:** `terraform.tfstate`
- **State locking:** Enabled using `use_lockfile = true`
- **State protection:** S3 versioning, encryption, and Block Public Access

Remote state provides a shared record of managed infrastructure. State locking helps prevent conflicting Terraform operations from modifying the state simultaneously.

### Common Terraform commands

Run these commands from the `terraform/` directory:

```bash
terraform init
terraform validate
terraform plan
terraform apply
```

- `terraform init` initializes the working directory and backend.
- `terraform validate` checks the configuration for errors.
- `terraform plan` previews proposed infrastructure changes.
- `terraform apply` applies the proposed infrastructure changes after confirmation.

The deployment workflow also runs Terraform as part of its automated process. Review the plan carefully before applying infrastructure changes.

## ⚙️ Ansible Configuration Management

![Ansible Configuration Management](docs/assets/animations/ansible-configuration.svg)

Ansible manages server configuration and deployment tasks after infrastructure provisioning.

Terraform and Ansible serve different purposes:

- **Terraform** creates and manages the infrastructure.
- **Ansible** configures software and services on the servers.

The Ansible playbook automates the required server configuration and deployment tasks. Supporting files manage playbook settings, SSH preparation, dynamic inventory generation, and Nginx configuration.

Separating infrastructure provisioning from server configuration makes these responsibilities easier to understand, maintain, and troubleshoot.

## 🔄 CI/CD and Deployment

![CI/CD Pipeline](docs/assets/animations/cicd-pipeline.svg)

GitHub Actions automates application deployment to AWS. The workflow uses GitHub OIDC federation to obtain AWS credentials through an IAM role, avoiding the need to store long-lived AWS access keys as GitHub Actions credentials.

The deployment workflow coordinates these operations:

1. Initializes and validates Terraform configuration.
2. Plans and applies infrastructure changes.
3. Checks the required infrastructure and database availability.
4. Builds the Docker image and pushes it to Amazon ECR.
5. Discovers the application instances and prepares deployment inventory.
6. Uses Ansible for the required server configuration and deployment tasks.
7. Configures Nginx and verifies the deployed application.
8. Performs the configured post-deployment instance-state operations.

### How to run the deployment workflow

1. Open the repository on GitHub.
2. Select **Actions**.
3. Open the **Deploy** workflow.
4. Select **Run workflow** if manual execution is available.
5. Select the `main` branch and start the workflow.
6. Open the run and inspect the job results and logs.

The workflow can also run automatically when its configured trigger conditions are met.

**Deployment workflow:** [Open Deploy workflow](https://github.com/Saurabhdhule0108/Infra-deploy-aws-2/actions/workflows/deploy.yml)

![Successful CI/CD Deployment](docs/screenshots/deployment-success.png)

## 🐳 Docker and Amazon ECR

![Docker and Amazon ECR Deployment](docs/assets/animations/docker-ecr-deployment.svg)

Docker packages the Node.js application and its required runtime dependencies into a container image.

Amazon ECR provides a private container registry for storing the images built by the CI/CD workflow.

The deployment process builds the application image, pushes it to the `infra-deploy-aws-app` ECR repository, and deploys the image to the application servers.

The application container listens on port `8080`. The configured web entry point and Nginx routing expose the application through HTTP port `80`.

![Docker and Amazon ECR](docs/screenshots/docker-ecr.png)

## 🗄️ Application and RDS Integration

![Application and Database Integration](docs/assets/animations/application-database.svg)

The application uses Node.js and Express to serve the web interface and handle HTTP requests. Amazon RDS for MySQL stores user records so that the data persists independently of the application container.

The application supports creating and retrieving users through its database integration.

### Application endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health` | Checks application health and reports the serving hostname. |
| `GET /db` | Checks database connectivity. |
| `/users` | Supports the user operations implemented by the application, including creating and retrieving records. |

The database is named `appdb`, and the application uses the `users` table. Database access is controlled through security groups, allowing MySQL traffic from the application EC2 security group rather than opening the database to the public internet.

### What this integration demonstrates

- Persistent data storage using a managed relational database.
- Application-to-database connectivity.
- Separation between the application and data tiers.
- Database connectivity checks and basic operational troubleshooting.

![Running Application](docs/screenshots/running-application.png)

![Application and RDS Integration](docs/screenshots/application-rds.png)

![Users Retrieved from RDS](docs/screenshots/application-users.png)

## 🔄 S3 and RDS Data Automation

![S3 and RDS Data Integration](docs/assets/animations/s3-rds-integration.svg)

Amazon S3 stores CSV files used to import records and files generated when exporting records from RDS.

EC2 acts as the bridge between S3 and RDS MySQL during these operations. The workflows use the application server to transfer data between the S3 bucket and the database.

### Import: S3 to RDS

1. Place a CSV file in the S3 bucket's `imports/` prefix.
2. Run the S3 import workflow from GitHub Actions.
3. The workflow uses the application server to download the CSV file.
4. It validates the expected `name` and `email` fields.
5. It imports the records into the `appdb.users` table using a transaction and insert-or-update behavior.
6. It verifies the import result.

### Export: RDS to S3

1. Run the S3 export workflow from GitHub Actions.
2. The workflow queries records from the RDS `appdb.users` table.
3. It generates a timestamped CSV file.
4. It uploads the exported file to the S3 bucket's `exports/` prefix.
5. It verifies that the export operation completed.

### Data bucket

- **Bucket:** `infra-deploy-aws-2-app-data-2026`
- **Import prefix:** `imports/`
- **Export prefix:** `exports/`

The EC2 role, `infra-deploy-aws-2-ec2-s3-role`, is intended to limit access to the required data operations, including reading import files and writing export files. Verify that the role is attached to the required EC2 instances and that its IAM policy grants the intended permissions.

### How to run the workflows

- [S3 Import Workflow](https://github.com/Saurabhdhule0108/Infra-deploy-aws-2/actions/workflows/s3-import.yml)
- [S3 Export Workflow](https://github.com/Saurabhdhule0108/Infra-deploy-aws-2/actions/workflows/s3-export.yml)

Open the relevant workflow in GitHub Actions, select **Run workflow** when available, provide any required inputs, and review the logs.

![S3 Import and Export](docs/screenshots/s3-import-export.png)

## 🛡️ Active-Passive Failover Testing

![Active-Passive Application Failover](docs/assets/animations/active-passive-failover.svg)

The project includes a manual GitHub Actions workflow that tests application-level failover between the primary and secondary application servers.

The test verifies the following behavior:

1. Checks the normal application and database paths.
2. Stops the Node.js application container on App-1 while leaving the EC2 instance and Nginx running.
3. Verifies that the primary application path becomes unavailable.
4. Checks that Nginx routes application requests to App-2.
5. Verifies database connectivity through the application.
6. Restores the App-1 container and checks recovery.

### How to run the failover test

1. Open GitHub Actions in the repository.
2. Select the **Failover Test** workflow.
3. Choose **Run workflow** if manual execution is available.
4. Monitor the test steps and inspect the output for failover and recovery checks.

**Failover workflow:** [Open Failover Test workflow](https://github.com/Saurabhdhule0108/Infra-deploy-aws-2/actions/workflows/failover-test.yml)

**Current limitation:** This validates application-container failover, not automated EC2 host replacement or Availability Zone failover. Nginx is configured on App-1, so the design does not provide a fully redundant load-balancing tier. The failover test demonstrates recovery from a specific application-container failure rather than complete high availability.

## 🔐 Security and IAM

Security controls are applied across infrastructure provisioning, deployment, application networking, and data access.

| Area | Implementation |
|---|---|
| GitHub-to-AWS authentication | OIDC federation with an IAM role. |
| AWS credentials | Avoids storing long-lived AWS access keys for GitHub Actions authentication. |
| Database access | MySQL access is restricted to the application EC2 security group. |
| RDS exposure | RDS is configured without public accessibility. |
| Terraform state | Stored in S3 with versioning, encryption, and Block Public Access. |
| S3 application data | Uses a dedicated bucket and an EC2 IAM role for the required data operations. |
| Container registry | Amazon ECR stores application images and has image scanning on push enabled. |

The GitHub Actions IAM role is `GitHubActions-InfraDeployAWS`. The EC2 S3 role is `infra-deploy-aws-2-ec2-s3-role`.

**Security hardening to address:** The current EC2 security group includes SSH access from `0.0.0.0/0`. Restrict SSH access to approved administration sources or use a more controlled management approach before treating the design as production-hardened.

## 🚀 Limitations and Future Improvements

The current implementation demonstrates several cloud engineering workflows. The following improvements could strengthen its availability, security, testing, and observability.

- **Application Load Balancer (ALB):** Introduce a dedicated load-balancing layer with health checks and traffic distribution.
- **Auto Scaling Group (ASG):** Automate EC2 instance replacement and application-tier capacity management.
- **Host-level resilience:** Extend failover beyond application-container failure to address EC2 instance and Availability Zone failures.
- **Automated testing:** Add unit and integration tests to the CI/CD pipeline before deployment.
- **Monitoring and alerting:** Add CloudWatch metrics, logs, alarms, and operational notifications.
- **Secrets management:** Improve database credential handling with a managed secrets solution and controlled rotation.
- **Network security:** Restrict SSH access and review security group rules using least-privilege principles.
- **HTTPS:** Configure TLS for encrypted application access.
- **Database availability and recovery:** Evaluate RDS Multi-AZ, backup retention, and tested recovery procedures.
- **Deployment resilience:** Improve rollback handling and make the deployment process safer when an intermediate step fails.

These are future improvements, not features claimed as already implemented.

---

<div align="center">

**AWS Infrastructure Deployment & Automation**

*Build it. Automate it. Verify it. Improve it.*

</div>

-------------------------------------------------------
