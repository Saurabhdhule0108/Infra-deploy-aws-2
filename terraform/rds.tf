# =========================================================
# RDS NETWORKING
# =========================================================

# ---------------------------------------------------------
# DB SUBNET GROUP
# ---------------------------------------------------------

resource "aws_db_subnet_group" "main" {
  name = "infra-deploy-aws-db-subnet-group"

  subnet_ids = [
    aws_subnet.db_private_1.id,
    aws_subnet.db_private_2.id
  ]

  tags = {
    Name = "infra-deploy-aws-db-subnet-group"
  }
}

# ---------------------------------------------------------
# RDS SECURITY GROUP
# ---------------------------------------------------------

resource "aws_security_group" "rds" {
  name        = "infra-deploy-aws-rds-sg"
  description = "Allow MySQL traffic from application EC2 only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from application EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }


  tags = {
    Name = "infra-deploy-aws-rds-sg"
  }
}

# =========================================================
# RDS MYSQL DATABASE
# =========================================================

resource "aws_db_instance" "mysql" {
  identifier = "infra-deploy-aws-mysql"

  engine = "mysql"

  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  port = 3306

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible = false
  multi_az            = false

  backup_retention_period = 1

  deletion_protection = false
  skip_final_snapshot = true

  auto_minor_version_upgrade = true

  tags = {
    Name = "infra-deploy-aws-mysql"
  }
}

# =========================================================
# RDS OUTPUTS
# =========================================================

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = aws_db_instance.mysql.address
}

output "rds_port" {
  description = "RDS MySQL port"
  value       = aws_db_instance.mysql.port
}