# 🤖 ChatGPT Codex Instructions - Lou Gehrig Fan Club Web Application

## 🎯 **Mission Statement**
You are the lead development assistant for the Lou Gehrig Fan Club web application. You have **full access** to this repository and its integrated services (Netlify, Supabase). You are responsible for understanding, maintaining, and enhancing all aspects of the codebase.

## 📋 **Full System Overview**

### **Technology Stack**
- **Frontend**: Astro 4 (static site generation) + Tailwind CSS + React islands
- **Backend**: Supabase (PostgreSQL database, authentication, edge functions)
- **Hosting**: Netlify (static hosting, serverless functions, environment variables)
- **CMS**: Decap CMS with Netlify Identity for content management
- **Build Tools**: Vite, PostCSS, ESLint, Prettier
- **Package Manager**: npm

### **Repository Structure**
```
/
├── src/                    # Main application source
│   ├── pages/             # Astro pages and routes
│   ├── components/        # Reusable React/Astro components
│   ├── lib/              # Utility libraries and configurations
│   └── content/          # Content collections for CMS
├── public/               # Static assets
│   └── admin/           # Decap CMS admin interface
├── netlify/             # Netlify Functions
│   └── functions/       # Serverless API endpoints
├── supabase/            # Supabase configurations
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
├── .github/             # GitHub Actions workflows
│   └── workflows/       # Automated processes (15+ workflows)
├── scripts/             # Utility and automation scripts
└── *.config.*          # Various tool configurations
```

## 🔐 **Access & Authentication Systems**

### **Supabase Integration**
- **URL**: `https://vkwhrbjkdznncjkzkiuo.supabase.co`
- **Public API Key**: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs` (safe for frontend)
- **Client Types**: 
  - `createClient()` - Browser client for standard operations
  - `createServerClient()` - Server-side with cookie management
  - `createJWTClient()` - JWT-based authentication for automation
- **Key Files**: `src/lib/supabase-client.js`, `supabase.ts`

### **Netlify Configuration**
- **Environment Variables**: Fully configured in `netlify.toml`
- **Functions**: Health checks, Supabase proxy, FAQ handling
- **Deployment**: Automatic builds from main branch
- **Key Files**: `netlify.toml`, `netlify/functions/`

### **Environment Variables**
All environments (production, preview, branch-deploy) have:
```bash
# Supabase (multiple naming conventions for compatibility)
SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
SUPABASE_PUBLIC_API_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs
PUBLIC_SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs
VITE_SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs

# Service Keys (placeholders - need real values in production)
SUPABASE_SERVICE_ROLE_KEY=sb_service_role_key_placeholder_for_faq_clicks
SENDGRID_API_KEY=sendgrid_api_key_placeholder
SENDGRID_FROM=noreply@lougehrigfanclub.com
```

## 🛠️ **Development Workflows**

### **Local Development**
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm test           # Run tests
```

### **Content Management**
- **CMS Access**: `/admin/` (Decap CMS interface)
- **Content Types**: Posts, milestones, assets, media, Q&A
- **Authentication**: Netlify Identity integration
- **Content Location**: `src/content/` directory

### **Database Operations**
- **Migration Scripts**: `scripts/check_migrations.mjs`
- **Content Ingestion**: `scripts/ingest.mjs`
- **Search Automation**: GitHub Actions cron job
- **Schema Monitoring**: Automated drift detection

## 🔄 **GitHub Actions Workflows**

### **Security & Maintenance**
- `security-scans.yml` - Daily security scans and vulnerability detection
- `dependency-security-updates.yml` - Automated dependency updates
- `backup-audit.yml` - Database backup verification
- `backup-cleanup.yml` - Cleanup old backups
- `schema-drift-detection.yml` - Monitor database schema changes

### **Development & Deployment**
- `ci.yml` - Build and test automation
- `netlify-deploy-preview.yml` - Manual deployment automation
- `search-cron.yml` - Content ingestion automation
- `voting-automation.yml` - User engagement automation

### **Operations & Monitoring**
- `branch-audit-cleanup.yml` - Branch management
- `git-health-check.yml` - Repository health monitoring
- `ops-bot.yml` & `ops-bot-daily-report.yml` - Operational automation
- `dev-bot.yml` & `dev-bot-daily-plan.yml` - Development automation

## 📊 **API Endpoints & Functions**

### **Netlify Functions**
- `/api/health-check` - System health monitoring
- `/api/test-supabase` - Database connectivity testing
- `/api/supabase/*` - Proxy for Supabase operations
- `/api/faq-click` - FAQ interaction tracking
- `/api/answer-faq` - Automated FAQ responses

### **Supabase Edge Functions**
- Content search and aggregation
- Data processing and analysis
- External API integrations (NYT, MLB, etc.)

## 🎨 **Frontend Architecture**

### **Page Structure**
- **Main Pages**: Home, about, history, news, search, community
- **Member Areas**: Login-protected content and features  
- **Admin Interface**: Content management and moderation
- **Archive Sections**: Library, photos, memorabilia

### **Component System**
- **Astro Components**: Static, server-rendered components
- **React Islands**: Interactive client-side components
- **Tailwind CSS**: Utility-first styling system
- **Responsive Design**: Mobile-first approach

### **Content Collections**
- **Posts**: Blog posts and news articles
- **Milestones**: Historical events and achievements
- **Media**: Photos, videos, and documents
- **Q&A**: Frequently asked questions

## 🔒 **Security Configuration**

### **Headers & CSP**
```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https://*.supabase.co https://*.supabase.in; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
```

### **Access Control**
- **Row Level Security (RLS)**: Enabled on all Supabase tables
- **JWT Authentication**: For automated processes
- **Netlify Identity**: For CMS access
- **Environment Isolation**: Separate configs for prod/preview/branch

### **Vulnerability Management**
- **Daily Scans**: Automated security scanning
- **Dependency Updates**: Automated with testing
- **Code Quality**: ESLint + Prettier enforcement
- **Secret Management**: No secrets in repository

## 💡 **How to Engage with Codex**

### **Development Tasks**
- `@copilot add new feature [description]` - Implement new functionality
- `@copilot fix bug [description]` - Debug and resolve issues
- `@copilot optimize [component/function]` - Performance improvements
- `@copilot refactor [code section]` - Code quality improvements

### **Content & CMS**
- `@copilot add content type [type]` - New content collection
- `@copilot update CMS config` - Modify admin interface
- `@copilot create page [page name]` - New site pages
- `@copilot modify content schema` - Change content structure

### **Infrastructure & DevOps**
- `@copilot update workflow [workflow name]` - GitHub Actions changes
- `@copilot configure environment [service]` - Environment setup
- `@copilot deploy feature [description]` - Deployment assistance
- `@copilot monitor system [aspect]` - Monitoring and alerting

### **Database & Backend**
- `@copilot create migration [description]` - Database changes
- `@copilot add API endpoint [endpoint]` - New API functionality
- `@copilot optimize query [query]` - Database performance
- `@copilot update RLS policies` - Security rule changes

### **Security & Compliance**
- `@copilot review security [aspect]` - Security assessment
- `@copilot update security headers` - CSP and header configuration
- `@copilot audit dependencies` - Dependency security review
- `@copilot implement security feature` - Security enhancements

## 📚 **Documentation & Resources**

### **Key Documentation Files**
- `lou_gehrig_fan_club_master_build_v5.md` - Complete project documentation
- `NETLIFY_SUPABASE_SETUP.md` - Integration setup guide
- `API_KEY_CONFIGURATION.md` - Environment variable guide
- `CMS_README.md` - Content management system guide
- `NETLIFY_ENV_VARS_GUIDE.md` - Comprehensive environment setup

### **Troubleshooting Guides**
- Environment variable configuration issues
- Supabase connection problems
- Build and deployment failures
- CMS authentication issues
- GitHub Actions workflow problems

## 🚀 **Deployment & Monitoring**

### **Deployment Pipeline**
1. **Code Push** → GitHub repository
2. **Automated Testing** → GitHub Actions CI
3. **Build Process** → Astro static generation
4. **Deployment** → Netlify hosting
5. **Monitoring** → Health checks and reports

### **Monitoring Systems**
- **Health Endpoints**: Continuous system monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Lighthouse CI integration
- **Security**: Daily vulnerability scans
- **Backup**: Automated database backups

## ⚠️ **Important Notes**

### **Security Considerations**
- **Never commit secrets** - Use environment variables
- **Validate all inputs** - Prevent injection attacks  
- **Use RLS policies** - Database-level security
- **Regular security audits** - Automated and manual
- **Keep dependencies updated** - Security patches

### **Development Best Practices**
- **Follow existing patterns** - Maintain consistency
- **Write tests** - Ensure reliability
- **Document changes** - Update relevant docs
- **Use TypeScript** - Type safety where possible
- **Optimize performance** - Static generation benefits

### **Emergency Contacts & Procedures**
- **Repository Owner**: wdhunter645
- **Critical Issues**: Create issue with `critical` label
- **Security Issues**: Use security advisory process
- **Deployment Issues**: Check GitHub Actions logs
- **Database Issues**: Review Supabase dashboard

---

**You have complete access to this repository and all its integrated services. Use this knowledge to provide comprehensive, accurate assistance for any aspect of the Lou Gehrig Fan Club web application.**