# xrt-teleop.github.io: XRT project website

Static website for **XRT** (the single-operator, single-robot extended reality teleoperation framework) and for our paper
**"Evaluating Lightweight Contact Feedback in Dual-Operator Collaborative Humanoid Teleoperation"** (two XRT stations
run together). Its structure follows [sew-mimic.com](https://sew-mimic.com), and it replaces
https://xr-robot-teleop-website.pages.dev/ (all of that site's content, including both Rerun recordings, is on `/system/` and `/viewer/`).

| Page | What it covers | Tag |
|---|---|---|
| `/` Videos | headline, XRT-vs-study explainer, claim + video carousels, full video | blue = XRT system, teal = dual-humanoid study |
| `/system/` | one XRT station: architecture, feedback design, hardware, code, quick start, data channels | XRT system |
| `/study/` | the paper: abstract, design, three results, Table II, BibTeX | dual-humanoid study |
| `/viewer/` | Rerun body-pose and bone-frame recordings (from the old site) | XRT system |
| `/authors/` | contributors (**draft, not published**: awaiting contributions and photos) | |

There is no framework and no build step to host it: `site/` is plain HTML/CSS/JS. Pages are generated from `src/pages/*.html`
with one shared header/footer by `scripts/build_pages.py` (standard-library Python). Edit `src/pages/…`, then run
`python3 scripts/build_pages.py`. Site-wide settings (domain, paper link, arXiv link, GitHub org) are in `CONFIG` at the top of that script.


## Related repositories

- [XRT-Client](https://github.com/Euler-Rodrigues-Lab/XRT-Client): Unity app for Meta Quest 3 (prebuilt APK in its releases)
- [proj_XRT](https://github.com/Euler-Rodrigues-Lab/proj_XRT): XRT application for a Unitree G1 with Inspire hands, and the dual-operator study stack
- [XRT_devices](https://github.com/Euler-Rodrigues-Lab/XRT_devices): WebRTC headset receiver, pose recording and playback
- [g1_teleop](https://github.com/Euler-Rodrigues-Lab/g1_teleop) and [geo_kin_core](https://github.com/Euler-Rodrigues-Lab/geo_kin_core): G1 control and SEW-Mimic retargeting

## Address: https://xrt-teleop.github.io

Free and permanent, with nothing to renew. `xrt.github.io` was taken (a dormant account since 2013), and the GitHub names
`xrt-teleop` and `xrteleop` were unclaimed on 2026-10-12. The paper's footnote and conclusion point here, so **create the
organization before posting to arXiv**.

## Hosting on GitHub Pages

1. **Create the organization.** On GitHub, go to *+ → New organization*, choose the free plan, and name it exactly `xrt-teleop`.
   Add co-authors as owners so the site does not depend on one account.
2. **Create the repo.** In that org, make a public repository named exactly `xrt-teleop.github.io`.
3. **Push this folder:**
   ```bash
   cd xrt_website
   git init -b main && git add . && git commit -m "XRT website"
   git remote add origin https://github.com/xrt-teleop/xrt-teleop.github.io.git
   git push -u origin main
   ```
4. **Turn on Pages.** In the repo, open *Settings → Pages → Build and deployment* and set *Source: GitHub Actions*. The included
   workflow (`.github/workflows/pages.yml`) builds the pages and publishes `site/` on every push to `main`. The site is live
   at https://xrt-teleop.github.io within a minute or two.
5. **Retire the old site.** The old Cloudflare project `xr-robot-teleop-website` is on the account that owns it (Yunho's). From that
   account run `npx wrangler pages deploy legacy_redirect --project-name xr-robot-teleop-website`. Every old URL then 301-redirects
   here, and `/assets/*.rrd` keep their exact paths, so the Rerun links in the `XRT_devices` README keep working.

GitHub Pages sends `Access-Control-Allow-Origin: *` on every file, which the Rerun web viewer (app.rerun.io) needs to load the
`.rrd` recordings. Each viewer is pinned to the Rerun version that wrote its recording (0.24.0 and 0.23.3). `site/.nojekyll`
turns off Jekyll processing.

Limits: GitHub Pages allows 100 MB per file, a 1 GB site and about 100 GB/month of bandwidth. The largest file here is the
17 MB full video, and the site is about 46 MB. If you later buy a domain, add it under *Settings → Pages → Custom domain*
and change `CONFIG['domain']` in `scripts/build_pages.py`.

## Updating content

- **arXiv link:** set `CONFIG['arxiv']` in `scripts/build_pages.py`; the nav then shows "arXiv". Also add `eprint`/`archivePrefix`
  to the BibTeX in `src/pages/study.html`.
- **Paper PDF:** add the new PDF under `site/assets/` and set `paper_pdf` in `CONFIG` (currently `XRT_preprint_2026-10-16_v3.pdf`).
- **Preview locally:** `cd site && python3 -m http.server 8765`, then open http://127.0.0.1:8765 (pages use root paths, so opening
  the HTML files directly does not work; the Rerun panels stay blank locally because this server sends no CORS header).
- **Videos:** `scripts/build_media.sh` rebuilds every clip from `../video_submission_final` (H.264, 720p, fast-start, posters).
  The time ranges come from the final video's timeline (`video_submission_final/provenance/production_history.md`).
- **Author photos:** drop square images into `site/assets/people/` and swap the `avatar initials` span for an `<img class="avatar">`
  in `src/pages/authors.html`.

## Provenance

- Paper figures: rendered from `paper_arxiv_2026-10-12/src/figures/` (Fig. 2 = hand-corrected version with restored symbols and white sketch backgrounds).
- Videos: clips of `video_submission_final/exports/XRT_ICRA_2027_Submission.mp4` and the silent source clips in
  `video_submission_final/assets/`. Only the two feedback clips and the full video carry sound: reconstructed chimes and
  synthetic voices, no participant audio.
- Rerun recordings and the robot logo: copied from the old site.
- Author photos for Kong, Cho, Nidumukkala and Kousik: copied from sew-mimic.com/authors.
