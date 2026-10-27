
# ============================================================
# EC2 IAM ROLE FOR S3 <-> RDS INTEGRATION
# ============================================================

resource "aws_iam_role" "ec2_s3" {
  name        = "infra-deploy-aws-2-ec2-s3-role"
  description = "Allows project EC2 instances to process S3 import and export files"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name    = "infra-deploy-aws-2-ec2-s3-role"
    Project = "infra-deploy-aws-2"
  }
}

# ============================================================
# S3 PERMISSIONS - APPLICATION DATA BUCKET ONLY
# ============================================================

resource "aws_iam_policy" "ec2_s3" {
  name        = "infra-deploy-aws-2-s3-data-access"
  description = "Allows EC2 to read import files and upload export files"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid      = "ListApplicationDataBucket"
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = "arn:aws:s3:::infra-deploy-aws-2-app-data-2026"
      },
      {
        Sid    = "ReadImportFiles"
        Effect = "Allow"

        Action = [
          "s3:GetObject"
        ]

        Resource = "arn:aws:s3:::infra-deploy-aws-2-app-data-2026/imports/*"
      },
      {
        Sid    = "UploadExportFiles"
        Effect = "Allow"

        Action = [
          "s3:PutObject"
        ]

        Resource = "arn:aws:s3:::infra-deploy-aws-2-app-data-2026/exports/*"
      }
    ]
  })

  tags = {
    Name    = "infra-deploy-aws-2-s3-data-access"
    Project = "infra-deploy-aws-2"
  }
}

# ============================================================
# ATTACH S3 POLICY TO EC2 ROLE
# ============================================================

resource "aws_iam_role_policy_attachment" "ec2_s3" {
  role       = aws_iam_role.ec2_s3.name
  policy_arn = aws_iam_policy.ec2_s3.arn
}

# ============================================================
# EC2 INSTANCE PROFILE
# ============================================================

resource "aws_iam_instance_profile" "ec2_s3" {
  name = "infra-deploy-aws-2-ec2-s3-profile"
  role = aws_iam_role.ec2_s3.name

  tags = {
    Name    = "infra-deploy-aws-2-ec2-s3-profile"
    Project = "infra-deploy-aws-2"
  }
}
