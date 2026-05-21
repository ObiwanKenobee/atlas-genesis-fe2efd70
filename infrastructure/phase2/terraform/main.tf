# ═══════════════════════════════════════════════════════════════════════════════
# ATLAS SANCTUM — PHASE 2: PLANETARY DATA FABRIC
# Kinesis | MSK | Timestream | S3 Lakehouse | Glue | Lake Formation | Neptune
# Months 4–6 | Targets: 1B events/day, <500ms stream latency, 100TB lakehouse
# ═══════════════════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket         = "atlas-terraform-state"
    key            = "phase2/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

variable "aws_region"  { default = "us-east-1" }
variable "environment" { default = "production" }

provider "aws" {
  region = var.aws_region
  default_tags { tags = { Phase = "2", Project = "AtlasSanctum", ManagedBy = "Terraform" } }
}

data "aws_caller_identity" "current" {}

# ─── KMS Key for Data Fabric ──────────────────────────────────────────────────

resource "aws_kms_key" "data_fabric" {
  description             = "Atlas Phase 2 data fabric encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags = { Name = "atlas-phase2-data-fabric-kms" }
}

resource "aws_kms_alias" "data_fabric" {
  name          = "alias/atlas-phase2-data-fabric"
  target_key_id = aws_kms_key.data_fabric.key_id
}

# ─── Kinesis Data Streams ─────────────────────────────────────────────────────
# Planetary sensor ingestion: satellite, IoT, climate, health, economic signals

resource "aws_kinesis_stream" "planetary_sensors" {
  name             = "atlas-planetary-sensors"
  shard_count      = 100   # 100 shards = 100MB/s ingest, ~1B events/day at 1KB avg
  retention_period = 168   # 7 days

  stream_mode_details {
    stream_mode = "PROVISIONED"   # Predictable throughput for planetary scale
  }

  encryption_type = "KMS"
  kms_key_id      = aws_kms_key.data_fabric.arn

  tags = { Name = "atlas-planetary-sensors", Stream = "ingestion" }
}

resource "aws_kinesis_stream" "ai_inference_outputs" {
  name             = "atlas-ai-inference-outputs"
  shard_count      = 20
  retention_period = 48

  stream_mode_details { stream_mode = "PROVISIONED" }
  encryption_type = "KMS"
  kms_key_id      = aws_kms_key.data_fabric.arn

  tags = { Name = "atlas-ai-inference-outputs", Stream = "inference" }
}

resource "aws_kinesis_stream" "blockchain_state" {
  name             = "atlas-blockchain-state"
  shard_count      = 10
  retention_period = 168

  stream_mode_details { stream_mode = "PROVISIONED" }
  encryption_type = "KMS"
  kms_key_id      = aws_kms_key.data_fabric.arn

  tags = { Name = "atlas-blockchain-state", Stream = "blockchain" }
}

# Kinesis Firehose: sensors → S3 lakehouse (auto-partitioned by region/date)
resource "aws_kinesis_firehose_delivery_stream" "sensors_to_s3" {
  name        = "atlas-sensors-to-lakehouse"
  destination = "extended_s3"

  kinesis_source_configuration {
    kinesis_stream_arn = aws_kinesis_stream.planetary_sensors.arn
    role_arn           = aws_iam_role.firehose.arn
  }

  extended_s3_configuration {
    role_arn            = aws_iam_role.firehose.arn
    bucket_arn          = aws_s3_bucket.lakehouse_raw.arn
    prefix              = "sensors/region=!{partitionKeyFromQuery:region}/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/"
    error_output_prefix = "errors/sensors/!{firehose:error-output-type}/!{timestamp:yyyy}/!{timestamp:MM}/"
    buffering_size      = 128   # MB — larger buffers = better Parquet compression
    buffering_interval  = 60    # seconds
    compression_format  = "UNCOMPRESSED"   # Parquet processor handles compression

    dynamic_partitioning_configuration { enabled = true }

    processing_configuration {
      enabled = true
      processors {
        type = "RecordDeAggregation"
        parameters { parameter_name = "SubRecordType"; parameter_value = "JSON" }
      }
      processors {
        type = "AppendDelimiterToRecord"
      }
      processors {
        type = "MetadataExtraction"
        parameters {
          parameter_name  = "JsonParsingEngine"
          parameter_value = "JQ-1.6"
        }
        parameters {
          parameter_name  = "MetadataExtractionQuery"
          parameter_value = "{region:.region}"
        }
      }
    }

    cloudwatch_logging_options {
      enabled         = true
      log_group_name  = "/aws/firehose/atlas-sensors"
      log_stream_name = "S3Delivery"
    }
  }

  tags = { Name = "atlas-sensors-to-lakehouse" }
}

# ─── S3 Data Lakehouse ────────────────────────────────────────────────────────

resource "aws_s3_bucket" "lakehouse_raw" {
  bucket = "atlas-lakehouse-raw-${data.aws_caller_identity.current.account_id}"
  tags   = { Name = "atlas-lakehouse-raw", Layer = "raw", Phase = "2" }
}

resource "aws_s3_bucket" "lakehouse_curated" {
  bucket = "atlas-lakehouse-curated-${data.aws_caller_identity.current.account_id}"
  tags   = { Name = "atlas-lakehouse-curated", Layer = "curated" }
}

resource "aws_s3_bucket" "lakehouse_serving" {
  bucket = "atlas-lakehouse-serving-${data.aws_caller_identity.current.account_id}"
  tags   = { Name = "atlas-lakehouse-serving", Layer = "serving" }
}

resource "aws_s3_bucket" "vector_store" {
  bucket = "atlas-vector-store-${data.aws_caller_identity.current.account_id}"
  tags   = { Name = "atlas-vector-store", Purpose = "ai-embeddings" }
}

locals {
  lakehouse_buckets = [
    aws_s3_bucket.lakehouse_raw.id,
    aws_s3_bucket.lakehouse_curated.id,
    aws_s3_bucket.lakehouse_serving.id,
    aws_s3_bucket.vector_store.id,
  ]
}

resource "aws_s3_bucket_versioning" "lakehouse" {
  for_each = toset(local.lakehouse_buckets)
  bucket   = each.value
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "lakehouse" {
  for_each = toset(local.lakehouse_buckets)
  bucket   = each.value
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.data_fabric.arn
    }
    bucket_key_enabled = true   # Reduces KMS API calls by 99%
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "lakehouse_raw" {
  bucket = aws_s3_bucket.lakehouse_raw.id
  rule {
    id     = "raw-tiering"
    status = "Enabled"
    transition { days = 30;  storage_class = "STANDARD_IA" }
    transition { days = 90;  storage_class = "GLACIER_IR" }
    transition { days = 365; storage_class = "DEEP_ARCHIVE" }
  }
}

# ─── AWS Glue Data Catalog ────────────────────────────────────────────────────

resource "aws_glue_catalog_database" "planetary_sensors" {
  name        = "atlas_planetary_sensors"
  description = "Planetary sensor data: satellite, IoT, climate, health, economic"
}

resource "aws_glue_catalog_database" "ai_outputs" {
  name        = "atlas_ai_outputs"
  description = "AI inference outputs, agent decisions, model predictions"
}

resource "aws_glue_catalog_database" "blockchain_events" {
  name        = "atlas_blockchain_events"
  description = "On-chain events: RIU trades, governance votes, impact verifications"
}

# Glue Crawler: auto-discovers schema from S3 raw zone
resource "aws_glue_crawler" "sensors_raw" {
  name          = "atlas-sensors-raw-crawler"
  role          = aws_iam_role.glue.arn
  database_name = aws_glue_catalog_database.planetary_sensors.name
  schedule      = "cron(0 */6 * * ? *)"   # Every 6 hours

  s3_target {
    path = "s3://${aws_s3_bucket.lakehouse_raw.id}/sensors/"
  }

  configuration = jsonencode({
    Version = 1.0
    CrawlerOutput = {
      Partitions = { AddOrUpdateBehavior = "InheritFromTable" }
    }
    Grouping = { TableGroupingPolicy = "CombineCompatibleSchemas" }
  })

  tags = { Name = "atlas-sensors-raw-crawler" }
}

# Glue ETL Job: raw → curated (Parquet conversion + quality checks)
resource "aws_glue_job" "raw_to_curated" {
  name         = "atlas-raw-to-curated"
  role_arn     = aws_iam_role.glue.arn
  glue_version = "4.0"
  worker_type  = "G.2X"
  number_of_workers = 10

  command {
    name            = "glueetl"
    script_location = "s3://${aws_s3_bucket.lakehouse_raw.id}/scripts/raw_to_curated.py"
    python_version  = "3"
  }

  default_arguments = {
    "--job-language"                     = "python"
    "--job-bookmark-option"              = "job-bookmark-enable"
    "--enable-metrics"                   = "true"
    "--enable-continuous-cloudwatch-log" = "true"
    "--enable-spark-ui"                  = "true"
    "--spark-event-logs-path"            = "s3://${aws_s3_bucket.lakehouse_raw.id}/spark-logs/"
    "--TempDir"                          = "s3://${aws_s3_bucket.lakehouse_raw.id}/tmp/"
    "--SOURCE_BUCKET"                    = aws_s3_bucket.lakehouse_raw.id
    "--TARGET_BUCKET"                    = aws_s3_bucket.lakehouse_curated.id
  }

  execution_property { max_concurrent_runs = 3 }
  tags = { Name = "atlas-raw-to-curated-etl" }
}

# ─── Amazon Timestream (Time-series sensor telemetry) ─────────────────────────
# Optimized for IoT/satellite time-series: auto-tiering hot→cold

resource "aws_timestreamwrite_database" "planetary" {
  database_name = "atlas_planetary"
  kms_key_id    = aws_kms_key.data_fabric.arn
  tags          = { Name = "atlas-planetary-timestream" }
}

resource "aws_timestreamwrite_table" "sensor_readings" {
  database_name = aws_timestreamwrite_database.planetary.database_name
  table_name    = "sensor_readings"

  retention_properties {
    memory_store_retention_period_in_hours = 24      # Hot: 24h in memory
    magnetic_store_retention_period_in_days = 3650   # Cold: 10 years on disk
  }

  magnetic_store_write_properties {
    enable_magnetic_store_writes = true
    magnetic_store_rejected_data_location {
      s3_configuration {
        bucket_name        = aws_s3_bucket.lakehouse_raw.id
        object_key_prefix  = "timestream-rejected/"
        encryption_option  = "SSE_KMS"
        kms_key_id         = aws_kms_key.data_fabric.arn
      }
    }
  }

  tags = { Name = "atlas-sensor-readings" }
}

resource "aws_timestreamwrite_table" "climate_metrics" {
  database_name = aws_timestreamwrite_database.planetary.database_name
  table_name    = "climate_metrics"

  retention_properties {
    memory_store_retention_period_in_hours  = 168    # 7 days hot
    magnetic_store_retention_period_in_days = 36500  # 100 years — climate record
  }

  magnetic_store_write_properties {
    enable_magnetic_store_writes = true
  }

  tags = { Name = "atlas-climate-metrics" }
}

# ─── Amazon Neptune (Knowledge Graph) ────────────────────────────────────────
# Stores: bioregional relationships, species networks, governance lineage,
# cultural knowledge graphs, impact causality chains

resource "aws_neptune_subnet_group" "phase2" {
  name       = "atlas-phase2-neptune-subnet"
  subnet_ids = data.aws_subnets.private.ids
  tags       = { Name = "atlas-phase2-neptune-subnet" }
}

resource "aws_neptune_cluster" "knowledge_graph" {
  cluster_identifier                  = "atlas-knowledge-graph"
  engine                              = "neptune"
  engine_version                      = "1.3.1.0"
  neptune_subnet_group_name           = aws_neptune_subnet_group.phase2.name
  storage_encrypted                   = true
  kms_key_arn                         = aws_kms_key.data_fabric.arn
  backup_retention_period             = 35
  preferred_backup_window             = "02:00-03:00"
  deletion_protection                 = true
  skip_final_snapshot                 = false
  final_snapshot_identifier           = "atlas-knowledge-graph-final"
  iam_database_authentication_enabled = true
  enable_cloudwatch_logs_exports      = ["audit"]
  tags                                = { Name = "atlas-knowledge-graph" }
}

resource "aws_neptune_cluster_instance" "knowledge_graph" {
  count              = 2   # 1 writer + 1 reader
  identifier         = "atlas-knowledge-graph-${count.index}"
  cluster_identifier = aws_neptune_cluster.knowledge_graph.id
  instance_class     = "db.r6g.2xlarge"
  engine             = "neptune"
  tags               = { Name = "atlas-knowledge-graph-${count.index}" }
}

# ─── Amazon OpenSearch (Full-text + vector search) ───────────────────────────

resource "aws_opensearch_domain" "atlas" {
  domain_name    = "atlas-search"
  engine_version = "OpenSearch_2.11"

  cluster_config {
    instance_type            = "r6g.2xlarge.search"
    instance_count           = 3
    dedicated_master_enabled = true
    dedicated_master_type    = "r6g.large.search"
    dedicated_master_count   = 3
    zone_awareness_enabled   = true
    zone_awareness_config { availability_zone_count = 3 }
  }

  ebs_options {
    ebs_enabled = true
    volume_type = "gp3"
    volume_size = 500
    throughput  = 250
  }

  encrypt_at_rest { enabled = true; kms_key_id = aws_kms_key.data_fabric.arn }
  node_to_node_encryption { enabled = true }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  advanced_security_options {
    enabled                        = true
    internal_user_database_enabled = false
    master_user_options {
      master_user_arn = aws_iam_role.opensearch_master.arn
    }
  }

  log_publishing_options {
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.opensearch.arn
    log_type                 = "INDEX_SLOW_LOGS"
  }

  tags = { Name = "atlas-opensearch" }
}

resource "aws_cloudwatch_log_group" "opensearch" {
  name              = "/aws/opensearch/atlas"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.data_fabric.arn
}

# ─── MSK Kafka (Phase 2 — planetary event bus) ───────────────────────────────
# Complements Phase 6 global MSK; this is the primary regional cluster

resource "aws_msk_cluster" "planetary_bus" {
  cluster_name           = "atlas-phase2-planetary-bus"
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 6   # 2 per AZ × 3 AZs

  broker_node_group_info {
    instance_type  = "kafka.m5.2xlarge"
    client_subnets = data.aws_subnets.private.ids
    storage_info {
      ebs_storage_info {
        volume_size = 2000   # 2TB per broker
        provisioned_throughput {
          enabled           = true
          volume_throughput = 500
        }
      }
    }
    connectivity_info {
      vpc_connectivity {
        client_authentication {
          sasl { iam { enabled = true } }
        }
      }
    }
  }

  client_authentication {
    sasl { iam = true }
    tls {}
  }

  encryption_info {
    encryption_at_rest_kms_key_arn = aws_kms_key.data_fabric.arn
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.planetary_bus.arn
    revision = 1
  }

  open_monitoring {
    prometheus {
      jmx_exporter  { enabled_in_broker = true }
      node_exporter { enabled_in_broker = true }
    }
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = "/aws/msk/atlas-planetary-bus"
      }
      s3 {
        enabled = true
        bucket  = aws_s3_bucket.lakehouse_raw.id
        prefix  = "msk-logs/"
      }
    }
  }

  tags = { Name = "atlas-planetary-bus" }
}

resource "aws_msk_configuration" "planetary_bus" {
  kafka_versions = ["3.5.1"]
  name           = "atlas-phase2-kafka-config"

  server_properties = <<PROPERTIES
auto.create.topics.enable=false
default.replication.factor=3
min.insync.replicas=2
num.partitions=50
log.retention.hours=168
compression.type=lz4
message.max.bytes=10485760
log.cleanup.policy=delete
PROPERTIES
}

# ─── Lake Formation (Fine-grained data governance) ───────────────────────────

resource "aws_lakeformation_data_lake_settings" "atlas" {
  admins = [
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/atlas-data-admin",
    aws_iam_role.glue.arn,
  ]

  create_database_default_permissions {
    principal   = "IAM_ALLOWED_PRINCIPALS"
    permissions = []   # Deny by default — explicit grants required
  }

  create_table_default_permissions {
    principal   = "IAM_ALLOWED_PRINCIPALS"
    permissions = []
  }
}

resource "aws_lakeformation_resource" "lakehouse_curated" {
  arn      = aws_s3_bucket.lakehouse_curated.arn
  role_arn = aws_iam_role.lakeformation.arn
}

# ─── IAM Roles ────────────────────────────────────────────────────────────────

resource "aws_iam_role" "firehose" {
  name = "atlas-phase2-firehose-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "firehose.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "firehose" {
  role = aws_iam_role.firehose.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetBucketLocation", "s3:ListBucket"]
        Resource = ["${aws_s3_bucket.lakehouse_raw.arn}", "${aws_s3_bucket.lakehouse_raw.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["kinesis:GetRecords", "kinesis:GetShardIterator", "kinesis:DescribeStream", "kinesis:ListShards"]
        Resource = aws_kinesis_stream.planetary_sensors.arn
      },
      {
        Effect   = "Allow"
        Action   = ["kms:GenerateDataKey", "kms:Decrypt"]
        Resource = aws_kms_key.data_fabric.arn
      }
    ]
  })
}

resource "aws_iam_role" "glue" {
  name = "atlas-phase2-glue-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "glue.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "glue_service" {
  role       = aws_iam_role.glue.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
}

resource "aws_iam_role_policy" "glue_s3" {
  role = aws_iam_role.glue.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
      Resource = [
        "${aws_s3_bucket.lakehouse_raw.arn}/*",
        "${aws_s3_bucket.lakehouse_curated.arn}/*",
        aws_s3_bucket.lakehouse_raw.arn,
        aws_s3_bucket.lakehouse_curated.arn,
      ]
    }]
  })
}

resource "aws_iam_role" "lakeformation" {
  name = "atlas-phase2-lakeformation-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lakeformation.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role" "opensearch_master" {
  name = "atlas-phase2-opensearch-master"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "es.amazonaws.com" }
    }]
  })
}

data "aws_subnets" "private" {
  filter { name = "tag:Tier"; values = ["private"] }
}

# ─── Outputs ──────────────────────────────────────────────────────────────────

output "kinesis_sensors_arn"      { value = aws_kinesis_stream.planetary_sensors.arn }
output "timestream_database"      { value = aws_timestreamwrite_database.planetary.database_name }
output "neptune_endpoint"         { value = aws_neptune_cluster.knowledge_graph.endpoint; sensitive = true }
output "opensearch_endpoint"      { value = aws_opensearch_domain.atlas.endpoint; sensitive = true }
output "msk_bootstrap_brokers"    { value = aws_msk_cluster.planetary_bus.bootstrap_brokers_sasl_iam; sensitive = true }
output "lakehouse_raw_bucket"     { value = aws_s3_bucket.lakehouse_raw.id }
output "lakehouse_curated_bucket" { value = aws_s3_bucket.lakehouse_curated.id }
output "vector_store_bucket"      { value = aws_s3_bucket.vector_store.id }
