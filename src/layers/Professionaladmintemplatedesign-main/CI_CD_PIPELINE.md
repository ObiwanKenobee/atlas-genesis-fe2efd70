# CI/CD Pipeline for Admin Dashboard System

## Overview
This document outlines the comprehensive CI/CD pipeline for the Admin Dashboard System, covering continuous integration, continuous deployment, monitoring, and rollback strategies.

## Pipeline Architecture

```plaintext
┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                                Development Workflow                           │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                                CI/CD Pipeline                                │
│                                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  Code        │    │  Build      │    │  Test       │    │  Deploy     │  │
│  │  Commit     │───▶│  & Package  │───▶│  & Quality  │───▶│  to Staging │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  Manual      │    │  Build      │    │  Test       │    │  Deploy     │  │
│  │  Approval    │───▶│  & Package  │───▶│  & Quality  │───▶│  to Prod    │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                                Monitoring & Alerting                         │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│                                Rollback & Recovery                           │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Tools and Technologies

### CI/CD Platform
- **GitHub Actions**: Primary CI/CD platform
- **GitHub Secrets**: Secure storage for credentials
- **GitHub Environments**: Environment management

### Build Tools
- **Node.js**: JavaScript runtime
- **npm/yarn/pnpm**: Package managers
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

### Testing Tools
- **Jest**: Unit and integration testing
- **Cypress**: End-to-end testing
- **k6**: Performance testing
- **SonarQube**: Code quality analysis

### Deployment Tools
- **Docker Hub**: Container registry
- **AWS ECS/EKS**: Container orchestration
- **AWS S3**: Static asset hosting
- **AWS CloudFront**: CDN
- **Terraform**: Infrastructure as Code

### Monitoring Tools
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **ELK Stack**: Logging (Elasticsearch, Logstash, Kibana)
- **Sentry**: Error tracking
- **Datadog**: APM and infrastructure monitoring

## Pipeline Configuration

### GitHub Actions Workflow

Create a workflow file at `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: 18
  DOCKER_IMAGE: yourusername/admin-dashboard
  AWS_REGION: us-east-1
  ECR_REPOSITORY: admin-dashboard

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier
        run: npm run format:check

  unit-tests:
    name: Run Unit Tests
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage report
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/

  integration-tests:
    name: Run Integration Tests
    needs: unit-tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: admin_dashboard_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/admin_dashboard_test
          JWT_SECRET: test-secret
        run: npm run test:integration

  e2e-tests:
    name: Run E2E Tests
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Start backend server
        run: npm run start:backend:test &

      - name: Wait for backend to be ready
        run: sleep 10

      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          start: npm run start:frontend:test
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120

  performance-tests:
    name: Run Performance Tests
    needs: e2e-tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Start backend server
        run: npm run start:backend:test &

      - name: Wait for backend to be ready
        run: sleep 10

      - name: Run performance tests
        run: npm run test:performance

      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-results/

  code-quality:
    name: Code Quality Analysis
    needs: performance-tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run SonarQube analysis
        uses: SonarSource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

  build-and-push:
    name: Build and Push Docker Image
    needs: code-quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ env.DOCKER_IMAGE }}:latest
            ${{ env.DOCKER_IMAGE }}:${{ github.sha }}
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:latest
            ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}

  deploy-staging:
    name: Deploy to Staging
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.admindashboard.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ecs-staging-task-definition.json
          service: admin-dashboard-staging-service
          cluster: admin-dashboard-staging-cluster
          wait-for-service-stability: true

      - name: Run smoke tests
        run: npm run test:smoke:staging

      - name: Notify Slack
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_COLOR: good
          SLACK_TITLE: 'Staging Deployment Successful'
          SLACK_MESSAGE: 'Admin Dashboard deployed to staging environment'

  deploy-production:
    name: Deploy to Production
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://admindashboard.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Wait for manual approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ secrets.MANUAL_APPROVAL_SECRET }}
          approvers: admin1,admin2
          minimum-approvals: 1
          issue-title: 'Production Deployment Approval'
          issue-body: 'Please approve deployment to production'

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ecs-production-task-definition.json
          service: admin-dashboard-production-service
          cluster: admin-dashboard-production-cluster
          wait-for-service-stability: true

      - name: Run smoke tests
        run: npm run test:smoke:production

      - name: Notify Slack
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_COLOR: good
          SLACK_TITLE: 'Production Deployment Successful'
          SLACK_MESSAGE: 'Admin Dashboard deployed to production environment'

  rollback:
    name: Rollback Deployment
    if: failure()
    needs: [deploy-staging, deploy-production]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Determine environment
        id: determine-env
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "environment=production" >> $GITHUB_OUTPUT
          else
            echo "environment=staging" >> $GITHUB_OUTPUT
          fi

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Rollback deployment
        run: |
          if [[ "${{ steps.determine-env.outputs.environment }}" == "production" ]]; then
            aws ecs update-service --cluster admin-dashboard-production-cluster --service admin-dashboard-production-service --force-new-deployment
          else
            aws ecs update-service --cluster admin-dashboard-staging-cluster --service admin-dashboard-staging-service --force-new-deployment
          fi

      - name: Notify Slack
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_COLOR: danger
          SLACK_TITLE: 'Deployment Failed - Rollback Initiated'
          SLACK_MESSAGE: 'Admin Dashboard deployment failed and rollback was initiated'

  notify:
    name: Notification
    if: always()
    needs: [lint, unit-tests, integration-tests, e2e-tests, performance-tests, code-quality, build-and-push, deploy-staging, deploy-production]
    runs-on: ubuntu-latest
    steps:
      - name: Determine overall status
        id: determine-status
        run: |
          if [[ "${{ needs.lint.result }}" == "failure" || "${{ needs.unit-tests.result }}" == "failure" || "${{ needs.integration-tests.result }}" == "failure" || "${{ needs.e2e-tests.result }}" == "failure" || "${{ needs.performance-tests.result }}" == "failure" || "${{ needs.code-quality.result }}" == "failure" || "${{ needs.build-and-push.result }}" == "failure" ]]; then
            echo "status=failure" >> $GITHUB_OUTPUT
            echo "message=CI/CD Pipeline Failed" >> $GITHUB_OUTPUT
            echo "color=danger" >> $GITHUB_OUTPUT
          else
            echo "status=success" >> $GITHUB_OUTPUT
            echo "message=CI/CD Pipeline Completed Successfully" >> $GITHUB_OUTPUT
            echo "color=good" >> $GITHUB_OUTPUT
          fi

      - name: Notify Slack
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_COLOR: ${{ steps.determine-status.outputs.color }}
          SLACK_TITLE: ${{ steps.determine-status.outputs.message }}
          SLACK_MESSAGE: 'Pipeline status: ${{ steps.determine-status.outputs.status }}'

      - name: Send email notification
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: 'CI/CD Pipeline Status: ${{ steps.determine-status.outputs.status }}'
          body: 'The CI/CD pipeline has completed with status: ${{ steps.determine-status.outputs.status }}'
          to: team@admindashboard.com
          from: ci-cd@admindashboard.com

  cleanup:
    name: Cleanup
    if: always()
    needs: notify
    runs-on: ubuntu-latest
    steps:
      - name: Remove old Docker images
        run: |
          docker system prune -a -f
          docker volume prune -f

      - name: Cleanup npm cache
        run: npm cache clean --force

      - name: Remove temporary files
        run: rm -rf node_modules coverage performance-results

## Environment Configuration

### Development Environment

```yaml
# .env.development
database:
  url: postgresql://localhost:5432/admin_dashboard_dev
  username: postgres
  password: postgres

api:
  port: 3001
  base_url: http://localhost:3001/api
  jwt_secret: dev-secret-key
  jwt_expiration: 3600
  refresh_token_expiration: 86400

frontend:
  base_url: http://localhost:3000
  api_base_url: http://localhost:3001/api

logging:
  level: debug
  format: pretty

rate_limiting:
  enabled: false
```

### Staging Environment

```yaml
# .env.staging
database:
  url: postgresql://staging-db:5432/admin_dashboard_staging
  username: staging_user
  password: staging_password

api:
  port: 3001
  base_url: https://staging.api.admindashboard.com/api
  jwt_secret: staging-secret-key
  jwt_expiration: 3600
  refresh_token_expiration: 86400

frontend:
  base_url: https://staging.admindashboard.com
  api_base_url: https://staging.api.admindashboard.com/api

logging:
  level: info
  format: json

rate_limiting:
  enabled: true
  window: 15
  max_requests: 100

monitoring:
  prometheus_enabled: true
  prometheus_port: 9090
```

### Production Environment

```yaml
# .env.production
database:
  url: postgresql://prod-db:5432/admin_dashboard_prod
  username: prod_user
  password: prod_password

api:
  port: 3001
  base_url: https://api.admindashboard.com/api
  jwt_secret: prod-secret-key
  jwt_expiration: 3600
  refresh_token_expiration: 86400

frontend:
  base_url: https://admindashboard.com
  api_base_url: https://api.admindashboard.com/api

logging:
  level: warn
  format: json

rate_limiting:
  enabled: true
  window: 15
  max_requests: 500

monitoring:
  prometheus_enabled: true
  prometheus_port: 9090
  datadog_enabled: true
  datadog_api_key: your-datadog-api-key

scaling:
  min_instances: 2
  max_instances: 10
  cpu_threshold: 70
  memory_threshold: 80
```

## Infrastructure as Code

### Terraform Configuration

Create a Terraform configuration file at `infrastructure/main.tf`:

```hcl
terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }

    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket = "admin-dashboard-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  
  tags = {
    Name = "admin-dashboard-vpc"
  }
}

resource "aws_subnet" "public" {
  count = 2

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index}.0/24"
  availability_zone = "us-east-1${count.index == 0 ? 'a' : 'b'}"
  
  tags = {
    Name = "admin-dashboard-public-subnet-${count.index}"
  }
}

resource "aws_subnet" "private" {
  count = 2

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 2}.0/24"
  availability_zone = "us-east-1${count.index == 0 ? 'a' : 'b'}"
  
  tags = {
    Name = "admin-dashboard-private-subnet-${count.index}"
  }
}

# Security Groups
resource "aws_security_group" "ecs" {
  name        = "admin-dashboard-ecs-sg"
  description = "Security group for ECS services"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "admin-dashboard-ecs-sg"
  }
}

resource "aws_security_group" "rds" {
  name        = "admin-dashboard-rds-sg"
  description = "Security group for RDS database"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "admin-dashboard-rds-sg"
  }
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier             = "admin-dashboard-db"
  engine                 = "postgres"
  engine_version         = "14.5"
  instance_class         = "db.t3.medium"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp2"
  
  db_name              = "admin_dashboard"
  username             = "admin"
  password             = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  publicly_accessible    = false
  skip_final_snapshot    = true
  backup_retention_period = 7
  
  tags = {
    Name = "admin-dashboard-db"
  }
}

resource "aws_db_subnet_group" "main" {
  name       = "admin-dashboard-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "admin-dashboard-db-subnet-group"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "admin-dashboard-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "admin-dashboard-cluster"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "api" {
  family                   = "admin-dashboard-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "admin-dashboard-api"
      image     = "${aws_ecr_repository.api.repository_url}:latest"
      essential = true
      
      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "DATABASE_URL"
          value = "postgresql://${aws_db_instance.postgres.username}:${var.db_password}@${aws_db_instance.postgres.endpoint}:5432/${aws_db_instance.postgres.db_name}"
        },
        {
          name  = "JWT_SECRET"
          value = var.jwt_secret
        },
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "admin-dashboard-api-task"
  }
}

# ECS Service
resource "aws_ecs_service" "api" {
  name            = "admin-dashboard-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "admin-dashboard-api"
    container_port   = 3001
  }

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  tags = {
    Name = "admin-dashboard-api-service"
  }
}

# Load Balancer
resource "aws_lb" "main" {
  name               = "admin-dashboard-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ecs.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "admin-dashboard-lb"
  }
}

resource "aws_lb_target_group" "api" {
  name        = "admin-dashboard-api-tg"
  port        = 3001
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path                = "/api/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }

  tags = {
    Name = "admin-dashboard-api-tg"
  }
}

resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# CloudWatch Logs
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/admin-dashboard-api"
  retention_in_days = 30

  tags = {
    Name = "admin-dashboard-api-logs"
  }
}

# IAM Roles
resource "aws_iam_role" "ecs_task_execution" {
  name = "admin-dashboard-ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "admin-dashboard-ecs-task-execution"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name = "admin-dashboard-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "admin-dashboard-ecs-task"
  }
}

resource "aws_iam_role_policy" "ecs_task" {
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Outputs
output "api_url" {
  value = "https://${aws_lb.main.dns_name}"
}

output "database_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.api.name
}
```

### Deployment Scripts

Create a deployment script at `scripts/deploy.sh`:

```bash
#!/bin/bash

# Deployment script for Admin Dashboard System

set -e

# Load environment variables
if [ "$ENVIRONMENT" = "production" ]; then
  source .env.production
elif [ "$ENVIRONMENT" = "staging" ]; then
  source .env.staging
else
  source .env.development
fi

# Function to deploy backend
deploy_backend() {
  echo "Deploying backend to $ENVIRONMENT..."
  
  # Build Docker image
  docker build -t admin-dashboard-backend -f Dockerfile.backend .
  
  # Tag and push to registry
  docker tag admin-dashboard-backend $REGISTRY_URL/admin-dashboard-backend:$VERSION
  docker push $REGISTRY_URL/admin-dashboard-backend:$VERSION
  
  # Deploy to ECS
  aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --force-new-deployment \
    --region $AWS_REGION
  
  echo "Backend deployed successfully!"
}

# Function to deploy frontend
deploy_frontend() {
  echo "Deploying frontend to $ENVIRONMENT..."
  
  # Build frontend
  npm run build:frontend
  
  # Deploy to S3
  aws s3 sync dist/ s3://$S3_BUCKET_NAME \
    --delete \
    --cache-control "max-age=31536000,public"
  
  # Invalidate CloudFront cache
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"
  
  echo "Frontend deployed successfully!"
}

# Function to run database migrations
deploy_database() {
  echo "Running database migrations..."
  
  # Run migrations
  npm run migrate:up
  
  echo "Database migrations completed!"
}

# Function to run smoke tests
run_smoke_tests() {
  echo "Running smoke tests..."
  
  # Run smoke tests
  npm run test:smoke
  
  echo "Smoke tests passed!"
}

# Main deployment function
deploy() {
  echo "Starting deployment to $ENVIRONMENT..."
  
  # Deploy database first
  deploy_database
  
  # Deploy backend
  deploy_backend
  
  # Deploy frontend
  deploy_frontend
  
  # Run smoke tests
  run_smoke_tests
  
  echo "Deployment to $ENVIRONMENT completed successfully!"
}

# Parse command line arguments
while getopts "e:v:" opt; do
  case $opt in
    e) ENVIRONMENT=$OPTARG ;;
    v) VERSION=$OPTARG ;;
    *) echo "Usage: $0 -e environment -v version" >&2
       exit 1 ;;
  esac
done

# Set default values
ENVIRONMENT=${ENVIRONMENT:-development}
VERSION=${VERSION:-latest}

# Execute deployment
deploy
```

## Monitoring and Alerting

### Prometheus Configuration

Create a Prometheus configuration file at `monitoring/prometheus.yml`:

```yaml
# Global configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

# Rule files
rule_files:
  - "alerts.yml"

# Scrape configurations
scrape_configs:
  # Scrape Prometheus itself
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  # Scrape API service
  - job_name: "api-service"
    metrics_path: "/api/metrics"
    static_configs:
      - targets: ["api:3001"]
    basic_auth:
      username: "prometheus"
      password: "${PROMETHEUS_PASSWORD}"

  # Scrape Node Exporter
  - job_name: "node-exporter"
    static_configs:
      - targets: ["node-exporter:9100"]

  # Scrape PostgreSQL Exporter
  - job_name: "postgres-exporter"
    static_configs:
      - targets: ["postgres-exporter:9187"]

  # Scrape Redis Exporter
  - job_name: "redis-exporter"
    static_configs:
      - targets: ["redis-exporter:9121"]

  # Scrape Docker containers
  - job_name: "docker"
    static_configs:
      - targets: ["docker-exporter:9323"]

  # Scrape AWS ECS
  - job_name: "ecs"
    ecs_sd_configs:
      - region: us-east-1
        access_key: "${AWS_ACCESS_KEY_ID}"
        secret_key: "${AWS_SECRET_ACCESS_KEY}"
        cluster_name: "admin-dashboard-cluster"
    relabel_configs:
      - source_labels: [__meta_ecs_task_arn]
        regex: ".*"
        target_label: task_arn
      - source_labels: [__meta_ecs_container_name]
        regex: ".*"
        target_label: container_name
```

### Alert Rules

Create an alert rules file at `monitoring/alerts.yml`:

```yaml
groups:
  - name: api-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[1m]) / rate(http_requests_total[1m]) > 0.1
        for: 5m
        labels:
          severity: critical
          service: api
        annotations:
          summary: "High error rate on API service"
          description: "Error rate is {{ $value }} (10% threshold)"

      # High latency
      - alert: HighLatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
        for: 5m
        labels:
          severity: warning
          service: api
        annotations:
          summary: "High latency on API service"
          description: "95th percentile latency is {{ $value }}s (1s threshold)"

      # Service down
      - alert: ServiceDown
        expr: up{job="api-service"} == 0
        for: 1m
        labels:
          severity: critical
          service: api
        annotations:
          summary: "API service is down"
          description: "API service has been down for more than 1 minute"

  - name: database-alerts
    rules:
      # High database connections
      - alert: HighDatabaseConnections
        expr: pg_stat_activity_count > 100
        for: 5m
        labels:
          severity: warning
          service: database
        annotations:
          summary: "High database connections"
          description: "Database connections are at {{ $value }} (100 threshold)"

      # High query time
      - alert: HighQueryTime
        expr: pg_stat_statements_avg_time > 1
        for: 5m
        labels:
          severity: warning
          service: database
        annotations:
          summary: "High database query time"
          description: "Average query time is {{ $value }}s (1s threshold)"

  - name: infrastructure-alerts
    rules:
      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
          service: infrastructure
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}% (80% threshold)"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
          service: infrastructure
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}% (85% threshold)"

      # Low disk space
      - alert: LowDiskSpace
        expr: node_filesystem_free_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100 < 20
        for: 5m
        labels:
          severity: critical
          service: infrastructure
        annotations:
          summary: "Low disk space"
          description: "Disk space is {{ $value }}% (20% threshold)"

  - name: business-alerts
    rules:
      # Low user activity
      - alert: LowUserActivity
        expr: rate(user_logins_total[1h]) < 10
        for: 1h
        labels:
          severity: warning
          service: business
        annotations:
          summary: "Low user activity"
          description: "User logins are at {{ $value }} per hour (10 threshold)"

      # High failed logins
      - alert: HighFailedLogins
        expr: rate(failed_logins_total[5m]) > 5
        for: 5m
        labels:
          severity: warning
          service: business
        annotations:
          summary: "High failed login attempts"
          description: "Failed logins are at {{ $value }} per 5 minutes (5 threshold)"
```

### Grafana Dashboards

Create a Grafana dashboard configuration at `monitoring/grafana-dashboard.json`:

```json
{
  "__inputs": [
    {
      "name": "DS_PROMETHEUS",
      "label": "Prometheus",
      "description": "",
      "type": "datasource",
      "pluginId": "prometheus",
      "pluginName": "Prometheus"
    }
  ],
  "__requires": [
    {
      "type": "grafana",
      "id": "grafana",
      "name": "Grafana",
      "version": "8.0.0"
    },
    {
      "type": "panel",
      "id": "graph",
      "name": "Graph",
      "version": ""
    },
    {
      "type": "datasource",
      "id": "prometheus",
      "name": "Prometheus",
      "version": "1.0.0"
    }
  ],
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "${DS_PROMETHEUS}",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 2,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "8.0.0",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "rate(http_requests_total[1m])",
          "interval": "",
          "legendFormat": "Requests per second",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeRegions": [],
      "title": "API Request Rate",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "mode": "time",
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "short",
          "logBase": 1,
          "show": true
        },
        {
          "format": "short",
          "logBase": 1,
          "show": true
        }
      ],
      "yaxis": {
        "align": false
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "${DS_PROMETHEUS}",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 4,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "8.0.0",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))",
          "interval": "",
          "legendFormat": "95th percentile",
          "refId": "A"
        },
        {
          "expr": "histogram_quantile(0.5, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))",
          "interval": "",
          "legendFormat": "50th percentile",
          "refId": "B"
        }
      ],
      "thresholds": [],
      "timeRegions": [],
      "title": "API Response Time",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "mode": "time",
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "s",
          "logBase": 1,
          "show": true
        },
        {
          "format": "s",
          "logBase": 1,
          "show": true
        }
      ],
      "yaxis": {
        "align": false
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "${DS_PROMETHEUS}",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 8
      },
      "hiddenSeries": false,
      "id": 6,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "8.0.0",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "rate(http_requests_total{status=~"5.."}[1m])",
          "interval": "",
          "legendFormat": "5xx errors",
          "refId": "A"
        },
        {
          "expr": "rate(http_requests_total{status=~"4.."}[1m])",
          "interval": "",
          "legendFormat": "4xx errors",
          "refId": "B"
        }
      ],
      "thresholds": [],
      "timeRegions": [],
      "title": "API Error Rate",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "mode": "time",
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "short",
          "logBase": 1,
          "show": true
        },
        {
          "format": "short",
          "logBase": 1,
          "show": true
        }
      ],
      "yaxis": {
        "align": false
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "${DS_PROMETHEUS}",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 8
      },
      "hiddenSeries": false,
      "id": 8,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "8.0.0",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "pg_stat_activity_count",
          "interval": "",
          "legendFormat": "Database connections",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeRegions": [],
      "title": "Database Connections",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "mode": "time",
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "short",
          "logBase": 1,
          "show": true
        },
        {
          "format": "short",
          "logBase": 1,
          "show": true
        }
      ],
      "yaxis": {
        "align": false
      }
    }
  ],
  "refresh": "5s",
  "schemaVersion": 30,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {
    "refresh_intervals": [
      "5s",
      "10s",
      "30s",
      "1m",
      "5m",
      "15m",
      "30m",
      "1h",
      "2h",
      "1d"
    ],
    "time_options": [
      "5m",
      "15m",
      "1h",
      "6h",
      "12h",
      "24h",
      "2d",
      "7d",
      "30d"
    ]
  },
  "timezone": "",
  "title": "Admin Dashboard - API Monitoring",
  "uid": "api-monitoring",
  "version": 1
}
```

### Logging Configuration

Create a logging configuration file at `monitoring/logging-config.json`:

```json
{
  "logLevel": "info",
  "logFormat": "json",
  "logOutput": ["console", "file"],
  "logFile": "/var/log/admin-dashboard/api.log",
  "maxFileSize": "100m",
  "maxFiles": "10",
  "logRotation": "daily",
  "logCompression": true,
  "logSources": {
    "api": {
      "enabled": true,
      "level": "info"
    },
    "database": {
      "enabled": true,
      "level": "warn"
    },
    "auth": {
      "enabled": true,
      "level": "info"
    },
    "performance": {
      "enabled": true,
      "level": "debug"
    }
  },
  "logFilters": {
    "sensitiveData": {
      "enabled": true,
      "patterns": [
        "password",
        "token",
        "secret",
        "creditCard",
        "ssn"
      ]
    }
  },
  "logRetention": {
    "console": "7d",
    "file": "30d",
    "database": "90d"
  },
  "logAlerts": {
    "errorThreshold": 10,
    "warningThreshold": 50,
    "notificationChannels": ["email", "slack", "pagerduty"]
  }
}
```

## Rollback Strategy

### Automated Rollback

```yaml
# .github/workflows/rollback.yml
name: Automated Rollback

on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types: [completed]

jobs:
  check-deployment:
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Determine environment
        id: determine-env
        run: |
          if [[ "${{ github.event.workflow_run.head_branch }}" == "main" ]]; then
            echo "environment=production" >> $GITHUB_OUTPUT
          else
            echo "environment=staging" >> $GITHUB_OUTPUT
          fi

      - name: Get previous successful deployment
        id: get-previous-deployment
        run: |
          PREVIOUS_DEPLOYMENT=$(aws deploy list-deployments \
            --application-name admin-dashboard \
            --deployment-group-name ${{ steps.determine-env.outputs.environment }} \
            --status-filter Succeeded \
            --max-items 1 \
            --query "deployments[0].deploymentId" \
            --output text)
          echo "previous_deployment=$PREVIOUS_DEPLOYMENT" >> $GITHUB_OUTPUT

      - name: Trigger rollback
        run: |
          aws deploy create-deployment \
            --application-name admin-dashboard \
            --deployment-group-name ${{ steps.determine-env.outputs.environment }} \
            --revision {
              "revisionType": "S3",
              "s3Location": {
                "bucket": "admin-dashboard-deployments",
                "key": "${{ steps.get-previous-deployment.outputs.previous_deployment }}.zip",
                "bundleType": "zip"
              }
            }

      - name: Notify team
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_COLOR: danger
          SLACK_TITLE: 'Automated Rollback Initiated'
          SLACK_MESSAGE: 'Rollback to previous deployment initiated for ${{ steps.determine-env.outputs.environment }} environment'
```

### Manual Rollback Procedure

```bash
#!/bin/bash

# Manual rollback script

set -e

# Parse command line arguments
while getopts "e:v:" opt; do
  case $opt in
    e) ENVIRONMENT=$OPTARG ;;
    v) VERSION=$OPTARG ;;
    *) echo "Usage: $0 -e environment -v version" >&2
       exit 1 ;;
  esac
done

# Set default values
ENVIRONMENT=${ENVIRONMENT:-staging}
VERSION=${VERSION:-previous}

# Function to rollback database
rollback_database() {
  echo "Rolling back database..."
  
  # Get previous migration
  PREVIOUS_MIGRATION=$(npm run migrate:status | grep "↓" | tail -1 | awk '{print $2}')
  
  # Rollback migration
  npm run migrate:down $PREVIOUS_MIGRATION
  
  echo "Database rollback completed!"
}

# Function to rollback backend
rollback_backend() {
  echo "Rolling back backend to $VERSION..."
  
  # Get previous Docker image
  if [ "$VERSION" = "previous" ]; then
    PREVIOUS_IMAGE=$(aws ecr describe-images \
      --repository-name admin-dashboard-backend \
      --query 'sort_by(imageDetails,& imagePushedAt)[-2].imageTags[0]' \
      --output text)
  else
    PREVIOUS_IMAGE=$VERSION
  fi
  
  # Update ECS service with previous image
  aws ecs update-service \
    --cluster admin-dashboard-$ENVIRONMENT-cluster \
    --service admin-dashboard-$ENVIRONMENT-service \
    --force-new-deployment \
    --region us-east-1
  
  echo "Backend rollback completed!"
}

# Function to rollback frontend
rollback_frontend() {
  echo "Rolling back frontend to $VERSION..."
  
  # Get previous frontend version
  if [ "$VERSION" = "previous" ]; then
    PREVIOUS_VERSION=$(aws s3 ls s3://admin-dashboard-frontend-$ENVIRONMENT/ \
      --recursive | grep "index.html" | sort | tail -2 | head -1 | awk '{print $4}')
  else
    PREVIOUS_VERSION=$VERSION
  fi
  
  # Restore previous frontend version
  aws s3 cp s3://admin-dashboard-frontend-$ENVIRONMENT/$PREVIOUS_VERSION/ s3://admin-dashboard-frontend-$ENVIRONMENT/ \
    --recursive \
    --exclude "*" \
    --include "index.html" \
    --include "static/*"
  
  # Invalidate CloudFront cache
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"
  
  echo "Frontend rollback completed!"
}

# Main rollback function
rollback() {
  echo "Starting rollback for $ENVIRONMENT environment..."
  
  # Rollback database first
  rollback_database
  
  # Rollback backend
  rollback_backend
  
  # Rollback frontend
  rollback_frontend
  
  echo "Rollback for $ENVIRONMENT environment completed successfully!"
}

# Execute rollback
rollback
```

## Security Considerations

### Secrets Management
- Use AWS Secrets Manager or HashiCorp Vault for sensitive data
- Rotate secrets regularly
- Never commit secrets to version control
- Use IAM roles for AWS permissions

### Infrastructure Security
- Enable VPC flow logs
- Use security groups and network ACLs
- Enable encryption at rest and in transit
- Implement regular security patches

### Monitoring Security
- Monitor for unauthorized access attempts
- Set up alerts for unusual activity
- Regularly audit IAM permissions
- Implement least privilege principle

## Performance Optimization

### Caching Strategies
- Implement Redis caching for frequent queries
- Use CDN for static assets
- Implement browser caching headers
- Cache API responses where appropriate

### Database Optimization
- Implement connection pooling
- Optimize queries with proper indexing
- Use read replicas for read-heavy workloads
- Implement query caching

### Auto-scaling
- Configure ECS auto-scaling based on CPU/memory usage
- Implement database read replicas
- Use SQS for background job processing
- Implement circuit breakers

## Cost Optimization

### Resource Management
- Use spot instances for non-critical workloads
- Implement auto-scaling to reduce idle resources
- Use reserved instances for predictable workloads
- Monitor and optimize resource usage

### Monitoring Costs
- Set up cost alerts in AWS
- Use cost allocation tags
- Regularly review and optimize costs
- Implement budget limits

## Disaster Recovery

### Backup Strategy
- Daily database backups with 30-day retention
- Weekly full system backups
- Regular backup validation
- Offsite backup storage

### Recovery Plan
- Documented recovery procedures
- Regular disaster recovery drills
- Clear communication plan
- Prioritized recovery of critical services

## Maintenance

### Regular Maintenance Tasks
- Database maintenance (vacuum, analyze)
- Log rotation and cleanup
- Dependency updates
- Security patching

### Maintenance Windows
- Scheduled maintenance windows
- Clear communication with users
- Rollback plan for failed maintenance
- Post-maintenance verification

## Conclusion

This comprehensive CI/CD pipeline provides a robust framework for deploying, monitoring, and maintaining the Admin Dashboard System. It includes:

1. **Continuous Integration**: Automated testing and quality checks
2. **Continuous Deployment**: Automated deployment to staging and production
3. **Monitoring**: Comprehensive monitoring with Prometheus and Grafana
4. **Alerting**: Proactive alerting for issues
5. **Rollback**: Automated and manual rollback procedures
6. **Security**: Best practices for infrastructure security
7. **Performance**: Optimization strategies for scalability
8. **Disaster Recovery**: Backup and recovery procedures

By implementing this pipeline, we ensure reliable, secure, and efficient deployment and operation of the Admin Dashboard System.