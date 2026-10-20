#!/usr/bin/env python3
"""Render src/pages/*.html into site/ with the shared header, nav and footer.

Each page file starts with front matter lines `key: value` up to a line `---`
(keys: title, description, path, nav, and optional `draft: true` to skip a page). Run: python3 scripts/build_pages.py
No dependencies; the output in site/ is plain static HTML.
"""
from pathlib import Path
import html

ROOT = Path(__file__).resolve().parents[1]
SRC, OUT = ROOT / 'src', ROOT / 'site'
CONFIG = dict(
    domain='https://xrt-teleop.github.io',
    github_org='https://github.com/Euler-Rodrigues-Lab',
    client_repo='https://github.com/Euler-Rodrigues-Lab/XRT-Client',
    devices_repo='https://github.com/Euler-Rodrigues-Lab/XRT_devices',
    app_repo='https://github.com/Euler-Rodrigues-Lab/proj_XRT',
    paper_pdf='/assets/XRT_preprint_2026-10-16_v3.pdf',
    arxiv='https://arxiv.org/abs/2610.24257',  # empty -> nav links to the PDF
    year='2026',
)
NAV = [('videos', '/', 'Videos'), ('system', '/system/', 'XRT System'),
       ('study', '/study/', 'Dual-Humanoid Study'), ('viewer', '/viewer/', 'Pose Viewer')]
# Add ('authors', '/authors/', 'Authors') back to NAV, and remove `draft: true` from src/pages/authors.html, to publish it.
GITHUB_SVG = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 '
              '22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 '
              '1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 '
              '0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 '
              '3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.68.41.36.78 '
              '1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>')
THEME_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
             '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>')
MENU_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
            '<path d="M4 6h16M4 12h16M4 18h16"/></svg>')


def layout(meta, body):
    paper = CONFIG['arxiv'] or CONFIG['paper_pdf']
    paper_label = 'arXiv' if CONFIG['arxiv'] else 'Paper'
    nav = ''.join(f'<a href="{href}"{" aria-current=\"page\"" if key == meta.get("nav") else ""}>{label}</a>'
                  for key, href, label in NAV)
    nav += f'<a href="{paper}">{paper_label}</a>'
    title = meta['title']
    desc = html.escape(meta.get('description', ''), quote=True)
    url = CONFIG['domain'] + meta.get('path', '/')
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{html.escape(title, quote=True)}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{CONFIG['domain']}/assets/img/og_card.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/xrt_robot_logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/site.css">
<script>try{{const t=localStorage.getItem('xrt-theme');if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
</head>
<body>
<header class="site-header">
  <div class="nav-wrap">
    <a class="brand" href="/"><img src="/assets/img/xrt_robot_logo.svg" alt="">XRT</a>
    <nav class="nav" aria-label="Main">{nav}</nav>
    <div class="nav-right">
      <a class="icon-btn" href="{CONFIG['github_org']}" aria-label="Code on GitHub">{GITHUB_SVG}</a>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Toggle dark mode">{THEME_SVG}</button>
      <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-label="Menu">{MENU_SVG}</button>
    </div>
  </div>
</header>
<main>
{body}
</main>
<footer class="site-footer">
  <div class="inner">
    <p>&copy; {CONFIG['year']} Symbiotic and Augmented Intelligence Lab and <a href="https://saferoboticslab.me.gatech.edu/">Robot Danger Lab</a> at Georgia Tech.</p>
    <nav>
      <a href="https://sew-mimic.com/">SEW-MIMIC retargeting &#8599;</a>
      <a href="{CONFIG['github_org']}">Euler Rodrigues Lab @ GitHub &#8599;</a>
    </nav>
  </div>
</footer>
<script src="/assets/js/site.js" defer></script>
</body>
</html>
'''


def main():
    for src in sorted((SRC / 'pages').glob('*.html')):
        head, body = src.read_text().split('\n---\n', 1)
        meta = dict(line.split(': ', 1) for line in head.strip().splitlines())
        if meta.get('draft') == 'true':  # kept in src/, not published
            print('skip (draft)', src.name)
            continue
        for k, v in CONFIG.items():
            body = body.replace('{{' + k + '}}', v)
        out = OUT / meta['path'].strip('/') / 'index.html' if meta['path'] != '/404' else OUT / '404.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(layout(meta, body))
        print(out.relative_to(ROOT))


if __name__ == '__main__':
    main()
