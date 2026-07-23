# ═══════════════════════════════════════════════════════════════════════════════
# ATLAS SANCTUM — PHASE 6: PLANETARY SCALE — FULL CIVILIZATIONAL OS
# Multi-Region | 1B Users | 1M Agents | 500 Digital Twins | 99.99% SLA
# Months 24–36 | Global Kubernetes Federation | Polkadot | IPFS/Filecoin
# ═══════════════════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws        = { source = "hashicorp/aws",       version = "~> 5.0" }
    google     = { source = "hashicorp/google",    version = "~> 5.0" }
    azurerm    = { source = "hashicorp/azurerm",   version = "~> 3.0" }
    cloudflare = { source = "cloudflare/cloudflare", version = "~> 4.0" }
  }
  backend "s3" {
    bucket = "atlas-terraform-state"
    key    = "phase6/terraform.tfstate"
    region = "us-east-1"
  }
}

# ─── Variables ────────────────────────────────────────────────────────────────

variable "cloudflare_api_token"    { sensitive = true }
variable "cloudflare_zone_id"      {}
variable "gcp_project_id"          {}
variable "azure_subscription_id"   {}
variable "polkadot_node_key"        { sensitive = true }

# ─── Providers ────────────────────────────────────────────────────────────────

provider "aws" {
  alias  = "us_east"
  region = "us-east-1"
  default_tags { tags = { Phase = "6", Project = "AtlasSanctum", Region = "us-east-1" } }
}

provider "aws" {
  alias  = "eu_west"
  region = "eu-west-1"
  default_tags { tags = { Phase = "6", Project = "AtlasSanctum", Region = "eu-west-1" } }
}

provider "aws" {
  alias  = "ap_southeast"
  region = "ap-southeast-1"
  default_tags { tags = { Phase = "6", Project = "AtlasSanctum", Region = "ap-southeast-1" } }
}

provider "aws" {
  alias  = "africa"
  region = "af-south-1"
  default_tags { tags = { Phase = "6", Project = "AtlasSanctum", Region = "af-south-1" } }
}

provider "google" {
  project = var.gcp_project_id
  region  = "europe-west1"
}

provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ─── GLOBAL EKS CLUSTERS (Multi-Region) ──────────────────────────────────────
# Each region runs a full Atlas Sanctum stack
# Global state sync via CockroachDB (multi-region ACID)

module "eks_us_east" {
  source       = "./modules/eks-cluster"
  providers    = { aws = aws.us_east }
  cluster_name = "atlas-sanctum-us-east"
  region       = "us-east-1"
  node_groups = {
    general = { instance_types = ["c6i.4xlarge"], min = 10, max = 100, desired = 20 }
    gpu     = { instance_types = ["g4dn.2xlarge"], min = 5, max = 50, desired = 10 }
    memory  = { instance_types = ["r6g.4xlarge"], min = 5, max = 30, desired = 10 }
  }
}

module "eks_eu_west" {
  source       = "./modules/eks-cluster"
  providers    = { aws = aws.eu_west }
  cluster_name = "atlas-sanctum-eu-west"
  region       = "eu-west-1"
  node_groups = {
    general = { instance_types = ["c6i.4xlarge"], min = 5, max = 50, desired = 10 }
    gpu     = { instance_types = ["g4dn.2xlarge"], min = 2, max = 20, desired = 5 }
  }
}

module "eks_africa" {
  source       = "./modules/eks-cluster"
  providers    = { aws = aws.africa }
  cluster_name = "atlas-sanctum-africa"
  region       = "af-south-1"
  # Africa: optimized for offline-first edge sync, lower latency for African users
  node_groups = {
    general = { instance_types = ["t3.xlarge", "t3.2xlarge"], min = 3, max = 30, desired = 6 }
    edge    = { instance_types = ["t3.medium"], min = 2, max = 20, desired = 4 }
  }
}

module "gke_europe" {
  source       = "./modules/gke-cluster"
  project_id   = var.gcp_project_id
  cluster_name = "atlas-sanctum-gke-eu"
  region       = "europe-west1"
  # GCP: used for BigQuery analytics, Vertex AI, and EU data residency
  node_pools = {
    general = { machine_type = "n2-standard-8", min = 3, max = 30, initial = 6 }
    ai      = { machine_type = "a2-highgpu-1g", min = 1, max = 10, initial = 2 }
  }
}

module "aks_asia" {
  source          = "./modules/aks-cluster"
  subscription_id = var.azure_subscription_id
  cluster_name    = "atlas-sanctum-aks-asia"
  location        = "Southeast Asia"
  node_pools = {
    general = { vm_size = "Standard_D8s_v3", min = 3, max = 30, initial = 6 }
  }
}

# ─── COCKROACHDB MULTI-REGION (Global ACID database) ─────────────────────────
# Replaces Phase 1 PostgreSQL for global-scale transactions
# 99.999% uptime, multi-region writes, automatic failover

resource "aws_eks_addon" "cockroachdb_us" {
  provider     = aws.us_east
  cluster_name = module.eks_us_east.cluster_name
  addon_name   = "cockroachdb-operator"
}

# CockroachDB cluster spans 3 regions: us-east-1, eu-west-1, af-south-1
# Configured via Helm chart — see kubernetes/phase6/cockroachdb.yaml

# ─── CLOUDFLARE GLOBAL DNS & CDN ─────────────────────────────────────────────

resource "cloudflare_zone_settings_override" "atlas_sanctum" {
  zone_id = var.cloudflare_zone_id
  settings {
    ssl                      = "strict"
    min_tls_version          = "1.2"
    tls_1_3                  = "on"
    automatic_https_rewrites = "on"
    always_use_https         = "on"
    http3                    = "on"
    zero_rtt                 = "on"
    brotli                   = "on"
    early_hints              = "on"
    rocket_loader            = "off"   # Disabled — we use our own bundler
  }
}

# Global API routing — Cloudflare Workers route to nearest healthy region
resource "cloudflare_worker_script" "global_router" {
  account_id = "CLOUDFLARE_ACCOUNT_ID"
  name       = "atlas-global-router"
  content    = file("${path.module}/workers/global-router.js")
}

resource "cloudflare_worker_route" "api_route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "api.atlas-sanctum.earth/*"
  script_name = cloudflare_worker_script.global_router.name
}

# DNS Records — Anycast routing to nearest region
resource "cloudflare_record" "api_us" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  value   = module.eks_us_east.load_balancer_ip
  type    = "A"
  ttl     = 60   # Low TTL for fast failover
  proxied = true
}

resource "cloudflare_record" "api_eu" {
  zone_id = var.cloudflare_zone_id
  name    = "api-eu"
  value   = module.eks_eu_west.load_balancer_ip
  type    = "A"
  ttl     = 60
  proxied = true
}

resource "cloudflare_record" "api_africa" {
  zone_id = var.cloudflare_zone_id
  name    = "api-africa"
  value   = module.eks_africa.load_balancer_ip
  type    = "A"
  ttl     = 60
  proxied = true
}

# DNSSEC for all Atlas Sanctum domains
resource "cloudflare_zone_dnssec" "atlas_sanctum" {
  zone_id = var.cloudflare_zone_id
}

# ─── CLOUDFLARE WAF RULES ─────────────────────────────────────────────────────

resource "cloudflare_ruleset" "waf" {
  zone_id = var.cloudflare_zone_id
  name    = "Atlas Sanctum WAF"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "block"
    description = "Block SQL injection attempts"
    expression  = "(http.request.uri.query contains \"UNION SELECT\" or http.request.uri.query contains \"DROP TABLE\")"
    enabled     = true
  }

  rules {
    action      = "challenge"
    description = "Challenge suspicious bot traffic"
    expression  = "(cf.threat_score gt 30)"
    enabled     = true
  }

  rules {
    action      = "block"
    description = "Rate limit: block if > 1000 req/min per IP"
    expression  = "(http.request.uri.path matches \"^/api/\" and rate(http.request.ip, 60) > 1000)"
    enabled     = true
  }
}

# ─── POLKADOT PARACHAIN NODE ──────────────────────────────────────────────────
# Atlas Sanctum governance runs on Polkadot parachain
# Provides: decentralized governance, cross-chain interoperability

resource "aws_instance" "polkadot_validator" {
  provider      = aws.us_east
  ami           = "ami-0c55b159cbfafe1f0"   # Ubuntu 22.04 LTS
  instance_type = "c6i.2xlarge"
  count         = 3   # 3 validator nodes for redundancy

  root_block_device {
    volume_size = 500
    volume_type = "gp3"
    iops        = 3000
    encrypted   = true
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    # Install Polkadot node
    curl -sL https://github.com/paritytech/polkadot/releases/latest/download/polkadot -o /usr/local/bin/polkadot
    chmod +x /usr/local/bin/polkadot

    # Configure as Atlas Sanctum parachain validator
    cat > /etc/systemd/system/polkadot.service << 'SERVICE'
    [Unit]
    Description=Atlas Sanctum Polkadot Validator
    After=network.target

    [Service]
    ExecStart=/usr/local/bin/polkadot \
      --name "atlas-sanctum-validator-${count.index}" \
      --validator \
      --chain polkadot \
      --base-path /data/polkadot \
      --port 30333 \
      --rpc-port 9933 \
      --prometheus-port 9615 \
      --telemetry-url "wss://telemetry.polkadot.io/submit/ 0"
    Restart=always
    RestartSec=10

    [Install]
    WantedBy=multi-user.target
    SERVICE

    systemctl enable polkadot
    systemctl start polkadot
  EOF
  )

  tags = { Name = "atlas-phase6-polkadot-validator-${count.index}" }
}

# ─── GLOBAL KAFKA (MSK Multi-Region) ─────────────────────────────────────────
# Phase 6: 1B+ events/day requires multi-region Kafka with MirrorMaker2

resource "aws_msk_cluster" "global_us" {
  provider              = aws.us_east
  cluster_name          = "atlas-phase6-kafka-us"
  kafka_version         = "3.5.1"
  number_of_broker_nodes = 9   # 3 per AZ × 3 AZs

  broker_node_group_info {
    instance_type   = "kafka.m5.4xlarge"
    client_subnets  = data.aws_subnets.private_us.ids
    storage_info {
      ebs_storage_info {
        volume_size = 10000   # 10TB per broker
        provisioned_throughput {
          enabled           = true
          volume_throughput = 1000
        }
      }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.phase6.arn
    revision = 1
  }
}

resource "aws_msk_configuration" "phase6" {
  provider       = aws.us_east
  kafka_versions = ["3.5.1"]
  name           = "atlas-phase6-kafka-config"

  server_properties = <<PROPERTIES
auto.create.topics.enable=false
default.replication.factor=3
min.insync.replicas=2
num.partitions=100
log.retention.hours=168
compression.type=lz4
message.max.bytes=10485760
replica.fetch.max.bytes=10485760
PROPERTIES
}

data "aws_subnets" "private_us" {
  provider = aws.us_east
  filter {
    name   = "tag:Tier"
    values = ["private"]
  }
}

# ─── AURORA GLOBAL DATABASE (Financial transactions) ─────────────────────────
# For RIU trading, bond markets — requires strong consistency

resource "aws_rds_global_cluster" "atlas_financial" {
  global_cluster_identifier = "atlas-phase6-financial"
  engine                    = "aurora-postgresql"
  engine_version            = "16.1"
  database_name             = "atlas_financial"
  storage_encrypted         = true
}

resource "aws_rds_cluster" "financial_primary" {
  provider                  = aws.us_east
  cluster_identifier        = "atlas-phase6-financial-primary"
  engine                    = "aurora-postgresql"
  engine_version            = "16.1"
  global_cluster_identifier = aws_rds_global_cluster.atlas_financial.id
  master_username           = "atlas_financial_admin"
  master_password           = random_password.aurora.result
  db_subnet_group_name      = "atlas-phase1-db-subnet"
  skip_final_snapshot       = false
  deletion_protection       = true
}

resource "aws_rds_cluster" "financial_replica_eu" {
  provider                  = aws.eu_west
  cluster_identifier        = "atlas-phase6-financial-replica-eu"
  engine                    = "aurora-postgresql"
  engine_version            = "16.1"
  global_cluster_identifier = aws_rds_global_cluster.atlas_financial.id
  db_subnet_group_name      = "atlas-phase6-db-subnet-eu"
  skip_final_snapshot       = true
  depends_on                = [aws_rds_cluster.financial_primary]
}

resource "random_password" "aurora" {
  length  = 32
  special = false
}

# ─── OUTPUTS ──────────────────────────────────────────────────────────────────

output "global_clusters" {
  value = {
    us_east    = module.eks_us_east.cluster_endpoint
    eu_west    = module.eks_eu_west.cluster_endpoint
    africa     = module.eks_africa.cluster_endpoint
  }
}

output "kafka_bootstrap_brokers_us" {
  value     = aws_msk_cluster.global_us.bootstrap_brokers_tls
  sensitive = true
}

output "polkadot_validator_ips" {
  value = aws_instance.polkadot_validator[*].public_ip
}

output "cloudflare_nameservers" {
  value = cloudflare_zone_dnssec.atlas_sanctum.ds_record
}
