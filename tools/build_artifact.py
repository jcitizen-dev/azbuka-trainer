#!/usr/bin/env python3
"""Inlines index.html + style.css + the scripts into one self-contained file.

The GitHub Pages app loads the separate files; the claude.ai artifact needs a
single page with no external requests, so this flattens them into build/artifact.html.
"""
import io, os, re

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def read(n): return io.open(os.path.join(root, n), encoding="utf-8").read()

html = read("index.html")
# strip the document scaffolding — the artifact host supplies its own <head>
body = re.search(r"<body>\n(.*)\n</body>", html, re.S).group(1)
title = "<title>Azbuka &amp; Padeži</title>"
fonts = re.search(r'(<link rel="preconnect".*?display=swap">)', html, re.S).group(1)

body = body.replace('<script src="vocab.js"></script>', "")
body = body.replace('<script src="azbuka.js"></script>', "")
body = body.replace('<script src="game.js"></script>', "")
body = re.sub(r'<script>\nif\("serviceWorker".*?</script>', "", body, flags=re.S)

out = (title + "\n" + fonts + "\n<style>\n" + read("style.css") + "\n</style>\n" + body +
       "\n<script>\n" + read("vocab.js") + "\n</script>\n" +
       "\n<script>\n" + read("azbuka.js") + "\n</script>\n" +
       "\n<script>\n" + read("game.js") + "\n</script>\n")

os.makedirs(os.path.join(root, "build"), exist_ok=True)
dest = os.path.join(root, "build", "artifact.html")
io.open(dest, "w", encoding="utf-8").write(out)
print(f"build/artifact.html: {len(out):,} bytes")
