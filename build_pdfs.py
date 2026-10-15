#!/usr/bin/env python3
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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/marked@9.1.2/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
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
      line-height: 1.45;
    }}
    .pec-header {{
      border-bottom: 2.5px solid #800000;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }}
    .pec-title {{
      font-size: 14pt;
      font-weight: bold;
      color: #800000;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .pec-sub {{
      font-size: 9pt;
      color: #444;
      margin-top: 3px;
    }}
    .mermaid {{
      text-align: center;
      margin: 18px 0;
      background: #fafafa;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e1e4e8;
      page-break-inside: avoid;
    }}
    table {{
      font-size: 9pt !important;
      page-break-inside: avoid;
      width: 100% !important;
      margin: 12px 0 !important;
    }}
    th {{
      background-color: #f6f8fa !important;
      color: #24292e !important;
    }}
    pre {{
      page-break-inside: avoid;
      background-color: #f6f8fa !important;
      font-size: 8.5pt !important;
      padding: 10px !important;
      border-radius: 4px !important;
    }}
    h1, h2, h3 {{
      page-break-after: avoid;
      color: #1a1a1a;
    }}
    h1 {{ border-bottom: 1.5px solid #800000; padding-bottom: 0.25em; font-size: 16pt; }}
    h2 {{ border-bottom: 1px solid #eaecef; padding-bottom: 0.2em; font-size: 13pt; margin-top: 1.2em; }}
    h3 {{ font-size: 11pt; margin-top: 1em; }}
    blockquote {{
      border-left: 3.5px solid #800000 !important;
      background: #fafafa !important;
      padding: 8px 12px !important;
      color: #333 !important;
    }}
  </style>
</head>
<body>
  <div class="pec-header">
    <div class="pec-title">Punjab Engineering College (Deemed to be University)</div>
    <div class="pec-sub">Sector 12, Chandigarh - 160012 | Office of Dean Academic Affairs (DAA)</div>
    <div class="pec-sub"><strong>Capstone Coursework Deliverable &bull; Academic Clearance Automation Engine</strong></div>
  </div>
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

    renderMathInElement(document.body, {{
      delimiters: [
        {{left: '$$', right: '$$', display: true}},
        {{left: '$', right: '$', display: false}},
        {{left: '\\\\(', right: '\\\\)', display: false}},
        {{left: '\\\\[', right: '\\\\]', display: true}}
      ],
      throwOnError: false
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
      window.__MERMAID_DONE__ = true;
    }}).catch(e => {{
      console.error(e);
      window.__MERMAID_DONE__ = true;
    }});
  </script>
</body>
</html>
"""

DOCS = [
    ("docs/SRS.md", "docs/SRS.pdf", "Software Requirements Specification (SRS) - IEEE Std 830"),
    ("docs/DFD.md", "docs/DFD.pdf", "Data Flow Diagrams (DFD) & Data Dictionary - Yourdon / Gane & Sarson"),
    ("docs/UML_DIAGRAMS.md", "docs/UML_DIAGRAMS.pdf", "UML Structural & Behavioral Models - OMG UML 2.5"),
    ("docs/DESIGN_PATTERNS.md", "docs/DESIGN_PATTERNS.pdf", "Chain of Responsibility Design Pattern Report"),
    ("docs/STATIC_CODE_QUALITY.md", "docs/STATIC_CODE_QUALITY.pdf", "Static Code Quality & Flake8 Analysis Report")
]

def render_doc(md_path, pdf_path, title):
    if not os.path.exists(md_path):
        print(f"Skipping {md_path} (not found)")
        return False
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    html_content = HTML_TEMPLATE.format(
        title=title,
        md_content_json=json.dumps(md_text)
    )

    tmp_html = f"/tmp/{os.path.basename(md_path)}.html"
    with open(tmp_html, "w", encoding="utf-8") as f:
        f.write(html_content)

    cmd = [
        CHROME_BIN,
        "--headless",
        "--disable-gpu",
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
    for md_path, pdf_path, title in DOCS:
        if render_doc(md_path, pdf_path, title):
            success_count += 1
    print(f"\nRendered {success_count}/{len(DOCS)} PDFs successfully.")

if __name__ == "__main__":
    main()
