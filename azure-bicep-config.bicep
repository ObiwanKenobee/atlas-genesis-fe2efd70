// Atlas Genesis Azure Infrastructure as Code using Bicep

param location string = resourceGroup().location
param environment string = 'production'
param frontendAppName string = 'atlas-genesis-frontend'
param backendAppName string = 'atlas-genesis-backend'
param databaseServerName string = 'atlas-genesis-db'
param databaseName string = 'atlas_genesis'
param keyVaultName string = 'atlas-genesis-kv'
param cdnProfileName string = 'atlas-genesis-cdn'
param cdnEndpointName string = 'atlas-genesis-frontend'
param appInsightsName string = 'atlas-genesis-insights'
param containerRegistryName string = 'atlasgenesisregistry'

// Resource Group Tags
var tags = {
  environment: environment
  project: 'atlas-genesis'
  createdBy: 'bicep-deployment'
}

// 1. Azure Database for PostgreSQL
resource databaseServer 'Microsoft.DBforPostgreSQL/servers@2017-12-01' = {
  name: databaseServerName
  location: location
  tags: tags
  sku: {
    name: 'GP_Gen5_4'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 4
  }
  properties: {
    administratorLogin: 'atlasadmin'
    administratorLoginPassword: databaseAdminPassword
    version: '12'
    sslEnforcement: 'Enabled'
    minimalTlsVersion: 'TLS1_2'
    storageProfile: {
      backupRetentionDays: 35
      geoRedundantBackup: 'Enabled'
      storageMB: 10240
      storageAutogrow: 'Enabled'
    }
    createMode: 'Default'
  }
}

resource database 'Microsoft.DBforPostgreSQL/servers/databases@2017-12-01' = {
  name: '${databaseServerName}/${databaseName}'
  dependsOn: [
    databaseServer
  ]
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

resource firewallRule 'Microsoft.DBforPostgreSQL/servers/firewallRules@2017-12-01' = {
  name: '${databaseServerName}/AllowAllAzureIPs'
  dependsOn: [
    databaseServer
  ]
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// 2. Azure Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2019-09-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    tenantId: subscription().tenantId
    sku: {
      name: 'standard'
      family: 'A'
    }
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: userObjectId
        permissions: {
          keys: [
            'get'
            'list'
            'create'
            'delete'
            'backup'
            'restore'
            'import'
            'update'
            'recover'
          ]
          secrets: [
            'get'
            'list'
            'set'
            'delete'
            'backup'
            'restore'
            'recover'
          ]
          certificates: [
            'get'
            'list'
            'delete'
            'create'
            'import'
            'update'
            'deleteissuers'
            'getissuers'
            'listissuers'
            'managecontacts'
            'setissuers'
          ]
        }
      }
    ]
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enableRbacAuthorization: false
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// 3. Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    retentionInDays: 90
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    workspaceResourceId: ''
    ImmediatePurgeDataOn30Days: false
  }
}

// 4. Container Apps Environment
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: '${backendAppName}-logs'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2022-03-01' = {
  name: '${backendAppName}-env'
  location: location
  tags: tags
  dependsOn: [
    logAnalyticsWorkspace
  ]
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: listKeys(logAnalyticsWorkspace.id, '2021-12-01-preview').primarySharedKey
      }
    }
  }
}

// 5. Container App (Backend)
resource backendContainerApp 'Microsoft.App/containerApps@2022-03-01' = {
  name: backendAppName
  location: location
  tags: tags
  dependsOn: [
    containerAppEnvironment
  ]
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      secrets: [
        {
          name: 'database-password'
          value: databaseAdminPassword
        }
        {
          name: 'jwt-access-secret'
          value: jwtAccessSecret
        }
        {
          name: 'jwt-refresh-secret'
          value: jwtRefreshSecret
        }
        {
          name: 'sendgrid-api-key'
          value: sendgridApiKey
        }
        {
          name: 'paystack-secret-key'
          value: paystackSecretKey
        }
      ]
      ingress: {
        external: true
        targetPort: 4000
        transport: 'auto'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: '${containerRegistryName}.azurecr.io/backend:latest'
          resources: {
            cpu: 0.5
            memory: '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '4000'
            }
            {
              name: 'FRONTEND_URL'
              value: 'https://${frontendAppName}.azurewebsites.net'
            }
            {
              name: 'DATABASE_URL'
              value: 'postgresql://atlasadmin:${databaseAdminPassword}@${databaseServerName}.postgres.database.azure.com:5432/${databaseName}?sslmode=require'
            }
            {
              name: 'JWT_ACCESS_SECRET'
              secretRef: 'jwt-access-secret'
            }
            {
              name: 'JWT_REFRESH_SECRET'
              secretRef: 'jwt-refresh-secret'
            }
            {
              name: 'SENDGRID_API_KEY'
              secretRef: 'sendgrid-api-key'
            }
            {
              name: 'PAYSTACK_SECRET_KEY'
              secretRef: 'paystack-secret-key'
            }
            {
              name: 'CORS_ORIGIN'
              value: 'https://${frontendAppName}.azurewebsites.net'
            }
            {
              name: 'LOG_LEVEL'
              value: 'info'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// 6. App Service Plan and Frontend
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: 'atlas-genesis-plan'
  location: location
  tags: tags
  sku: {
    name: 'P1v2'
    tier: 'PremiumV2'
    size: 'P1v2'
    family: 'Pv2'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    perSiteScaling: false
    elasticScaleEnabled: false
    maximumElasticWorkerCount: 1
    isSpot: false
    isXenon: false
    hyperV: false
    reserved: true
  }
}

resource frontendAppService 'Microsoft.Web/sites@2022-03-01' = {
  name: frontendAppName
  location: location
  tags: tags
  dependsOn: [
    appServicePlan
  ]
  kind: 'app,linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      alwaysOn: true
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      cors: {
        allowedOrigins: [
          'https://${backendContainerApp.properties.configuration.ingress.fqdn}'
        ]
        supportCredentials: false
      }
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'VITE_API_URL'
          value: 'https://${backendContainerApp.properties.configuration.ingress.fqdn}/api'
        }
        {
          name: 'VITE_SUPABASE_URL'
          value: supabaseUrl
        }
        {
          name: 'VITE_SUPABASE_ANON_KEY'
          value: supabaseAnonKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
    httpsOnly: true
  }
}

// 7. Azure CDN
resource cdnProfile 'Microsoft.Cdn/profiles@2021-06-01' = {
  name: cdnProfileName
  location: location
  tags: tags
  sku: {
    name: 'Standard_Microsoft'
  }
  properties: {
    profileName: cdnProfileName
  }
}

resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2021-06-01' = {
  name: '${cdnProfileName}/${cdnEndpointName}'
  location: location
  tags: tags
  dependsOn: [
    cdnProfile
  ]
  sku: {
    name: 'Standard_Microsoft'
  }
  properties: {
    isHttpAllowed: true
    isHttpsAllowed: true
    isCompressionEnabled: true
    queryStringCachingBehavior: 'IgnoreQueryString'
    contentTypesToCompress: [
      'text/plain'
      'text/html'
      'text/css'
      'application/x-javascript'
      'application/javascript'
      'application/json'
      'application/xml'
      'application/xml+rss'
      'image/svg+xml'
    ]
    origins: [
      {
        name: 'appservice-origin'
        properties: {
          hostName: '${frontendAppName}.azurewebsites.net'
          httpPort: 80
          httpsPort: 443
          originType: 'AzureStorage'
          priority: 1
          weight: 1000
        }
      }
    ]
    originHostHeader: '${frontendAppName}.azurewebsites.net'
    isOriginHttps: true
    defaultOriginGroup: {
      name: 'defaultorigin'
      properties: {
        origins: [
          {
            name: 'appservice-origin'
            properties: {
              hostName: '${frontendAppName}.azurewebsites.net'
              httpPort: 80
              httpsPort: 443
              originType: 'AzureStorage'
              priority: 1
              weight: 1000
            }
          }
        ]
        healthProbeSettings: {
          probeRequestType: 'HEAD'
          probeProtocol: 'Https'
          probePath: '/'
          probeIntervalInSeconds: 100
        }
      }
    }
  }
}

// 8. Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2021-12-01-preview' = {
  name: containerRegistryName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    networkRuleSet: {
      defaultAction: 'Allow'
    }
    policies: {
      quarantinePolicy: {
        status: 'disabled'
      }
      trustPolicy: {
        status: 'disabled'
        type: 'Notary'
      }
      retentionPolicy: {
        status: 'disabled'
        days: 7
      }
    }
  }
}

// Outputs
output frontendUrl string = 'https://${frontendAppName}.azurewebsites.net'
output backendUrl string = 'https://${backendContainerApp.properties.configuration.ingress.fqdn}'
output cdnUrl string = 'https://${cdnEndpointName}.azureedge.net'
output databaseConnectionString string = 'postgresql://atlasadmin:${databaseAdminPassword}@${databaseServerName}.postgres.database.azure.com:5432/${databaseName}?sslmode=require'
output keyVaultUri string = keyVault.properties.vaultUri
output appInsightsConnectionString string = appInsights.properties.ConnectionString

// Parameters (these would be provided during deployment)
@description('Database administrator password')
@secure()
param databaseAdminPassword string

@description('JWT access secret')
@secure()
param jwtAccessSecret string

@description('JWT refresh secret')
@secure()
param jwtRefreshSecret string

@description('SendGrid API key')
@secure()
param sendgridApiKey string

@description('Paystack secret key')
@secure()
param paystackSecretKey string

@description('Supabase URL')
param supabaseUrl string

@description('Supabase anonymous key')
@secure()
param supabaseAnonKey string

@description('User object ID for Key Vault access')
param userObjectId string