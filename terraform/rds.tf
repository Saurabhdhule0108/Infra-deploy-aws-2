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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "infra-deploy-aws-rds-sg"
  }
}