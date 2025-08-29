# 🤖 GitHub Copilot Instructions for LGFC-WEBAPP

## 📋 Project Context

**Lou Gehrig Fan Club Web Application** - A modern web application built with Astro.js and Supabase, dedicated to honoring Lou Gehrig's legacy and supporting the ALS community.

### 🏗️ Architecture Overview
- **Frontend**: Astro.js with React components and Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, real-time features)
- **Authentication**: JWT-based with anonymous and authenticated sessions
- **Content Management**: Decap CMS for editorial workflows
- **Deployment**: Netlify with GitHub Actions CI/CD
- **Styling**: Tailwind CSS with custom design system

### 📁 Key Directory Structure
```
src/
├── components/           # React components (.jsx)
├── content/             # Content collections (Astro)
├── layouts/             # Layout components (.astro)
├── lib/                 # Utilities and clients
├── pages/               # Route pages (.astro)
└── styles/              # Global styles and CSS

public/
├── admin/               # Decap CMS configuration
└── (static assets)

supabase/
├── migrations/          # Database migrations
└── schema/              # Schema backups

scripts/
├── ingest.mjs          # Content ingestion
├── check_migrations.mjs # Migration verification
└── (automation scripts)
```

## 🎯 Development Guidelines

### 1. Context Retention & Session Management
- **ALWAYS** maintain user session context across interactions
- Never lose track of active PRs, branches, or workflow state
- Reference recent commits and changes when making suggestions
- Ask for clarification if context is missing rather than assuming

### 2. Code Quality Standards
- Follow existing patterns and conventions in the codebase
- Use TypeScript/JSDoc annotations where applicable
- Maintain consistent formatting with Prettier and ESLint
- Write descriptive commit messages and PR descriptions

### 3. Authentication & Security Patterns
- **JWT Authentication**: Use `createClient()` from `src/lib/supabase-client.js`
- **Environment Variables**: Reference hardcoded fallbacks in client code
- **RLS Policies**: Ensure database operations respect Row Level Security
- **Session Handling**: Use `autoRefreshToken: true` and appropriate persistence

### 4. Database Operations
- **Tables**: `search_state`, `content_items`, `media_files`, `search_sessions`
- **Migrations**: Always create timestamped migration files
- **Backup Strategy**: Manual exports with date-based filenames
- **Testing**: Use diagnostic scripts before deploying database changes

## 🔧 Technical Implementation Patterns

### Supabase Client Usage
```javascript
// Standard client initialization
import { createClient } from '../lib/supabase-client.js';
const supabase = createClient();

// Authentication pattern
const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

// Database queries with RLS
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .limit(10);
```

### Astro Component Patterns
```astro
---
// Frontmatter with TypeScript types
import BaseLayout from "../layouts/BaseLayout.astro";
const { title, description } = Astro.props;
---

<BaseLayout title={title} description={description}>
  <!-- Component content -->
</BaseLayout>
```

### Content Collection Schema
```typescript
// Use Zod schemas for type safety
import { defineCollection, z } from 'astro:content';

const collection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
  }),
});
```

## 🚀 Workflow & Automation

### GitHub Actions Workflows
- **CI/CD**: Build, lint, and deploy on push to main
- **Content Ingestion**: Automated RSS feed processing
- **Database Backups**: Daily, weekly, and monthly snapshots
- **Traffic Simulation**: JWT-based continuous activity

### Development Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run format       # Code formatting
npm run ingest       # Content ingestion
```

### Deployment Pipeline
1. **GitHub**: Source code and version control
2. **GitHub Actions**: Automated testing and builds
3. **Netlify**: Static site hosting and deployment
4. **Supabase**: Backend services and database

## 📝 Content Management

### Decap CMS Integration
- **Admin Interface**: `/admin/` route for content editing
- **Collections**: Milestones, events, news, photos, books, memorabilia
- **Authentication**: Netlify Identity with Git Gateway
- **File Management**: Media uploads and organization

### Content Types & Schemas
- **Milestones**: Historical events with dates and descriptions
- **Events**: Club events and ALS community activities
- **News**: Articles and updates with rich content
- **Photos**: Image galleries with metadata and voting
- **Books**: Library resources with reviews and ratings

## 🔍 Troubleshooting & Maintenance

### Common Issues
1. **Authentication Errors**: Check JWT token validity and RLS policies
2. **Database Connection**: Verify environment variables and migrations
3. **Build Failures**: Review dependency conflicts and TypeScript errors
4. **Migration Issues**: Use diagnostic scripts and manual verification

### Diagnostic Commands
```bash
# Test database connection
node scripts/check_migrations.mjs

# Test content ingestion
node scripts/ingest.mjs "Lou Gehrig" 10

# Verify Supabase configuration
npm run build && node scripts/test_connection.mjs
```

### Migration Safety
- Always backup schema before major changes
- Test migrations in development environment first
- Use RLS policies to maintain security during updates
- Document breaking changes and rollback procedures

## 🎨 Design System & UI Guidelines

### Color Scheme
- **Primary**: Slate-based neutral palette
- **Accent**: Yankees-inspired navy blue
- **Background**: Clean white with subtle slate tints
- **Interactive**: Hover states with opacity and color transitions

### Typography
- **Headings**: Playfair Display for elegance
- **Body**: Inter for readability
- **Code**: Monospace with syntax highlighting

### Component Patterns
- **Responsive Design**: Mobile-first approach with Tailwind utilities
- **Accessibility**: ARIA labels and semantic HTML
- **Loading States**: Graceful loading indicators
- **Error Handling**: User-friendly error messages

## 📊 Performance & Optimization

### Build Optimization
- **Static Generation**: Pre-render all possible routes
- **Image Optimization**: Responsive images with appropriate formats
- **Code Splitting**: Lazy load components where beneficial
- **Bundle Analysis**: Monitor bundle size and dependencies

### Database Performance
- **Indexing**: Optimize queries with appropriate indexes
- **Caching**: Use Supabase edge caching where applicable
- **Connection Pooling**: Manage database connections efficiently
- **Query Optimization**: Write efficient SQL and use EXPLAIN plans

## 🔐 Security Best Practices

### Authentication Security
- **JWT Expiration**: Implement appropriate token lifetimes
- **Session Management**: Secure session storage and cleanup
- **CORS Configuration**: Restrict origins appropriately
- **API Rate Limiting**: Implement reasonable rate limits

### Data Protection
- **RLS Enforcement**: All database operations through RLS policies
- **Input Validation**: Sanitize and validate all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Escape user-generated content

## 🎯 Project-Specific Guidelines

### Lou Gehrig Fan Club Context
- **Historical Accuracy**: Verify all historical content and dates
- **ALS Awareness**: Maintain sensitivity around ALS-related content
- **Community Focus**: Prioritize features that build community engagement
- **Legacy Preservation**: Ensure content preservation and accessibility

### Content Guidelines
- **Fact-Checking**: Verify historical claims and statistics
- **Image Rights**: Use only properly licensed images
- **Community Contributions**: Moderate user-generated content appropriately
- **Educational Value**: Prioritize content that educates about Lou Gehrig and ALS

## 🚦 Development Workflow

### Branch Strategy
- **Main Branch**: Production-ready code only
- **Feature Branches**: Individual features and fixes
- **Hotfix Branches**: Critical production fixes
- **Development Branch**: Integration testing (if needed)

### Code Review Process
1. **Self Review**: Test locally and verify functionality
2. **Automated Checks**: Ensure CI/CD passes
3. **Peer Review**: Request review from team members
4. **Documentation**: Update relevant documentation
5. **Deployment**: Merge and monitor deployment

### Issue Management
- **Bug Reports**: Include reproduction steps and environment details
- **Feature Requests**: Provide use cases and acceptance criteria
- **Documentation**: Update docs with new features and changes
- **Testing**: Include test cases for new functionality

---

## 📞 Support & Resources

### Key Documentation Files
- `README.md` - Project overview and setup
- `CMS_README.md` - Content management system guide
- `RLS_IMPLEMENTATION_GUIDE.md` - Database security setup
- Various migration guides - JWT, Supabase, and authentication updates

### External Resources
- [Astro Documentation](https://docs.astro.build/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Decap CMS Documentation](https://decapcms.org/docs/)

### Environment Configuration
- **Supabase URL**: `https://vkwhrbjkdznncjkzkiuo.supabase.co`
- **Anon Key**: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs`
- **Development Mode**: Add `?dev=true` to bypass auth checks

---

**Remember**: Always maintain context, ask for clarification when uncertain, and prioritize the user's active workflow and session state. Focus on incremental improvements that align with the project's mission of honoring Lou Gehrig's legacy while building a supportive community around ALS awareness.