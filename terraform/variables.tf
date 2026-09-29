variable "aws_region" {
  description = "AWS region where infrastructure will be created"
  type        = string
  default     = "ap-south-1"
}

variable "ami_id" {
  description = "Ubuntu AMI ID for the EC2 instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "EC2 key pair name"
  type        = string
}

# =========================================================
# RDS VARIABLES
# =========================================================

variable "db_name" {
  description = "Name of the MySQL database"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "Master username for the MySQL database"
  type        = string
  default     = "adminuser"
}

variable "db_password" {
  description = "Master password for the MySQL database"
  type        = string
  sensitive   = true
}