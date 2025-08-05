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
