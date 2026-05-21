# ═══════════════════════════════════════════════════════════════════════════════
# ATLAS SANCTUM — PHASE 1: FOUNDATION
# Ethical Core, Knowledge Graph, Constitutional Governance, Trust Anchoring
# Months 1–3 | Targets: Ethics kernel >95%, 10K graph nodes, 3 councils, 1K records
# ═══════════════════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws        = { source = "hashicorp/aws",       version = "~> 5.0" }
    kubernetes = { source = "hashicorp/kubernetes", version = "~> 2.0" }
    helm       = { source = "hashicorp/helm",       version = "~> 2.0" }
  }
  backend "s3" {
    bucket         = "atlas-terraform-state"
    key            = "phase1/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# ─── Variables ────────────────────────────────────────────────────────────────

variable "environment"       { default = "production" }
variable "aws_region"        { default = "us-east-1" }
variable "africa_region"     { default = "af-south-1" }   # AWS Cape Town
variable "neo4j_password"    { sensitive = true }
variable "polygon_rpc_url"   { sensitive = true }
variable "vault_token"       { sensitive = true }

# ─── Providers ────────────────────────────────────────────────────────────────

provider "aws" {
  alias  = "primary"
  region = var.aws_region
  default_tags { tags = { Phase = "1", Project = "AtlasSanctum", ManagedBy = "Terraform" } }
}

provider "aws" {
  alias  = "africa"
  region = var.africa_region
  default_tags { tags = { Phase = "1", Project = "AtlasSanctum", Region = "Africa" } }
}

# ─── VPC — Primary (US-East-1) ────────────────────────────────────────────────

resource "aws_vpc" "primary" {
  provider             = aws.primary
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "atlas-phase1-vpc-primary" }
}

resource "aws_subnet" "private" {
  count             = 3
  provider          = aws.primary
  vpc_id            = aws_vpc.primary.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = data.aws_availability_zones.primary.names[count.index]
  tags = { Name = "atlas-phase1-private-${count.index}", Tier = "private" }
}

resource "aws_subnet" "public" {
  count                   = 3
  provider                = aws.primary
  vpc_id                  = aws_vpc.primary.id
  cidr_block              = "10.0.${count.index + 10}.0/24"
  availability_zone       = data.aws_availability_zones.primary.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "atlas-phase1-public-${count.index}", Tier = "public" }
}

data "aws_availability_zones" "primary" { provider = aws.primary; state = "available" }

# ─── VPC — Africa (af-south-1) ────────────────────────────────────────────────
# Africa-first: all user-facing APIs route here first

resource "aws_vpc" "africa" {
  provider             = aws.africa
  cidr_block           = "10.1.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "atlas-phase1-vpc-africa" }
}

resource "aws_subnet" "africa_private" {
  count             = 2
  provider          = aws.africa
  vpc_id            = aws_vpc.africa.id
  cidr_block        = "10.1.${count.index}.0/24"
  availability_zone = data.aws_availability_zones.africa.names[count.index]
  tags = { Name = "atlas-phase1-africa-private-${count.index}" }
}

data "aws_availability_zones" "africa" { provider = aws.africa; state = "available" }

# ─── EKS Cluster — Phase 1 ────────────────────────────────────────────────────

resource "aws_eks_cluster" "phase1" {
  provider = aws.primary
  name     = "atlas-sanctum-phase1"
  version  = "1.29"
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  encryption_config {
    provider { key_arn = aws_kms_key.eks.arn }
    resources = ["secrets"]
  }

  tags = { Name = "atlas-phase1-eks" }
}

resource "aws_eks_node_group" "ethics_core" {
  provider        = aws.primary
  cluster_name    = aws_eks_cluster.phase1.name
  node_group_name = "ethics-core"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = aws_subnet.private[*].id
  instance_types  = ["t3.xlarge"]
  capacity_type   = "ON_DEMAND"   # Ethics kernel must NOT run on spot

  scaling_config {
    desired_size = 3
    min_size     = 3
    max_size     = 6
  }

  labels = { workload = "ethics-core", phase = "1" }
  taint {
    key    = "workload"
    value  = "ethics-core"
    effect = "NO_SCHEDULE"
  }
}

resource "aws_eks_node_group" "general" {
  provider        = aws.primary
  cluster_name    = aws_eks_cluster.phase1.name
  node_group_name = "general"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = aws_subnet.private[*].id
  instance_types  = ["t3.large", "t3.xlarge"]
  capacity_type   = "SPOT"

  scaling_config {
    desired_size = 3
    min_size     = 2
    max_size     = 12
  }

  labels = { workload = "general", phase = "1" }
}

# ─── KMS Keys ─────────────────────────────────────────────────────────────────

resource "aws_kms_key" "eks" {
  provider                = aws.primary
  description             = "Atlas Phase 1 EKS secrets encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags = { Name = "atlas-phase1-eks-kms" }
}

resource "aws_kms_key" "database" {
  provider                = aws.primary
  description             = "Atlas Phase 1 database encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags = { Name = "atlas-phase1-db-kms" }
}

# ─── PostgreSQL + PostGIS (Phase 1 primary DB) ────────────────────────────────

resource "aws_db_subnet_group" "phase1" {
  provider   = aws.primary
  name       = "atlas-phase1-db-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_db_instance" "postgres" {
  provider               = aws.primary
  identifier             = "atlas-phase1-postgres"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = "db.r6g.xlarge"
  allocated_storage      = 100
  max_allocated_storage  = 1000
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.database.arn
  db_name                = "atlas_sanctum"
  username               = "atlas_admin"
  password               = random_password.postgres.result
  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.phase1.name
  backup_retention_period = 35
  deletion_protection    = true
  skip_final_snapshot    = false
  final_snapshot_identifier = "atlas-phase1-final-snapshot"

  # PostGIS extension enabled via parameter group
  parameter_group_name = aws_db_parameter_group.postgis.name

  tags = { Name = "atlas-phase1-postgres", Phase = "1" }
}

resource "aws_db_parameter_group" "postgis" {
  provider = aws.primary
  name     = "atlas-phase1-postgis16"
  family   = "postgres16"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements,postgis"
  }
  parameter {
    name  = "max_connections"
    value = "500"
  }
  parameter {
    name  = "work_mem"
    value = "65536"  # 64MB
  }
}

resource "random_password" "postgres" {
  length  = 32
  special = false
}

# ─── Redis Cluster (Agent working memory, session cache) ──────────────────────

resource "aws_elasticache_subnet_group" "phase1" {
  provider   = aws.primary
  name       = "atlas-phase1-redis-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "phase1" {
  provider                   = aws.primary
  replication_group_id       = "atlas-phase1-redis"
  description                = "Atlas Phase 1 Redis — agent memory + sessions"
  node_type                  = "cache.r6g.large"
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis.result
  subnet_group_name          = aws_elasticache_subnet_group.phase1.name
  engine_version             = "7.1"
  tags = { Name = "atlas-phase1-redis" }
}

resource "random_password" "redis" {
  length  = 32
  special = false
}

# ─── S3 Buckets ───────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "knowledge_graph_exports" {
  provider = aws.primary
  bucket   = "atlas-phase1-knowledge-graph-exports"
  tags = { Name = "atlas-phase1-kg-exports", Phase = "1" }
}

resource "aws_s3_bucket_versioning" "knowledge_graph_exports" {
  provider = aws.primary
  bucket   = aws_s3_bucket.knowledge_graph_exports.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "knowledge_graph_exports" {
  provider = aws.primary
  bucket   = aws_s3_bucket.knowledge_graph_exports.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.database.arn
    }
  }
}

resource "aws_s3_bucket" "blockchain_evidence" {
  provider = aws.primary
  bucket   = "atlas-phase1-blockchain-evidence"
  tags = { Name = "atlas-phase1-blockchain-evidence", Phase = "1" }
}

resource "aws_s3_bucket_versioning" "blockchain_evidence" {
  provider = aws.primary
  bucket   = aws_s3_bucket.blockchain_evidence.id
  versioning_configuration { status = "Enabled" }
}

# ─── HashiCorp Vault (Secrets Management) ─────────────────────────────────────
# Deployed as Helm chart on EKS — see kubernetes/vault.yaml

resource "aws_secretsmanager_secret" "vault_unseal_key" {
  provider                = aws.primary
  name                    = "atlas/phase1/vault/unseal-key"
  recovery_window_in_days = 30
  kms_key_id              = aws_kms_key.database.arn
}

resource "aws_secretsmanager_secret" "polygon_rpc" {
  provider                = aws.primary
  name                    = "atlas/phase1/blockchain/polygon-rpc"
  recovery_window_in_days = 30
  kms_key_id              = aws_kms_key.database.arn
}

# ─── IAM Roles ────────────────────────────────────────────────────────────────

resource "aws_iam_role" "eks_cluster" {
  provider = aws.primary
  name     = "atlas-phase1-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  provider   = aws.primary
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role" "eks_node" {
  provider = aws.primary
  name     = "atlas-phase1-eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  provider   = aws.primary
  role       = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  provider   = aws.primary
  role       = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "eks_ecr" {
  provider   = aws.primary
  role       = aws_iam_role.eks_node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# ─── Outputs ──────────────────────────────────────────────────────────────────

output "eks_cluster_endpoint"  { value = aws_eks_cluster.phase1.endpoint }
output "eks_cluster_name"      { value = aws_eks_cluster.phase1.name }
output "postgres_endpoint"     { value = aws_db_instance.postgres.endpoint; sensitive = true }
output "redis_endpoint"        { value = aws_elasticache_replication_group.phase1.primary_endpoint_address; sensitive = true }
output "africa_vpc_id"         { value = aws_vpc.africa.id }
output "primary_vpc_id"        { value = aws_vpc.primary.id }
