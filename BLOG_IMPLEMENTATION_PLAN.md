# Blog Implementation Plan for BuyIreland.com

## Overview
Add a blog section to improve SEO, share Irish culture content, customer stories, and establish authority in the Irish land/heritage niche.

---

## 1. Content Strategy

### Blog Topics & Categories

**Categories:**
1. **Irish Heritage** - History, culture, traditions
2. **Customer Stories** - Testimonials, land visits, experiences
3. **Travel Guides** - Visiting your plot, Ireland travel tips
4. **Company News** - Updates, new locations, announcements
5. **Irish Culture** - Holidays, recipes, traditions, language

**Example Post Ideas:**
- "How to Find Your Irish Land Plot: A Complete Guide"
- "Customer Spotlight: The Johnsons Visit Their County Roscommon Plot"
- "10 Irish Traditions to Celebrate St. Patrick's Day"
- "The History of County Roscommon: Your Land's Heritage"
- "Planning Your First Trip to Ireland: What You Need to Know"
- "Why Owning Irish Land Makes the Perfect Wedding Gift"

---

## 2. Database Schema (SQLite)

```sql
-- Blog Posts Table
CREATE TABLE blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    category TEXT,
    author TEXT DEFAULT 'BuyIreland Team',
    status TEXT DEFAULT 'draft', -- draft, published, archived
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT -- comma-separated or JSON
);

-- Blog Categories Table
CREATE TABLE blog_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    post_count INTEGER DEFAULT 0
);

-- Blog Comments Table (optional)
CREATE TABLE blog_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, spam
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id)
);

-- Indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
```

---

## 3. Frontend Structure

### File Organization
```
Frontend/
├── blog.html              (Blog listing page)
├── blog-post.html         (Single post template)
├── blog-category.html     (Category archive)
├── css/
│   └── blog.css          (Blog-specific styles)
├── js/
│   └── blog.js           (Blog interactions)
└── images/
    └── blog/             (Blog post images)
        ├── featured/
        └── inline/
```

---

## 4. URL Structure (SEO-Friendly)

```
/blog                           → Blog home (listing)
/blog/irish-heritage            → Category archive
/blog/2026/01/post-slug         → Individual post
/blog/tag/st-patricks-day       → Tag archive
/blog/author/john-beckett       → Author archive
/blog/search?q=ireland          → Search results
```

---

## 5. Flask Backend Routes

```python
from flask import Flask, render_template, request, abort
from datetime import datetime
import sqlite3

# Blog listing page
@app.route('/blog')
@app.route('/blog/page/<int:page>')
def blog_index(page=1):
    per_page = 10
    offset = (page - 1) * per_page

    conn = sqlite3.connect('buyireland.db')
    cursor = conn.cursor()

    # Get published posts
    cursor.execute('''
        SELECT id, title, slug, excerpt, featured_image,
               category, published_at, views
        FROM blog_posts
        WHERE status = 'published'
        ORDER BY published_at DESC
        LIMIT ? OFFSET ?
    ''', (per_page, offset))

    posts = cursor.fetchall()

    # Get total count for pagination
    cursor.execute('SELECT COUNT(*) FROM blog_posts WHERE status = "published"')
    total_posts = cursor.fetchone()[0]
    total_pages = (total_posts + per_page - 1) // per_page

    conn.close()

    return render_template('blog.html',
                         posts=posts,
                         page=page,
                         total_pages=total_pages)

# Single blog post
@app.route('/blog/<int:year>/<int:month>/<slug>')
def blog_post(year, month, slug):
    conn = sqlite3.connect('buyireland.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, title, content, featured_image, category,
               author, published_at, views, meta_title, meta_description
        FROM blog_posts
        WHERE slug = ? AND status = 'published'
    ''', (slug,))

    post = cursor.fetchone()

    if not post:
        abort(404)

    # Increment view count
    cursor.execute('UPDATE blog_posts SET views = views + 1 WHERE slug = ?', (slug,))
    conn.commit()

    # Get related posts
    cursor.execute('''
        SELECT id, title, slug, excerpt, featured_image, published_at
        FROM blog_posts
        WHERE category = ? AND slug != ? AND status = 'published'
        ORDER BY published_at DESC
        LIMIT 3
    ''', (post[4], slug))

    related_posts = cursor.fetchall()

    conn.close()

    return render_template('blog-post.html',
                         post=post,
                         related_posts=related_posts)

# Category archive
@app.route('/blog/category/<category_slug>')
def blog_category(category_slug):
    conn = sqlite3.connect('buyireland.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT id, title, slug, excerpt, featured_image, published_at
        FROM blog_posts
        WHERE category = ? AND status = 'published'
        ORDER BY published_at DESC
    ''', (category_slug,))

    posts = cursor.fetchall()
    conn.close()

    return render_template('blog-category.html',
                         posts=posts,
                         category=category_slug)
```

---

## 6. Admin Interface Options

### Option A: Simple Admin Panel (Custom Built)
```python
@app.route('/admin/blog/new', methods=['GET', 'POST'])
@login_required  # Add authentication
def admin_new_post():
    if request.method == 'POST':
        title = request.form['title']
        slug = request.form['slug'].lower().replace(' ', '-')
        content = request.form['content']
        # ... save to database

    return render_template('admin/blog-new.html')
```

### Option B: Use Flask-Admin
```python
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

admin = Admin(app, name='BuyIreland Admin')
admin.add_view(ModelView(BlogPost, db.session))
```

### Option C: Headless CMS
- **Strapi** (Node.js) - Free, open-source
- **Ghost** (Node.js) - Blog-focused CMS
- **Directus** (PHP/Node) - Flexible headless CMS

### Option D: Static Site Generator (Recommended for simplicity)
- Write posts in Markdown
- Use Python-Markdown to convert
- No complex admin needed

---

## 7. Frontend Templates

### Blog Listing Page Structure
```html
<!-- blog.html -->
<section class="page-header">
    <h1>Our Blog</h1>
    <p>Stories, tips, and insights about Irish heritage</p>
</section>

<section class="blog-section">
    <div class="container">
        <div class="blog-grid">
            <!-- Featured post (first post) -->
            <article class="blog-featured">
                <img src="..." alt="...">
                <span class="category-badge">Irish Heritage</span>
                <h2>Post Title</h2>
                <p class="excerpt">...</p>
                <div class="post-meta">
                    <span class="date">Jan 2, 2026</span>
                    <span class="read-time">5 min read</span>
                </div>
            </article>

            <!-- Regular posts -->
            <article class="blog-card">...</article>
            <article class="blog-card">...</article>
        </div>

        <!-- Pagination -->
        <div class="pagination">
            <a href="/blog/page/1">1</a>
            <a href="/blog/page/2" class="active">2</a>
            <a href="/blog/page/3">3</a>
        </div>
    </div>

    <!-- Sidebar -->
    <aside class="blog-sidebar">
        <div class="widget">
            <h3>Categories</h3>
            <ul>
                <li><a href="/blog/category/irish-heritage">Irish Heritage</a></li>
                <li><a href="/blog/category/customer-stories">Customer Stories</a></li>
            </ul>
        </div>

        <div class="widget">
            <h3>Recent Posts</h3>
            <!-- Recent posts list -->
        </div>

        <div class="widget">
            <h3>Newsletter</h3>
            <form class="newsletter-form">
                <input type="email" placeholder="Your email">
                <button type="submit">Subscribe</button>
            </form>
        </div>
    </aside>
</section>
```

### Single Post Structure
```html
<!-- blog-post.html -->
<article class="blog-post-single">
    <header class="post-header">
        <span class="category-badge">Irish Heritage</span>
        <h1>Post Title Goes Here</h1>
        <div class="post-meta">
            <span class="author">By John Beckett</span>
            <span class="date">January 2, 2026</span>
            <span class="read-time">5 min read</span>
            <span class="views">1,234 views</span>
        </div>
    </header>

    <img src="..." alt="..." class="featured-image">

    <div class="post-content">
        <!-- Rich content with typography styles -->
        <p>...</p>
        <h2>Subheading</h2>
        <p>...</p>
        <blockquote>...</blockquote>
    </div>

    <footer class="post-footer">
        <div class="tags">
            <a href="/blog/tag/ireland">#ireland</a>
            <a href="/blog/tag/heritage">#heritage</a>
        </div>

        <div class="share-buttons">
            <a href="..." class="share-facebook">Share on Facebook</a>
            <a href="..." class="share-twitter">Share on Twitter</a>
            <a href="..." class="share-email">Share via Email</a>
        </div>
    </footer>

    <!-- Author bio -->
    <div class="author-bio">
        <img src="..." alt="John Beckett">
        <div>
            <h3>About John Beckett</h3>
            <p>Co-founder of BuyIreland.com...</p>
        </div>
    </div>

    <!-- Related posts -->
    <section class="related-posts">
        <h2>You May Also Like</h2>
        <div class="related-grid">
            <article class="blog-card">...</article>
            <article class="blog-card">...</article>
            <article class="blog-card">...</article>
        </div>
    </section>

    <!-- Comments (optional) -->
    <section class="comments">
        <h2>Comments</h2>
        <!-- Comment form and list -->
    </section>
</article>
```

---

## 8. SEO Optimization

### Meta Tags for Blog Posts
```html
<head>
    <title>{{ post.meta_title or post.title }} | BuyIreland Blog</title>
    <meta name="description" content="{{ post.meta_description or post.excerpt }}">

    <!-- Open Graph (Facebook) -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="{{ post.title }}">
    <meta property="og:description" content="{{ post.excerpt }}">
    <meta property="og:image" content="{{ post.featured_image }}">
    <meta property="og:url" content="{{ request.url }}">
    <meta property="article:published_time" content="{{ post.published_at }}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ post.title }}">
    <meta name="twitter:description" content="{{ post.excerpt }}">
    <meta name="twitter:image" content="{{ post.featured_image }}">

    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "{{ post.title }}",
        "image": "{{ post.featured_image }}",
        "datePublished": "{{ post.published_at }}",
        "author": {
            "@type": "Person",
            "name": "{{ post.author }}"
        },
        "publisher": {
            "@type": "Organization",
            "name": "BuyIreland.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://buyireland.com/images/logo.png"
            }
        }
    }
    </script>
</head>
```

### XML Sitemap Addition
```xml
<!-- Add to sitemap.xml -->
<url>
    <loc>https://buyireland.com/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
</url>
{% for post in blog_posts %}
<url>
    <loc>https://buyireland.com/blog/{{ post.year }}/{{ post.month }}/{{ post.slug }}</loc>
    <lastmod>{{ post.updated_at }}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
</url>
{% endfor %}
```

---

## 9. Simple Markdown-Based Approach (Recommended)

This avoids complex admin interfaces - just write posts in Markdown files.

```
blog/
├── posts/
│   ├── 2026-01-15-how-to-find-your-plot.md
│   ├── 2026-01-10-customer-story-johnsons.md
│   └── 2026-01-05-irish-traditions.md
└── images/
    └── ...
```

**Post Format (Front Matter + Markdown):**
```markdown
---
title: "How to Find Your Irish Land Plot: A Complete Guide"
slug: how-to-find-your-plot
date: 2026-01-15
category: Travel Guides
author: John Beckett
excerpt: "Step-by-step instructions for locating and visiting your one square foot of Irish countryside."
featured_image: /images/blog/find-plot.jpg
tags: travel, guides, county-roscommon
---

# How to Find Your Irish Land Plot

So you've purchased your one square foot of Irish countryside - congratulations! Now you're probably wondering: how do I actually find it?

## Getting There

County Roscommon is located in...

[Rest of content in Markdown]
```

**Python Script to Convert:**
```python
import markdown
import frontmatter
from pathlib import Path

def load_blog_posts():
    posts = []
    post_dir = Path('blog/posts')

    for post_file in sorted(post_dir.glob('*.md'), reverse=True):
        with open(post_file, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
            posts.append({
                'title': post['title'],
                'slug': post['slug'],
                'content': markdown.markdown(post.content),
                'date': post['date'],
                'category': post['category'],
                'excerpt': post['excerpt'],
                'featured_image': post['featured_image']
            })

    return posts
```

---

## 10. Implementation Phases

### Phase 1: MVP (Week 1)
- ✅ Create blog.html template
- ✅ Create blog-post.html template
- ✅ Add 3-5 initial blog posts (Markdown files)
- ✅ Style blog sections in CSS
- ✅ Add "Blog" link to navigation
- ✅ Basic Flask routes for listing and single post

### Phase 2: Enhanced Features (Week 2)
- ✅ Add categories and category pages
- ✅ Implement pagination
- ✅ Add related posts section
- ✅ Create sidebar with recent posts
- ✅ Add social sharing buttons

### Phase 3: Advanced Features (Week 3-4)
- ✅ Comments system (or integrate Disqus)
- ✅ Search functionality
- ✅ Newsletter signup widget
- ✅ RSS feed
- ✅ Author profiles

### Phase 4: Admin & Content (Ongoing)
- ✅ Simple admin for creating posts (or continue with Markdown)
- ✅ Regular content publication (2-4 posts per month)
- ✅ SEO optimization
- ✅ Analytics tracking

---

## 11. Content Calendar

### Month 1
- Week 1: "How to Find Your Plot" (Travel Guide)
- Week 2: "Customer Spotlight: First Visit" (Customer Story)
- Week 3: "History of County Roscommon" (Irish Heritage)
- Week 4: "St. Patrick's Day Gift Guide" (Company News)

### Month 2
- "Planning Your Ireland Trip" (Travel Guide)
- "Irish Language Basics" (Irish Culture)
- "Why Land Makes a Perfect Gift" (Company News)
- "Customer Photos from 2025" (Customer Story)

---

## 12. Estimated Effort

**Developer Time:**
- Database setup: 2 hours
- Frontend templates: 8 hours
- Flask routes: 4 hours
- Styling: 6 hours
- Testing: 4 hours
**Total: ~24 hours (3 days)**

**Content Creation:**
- 1 blog post: 2-4 hours (research, writing, images)
- Target: 2-4 posts per month

---

## 13. Alternative: WordPress Integration

If you prefer a full-featured CMS:

**Subdomain Approach:**
- Main site: `buyireland.com` (Flask)
- Blog: `blog.buyireland.com` (WordPress)
- Shared navigation/footer via iframe or API

**Pros:**
- Full-featured editor
- Plugins for SEO, comments, etc.
- No custom development

**Cons:**
- Additional hosting/maintenance
- Different tech stack
- Slightly more complex

---

## Next Steps

1. **Decide on approach:**
   - Markdown + Flask (simple, recommended)
   - Full database + admin (more features)
   - WordPress subdomain (easiest content management)

2. **Create initial content:**
   - Write 3-5 blog posts
   - Source images
   - Plan content calendar

3. **Build MVP:**
   - Templates + routes
   - Basic styling
   - Test on staging

4. **Launch & promote:**
   - Announce to customers
   - Share on social media
   - Submit to search engines

---

*Would you like me to start building the blog templates and implement one of these approaches?*
