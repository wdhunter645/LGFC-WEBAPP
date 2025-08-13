# Decap CMS Integration

This project now includes a full Decap CMS integration for managing content through a user-friendly interface.

## 🚀 Quick Start

### Accessing the CMS
1. **Local Development**: Visit `http://localhost:4321/admin/` when running `npm run dev`
2. **Production**: Visit `https://your-site.netlify.app/admin/`

### First Time Setup
1. Go to `/admin/` on your site
2. Click "Login with Netlify Identity"
3. Check your email for the invitation link
4. Set your password and start managing content

## 📁 Content Collections

The CMS is configured with the following content collections:

### Pages
- **About Page** (`/about`) - Club information and mission
- **Privacy Policy** (`/privacy`) - Privacy policy page
- **Terms of Service** (`/terms`) - Terms of service page
- **Community Guidelines** (`/community-guidelines`) - Community rules

### Dynamic Content
- **Milestones** (`/milestones`) - Historical events and dates
- **News Articles** (`/news`) - Club news and updates
- **Events** (`/events`) - Upcoming and past events
- **Memorabilia** (`/memorabilia`) - Collection items by category
- **Photos** (`/photos`) - Photo gallery
- **Books** (`/books`) - Book reviews and recommendations

### Settings
- **Site Configuration** - Global site settings and social links

## 🛠️ Configuration Files

### CMS Configuration
- `public/admin/config.yml` - Main CMS configuration
- `public/admin/index.html` - CMS admin interface

### Content Schemas
- `src/content/config.ts` - Astro content collection schemas
- `src/content/` - Content directories for each collection

### Pages
- `src/pages/admin.astro` - Admin dashboard page
- `src/pages/milestones.astro` - Milestones display page
- `src/pages/news.astro` - News articles page
- `src/pages/events.astro` - Events page
- `src/pages/memorabilia.astro` - Memorabilia gallery
- `src/pages/photos.astro` - Photo gallery
- `src/pages/books.astro` - Books page
- `src/pages/about.astro` - Dynamic about page

## 📝 Adding New Content

### Through the CMS Interface
1. Go to `/admin/`
2. Select the collection you want to add to
3. Click "New [Collection Name]"
4. Fill in the required fields
5. Click "Publish" to save

### Content Types

#### Milestones
- **Title**: Event title
- **Date**: When it happened
- **Description**: Brief description
- **Body**: Full markdown content
- **Image**: Optional featured image
- **Tags**: Optional tags for categorization

#### News Articles
- **Title**: Article title
- **Date**: Publication date
- **Author**: Article author (defaults to "Lou Gehrig Fan Club")
- **Description**: Brief summary
- **Body**: Full article content in markdown
- **Featured Image**: Optional hero image
- **Tags**: Optional tags

#### Events
- **Title**: Event name
- **Start Date**: When the event begins
- **End Date**: Optional end date
- **Location**: Optional location
- **Description**: Brief description
- **Body**: Full details in markdown
- **Image**: Optional event image
- **External Link**: Optional link to external site
- **Is Club Event**: Checkbox for club-specific events
- **Tags**: Optional tags

#### Memorabilia
- **Title**: Item name
- **Description**: Brief description
- **Year**: Optional year
- **Category**: Select from predefined categories
- **Image**: Required item image
- **Details**: Optional detailed description
- **Tags**: Optional tags

#### Photos
- **Title**: Photo title
- **Description**: Optional description
- **Year**: Optional year taken
- **Photographer**: Optional photographer credit
- **Image**: Required photo file
- **Tags**: Optional tags

#### Books
- **Title**: Book title
- **Author**: Book author
- **Year Published**: Optional publication year
- **Description**: Brief description
- **Cover Image**: Optional book cover
- **ISBN**: Optional ISBN
- **Review**: Optional book review in markdown
- **Tags**: Optional tags

## 🔧 Customization

### Adding New Collections
1. Update `public/admin/config.yml` with new collection definition
2. Add schema to `src/content/config.ts`
3. Create content directory in `src/content/`
4. Create display page in `src/pages/`

### Modifying Fields
1. Update the collection schema in `src/content/config.ts`
2. Update the CMS configuration in `public/admin/config.yml`
3. Update any display pages that use the content

### Custom Widgets
Decap CMS supports custom widgets for specialized content types. See the [Decap CMS documentation](https://decapcms.org/docs/custom-widgets/) for more information.

## 🚀 Deployment

### Netlify Setup
1. Enable Netlify Identity in your Netlify dashboard
2. Configure registration settings (invite-only recommended)
3. Set up Git Gateway for authentication
4. Deploy your site

### Environment Variables
Ensure these are set in Netlify:
- `NETLIFY_USE_YARN=true`
- Any other environment variables your site needs

## 🔒 Security

### Authentication
- Uses Netlify Identity for user management
- Git Gateway for secure Git operations
- Role-based access control available

### Content Validation
- Schema validation on all content
- Required field enforcement
- File type and size restrictions

## 📚 Resources

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Netlify Identity](https://docs.netlify.com/visitor-access/identity/)
- [Git Gateway](https://docs.netlify.com/visitor-access/git-gateway/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)

## 🐛 Troubleshooting

### Common Issues

1. **CMS not loading**: Check that `/admin/index.html` exists and is accessible
2. **Authentication issues**: Verify Netlify Identity is enabled and configured
3. **Content not appearing**: Check that content files are in the correct directories
4. **Build errors**: Verify all schemas in `src/content/config.ts` are valid

### Local Development
- Run `npm run dev` to start the development server
- Visit `http://localhost:4321/admin/` to access the CMS
- Use `?dev=true` parameter to bypass authentication for testing

## 📈 Next Steps

1. **Set up Netlify Identity** for production authentication
2. **Configure Git Gateway** for secure content publishing
3. **Add custom widgets** for specialized content types
4. **Implement content preview** for draft content
5. **Add image optimization** for uploaded media
6. **Set up content workflows** for approval processes