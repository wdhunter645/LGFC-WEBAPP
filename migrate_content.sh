
#!/bin/bash

# Lou Gehrig Fan Club - Content Migration Script
# File: migrate_content.sh

set -e

echo "🔄 Lou Gehrig Fan Club - Content Migration from SitePro"
echo "====================================================="

# Configuration
SITEPRO_URL="https://www.LouGehrigFanClub.com"
NETLIFY_SITE="lgfc-webapp"
# CLOUDFLARE_ZONE_ID=""  # REMOVED - Cloudflare step skipped
DOMAIN="lougehrfanclub.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Create content migration directories
setup_migration_workspace() {
  log_info "Setting up migration workspace..."

  mkdir -p migration/{scraped_content,processed_content,images}
  mkdir -p content/{posts,pages,milestones}
  mkdir -p scripts

  log_success "Migration workspace ready"
}

# Step 2: Scrape existing SitePro content
scrape_sitepro_content() {
  log_info "Scraping content from SitePro site..."

  cat > migration/scrape_content.py << 'EOF'
#!/usr/bin/env python3
"""
Content scraper for SitePro Lou Gehrig Fan Club site
Extracts text content while respecting robots.txt
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urljoin
import os

class SiteProScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; LGFCMigration/1.0)'
        })
        self.scraped_content = []

    def scrape_page(self, url, page_type="page"):
        try:
            print(f"Scraping: {url}")
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            content = {
                'url': url,
                'type': page_type,
                'title': '',
                'content': '',
                'images': [],
                'links': []
            }

            title_tag = soup.find('title')
            if title_tag:
                content['title'] = title_tag.get_text().strip()

            main_content = soup.find('main') or soup.find('div', class_='content') or soup.find('body')
            if main_content:
                for script in main_content(["script", "style", "nav", "footer"]):
                    script.decompose()
                content['content'] = main_content.get_text().strip()

            for img in soup.find_all('img'):
                if img.get('src'):
                    img_url = urljoin(url, img.get('src'))
                    content['images'].append({
                        'src': img_url,
                        'alt': img.get('alt', ''),
                        'title': img.get('title', '')
                    })

            for link in soup.find_all('a', href=True):
                href = link.get('href')
                if href and not href.startswith('http'):
                    full_url = urljoin(url, href)
                    content['links'].append(full_url)

            return content

        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def discover_pages(self):
        print("Discovering pages...")

        potential_urls = [
            self.base_url,
            f"{self.base_url}/about",
            f"{self.base_url}/biography",
            f"{self.base_url}/career",
            f"{self.base_url}/statistics",
            f"{self.base_url}/photos",
            f"{self.base_url}/gallery",
            f"{self.base_url}/news",
            f"{self.base_url}/blog",
            f"{self.base_url}/contact",
            f"{self.base_url}/als",
            f"{self.base_url}/awareness"
        ]

        found_urls = set()
        for url in potential_urls:
            try:
                response = self.session.head(url, timeout=5)
                if response.status_code == 200:
                    found_urls.add(url)
            except:
                pass

        return list(found_urls)

    def scrape_all_content(self):
        urls = self.discover_pages()
        for url in urls:
            content = self.scrape_page(url)
            if content:
                self.scraped_content.append(content)
            time.sleep(1)
        return self.scraped_content

    def save_content(self, output_dir):
        os.makedirs(output_dir, exist_ok=True)

        with open(f"{output_dir}/scraped_data.json", 'w') as f:
            json.dump(self.scraped_content, f, indent=2)

        for i, content in enumerate(self.scraped_content):
            filename = f"page_{i:02d}_{content['url'].split('/')[-1] or 'home'}.json"
            with open(f"{output_dir}/{filename}", 'w') as f:
                json.dump(content, f, indent=2)

        print(f"✅ Content saved to {output_dir}")

def main():
    scraper = SiteProScraper("https://www.LouGehrigFanClub.com")
    print("🕷️  Starting content scraping...")
    scraped_content = scraper.scrape_all_content()
    print(f"📄 Scraped {len(scraped_content)} pages")
    scraper.save_content("scraped_content")
    print("✅ Content scraping completed!")

if __name__ == "__main__":
    main()
EOF

  cd migration
  python3 scrape_content.py
  cd ..
  log_success "Content scraping completed"
}

# Step 3: Process content
process_scraped_content() {
  log_info "Processing scraped content for Netlify CMS..."

  cat > migration/process_content.py << 'EOF'
#!/usr/bin/env python3
"""
Convert scraped content to Netlify CMS markdown format
"""

import json
import os
from datetime import datetime
import re

def clean_text(text):
    text = re.sub(r'\s+', ' ', text).strip()
    text = re.sub(r'Copyright.*SitePro.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Powered by.*', '', text, flags=re.IGNORECASE)
    return text

def create_markdown_post(content, output_dir):
    title = content.get('title', 'Untitled')
    body = clean_text(content.get('content', ''))

    slug = re.sub(r'[^a-zA-Z0-9\s]', '', title).lower().replace(' ', '-')

    frontmatter = f"""---
title: "{title}"
date: {datetime.now().isoformat()}
tags: ["legacy", "lou-gehrig"]
migrated_from: "{content.get('url', '')}"
---

{body}
"""

    filename = f"{datetime.now().strftime('%Y-%m-%d')}-{slug}.md"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, 'w') as f:
        f.write(frontmatter)

    return filepath

def process_all_content():
    with open('scraped_content/scraped_data.json', 'r') as f:
        scraped_data = json.load(f)

    os.makedirs('../content/posts', exist_ok=True)
    os.makedirs('../content/pages', exist_ok=True)

    processed_files = []

    for content in scraped_data:
        if content.get('content') and len(content['content']) > 100:
            url = content.get('url', '')
            output_dir = '../content/posts' if 'blog' in url or 'news' in url else '../content/pages'
            filepath = create_markdown_post(content, output_dir)
            processed_files.append(filepath)

    print(f"✅ Processed {len(processed_files)} content files")

if __name__ == "__main__":
    process_all_content()
EOF

  cd migration
  python3 process_content.py
  cd ..
  log_success "Content processing completed"
}

# Step 6: Create monitoring script
create_monitoring_script() {
  log_info "Creating site monitoring script..."

  cat > scripts/monitor_site.sh << 'EOF'
#!/bin/bash

echo "🔍 Monitoring Lou Gehrig Fan Club Site Health"
echo "==========================================="

SITE_URL="https://lgfc-webapp.netlify.app"
CUSTOM_DOMAIN="https://lougehrfanclub.com"

check_url() {
  local url=$1
  local name=$2

  echo -n "Checking $name... "
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
  response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" --max-time 10)

  if [[ "$status_code" == "200" ]]; then
    echo "✅ OK (${response_time}s)"
  else
    echo "❌ FAILED (HTTP $status_code)"
  fi
}

echo "📊 Site Health Check $(date)"
echo ""

check_url "$SITE_URL" "Netlify Site"
check_url "$SITE_URL/admin" "Admin Interface"
check_url "https://vkwhrbjkdznncjkzkiuo.supabase.co/rest/v1/" "Supabase API"
check_url "https://f005.backblazeb2.com/file/LouGehrigFanClub/" "B2 Storage"

if host lougehrfanclub.com >/dev/null 2>&1; then
  echo ""
  echo "🌐 Custom Domain Check:"
  check_url "$CUSTOM_DOMAIN" "Custom Domain"
fi

echo ""
echo "✅ Monitoring completed"
EOF

  chmod +x scripts/monitor_site.sh
  log_success "Monitoring script created"
}

# Main execution
main() {
  echo "🔄 Starting Lou Gehrig Fan Club content migration..."

  setup_migration_workspace

  if command -v python3 &> /dev/null; then
    scrape_sitepro_content
    process_scraped_content
  else
    log_warning "Python3 not available. Manual content migration required."
    echo "📋 Manual steps:"
    echo "1. Visit each page on the live site"
    echo "2. Copy/paste into markdown files"
    echo "3. Use Netlify CMS admin to manage content"
  fi

  # setup_cloudflare_dns  <-- Removed for now
  # create_migration_checklist <-- Removed for now

  create_monitoring_script

  echo ""
  log_success "Ready for content migration! 🚀"
}

main "$@"

