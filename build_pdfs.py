#!/usr/bin/env python3
import base64
import json
import os
import subprocess
import sys
import time

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.2.0/github-markdown.min.css">
  <script src="https://cdn.jsdelivr.net/npm/marked@9.1.2/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
  <style>
    @page {{
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1a1a1a;
      background: #ffffff;
      padding: 0;
      margin: 0;
    }}
    .markdown-body {{
      max-width: 100%;
      font-size: 10pt;
      line-height: 1.5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1a1a1a;
    }}
    .markdown-body a {{
      color: #1a1a1a !important;
      text-decoration: none !important;
      font-weight: normal;
    }}
    .cover-page {{
      page-break-after: always;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 96vh;
      margin: 0;
      padding: 0;
    }}
    .cover-img {{
      max-width: 100%;
      max-height: 95vh;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
      margin: 0 auto;
    }}
    .mermaid {{
      text-align: center;
      margin: 10px auto;
      background: #fafafa;
      padding: 6px;
      border-radius: 6px;
      border: 1px solid #e1e4e8;
      max-width: 100%;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }}
    .mermaid svg {{
      max-width: 100% !important;
      max-height: 520px !important;
      height: auto !important;
      display: block;
      margin: 0 auto;
    }}
    table {{
      font-size: 8pt !important;
      width: 100% !important;
      margin: 10px 0 !important;
      border-collapse: collapse;
      table-layout: auto !important;
      word-wrap: break-word !important;
    }}
    th, td {{
      padding: 4px 5px !important;
      border: 1px solid #d0d7de !important;
      word-break: normal !important;
      line-height: 1.35 !important;
      vertical-align: top !important;
    }}
    th {{
      background-color: #f6f8fa !important;
      color: #24292e !important;
      font-weight: 600 !important;
    }}
    pre {{
      page-break-inside: avoid;
      background-color: #f6f8fa !important;
      font-size: 8.5pt !important;
      padding: 10px !important;
      border-radius: 4px !important;
    }}
    h1, h2, h3, h4 {{
      page-break-after: avoid;
      break-after: avoid;
      color: #1a1a1a;
      border-bottom: none !important;
    }}
    h1 {{ font-size: 16pt; margin-top: 1.2em; }}
    h2 {{ font-size: 13pt; margin-top: 1.1em; }}
    h3 {{ font-size: 11pt; margin-top: 0.9em; }}
  </style>
</head>
<body>
  {cover_html}
  <div id="content" class="markdown-body"></div>
  <script>
    const rawMd = {md_content_json};
    marked.setOptions({{ gfm: true, breaks: false }});
    document.getElementById('content').innerHTML = marked.parse(rawMd);

    document.querySelectorAll('pre code.language-mermaid').forEach(el => {{
      const pre = el.parentElement;
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = el.textContent;
      pre.replaceWith(div);
    }});

    mermaid.initialize({{
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {{ htmlLabels: true, curve: 'basis' }}
    }});
    mermaid.run({{
      nodes: document.querySelectorAll('.mermaid')
    }}).then(() => {{
      document.querySelectorAll('.mermaid svg').forEach(svg => {{
        svg.removeAttribute('height');
        svg.style.maxHeight = '520px';
        svg.style.width = '100%';
        svg.style.height = 'auto';
      }});
      window.__MERMAID_DONE__ = true;
    }}).catch(e => {{
      console.error(e);
      window.__MERMAID_DONE__ = true;
    }});
  </script>
</body>
</html>
"""

COVER_TEMPLATE = """
<div class="cover-page">
  <img src="data:image/jpeg;base64,{logo_b64}" class="cover-img" alt="Software Requirements Specification - Punjab Engineering College" />
</div>
"""

DOCS = [
    ("docs/SRS.md", "docs/SRS.pdf", "Software Requirements Specification (SRS) - Karl E. Wiegers Template", True),
    ("docs/DFD.md", "docs/DFD.pdf", "Data Flow Diagrams (DFD) & Data Dictionary - Yourdon / Gane & Sarson", False),
    ("docs/UML_DIAGRAMS.md", "docs/UML_DIAGRAMS.pdf", "UML Structural & Behavioral Models - OMG UML 2.5", False),
    ("docs/DESIGN_PATTERNS.md", "docs/DESIGN_PATTERNS.pdf", "Chain of Responsibility Design Pattern Report", False),
    ("docs/STATIC_CODE_QUALITY.md", "docs/STATIC_CODE_QUALITY.pdf", "Static Code Quality & Flake8 Analysis Report", False),
    ("docs/SDLC_PROCESS_MODEL.md", "docs/SDLC_PROCESS_MODEL.pdf", "Software Development Life Cycle (SDLC) & Process Model Specification", False),
    ("docs/SOFTWARE_TEST_PLAN.md", "docs/SOFTWARE_TEST_PLAN.pdf", "Software Test Plan (STP) & Verification Specification - IEEE Std 829-2008", False)
]

def render_doc(md_path, pdf_path, title, has_cover):
    if not os.path.exists(md_path):
        print(f"Skipping {md_path} (not found)")
        return False
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    cover_html = ""
    if has_cover and os.path.exists("docs/pec_title_page.jpg"):
        with open("docs/pec_title_page.jpg", "rb") as img_f:
            logo_b64 = base64.b64encode(img_f.read()).decode("utf-8")
        cover_html = COVER_TEMPLATE.format(logo_b64=logo_b64)

    html_content = HTML_TEMPLATE.format(
        title=title,
        cover_html=cover_html,
        md_content_json=json.dumps(md_text)
    )

    tmp_html = f"/tmp/{os.path.basename(md_path)}.html"
    with open(tmp_html, "w", encoding="utf-8") as f:
        f.write(html_content)

    import tempfile
    ud_dir = tempfile.mkdtemp(prefix="chrome_ud_")

    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-crash-reporter",
        f"--crash-dumps-dir={ud_dir}",
        f"--user-data-dir={ud_dir}",
        "--no-pdf-header-footer",
        "--allow-file-access-from-files",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=8000",
        f"--print-to-pdf={pdf_path}",
        tmp_html
    ]
    print(f"Rendering {md_path} -> {pdf_path}...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000:
        print(f"  [SUCCESS] {pdf_path} ({os.path.getsize(pdf_path) // 1024} KB)")
        return True
    else:
        print(f"  [ERROR] Failed to generate {pdf_path}: {res.stderr[:300]}")
        return False

def main():
    success_count = 0
    for md_path, pdf_path, title, has_cover in DOCS:
        if render_doc(md_path, pdf_path, title, has_cover):
            success_count += 1
    print(f"\nRendered {success_count}/{len(DOCS)} PDFs successfully.")

if __name__ == "__main__":
    main()
