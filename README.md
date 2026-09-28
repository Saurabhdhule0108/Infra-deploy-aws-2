# Infra-deploy-aws-2

This project implements a CI/CD pipeline using Terraform and AWS. It automates infrastructure provisioning and application deployment using GitHub Actions, Docker, and Amazon ECR. The project uses GitHub OIDC to securely authenticate GitHub Actions with AWS using temporary credentials instead of long-lived AWS access keys.

## Tech Stack 💻

- **Git** 🐙: Version control system used to track project changes.
- **GitHub** 🌐: Repository hosting and source-code management.
- **GitHub Actions** ⚙️: Automates the CI/CD workflow.
- **Terraform** 🌍: Infrastructure as Code (IaC) tool used to provision AWS resources.
- **HCL** 📝: HashiCorp Configuration Language used for writing Terraform configuration.
- **Terraform Variables** 🔧: Used to provide configurable values such as AWS region, AMI ID, EC2 instance type, and key pair name.
- **AWS EC2** 🖥️: Virtual server used to host the application.
- **Amazon ECR** 🐋: Stores and manages the Docker container image.
- **Docker** 🐳: Containerizes and runs the Node.js application.
- **GitHub OIDC** 🔐: Provides temporary AWS credentials to GitHub Actions without storing long-lived AWS access keys.

## Project Structure 📂

```text
Infra-deploy-aws-2/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── terraform/
│   ├── main.tf
│   └── variables.tf
├── nodeapp/
│   ├── app.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── .gitignore
└── README.md
```

## Features ✨

- **EC2 Hosting**: The application runs inside a Docker container on Amazon EC2.
- **Container Auto-Restart**: Docker uses `unless-stopped` so the application container automatically starts after an EC2/Docker restart.

## Getting Started 🏁

### Prerequisites

- **Git**: [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- **Terraform**: [Install Terraform](https://developer.hashicorp.com/terraform/install)
- **AWS Account**: [Create an AWS Account](https://aws.amazon.com/)
- **GitHub Account**: [Create a GitHub Account](https://github.com/signup)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Docker**: [Docker Documentation](https://docs.docker.com/)
- **HCL / Terraform Language**: [Terraform Configuration Language](https://developer.hashicorp.com/terraform/language)

> Docker and the Node.js runtime are used by the CI/CD environment and EC2 deployment. They do not need to be installed locally for this project.

### Installation

1. **Clone the repository**:

```sh
git clone https://github.com/Saurabhdhule0108/Infra-deploy-aws-2.git
cd Infra-deploy-aws-2
```

2. **Initialize Terraform**:

```sh
cd terraform
terraform init
```

3. **Review Terraform variables**:

The project uses `variables.tf` to define configurable infrastructure values such as:

- AWS region
- Ubuntu AMI ID
- EC2 instance type
- EC2 key pair name


4. **Trigger the CI/CD pipeline**:

Push changes to the `main` branch to start the GitHub Actions workflow.

## Usage 🚀

- **Trigger CI/CD Pipeline**: Push changes to the `main` branch to trigger GitHub Actions.
- **Provision Infrastructure**: Terraform creates and manages the required AWS resources.
- **Build Application Image**: GitHub Actions builds the Docker image.
- **Push Image to ECR**: The Docker image is pushed to Amazon ECR.
- **Deploy to EC2**: The latest Docker image is pulled and deployed to the EC2 instance.
- **Run Application**: Docker exposes the Node.js application through port `80` on EC2 and forwards traffic to port `8080` inside the container.

### CI/CD Flow

```text
GitHub
   ↓
GitHub Actions
   ↓
GitHub OIDC → AWS IAM Role
   ↓
Terraform
   ↓
AWS Infrastructure
   ↓
Docker Build
   ↓
Amazon ECR
   ↓
EC2
   ↓
Docker Container
   ↓
Node.js Application
```

## Acknowledgements 🙏

- [Terraform](https://developer.hashicorp.com/terraform/)
- [Terraform Configuration Language / HCL](https://developer.hashicorp.com/terraform/language)
- [Terraform Variables](https://developer.hashicorp.com/terraform/language/values/variables)
- [Amazon ECR](https://aws.amazon.com/ecr/)
- [Docker](https://www.docker.com/)
- [GitHub Actions](https://github.com/features/actions)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)