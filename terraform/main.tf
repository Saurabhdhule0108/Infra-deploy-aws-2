# ============================================================
# TERRAFORM CONFIGURATION
# ============================================================

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = "infra-deploy-aws-2-terraform-state-2026"
    key          = "terraform.tfstate"
    region       = "ap-south-1"
    use_lockfile = true
  }
}


# ============================================================
# AWS PROVIDER
# ============================================================

provider "aws" {
  region = var.aws_region
}


# ============================================================
# VPC
# ============================================================

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "infra-deploy-aws-vpc"
  }
}


# ============================================================
# PUBLIC APPLICATION SUBNET 1 - AZ 1
# ============================================================

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "infra-deploy-aws-public-subnet-1"
  }
}


# ============================================================
# PUBLIC APPLICATION SUBNET 2 - AZ 2
# ============================================================

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.4.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "infra-deploy-aws-public-subnet-2"
  }
}


# ============================================================
# PRIVATE DATABASE SUBNET 1 - AZ 1
# ============================================================

resource "aws_subnet" "db_private_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = false

  tags = {
    Name = "infra-deploy-aws-db-private-1"
  }
}


# ============================================================
# PRIVATE DATABASE SUBNET 2 - AZ 2
# ============================================================

resource "aws_subnet" "db_private_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = false

  tags = {
    Name = "infra-deploy-aws-db-private-2"
  }
}


# ============================================================
# INTERNET GATEWAY
# ============================================================

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "infra-deploy-aws-igw"
  }
}


# ============================================================
# PUBLIC ROUTE TABLE
# ============================================================

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "infra-deploy-aws-public-rt"
  }
}


# ============================================================
# PUBLIC SUBNET 1 ROUTE TABLE ASSOCIATION
# ============================================================

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}


# ============================================================
# PUBLIC SUBNET 2 ROUTE TABLE ASSOCIATION
# ============================================================

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}


# ============================================================
# EC2 SECURITY GROUP
# ============================================================

resource "aws_security_group" "ec2" {
  name        = "infra-deploy-aws-ec2-sg"
  description = "Security group for infrastructure project EC2"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "infra-deploy-aws-ec2-sg"
  }
}


# ============================================================
# APPLICATION EC2 INSTANCE 1
# ============================================================

resource "aws_instance" "app" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_name

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              systemctl enable docker
              systemctl start docker
              usermod -aG docker ubuntu
              EOF

  user_data_replace_on_change = false

  tags = {
    Name = "infra-deploy-aws-app-1"
  }
}


# ============================================================
# ECR REPOSITORY
# ============================================================

resource "aws_ecr_repository" "app" {
  name                 = "infra-deploy-aws-app"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "infra-deploy-aws-app"
  }
}


# ============================================================
# OUTPUTS
# ============================================================

output "instance_id" {
  description = "Application EC2 instance 1 ID"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "Application EC2 instance 1 public IP"
  value       = aws_instance.app.public_ip
}

output "public_subnet_2_id" {
  description = "Public application subnet 2 ID"
  value       = aws_subnet.public_2.id
}