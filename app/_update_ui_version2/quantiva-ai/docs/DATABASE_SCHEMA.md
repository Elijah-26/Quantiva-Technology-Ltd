# Quantiva AI - Database Schema

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USERS & AUTH                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  users ──┬── user_profiles                                              │
│          ├── business_profiles ──┬── industries                         │
│          │                       └── jurisdictions                       │
│          ├── subscriptions ──────┬── plans                              │
│          │                       └── payments                            │
│          ├── sessions                                                   │
│          └── mfa_settings                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  categories ──┬── subcategories ──┬── niches                            │
│               │                    │                                    │
│  documents ──┬┴── document_versions                                    │
│              ├── document_tags ──┬── tags                               │
│              ├── document_industries                                   │
│              ├── document_jurisdictions                                │
│              ├── document_relationships                                │
│              └── document_analytics                                     │
│                                                                         │
│  generated_documents ──┬── generation_jobs                             │
│                        └── ai_prompts                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER WORKSPACE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  user_workspaces ──┬── workspace_folders                                │
│                    ├── saved_documents                                  │
│                    ├── favorites                                        │
│                    ├── downloads                                        │
│                    └── workspace_tags                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        RESEARCH & EXTENSION                              │
├─────────────────────────────────────────────────────────────────────────┤
│  research_templates ──┬── research_fields                               │
│                       └── research_papers                               │
│                                                                         │
│  extension_sessions                                                     │
│  extension_captures                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PLATFORM & ADMIN                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  notifications                                                          │
│  search_history                                                         │
│  user_activity_logs                                                     │
│  admin_actions                                                          │
│  system_settings                                                        │
│  email_templates                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Schema Definition

### 1. USERS & AUTHENTICATION

#### `users`
Primary user accounts table.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    password_hash VARCHAR(255), -- NULL for OAuth users
    auth_provider VARCHAR(50), -- 'email', 'google', 'microsoft'
    auth_provider_id VARCHAR(255), -- OAuth provider user ID
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    mfa_backup_codes TEXT[], -- Encrypted backup codes
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
    role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'super_admin'
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### `user_profiles`
Extended user profile information.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    phone VARCHAR(50),
    phone_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    job_title VARCHAR(200),
    department VARCHAR(200),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{}',
    marketing_consent BOOLEAN DEFAULT FALSE,
    marketing_consent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

#### `business_profiles`
User's business/organization information.

```sql
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    company_size VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '500+'
    business_stage VARCHAR(50), -- 'startup', 'growth', 'established', 'enterprise'
    employee_count INTEGER,
    company_website VARCHAR(500),
    company_description TEXT,
    primary_industry_id UUID REFERENCES industries(id),
    primary_subindustry_id UUID REFERENCES subindustries(id),
    niche_specialization VARCHAR(255),
    primary_jurisdiction_id UUID REFERENCES jurisdictions(id),
    additional_jurisdictions UUID[], -- Array of jurisdiction IDs
    business_goals TEXT[], -- Array of goal strings
    compliance_focus_areas TEXT[], -- Array of focus areas
    template_preferences TEXT[], -- Array of preferred template types
    research_interest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_industry ON business_profiles(primary_industry_id);
```

#### `sessions`
User session management.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

### 2. INDUSTRY CLASSIFICATION

#### `industries`
Top-level industry categories.

```sql
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_industries_slug ON industries(slug);
CREATE INDEX idx_industries_active ON industries(is_active);
```

#### `subindustries`
Industry subcategories.

```sql
CREATE TABLE subindustries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(industry_id, slug)
);

CREATE INDEX idx_subindustries_industry ON subindustries(industry_id);
CREATE INDEX idx_subindustries_slug ON subindustries(slug);
```

#### `niches`
Niche/specialization within subindustries.

```sql
CREATE TABLE niches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subindustry_id UUID NOT NULL REFERENCES subindustries(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_niches_subindustry ON niches(subindustry_id);
```

#### `jurisdictions`
Geographic jurisdictions for compliance.

```sql
CREATE TABLE jurisdictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, -- 'UK', 'US', 'EU', etc.
    name VARCHAR(200) NOT NULL,
    country_code VARCHAR(2), -- ISO 3166-1 alpha-2
    region VARCHAR(100),
    description TEXT,
    regulatory_bodies TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jurisdictions_code ON jurisdictions(code);
CREATE INDEX idx_jurisdictions_country ON jurisdictions(country_code);
```

---

### 3. DOCUMENT SYSTEM

#### `documents`
Core document templates.

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    content TEXT, -- Full template content
    document_type VARCHAR(100) NOT NULL, -- 'compliance', 'policy', 'contract', etc.
    category VARCHAR(100), -- High-level category
    
    -- Access control
    access_level VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'business', 'premium'
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    latest_version_id UUID REFERENCES documents(id),
    
    -- Source tracking
    source_type VARCHAR(50) DEFAULT 'ai', -- 'ai', 'manual', 'imported'
    generated_by_job_id UUID, -- Reference to generation job
    
    -- Metadata
    word_count INTEGER,
    estimated_read_time INTEGER, -- Minutes
    complexity_level VARCHAR(20), -- 'simple', 'moderate', 'complex'
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    generation_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    -- Review status
    review_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_revision'
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_documents_slug ON documents(slug);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_access ON documents(access_level);
CREATE INDEX idx_documents_published ON documents(is_published);
CREATE INDEX idx_documents_review ON documents(review_status);
CREATE INDEX idx_documents_created ON documents(created_at);

-- Full-text search index
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, '')));
```

#### `document_versions`
Version history for documents.

```sql
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, version)
);

CREATE INDEX idx_document_versions_document ON document_versions(document_id);
```

#### `document_industries`
Many-to-many: Documents ↔ Industries

```sql
CREATE TABLE document_industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, industry_id)
);

CREATE INDEX idx_doc_industries_document ON document_industries(document_id);
CREATE INDEX idx_doc_industries_industry ON document_industries(industry_id);
```

#### `document_subindustries`
Many-to-many: Documents ↔ Subindustries

```sql
CREATE TABLE document_subindustries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    subindustry_id UUID NOT NULL REFERENCES subindustries(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, subindustry_id)
);

CREATE INDEX idx_doc_subindustries_document ON document_subindustries(document_id);
CREATE INDEX idx_doc_subindustries_subindustry ON document_subindustries(subindustry_id);
```

#### `document_jurisdictions`
Many-to-many: Documents ↔ Jurisdictions

```sql
CREATE TABLE document_jurisdictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, jurisdiction_id)
);

CREATE INDEX idx_doc_jurisdictions_document ON document_jurisdictions(document_id);
CREATE INDEX idx_doc_jurisdictions_jurisdiction ON document_jurisdictions(jurisdiction_id);
```

#### `tags`
Document tags.

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'topic', 'regulation', 'use_case', etc.
    color VARCHAR(20),
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_category ON tags(category);
```

#### `document_tags`
Many-to-many: Documents ↔ Tags

```sql
CREATE TABLE document_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    confidence_score DECIMAL(3,2), -- AI tagging confidence
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, tag_id)
);

CREATE INDEX idx_document_tags_document ON document_tags(document_id);
CREATE INDEX idx_document_tags_tag ON document_tags(tag_id);
```

#### `document_relationships`
Related documents.

```sql
CREATE TABLE document_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    related_document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50), -- 'related', 'prerequisite', 'extension', 'alternative'
    strength_score DECIMAL(3,2), -- Similarity score
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(document_id, related_document_id)
);

CREATE INDEX idx_doc_relations_document ON document_relationships(document_id);
```

---

### 4. AI GENERATION SYSTEM

#### `generation_jobs`
AI document generation jobs.

```sql
CREATE TABLE generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL, -- 'document', 'research', 'batch'
    status VARCHAR(50) DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed', 'cancelled'
    
    -- Input parameters
    template_document_id UUID REFERENCES documents(id),
    user_id UUID REFERENCES users(id),
    parameters JSONB NOT NULL, -- Generation parameters
    
    -- Output
    output_document_id UUID REFERENCES documents(id),
    output_content TEXT,
    
    -- Processing
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- AI metadata
    model_used VARCHAR(100),
    tokens_used INTEGER,
    cost_estimate DECIMAL(10,4),
    
    -- Quality
    quality_score DECIMAL(3,2),
    confidence_score DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_generation_jobs_user ON generation_jobs(user_id);
CREATE INDEX idx_generation_jobs_template ON generation_jobs(template_document_id);
CREATE INDEX idx_generation_jobs_created ON generation_jobs(created_at);
```

#### `ai_prompts`
Reusable AI prompt templates.

```sql
CREATE TABLE ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    prompt_type VARCHAR(100), -- 'document_generation', 'section_rewrite', 'tagging', etc.
    template TEXT NOT NULL, -- Prompt template with placeholders
    variables JSONB, -- Expected variables
    model_config JSONB, -- Model parameters (temperature, max_tokens, etc.)
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    average_quality_score DECIMAL(3,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_prompts_type ON ai_prompts(prompt_type);
CREATE INDEX idx_ai_prompts_active ON ai_prompts(is_active);
```

#### `generated_documents`
User-generated document instances.

```sql
CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_document_id UUID NOT NULL REFERENCES documents(id),
    generation_job_id UUID REFERENCES generation_jobs(id),
    
    -- Content
    title VARCHAR(500),
    content TEXT NOT NULL,
    
    -- Input parameters used
    generation_parameters JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'saved', 'deleted'
    
    -- Statistics
    edit_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_edited_at TIMESTAMP
);

CREATE INDEX idx_generated_docs_user ON generated_documents(user_id);
CREATE INDEX idx_generated_docs_template ON generated_documents(template_document_id);
CREATE INDEX idx_generated_docs_status ON generated_documents(status);
CREATE INDEX idx_generated_docs_created ON generated_documents(created_at);
```

---

### 5. USER WORKSPACE

#### `workspace_folders`
User folder organization.

```sql
CREATE TABLE workspace_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES workspace_folders(id), -- For nested folders
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workspace_folders_user ON workspace_folders(user_id);
CREATE INDEX idx_workspace_folders_parent ON workspace_folders(parent_id);
```

#### `saved_documents`
Saved/generated documents in workspace.

```sql
CREATE TABLE saved_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generated_document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES workspace_folders(id),
    
    -- User customization
    custom_title VARCHAR(500),
    custom_tags TEXT[],
    notes TEXT,
    
    -- Organization
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_saved_docs_user ON saved_documents(user_id);
CREATE INDEX idx_saved_docs_folder ON saved_documents(folder_id);
CREATE INDEX idx_saved_docs_favorite ON saved_documents(is_favorite);
```

#### `downloads`
Document download history.

```sql
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generated_document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    
    -- Download details
    format VARCHAR(20) NOT NULL, -- 'pdf', 'docx', 'txt', 'markdown'
    file_size INTEGER,
    file_url TEXT,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_document ON downloads(generated_document_id);
CREATE INDEX idx_downloads_created ON downloads(created_at);
```

---

### 6. SUBSCRIPTION & BILLING

#### `plans`
Subscription plans.

```sql
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Pricing
    price_monthly DECIMAL(10,2) NOT NULL,
    price_annual DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    
    -- Features
    features JSONB NOT NULL, -- Feature list with limits
    
    -- Limits
    downloads_per_month INTEGER,
    ai_generations_per_month INTEGER,
    documents_access_level VARCHAR(20), -- 'free', 'pro', 'business', 'premium'
    storage_limit_mb INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active);
```

#### `subscriptions`
User subscriptions.

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    
    -- Subscription details
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'past_due', 'paused'
    billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'annual'
    
    -- Dates
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    -- Payment
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    
    -- Usage tracking
    downloads_used_this_period INTEGER DEFAULT 0,
    ai_generations_used_this_period INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);
```

#### `payments`
Payment transactions.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    status VARCHAR(50), -- 'succeeded', 'failed', 'pending', 'refunded'
    
    -- Stripe info
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Metadata
    description TEXT,
    failure_message TEXT,
    receipt_url TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_created ON payments(created_at);
```

#### `invoices`
Generated invoices.

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    payment_id UUID REFERENCES payments(id),
    
    -- Invoice details
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    status VARCHAR(50), -- 'draft', 'open', 'paid', 'void'
    
    -- Dates
    invoice_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    
    -- Files
    pdf_url TEXT,
    
    -- Stripe
    stripe_invoice_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
```

---

### 7. RESEARCH MODULE

#### `research_fields`
Academic research fields.

```sql
CREATE TABLE research_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES research_fields(id), -- For hierarchical fields
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_research_fields_slug ON research_fields(slug);
CREATE INDEX idx_research_fields_parent ON research_fields(parent_id);
```

#### `research_templates`
Research document templates.

```sql
CREATE TABLE research_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id), -- Link to main document if applicable
    
    -- Template details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    template_type VARCHAR(100), -- 'dissertation', 'thesis', 'proposal', etc.
    
    -- Applicability
    applicable_levels TEXT[], -- ['bachelor', 'master', 'phd']
    applicable_fields UUID[], -- Array of research_field IDs
    
    -- Structure
    structure JSONB NOT NULL, -- Document structure/outline
    
    -- Access
    access_level VARCHAR(20) DEFAULT 'free',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_research_templates_type ON research_templates(template_type);
CREATE INDEX idx_research_templates_access ON research_templates(access_level);
```

#### `research_papers`
User research papers.

```sql
CREATE TABLE research_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES research_templates(id),
    
    -- Paper details
    title VARCHAR(500),
    abstract TEXT,
    
    -- Academic info
    field_id UUID REFERENCES research_fields(id),
    education_level VARCHAR(50),
    institution VARCHAR(255),
    
    -- Content
    content TEXT,
    outline JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'in_progress', 'completed'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_research_papers_user ON research_papers(user_id);
CREATE INDEX idx_research_papers_status ON research_papers(status);
```

---

### 8. EXTENSION SYSTEM

#### `extension_sessions`
Browser extension sessions.

```sql
CREATE TABLE extension_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session details
    session_token_hash VARCHAR(255) NOT NULL,
    device_name VARCHAR(200),
    browser VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_heartbeat_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_extension_sessions_user ON extension_sessions(user_id);
CREATE INDEX idx_extension_sessions_token ON extension_sessions(session_token_hash);
```

#### `extension_captures`
Content captured via extension.

```sql
CREATE TABLE extension_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES extension_sessions(id),
    
    -- Capture details
    source_url TEXT NOT NULL,
    source_title VARCHAR(500),
    captured_content TEXT,
    content_type VARCHAR(100), -- 'webpage', 'article', 'regulation', etc.
    
    -- AI analysis
    suggested_documents UUID[], -- Array of document IDs
    ai_analysis JSONB,
    
    -- Status
    is_processed BOOLEAN DEFAULT FALSE,
    generated_document_id UUID REFERENCES generated_documents(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_extension_captures_user ON extension_captures(user_id);
CREATE INDEX idx_extension_captures_session ON extension_captures(session_id);
CREATE INDEX idx_extension_captures_created ON extension_captures(created_at);
```

---

### 9. PLATFORM FEATURES

#### `notifications`
User notifications.

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(100) NOT NULL, -- 'document_ready', 'template_recommended', 'subscription_alert', etc.
    title VARCHAR(500) NOT NULL,
    message TEXT,
    
    -- Action
    action_url TEXT,
    action_text VARCHAR(200),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

#### `search_history`
User search queries.

```sql
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Search details
    query TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER,
    
    -- Click tracking
    clicked_document_id UUID REFERENCES documents(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_query ON search_history(query);
CREATE INDEX idx_search_history_created ON search_history(created_at);
```

#### `user_activity_logs`
Activity tracking for analytics.

```sql
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type VARCHAR(100) NOT NULL, -- 'view', 'download', 'generate', 'search', etc.
    entity_type VARCHAR(100), -- 'document', 'template', etc.
    entity_id UUID,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Metadata
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON user_activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created ON user_activity_logs(created_at);
```

---

### 10. ADMIN SYSTEM

#### `admin_actions`
Admin activity log.

```sql
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    
    -- Action details
    action_type VARCHAR(100) NOT NULL, -- 'document_approve', 'user_suspend', etc.
    entity_type VARCHAR(100),
    entity_id UUID,
    
    -- Details
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_created ON admin_actions(created_at);
```

#### `system_settings`
Platform configuration.

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(200) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);
```

#### `email_templates`
Email template management.

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_templates_slug ON email_templates(slug);
```

---

## Indexes Summary

### Performance-Critical Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| users | email | Login lookups |
| documents | search | Full-text search |
| documents | type + published | Library browsing |
| generated_documents | user_id + created | User workspace |
| downloads | user_id + created | Download history |
| generation_jobs | status | Job queue processing |
| subscriptions | status + period_end | Billing jobs |

### Foreign Key Indexes

All foreign key columns have indexes for JOIN performance.

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on user-specific tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own data
CREATE POLICY user_isolation ON user_profiles
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::UUID);
```

---

## Migration Strategy

1. **Initial Migration**: Create all tables
2. **Seed Data**: Insert industries, subindustries, jurisdictions, plans
3. **Document Migration**: Import initial document templates
4. **Index Migration**: Create indexes after data load
5. **RLS Migration**: Enable RLS after initial setup

---

## Backup Strategy

- **Daily**: Full database backup
- **Hourly**: Incremental backups
- **Point-in-time**: 7-day recovery window
- **Archival**: Monthly snapshots retained for 1 year
