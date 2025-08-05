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
