# 🤖 ChatGPT Codex Repository Context - Lou Gehrig Fan Club

## 📁 **Repository Structure Deep Dive**

### **Source Code Architecture**

#### `/src/pages/` - Site Pages
```
├── index.astro              # Homepage
├── about.astro              # About page
├── history.astro            # Lou Gehrig history
├── news.astro               # News aggregation
├── search.astro             # Content search
├── community.astro          # Community features
├── faq.astro               # FAQ system
├── login.astro             # Authentication
├── admin/                  # Admin interface pages
├── members/                # Member-only areas
├── archive/                # Historical content
└── api/                    # API endpoints
```

#### `/src/components/` - Reusable Components
- **Layout Components**: Header, footer, navigation
- **Content Components**: Article cards, image galleries, forms
- **Interactive Components**: Search forms, voting systems, CMS widgets
- **Utility Components**: Loading states, error boundaries, modals

#### `/src/lib/` - Core Libraries
- `supabase-client.js` - Database connection management
- `auth.js` - Authentication utilities
- `content.js` - Content management helpers
- `api.js` - API interaction utilities

### **Configuration Files**

#### **Build & Development**
- `astro.config.mjs` - Astro framework configuration
- `tailwind.config.mjs` - Tailwind CSS customization
- `postcss.config.mjs` - CSS processing
- `vite.config.js` - Build tool configuration (via Astro)

#### **Code Quality**
- `.eslintrc.cjs` - ESLint rules and plugins
- `.prettierrc` - Code formatting rules
- `tsconfig.json` - TypeScript configuration (if present)

#### **Package Management**
- `package.json` - Dependencies and scripts
- `package-lock.json` - Dependency lock file
- `.nvmrc` - Node.js version specification

## 🗄️ **Database Schema & Content**

### **Supabase Tables**
Based on the repository patterns, the database likely includes:

#### **Content Tables**
- `content_items` - Main content entries (news, articles, etc.)
- `media_files` - Images, videos, documents
- `posts` - Blog posts and updates
- `milestones` - Historical events and achievements

#### **User & Community Tables**
- `users` - User profiles and authentication
- `user_votes` - Voting and engagement tracking
- `user_submissions` - User-generated content
- `faq_interactions` - FAQ usage tracking

#### **System Tables**
- `search_sessions` - Search query tracking
- `search_state` - Search automation state
- `system_health` - Application monitoring data

### **Row Level Security (RLS)**
All tables implement RLS policies for:
- **Public read access** for general content
- **Authenticated user access** for member features  
- **Admin access** for content management
- **System access** for automated processes

## 🔧 **Netlify Functions**

### **API Endpoints**
Located in `/netlify/functions/`:

#### **System Functions**
- `health-check.ts` - System health monitoring
- `test-supabase.ts` - Database connectivity testing
- `supabase-proxy.ts` - Proxy for Supabase operations

#### **Content Functions**
- `faq-click.ts` - FAQ interaction tracking
- `answer-faq.ts` - Automated FAQ responses
- `content-search.ts` - Enhanced search functionality

#### **Integration Functions**
- Email notifications via SendGrid
- External API integrations (NYT, MLB)
- Backup and monitoring utilities

## 📊 **GitHub Actions Workflows**

### **Automation Categories**

#### **Security & Compliance**
- `security-scans.yml` - CodeQL, dependency scanning, SAST
- `dependency-security-updates.yml` - Automated security patches
- `backup-audit.yml` - Database backup verification

#### **Content & Data**
- `search-cron.yml` - Automated content ingestion
- `schema-drift-detection.yml` - Database schema monitoring
- `voting-automation.yml` - User engagement automation

#### **Operations & Maintenance**  
- `backup-cleanup.yml` - Remove old backups
- `branch-audit-cleanup.yml` - Git branch management
- `git-health-check.yml` - Repository health monitoring

#### **Development Support**
- `ci.yml` - Build, test, and deploy
- `netlify-deploy-preview.yml` - Preview deployments
- `dev-bot.yml` - Development automation
- `ops-bot.yml` - Operations automation

### **Workflow Patterns**
All workflows include:
- **Error handling** with notification systems
- **Security scanning** integrated into CI/CD
- **Monitoring** with health checks and reports
- **Documentation** generation and updates

## 🌐 **External Integrations**

### **Content Sources**
- **MLB RSS Feeds** - Official baseball news
- **New York Times API** - Historical articles
- **GDELT Project** - News aggregation
- **Internet Archive** - Historical documents
- **Wikimedia Commons** - Public domain media

### **Service Providers**
- **Supabase** - Database, authentication, edge functions
- **Netlify** - Hosting, serverless functions, identity
- **SendGrid** - Email notifications and responses
- **GitHub** - Source control, CI/CD, issue tracking
- **Backblaze B2** - File storage and backup

### **Monitoring & Analytics**
- **Sentry** - Error tracking and performance monitoring
- **GitHub Actions** - Build and deployment monitoring
- **Custom health checks** - System availability monitoring
- **Security scanning** - Vulnerability detection

## 🎨 **Frontend Architecture**

### **Astro Framework Features**
- **Static Site Generation** - Fast, SEO-friendly pages
- **Component Islands** - Interactive React components
- **Partial Hydration** - Selective client-side JavaScript
- **Content Collections** - Type-safe content management

### **Styling System**
- **Tailwind CSS** - Utility-first styling
- **Custom Components** - Reusable design patterns
- **Responsive Design** - Mobile-first approach
- **Dark/Light Themes** - User preference support

### **State Management**
- **Astro Global State** - Server-side data sharing
- **React State** - Component-level interactivity
- **Supabase Realtime** - Live data updates
- **Local Storage** - User preference persistence

## 🔐 **Security Implementation**

### **Authentication Flow**
1. **Netlify Identity** - CMS and admin access
2. **Supabase Auth** - Member authentication
3. **JWT Tokens** - API authentication
4. **Session Management** - Secure token handling

### **Authorization Layers**
1. **Network Level** - CSP headers, CORS policies
2. **Application Level** - Route protection, role checking
3. **Database Level** - RLS policies, API key restrictions
4. **Function Level** - Input validation, rate limiting

### **Data Protection**
- **Encryption** - All data encrypted in transit and at rest
- **Secrets Management** - Environment variables, no hardcoded secrets
- **Input Validation** - Sanitization and type checking
- **Output Encoding** - XSS prevention

## 📱 **Content Management System**

### **Decap CMS Configuration**
Located in `/public/admin/config.yml`:

#### **Collections**
- **Posts** - Blog posts and news articles
- **Milestones** - Historical events
- **Media** - Images and documents
- **Settings** - Site configuration
- **Users** - User management (admin only)

#### **Widgets**
- **Rich Text Editor** - Markdown with WYSIWYG
- **Image Upload** - With automatic optimization
- **Date Picker** - Event and publication dates
- **Select Fields** - Categories and tags
- **Relation Fields** - Content relationships

### **Content Workflow**
1. **Draft Creation** - Authors create content
2. **Review Process** - Editorial review and approval
3. **Publication** - Automatic deployment to site
4. **Archive Management** - Content lifecycle management

## 🚀 **Deployment Pipeline**

### **Build Process**
1. **Code Push** - Trigger GitHub Actions
2. **Dependency Install** - npm install with cache
3. **Code Quality** - ESLint, Prettier checks
4. **Security Scan** - Vulnerability assessment
5. **Build Generation** - Astro static site build
6. **Deployment** - Netlify automatic deployment

### **Environment Management**
- **Production** - Main branch, full monitoring
- **Preview** - Pull request previews, testing
- **Branch Deploy** - Feature branch testing
- **Local Development** - Full feature parity

## 🔍 **Debugging & Troubleshooting**

### **Common Issues & Solutions**

#### **Build Failures**
- Check Node.js version compatibility (20.19.4)
- Verify environment variable availability
- Review dependency conflicts
- Check TypeScript errors

#### **Database Connection Issues**
- Verify Supabase URL and API key
- Check RLS policy configurations
- Review network security settings
- Test with health check endpoints

#### **CMS Access Problems**
- Verify Netlify Identity configuration
- Check user permissions and roles
- Review CMS configuration file
- Test authentication flow

#### **Deployment Issues**
- Monitor GitHub Actions logs
- Check Netlify build logs
- Verify environment variable setup
- Review function deployment status

### **Monitoring & Alerting**
- **Health Check Endpoints** - `/api/health-check`
- **Error Tracking** - Sentry integration
- **Performance Monitoring** - Core Web Vitals
- **Security Alerts** - Automated vulnerability scanning

## 📖 **Development Guidelines**

### **Code Standards**
- **ESLint Configuration** - Enforced code quality rules
- **Prettier Formatting** - Consistent code style
- **Component Architecture** - Reusable, composable components
- **Type Safety** - TypeScript where applicable

### **Git Workflow**
- **Main Branch** - Protected, production-ready code
- **Feature Branches** - Individual feature development
- **Pull Request Reviews** - Required for main branch
- **Automated Testing** - CI/CD pipeline validation

### **Documentation Requirements**
- **Code Comments** - Complex logic documentation
- **API Documentation** - Endpoint and parameter descriptions
- **Configuration Documentation** - Setup and deployment guides
- **Change Logs** - Feature and fix documentation

---

**This context provides ChatGPT Codex with comprehensive knowledge of the Lou Gehrig Fan Club repository structure, configurations, and operational patterns for effective assistance and development support.**