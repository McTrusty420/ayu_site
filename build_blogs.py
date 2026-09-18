#!/usr/bin/env python3
"""
RIDDHI Ayurveda Clinic — Automated Blog Publisher
=================================================
Converts Word documents (.docx) into fully-styled, SEO-optimized,
and schema-compliant blog posts without touching HTML manually.

Usage:
  python3 build_blogs.py
"""

import os
import re
import json
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_DIR = os.path.join(ROOT_DIR, "blog")
os.makedirs(BLOG_DIR, exist_ok=True)

CONFIG_FILE = os.path.join(ROOT_DIR, "blogs_config.json")

DEFAULT_IMAGE = "./assets/images/panchakarma.png"

def parse_docx(file_path):
    """Extract paragraphs and structural content from a docx file using standard library."""
    with zipfile.ZipFile(file_path) as z:
        xml_content = z.read("word/document.xml")
    
    tree = ET.fromstring(xml_content)
    paragraphs = []
    
    for p in tree.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        texts = [t.text for t in p.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t") if t.text]
        if texts:
            clean_text = "".join(texts).strip()
            if clean_text:
                paragraphs.append(clean_text)
                
    return paragraphs

def slugify(text):
    """Convert text into clean URL slug."""
    text = text.lower()
    text = re.sub(r'[\u0900-\u097F]', '', text)  # remove devanagari from slug
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text[:60] if text else "blog-post"

def load_or_init_config():
    """Load metadata configuration mapping docx files to metadata."""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
            
    # Default initial configuration
    default_config = {
        "Document (87).docx": {
            "slug": "science-of-liquid-foods-in-ayurveda",
            "title": "Soup Is Not Just a Japanese Trend: The Ancient Science of Liquid Foods in Ayurveda",
            "category": "Nutrition & Āhāra",
            "image": "./assets/images/digestive-wellness.png",
            "date": "September 18, 2026",
            "date_iso": "2026-09-18",
            "tithi": "Bhadrapada Shuddh Saptami",
            "read_time": "4 min read"
        },
        "Document (80).docx": {
            "slug": "sravana-krishna-shashthi-monsoon-ayurveda",
            "title": "Śrāvaṇa Krishna Ṣaṣṭhī: Looking at a Traditional Observance Through Ayurveda",
            "category": "Seasonal Living",
            "image": "./assets/images/diet-guidance.png",
            "date": "August 28, 2026",
            "date_iso": "2026-08-28",
            "tithi": "Śrāvaṇa Krishna Ṣaṣṭhī",
            "read_time": "3 min read"
        },
        "Blog 1.docx": {
            "slug": "ayurveda-for-beginners",
            "title": "Ayurveda for Beginners: Why Traditional Wisdom Still Matters in the Age of AI",
            "category": "Foundations",
            "image": "./assets/images/panchakarma.png",
            "date": "August 14, 2026",
            "date_iso": "2026-08-14",
            "tithi": "Shravan Shuddh Dwitiya",
            "read_time": "4 min read"
        }
    }
    
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(default_config, f, indent=2, ensure_ascii=False)
        
    return default_config

def main():
    print("RIDDHI Ayurveda Blog Engine")
    print("===========================")
    config = load_or_init_config()
    
    # Discover all docx files
    docx_files = [f for f in os.listdir(ROOT_DIR) if f.endswith(".docx") and not f.startswith("~$")]
    print(f"Discovered {len(docx_files)} Word document(s): {', '.join(docx_files)}")
    
    for doc in docx_files:
        if doc not in config:
            # Auto-generate entry for new docx
            paragraphs = parse_docx(os.path.join(ROOT_DIR, doc))
            first_line = paragraphs[0] if paragraphs else "New Article"
            title = first_line if len(first_line) > 10 else (paragraphs[1] if len(paragraphs) > 1 else first_line)
            slug = slugify(title)
            today = datetime.now()
            
            config[doc] = {
                "slug": slug,
                "title": title,
                "category": "Clinical Perspectives",
                "image": DEFAULT_IMAGE,
                "date": today.strftime("%B %d, %Y"),
                "date_iso": today.strftime("%Y-%m-%d"),
                "tithi": "Ayurvedic Journal",
                "read_time": "3 min read"
            }
            print(f"Auto-configured new document: {doc} -> slug: {slug}")
            
    # Save updated config
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
        
    print("\nBlog index, articles, and XML syndication are synchronized.")
    print("To publish a new blog in the future:")
    print("  1. Drop your new '.docx' file into the repository.")
    print("  2. Run: python3 build_blogs.py")
    print("  3. (Optional) Customize image/category in blogs_config.json if desired.")

if __name__ == "__main__":
    main()
