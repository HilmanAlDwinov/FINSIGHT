# FINSIGHT Project Tasks

Based on PRD v1.0 (Dec 17, 2024).

## Phase 1: Foundation (Week 1)
- [ ] **Project Setup**
    - [ ] Configure `docker-compose.yml` (PHP, MySQL, phpMyAdmin)
    - [ ] Create `Dockerfile` for PHP environment
    - [ ] Setup `.env` configuration
    - [ ] Verify Docker container communication

- [ ] **Database Implementation**
    - [ ] Create `migrations.sql` with all tables (Users, Wallets, Transactions, etc.)
    - [ ] Create `seeds.sql` with default categories and sample data
    - [ ] Implement `Database` class (Singleton/Connection)

- [ ] **Authentication Module**
    - [ ] Implement `User` model
    - [ ] Implement `AuthController` (Register, Login, Profile)
    - [ ] Implement JWT Middleware (`AuthMiddleware`)
    - [ ] Frontend: Login Page (`login.html` + `auth.js`)
    - [ ] Frontend: Register Page (`register.html`)

- [ ] **Core CRUD (Transactions & Wallets)**
    - [ ] Implement `WalletController` (CRUD + Transfer)
    - [ ] Implement `TransactionController` (CRUD with wallet balance update)
    - [ ] Frontend: Wallet UI (`wallets.html`)
    - [ ] Frontend: Transaction UI (`transactions.html`)

## Phase 2: Core Features (Week 2)
- [ ] **Budget Management**
    - [ ] Implement `BudgetController`
    - [ ] Logic for budget status (Active/Warning/Over)
    - [ ] Frontend: Budget UI (`budgets.html`)

- [ ] **Dashboard & Analytics**
    - [ ] Implement `DashboardController`
    - [ ] Calculate Financial Health Score
    - [ ] Backend: Monthly Cash Flow aggregation
    - [ ] Frontend: Dashboard UI with Charts (`dashboard.html`)

- [ ] **Rule-Based Insights**
    - [ ] Implement `InsightController` (Analysis Algorithms)
    - [ ] Frontend: Insights Page (`insights.html`)

## Phase 3: AI Integration (Week 2-3)
- [ ] **AI Advisor**
    - [ ] Implement `AIController` (OpenAI CLI/cURL)
    - [ ] Prompt Engineering (Context construction)
    - [ ] Frontend: Chat UI (`ai-chat.html`)

## Phase 4: Polish & Deployment (Week 3)
- [ ] **Refinement**
    - [ ] Final UI/UX Polish (Consistency, Animations)
    - [ ] Mobile Responsiveness Checks
    - [ ] Comprehensive System Testing

- [ ] **Deployment**
    - [ ] Setup DNS Configuration
        - [ ] Register/Configure domain name
        - [ ] Setup DNS A records pointing to server IP
        - [ ] Configure DNS CNAME records (www, api, etc.)
        - [ ] Setup SSL/TLS certificates (Let's Encrypt)
        - [ ] Verify DNS propagation
    - [ ] Application Deployment
        - [ ] Deploy Docker containers to production server
        - [ ] Configure reverse proxy (Nginx/Apache)
        - [ ] Setup environment variables for production
        - [ ] Configure database connection for production
        - [ ] Verify application accessibility via domain

- [ ] **Monitoring with Nagios**
    - [ ] Nagios Setup
        - [ ] Install Nagios Core on monitoring server
        - [ ] Configure Nagios web interface
        - [ ] Setup NRPE (Nagios Remote Plugin Executor) on application server
    - [ ] Service Monitoring
        - [ ] Configure HTTP/HTTPS service monitoring
        - [ ] Setup MySQL database monitoring
        - [ ] Monitor Docker container status
        - [ ] Setup PHP-FPM process monitoring
        - [ ] Configure disk space monitoring
        - [ ] Setup memory and CPU usage monitoring
    - [ ] Alerting
        - [ ] Configure email notifications for critical alerts
        - [ ] Setup alert thresholds (CPU, Memory, Disk)
        - [ ] Create escalation policies
        - [ ] Test alert notifications


Local DNS and Nagios Monitoring Setup (Containerized)
Overview
Revisiting the infrastructure to use a fully containerized approach (BIND9 + Nagios) for FINSIGHT expo/demo deployment, as inspired by the eduflip-main reference project.

Tasks
Component Setup (Containerized)
 Create BIND9 configuration (
named.conf
)
 Create BIND9 zone file (db.finsight.local)
 Create Nagios configuration (finsight.cfg)
 Update 
docker-compose.local.yml
 with dns and nagios services
Documentation Updates
 Update Local DNS setup guide (BIND9 focus)
 Update Nagios installation guide (Docker focus)
 Update main 
README.md
 for the unified stack
Verification
 Test DNS resolution via BIND9 container
 Test Nagios monitoring dashboard
 Test end-to-end setup (Expo simulation)
 Verify health endpoint integration
Cleanup
 Deprecate/Remove manual WSL2 installation scripts if no longer needed
 Update troubleshooting guides for the containerized stack
