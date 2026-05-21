# ═══════════════════════════════════════════════════════════════════════════════
# ATLAS SANCTUM — PHASE 4: OPTIMIZATION & LEARNING
# RL Training | Optuna | Ray Tune | Ecological Feedback | Resource Allocation
# Months 12–18 | Targets: >85% efficiency, 100 carbon projects, <1000 RL episodes
# ═══════════════════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "atlas-terraform-state"
    key    = "phase4/terraform.tfstate"
    region = "us-east-1"
  }
}

variable "aws_region"   { default = "us-east-1" }
variable "environment"  { default = "production" }

provider "aws" {
  region = var.aws_region
  default_tags { tags = { Phase = "4", Project = "AtlasSanctum" } }
}

# ─── GPU Training Cluster (A100 for RL training) ──────────────────────────────
# Phase 4 requires A100 GPUs for:
# - PyTorch RL policy training (PPO/SAC algorithms)
# - Ray Tune hyperparameter search
# - Optuna optimization studies

resource "aws_eks_node_group" "gpu_training" {
  cluster_name    = "atlas-sanctum-phase1"   # Reuse Phase 1 cluster
  node_group_name = "gpu-training-phase4"
  node_role_arn   = data.aws_iam_role.eks_node.arn
  subnet_ids      = data.aws_subnets.private.ids
  instance_types  = ["p3.2xlarge"]   # NVIDIA V100 16GB — cost-effective for RL
  capacity_type   = "ON_DEMAND"      # Training jobs need stable compute

  scaling_config {
    desired_size = 2
    min_size     = 0   # Scale to 0 when no training jobs
    max_size     = 8
  }

  labels = {
    workload = "gpu-training"
    phase    = "4"
  }

  taint {
    key    = "workload"
    value  = "gpu-training"
    effect = "NO_SCHEDULE"
  }

  # Lifecycle: scale down after training completes
  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
  }
}

data "aws_iam_role" "eks_node" {
  name = "atlas-phase1-eks-node-role"
}

data "aws_subnets" "private" {
  filter {
    name   = "tag:Tier"
    values = ["private"]
  }
}

# ─── S3 Buckets for RL Training Artifacts ─────────────────────────────────────

resource "aws_s3_bucket" "rl_models" {
  bucket = "atlas-phase4-rl-models"
  tags = { Name = "atlas-phase4-rl-models", Phase = "4" }
}

resource "aws_s3_bucket_versioning" "rl_models" {
  bucket = aws_s3_bucket.rl_models.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket" "optuna_studies" {
  bucket = "atlas-phase4-optuna-studies"
  tags = { Name = "atlas-phase4-optuna-studies", Phase = "4" }
}

# ─── RDS for Optuna Study Storage ─────────────────────────────────────────────
# Optuna uses PostgreSQL to store trial results across distributed workers

resource "aws_db_instance" "optuna" {
  identifier             = "atlas-phase4-optuna"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = "db.t3.medium"   # Small — just stores trial metadata
  allocated_storage      = 20
  storage_encrypted      = true
  db_name                = "optuna_studies"
  username               = "optuna_user"
  password               = random_password.optuna.result
  skip_final_snapshot    = true
  db_subnet_group_name   = "atlas-phase1-db-subnet"
  tags = { Name = "atlas-phase4-optuna-db" }
}

resource "random_password" "optuna" {
  length  = 32
  special = false
}

# ─── MSK Kafka Topics for RL Feedback Loops ───────────────────────────────────
# RL agents need real-time ecological feedback signals

resource "aws_msk_configuration" "phase4" {
  kafka_versions = ["3.5.1"]
  name           = "atlas-phase4-kafka-config"

  server_properties = <<PROPERTIES
auto.create.topics.enable=false
default.replication.factor=3
min.insync.replicas=2
num.partitions=10
log.retention.hours=168
compression.type=lz4
PROPERTIES
}

# ─── CloudWatch Alarms for RL Training ────────────────────────────────────────

resource "aws_cloudwatch_metric_alarm" "rl_training_cost" {
  alarm_name          = "atlas-phase4-rl-training-cost"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 86400   # Daily
  statistic           = "Maximum"
  threshold           = 500     # Alert if daily GPU cost > $500
  alarm_description   = "RL training GPU costs exceeding budget"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

resource "aws_sns_topic" "alerts" {
  name = "atlas-phase4-alerts"
}

output "gpu_training_node_group" { value = aws_eks_node_group.gpu_training.id }
output "optuna_db_endpoint"      { value = aws_db_instance.optuna.endpoint; sensitive = true }
output "rl_models_bucket"        { value = aws_s3_bucket.rl_models.bucket }
