# ═══════════════════════════════════════════════════════════════════════════════
# ATLAS SANCTUM — AWS ORGANIZATIONS + CONTROL TOWER LANDING ZONE
# Multi-account structure for planetary-scale sovereign cloud segmentation
# Run ONCE from the management account before any phase deployment
# ═══════════════════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket         = "atlas-terraform-state"
    key            = "org/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags { tags = { ManagedBy = "Terraform", Project = "AtlasSanctum" } }
}

# ─── AWS Organization ─────────────────────────────────────────────────────────

resource "aws_organizations_organization" "atlas" {
  aws_service_access_principals = [
    "cloudtrail.amazonaws.com",
    "config.amazonaws.com",
    "sso.amazonaws.com",
    "controltower.amazonaws.com",
    "securityhub.amazonaws.com",
    "guardduty.amazonaws.com",
    "macie.amazonaws.com",
    "access-analyzer.amazonaws.com",
    "account.amazonaws.com",
  ]
  feature_set          = "ALL"
  enabled_policy_types = ["SERVICE_CONTROL_POLICY", "TAG_POLICY"]
}

# ─── Organizational Units ─────────────────────────────────────────────────────
# Sovereign segmentation: each OU maps to a geopolitical/functional boundary

resource "aws_organizations_organizational_unit" "platform" {
  name      = "Platform"
  parent_id = aws_organizations_organization.atlas.roots[0].id
}

resource "aws_organizations_organizational_unit" "africa" {
  name      = "Africa"
  parent_id = aws_organizations_organization.atlas.roots[0].id
}

resource "aws_organizations_organizational_unit" "europe" {
  name      = "Europe"
  parent_id = aws_organizations_organization.atlas.roots[0].id
}

resource "aws_organizations_organizational_unit" "asia_pacific" {
  name      = "AsiaPacific"
  parent_id = aws_organizations_organization.atlas.roots[0].id
}

resource "aws_organizations_organizational_unit" "security" {
  name      = "Security"   # Dedicated security tooling account
  parent_id = aws_organizations_organization.atlas.roots[0].id
}

resource "aws_organizations_organizational_unit" "sandbox" {
  name      = "Sandbox"
  parent_id = aws_organizations_organization.atlas.roots[0].id
}

# ─── Member Accounts ──────────────────────────────────────────────────────────

resource "aws_organizations_account" "platform_prod" {
  name      = "atlas-platform-production"
  email     = "aws-platform-prod@atlas-sanctum.earth"
  parent_id = aws_organizations_organizational_unit.platform.id
  role_name = "OrganizationAccountAccessRole"
  tags      = { Environment = "production", Tier = "platform" }
}

resource "aws_organizations_account" "platform_staging" {
  name      = "atlas-platform-staging"
  email     = "aws-platform-staging@atlas-sanctum.earth"
  parent_id = aws_organizations_organizational_unit.platform.id
  role_name = "OrganizationAccountAccessRole"
  tags      = { Environment = "staging", Tier = "platform" }
}

resource "aws_organizations_account" "africa_prod" {
  name      = "atlas-africa-production"
  email     = "aws-africa-prod@atlas-sanctum.earth"
  parent_id = aws_organizations_organizational_unit.africa.id
  role_name = "OrganizationAccountAccessRole"
  tags      = { Environment = "production", Region = "africa", DataResidency = "af-south-1" }
}

resource "aws_organizations_account" "europe_prod" {
  name      = "atlas-europe-production"
  email     = "aws-europe-prod@atlas-sanctum.earth"
  parent_id = aws_organizations_organizational_unit.europe.id
  role_name = "OrganizationAccountAccessRole"
  # GDPR: all EU user data stays in this account / eu-west-1
  tags      = { Environment = "production", Region = "europe", DataResidency = "eu-west-1", GDPR = "true" }
}

resource "aws_organizations_account" "security_tooling" {
  name      = "atlas-security-tooling"
  email     = "aws-security@atlas-sanctum.earth"
  parent_id = aws_organizations_organizational_unit.security.id
  role_name = "OrganizationAccountAccessRole"
  tags      = { Purpose = "security-tooling" }
}

resource "aws_organizations_account" "log_archive" {
  name      = "atlas-log-archive"
  email     = "aws-logs@atlas-sanctum.earth"
  parent_id = aws_organizations_organizational_unit.security.id
  role_name = "OrganizationAccountAccessRole"
  tags      = { Purpose = "log-archive", Immutable = "true" }
}

# ─── Service Control Policies ─────────────────────────────────────────────────

# Deny any action that would disable CloudTrail — immutable audit trail
resource "aws_organizations_policy" "deny_cloudtrail_disable" {
  name        = "DenyCloudTrailDisable"
  description = "Prevents disabling CloudTrail — required for planetary audit trail"
  type        = "SERVICE_CONTROL_POLICY"
  content = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid      = "DenyCloudTrailDisable"
      Effect   = "Deny"
      Action   = ["cloudtrail:DeleteTrail", "cloudtrail:StopLogging", "cloudtrail:UpdateTrail"]
      Resource = "*"
    }]
  })
}

resource "aws_organizations_policy_attachment" "deny_cloudtrail_root" {
  policy_id = aws_organizations_policy.deny_cloudtrail_disable.id
  target_id = aws_organizations_organization.atlas.roots[0].id
}

# EU data residency: deny creating resources outside eu-west-1 in Europe OU
resource "aws_organizations_policy" "eu_data_residency" {
  name        = "EUDataResidency"
  description = "Restricts EU account to eu-west-1 and eu-central-1 only (GDPR)"
  type        = "SERVICE_CONTROL_POLICY"
  content = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "DenyNonEURegions"
      Effect = "Deny"
      NotAction = [
        "iam:*", "sts:*", "support:*", "trustedadvisor:*",
        "organizations:*", "account:*"
      ]
      Resource = "*"
      Condition = {
        StringNotEquals = {
          "aws:RequestedRegion" = ["eu-west-1", "eu-central-1", "eu-west-2"]
        }
      }
    }]
  })
}

resource "aws_organizations_policy_attachment" "eu_data_residency" {
  policy_id = aws_organizations_policy.eu_data_residency.id
  target_id = aws_organizations_organizational_unit.europe.id
}

# Africa data residency
resource "aws_organizations_policy" "africa_data_residency" {
  name        = "AfricaDataResidency"
  description = "Restricts Africa account to af-south-1"
  type        = "SERVICE_CONTROL_POLICY"
  content = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "DenyNonAfricaRegions"
      Effect = "Deny"
      NotAction = ["iam:*", "sts:*", "support:*", "organizations:*", "account:*"]
      Resource = "*"
      Condition = {
        StringNotEquals = {
          "aws:RequestedRegion" = ["af-south-1"]
        }
      }
    }]
  })
}

resource "aws_organizations_policy_attachment" "africa_data_residency" {
  policy_id = aws_organizations_policy.africa_data_residency.id
  target_id = aws_organizations_organizational_unit.africa.id
}

# ─── IAM Identity Center (SSO) ────────────────────────────────────────────────
# Single sign-on across all accounts — engineers get least-privilege access

resource "aws_ssoadmin_instance_access_control_attributes" "atlas" {
  instance_arn = tolist(data.aws_ssoadmin_instances.atlas.arns)[0]
  attribute {
    key = "email"
    value { source = ["$${path:enterprise.email}"] }
  }
}

data "aws_ssoadmin_instances" "atlas" {}

# ─── Organization-wide CloudTrail ─────────────────────────────────────────────

resource "aws_cloudtrail" "org_trail" {
  name                          = "atlas-org-trail"
  s3_bucket_name                = aws_s3_bucket.log_archive.id
  include_global_service_events = true
  is_multi_region_trail         = true
  is_organization_trail         = true
  enable_log_file_validation    = true
  kms_key_id                    = aws_kms_key.cloudtrail.arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true
    data_resource {
      type   = "AWS::S3::Object"
      values = ["arn:aws:s3:::"]
    }
  }

  tags = { Name = "atlas-org-cloudtrail", Immutable = "true" }
}

resource "aws_s3_bucket" "log_archive" {
  bucket = "atlas-org-log-archive-${data.aws_caller_identity.current.account_id}"
  tags   = { Purpose = "log-archive", Immutable = "true" }
}

resource "aws_s3_bucket_policy" "log_archive" {
  bucket = aws_s3_bucket.log_archive.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.log_archive.arn
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.log_archive.arn}/AWSLogs/*"
        Condition = { StringEquals = { "s3:x-amz-acl" = "bucket-owner-full-control" } }
      },
      {
        Sid    = "DenyDelete"
        Effect = "Deny"
        Principal = "*"
        Action   = ["s3:DeleteObject", "s3:DeleteBucket"]
        Resource = ["${aws_s3_bucket.log_archive.arn}", "${aws_s3_bucket.log_archive.arn}/*"]
      }
    ]
  })
}

resource "aws_s3_bucket_versioning" "log_archive" {
  bucket = aws_s3_bucket.log_archive.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_kms_key" "cloudtrail" {
  description             = "Atlas Org CloudTrail encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root" }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow CloudTrail"
        Effect = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action   = ["kms:GenerateDataKey*", "kms:DescribeKey"]
        Resource = "*"
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

# ─── Outputs ──────────────────────────────────────────────────────────────────

output "org_id"                  { value = aws_organizations_organization.atlas.id }
output "platform_prod_account"   { value = aws_organizations_account.platform_prod.id }
output "africa_prod_account"     { value = aws_organizations_account.africa_prod.id }
output "europe_prod_account"     { value = aws_organizations_account.europe_prod.id }
output "security_tooling_account"{ value = aws_organizations_account.security_tooling.id }
output "log_archive_account"     { value = aws_organizations_account.log_archive.id }
