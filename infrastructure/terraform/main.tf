terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    bucket         = "atlas-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# PROVIDERS
# ─────────────────────────────────────────────────────────────────────────────

provider "aws" {
  alias   = "primary"
  region  = var.aws_region

  default_tags {
    tags = {
      Project     = "AtlasHumanitarian"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Repository  = "github.com/atlas-humanitarian/atlas-genesis"
    }
  }
}

provider "kubernetes" {
  alias                  = "eks"
  cluster_ca_certificate = module.eks.cluster_certificate
  host                  = module.eks.cluster_endpoint
  token                 = module.eks.cluster_token
}

provider "helm" {
  kubernetes {
    cluster_ca_certificate = module.eks.cluster_certificate
    host                  = module.eks.cluster_endpoint
    token                 = module.eks.cluster_token
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# MODULES
# ─────────────────────────────────────────────────────────────────────────────

# Networking
module "vpc" {
  source = "./modules/networking"

  environment = var.environment
  aws_region  = var.aws_region

  vpc_cidr             = var.vpc_cidr
  enable_nat_gateway   = true
  enable_vpn_gateway   = false

  tags = {
    Name = "atlas-vpc-${var.environment}"
  }
}

# EKS Cluster
module "eks" {
  source = "./modules/kubernetes/eks"

  environment = var.environment
  aws_region  = var.aws_region

  vpc_id           = module.vpc.vpc_id
  subnet_ids       = module.vpc.private_subnet_ids
  cluster_version = "1.28"

  # Control plane
  enable_control_plane_logging = true
  log_types                   = ["api", "audit", "authenticator", "controllerManager"]

  # Node groups
  node_groups = {
    general = {
      instance_types = ["t3.xlarge", "t3.2xlarge"]
      min_size       = 3
      max_size       = 20
      desired_size  = 6
      capacity_type  = "SPOT"
    },
    memory = {
      instance_types = ["r6g.2xlarge"]
      min_size       = 2
      max_size       = 8
      desired_size  = 3
      capacity_type  = "ON_DEMAND"
    },
    compute = {
      instance_types = ["c6i.4xlarge"]
      min_size       = 2
      max_size       = 6
      desired_size  = 3
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Name = "atlas-eks-${var.environment}"
  }
}

# Database
module "postgresql" {
  source = "./modules/database/postgresql"

  environment = var.environment
  aws_region  = var.aws_region

  identifier        = "atlas-${var.environment}"
  engine_version   = "15.4"
  instance_class   = "db.r6g.2xlarge"
  allocated_storage = 100
  storage_encrypted = true

  # Multi-AZ for production
  multi_az = var.environment == "production" ? true : false

  # Backup
  backup_retention_period = var.environment == "production" ? 35 : 7
  deletion_protection    = var.environment == "production" ? true : false

  subnet_ids       = module.vpc.private_subnet_ids
  vpc_id          = module.vpc.vpc_id
  security_group_ids = [module.vpc.database_security_group_id]

  tags = {
    Name = "atlas-postgresql-${var.environment}"
  }
}

module "redis" {
  source = "./modules/cache/redis"

  environment = var.environment
  aws_region  = var.aws_region

  cluster_id      = "atlas-${var.environment}"
  node_type       = "cache.r6g.2xlarge"
  num_cache_nodes = var.environment == "production" ? 2 : 1
  engine_version = "7.1"

  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  subnet_ids       = module.vpc.private_subnet_ids
  security_group_ids = [module.vpc.redis_security_group_id]

  tags = {
    Name = "atlas-redis-${var.environment}"
  }
}

# Storage
module "s3_storage" {
  source = "./modules/storage/s3"

  environment = var.environment
  aws_region  = var.aws_region

  buckets = {
    documents = {
      name = "atlas-documents-${var.environment}"
      acl  = "private"
    },
    media = {
      name = "atlas-media-${var.environment}"
      acl  = "private"
    },
    backups = {
      name = "atlas-backups-${var.environment}"
      acl  = "private"
    },
    logs = {
      name = "atlas-logs-${var.environment}"
      acl  = "private"
    }
  }

  enable_versioning = true
  enable_lifecycle  = true

  lifecycle_rules = {
    documents = {
      prefix  = ""
      enabled = true
      transition = {
        days          = 90
        storage_class = "STANDARD_IA"
      }
      expiration = {
        days = 365
      }
    }
  }

  tags = {
    Name = "atlas-s3-${var.environment}"
  }
}

# Security
module "security" {
  source = "./modules/security"

  environment = var.environment
  aws_region  = var.aws_region

  # KMS Keys
  enable_key_rotation = true

  # Secrets
  secrets = {
    database = {
      secret_name = "atlas/database/credentials"
    },
    api = {
      secret_name = "atlas/api/keys"
    }
  }

  tags = {
    Name = "atlas-security-${var.environment}"
  }
}

# Monitoring
module "monitoring" {
  source = "./modules/monitoring"

  environment = var.environment
  aws_region  = var.aws_region

  enable_cloudwatch = true
  enable_alarms     = true

  # Dashboards
  dashboards = ["production", "staging", "development"]

  # Alerts
  alert_channels = {
    email    = var.alert_email
    slack    = var.slack_webhook_url
    pagerduty = var.pagerduty_key
  }

  tags = {
    Name = "atlas-monitoring-${var.environment}"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# HELM RELEASES
# ─────────────────────────────────────────────────────────────────────────────

resource "helm_release" "ingress_nginx" {
  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.8.0"

  namespace        = "ingress-nginx"
  create_namespace = true

  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-type"
    value = "nlb"
  }

  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-cross-zone-load-balancing-enabled"
    value = "true"
  }

  set {
    name  = "controller.autoscaling.enabled"
    value = "true"
  }

  set {
    name  = "controller.autoscaling.minReplicas"
    value = var.environment == "production" ? 3 : 1
  }

  set {
    name  = "controller.autoscaling.maxReplicas"
    value = var.environment == "production" ? 20 : 5
  }
}

resource "helm_release" "external_dns" {
  name       = "external-dns"
  repository = "https://kubernetes-sigs.github.io/external-dns"
  chart      = "external-dns"
  version    = "1.13.0"

  namespace = "kube-system"

  set {
    name  = "provider"
    value = "aws"
  }

  set {
    name  = "aws.region"
    value = var.aws_region
  }

  set {
    name  = "txtOwnerId"
    value = module.eks.cluster_id
  }
}

resource "helm_release" "cluster_autoscaler" {
  name       = "cluster-autoscaler"
  repository = "https://kubernetes.github.io/autoscaler"
  chart      = "cluster-autoscaler"
  version    = "9.29.0"

  namespace = "kube-system"

  set {
    name  = "awsRegion"
    value = var.aws_region
  }

  set {
    name  = "autoDiscovery.clusterName"
    value = module.eks.cluster_name
  }

  set {
    name  = "replicaCount"
    value = var.environment == "production" ? 3 : 1
  }
}

resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server"
  chart      = "metrics-server"
  version    = "3.11.0"

  namespace = "kube-system"

  set {
    name  = "apiService.create"
    value = "true"
  }
}

resource "helm_release" "secrets_manager" {
  name       = "external-secrets"
  repository = "https://charts.external-secrets.io"
  chart      = "external-secrets"
  version    = "0.9.0"

  namespace = "external-secrets"
  create_namespace = true

  set {
    name  = "serviceAccount.name"
    value = "external-secrets-sa"
  }

  set {
    name  = "installCRDs"
    value = "true"
  }
}

resource "helm_release" "monitoring" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "55.0.0"

  namespace = "monitoring"
  create_namespace = true

  set {
    name  = "prometheus.prometheusSpec.retention"
    value = var.environment == "production" ? "30d" : "7d"
  }

  set {
    name  = "grafana.persistence.enabled"
    value = "true"
  }

  set {
    name  = "alertmanager.alertmanagerSpec.storage.volumeClaimTemplate.spec.resources.requests.storage"
    value = var.environment == "production" ? "10Gi" : "1Gi"
  }
}

resource "helm_release" "cert_manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  version    = "1.13.0"

  namespace = "cert-manager"
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  set {
    name  = "ingressShim.defaultIssuerName"
    value = "letsencrypt-prod"
  }

  set {
    name  = "ingressShim.defaultIssuerKind"
    value = "ClusterIssuer"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# KUBERNETES NAMESPACES
# ─────────────────────────────────────────────────────────────────────────────

resource "kubernetes_namespace" "production" {
  metadata {
    name = "atlas-production"
    labels = {
      environment   = "production"
      team          = "platform"
      cost-center   = "atlas-core"
    }
  }
}

resource "kubernetes_namespace" "staging" {
  metadata {
    name = "atlas-staging"
    labels = {
      environment   = "staging"
      team          = "platform"
      cost-center   = "atlas-staging"
    }
  }
}

resource "kubernetes_namespace" "development" {
  metadata {
    name = "atlas-development"
    labels = {
      environment   = "development"
      team          = "engineering"
      cost-center   = "atlas-dev"
    }
  }
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
    labels = {
      environment = var.environment
      team        = "platform"
    }
  }
}

resource "kubernetes_namespace" "ingress_nginx" {
  metadata {
    name = "ingress-nginx"
  }
}

resource "kubernetes_namespace" "external_secrets" {
  metadata {
    name = "external-secrets"
  }
}

resource "kubernetes_namespace" "cert_manager" {
  metadata {
    name = "cert-manager"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# KUBERNETES CONFIGMAPS
# ─────────────────────────────────────────────────────────────────────────────

resource "kubernetes_config_map" "app_config" {
  metadata {
    name      = "atlas-app-config"
    namespace = "atlas-${var.environment}"
  }

  data = {
    # Application configuration
    NODE_ENV                     = var.environment
    LOG_LEVEL                    = var.environment == "production" ? "info" : "debug"
    API_URL                      = "https://api.atlas.org"
    FRONTEND_URL                 = "https://atlas.org"
    
    # Database
    DATABASE_HOST                = module.postgresql.endpoint
    DATABASE_PORT                = module.postgresql.port
    DATABASE_NAME                = module.postgresql.database_name
    DATABASE_USERNAME            = module.postgresql.username
    DATABASE_URL                = "postgresql://${module.postgresql.username}:${module.postgresql.password}@${module.postgresql.endpoint}/${module.postgresql.database_name}"
    
    # Redis
    REDIS_HOST                   = module.redis.cluster_endpoint
    REDIS_PORT                   = module.redis.port
    
    # Feature flags
    FEATURE_MULTI_LANGUAGE       = "true"
    FEATURE_ANALYTICS           = "true"
    FEATURE_MACHINE_LEARNING     = "true"
  }
}

resource "kubernetes_config_map" "database_config" {
  metadata {
    name      = "atlas-database-config"
    namespace = "atlas-${var.environment}"
  }

  data = {
    # PostgreSQL settings
    MAX_CONNECTIONS             = "100"
    WORK_MEM                   = "64MB"
    MAINTENANCE_WORK_MEM       = "512MB"
    EFFECTIVE_CACHE_SIZE       = "8GB"
    SHARED_BUFFERS             = "4GB"
    
    # Connection pooling
    POOL_MODE                   = "transaction"
    MIN_CONNECTIONS             = "10"
    MAX_CONNECTIONS             = "100"
    
    # Query optimization
    DEFAULT_STATISTICS_TARGET   = "100"
    RANDOM_PAGE_COST           = "1.1"
    EFFECTIVE_IO_CONCURRENCY   = "200"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# OUTPUTS
# ─────────────────────────────────────────────────────────────────────────────

output "cluster_endpoint" {
  description = "EKS Cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "EKS Cluster name"
  value       = module.eks.cluster_name
}

output "database_endpoint" {
  description = "PostgreSQL endpoint"
  value       = module.postgresql.endpoint
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = module.redis.cluster_endpoint
}

output "s3_bucket_names" {
  description = "S3 bucket names"
  value       = module.s3_storage.bucket_names
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "arns" {
  description = "Important ARNs for the deployment"
  value = {
    cluster_arn      = module.eks.cluster_arn
    node_role_arn    = module.eks.node_role_arn
    database_arn     = module.postgresql.arn
    redis_arn        = module.redis.arn
    s3_documents_arn = module.s3_storage.bucket_arns.documents
    s3_media_arn     = module.s3_storage.bucket_arns.media
  }
}
