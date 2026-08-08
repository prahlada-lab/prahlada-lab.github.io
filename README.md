# prahlada-research.github.io

Website for Prahlada, a student-led AI research lab at BITS Pilani.

- `index.html` — culture / about
- `research.html` — papers and blogs
- `paper-dives.html` — reading-group sessions
- `papers.json` — **the only file you edit to add content.** Papers, blogs and dives live here; the pages read it at load.
- `assets/` — logo mark and mandala motif
- `support.js`, `_ds/` — runtime and design tokens; do not edit
- `.nojekyll` — required, keeps GitHub Pages from hiding the `_ds` folder

## Adding a paper, blog or dive

Open `papers.json` on GitHub, click the pencil icon, copy an existing block, change the values, commit. The site updates in about a minute.

Fields: `title`, `url`, `authors` (first author is shown bold), `venue`, `status`, `date`, `sortKey` (`YYYY-MM`, controls order — newest first), `topic` (brass tag), `abstract` (leave `""` to hide the dropdown; separate paragraphs with a blank line).
