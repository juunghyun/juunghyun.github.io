#!/usr/bin/env python3
"""docs/PRD.md -> docs/PRD.html (개인 디자인시스템 report 템플릿 적용).
사용: python3 tools/md2report.py docs/PRD.md ~/.claude/skills/design-system/templates/report.html docs/PRD.html
mermaid 다이어그램은 cdnjs에서 로드하므로 오프라인이면 코드 텍스트로 남는다.
"""
import re, html, sys, pathlib
md = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8').splitlines()
tpl = pathlib.Path(sys.argv[2]).read_text(encoding='utf-8').splitlines()
head = "\n".join(tpl[:79])  # <!DOCTYPE> .. </style>
head = head.replace("{{보고서 제목}}", "개인 테크 블로그 PRD")

def inline(s):
    s = html.escape(s, quote=False)
    codes = []
    def keep(m):
        codes.append(m.group(1)); return f"\x00{len(codes)-1}\x00"
    s = re.sub(r"`([^`]+)`", keep, s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
    s = re.sub(r"\x00(\d+)\x00", lambda m: f"<code>{codes[int(m.group(1))]}</code>", s)
    return s

out, toc = [], []
title = meta = summary = None
i = 0; sec = 0
in_list = None  # 'ul' | 'check'
def close_list():
    global in_list
    if in_list: out.append("</ul>"); in_list = None
para = []
def flush_para():
    global para
    if para:
        txt = " ".join(para).strip()
        if txt: out.append(f"<p>{inline(txt)}</p>")
        para = []
while i < len(md):
    line = md[i]
    if line.startswith("# ") and title is None:
        title = line[2:].strip(); i += 1; continue
    if meta is None and title and re.match(r"^\d{4}-\d{2}-\d{2} · ", line):
        meta = line.strip(); i += 1; continue
    if line.startswith("```"):
        flush_para(); close_list()
        lang = line[3:].strip(); buf = []; i += 1
        while i < len(md) and not md[i].startswith("```"):
            buf.append(md[i]); i += 1
        i += 1
        body = html.escape("\n".join(buf), quote=False)
        if lang == "mermaid":
            out.append(f'<div class="diagram"><pre class="mermaid">{body}</pre></div>')
        else:
            out.append(f'<pre><code>{body}</code></pre>')
        continue
    if line.startswith("## "):
        flush_para(); close_list(); sec += 1
        t = line[3:].strip(); toc.append((sec, re.sub(r"^\d+\.\s*", "", t)))
        out.append(f'<h2 id="s{sec}">{inline(t)}</h2>'); i += 1; continue
    if line.startswith("### "):
        flush_para(); close_list()
        out.append(f"<h3>{inline(line[4:].strip())}</h3>"); i += 1; continue
    if line.startswith("|"):
        flush_para(); close_list()
        rows = []
        while i < len(md) and md[i].startswith("|"):
            rows.append([c.strip() for c in md[i].strip().strip("|").split("|")]); i += 1
        hdr = rows[0]; body_rows = [r for r in rows[1:] if not all(re.fullmatch(r":?-{3,}:?", c) for c in r)]
        t = ['<div class="table-wrap"><table><thead><tr>' + "".join(f"<th>{inline(c)}</th>" for c in hdr) + "</tr></thead><tbody>"]
        for r in body_rows:
            r = r + [""] * (len(hdr) - len(r))
            t.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r[:len(hdr)]) + "</tr>")
        t.append("</tbody></table></div>"); out.append("".join(t)); continue
    m = re.match(r"^- \[( |x)\] (.*)", line)
    if m:
        flush_para()
        if in_list != "check": close_list(); out.append('<ul class="checklist">'); in_list = "check"
        chk = "checked" if m.group(1) == "x" else ""
        out.append(f'<li><input type="checkbox" disabled {chk}> {inline(m.group(2))}</li>'); i += 1; continue
    if line.startswith("- "):
        flush_para()
        if in_list != "ul": close_list(); out.append("<ul>"); in_list = "ul"
        out.append(f"<li>{inline(line[2:].strip())}</li>"); i += 1; continue
    if not line.strip():
        flush_para(); close_list(); i += 1; continue
    if summary is None and sec == 1 and not para and not line.startswith("**"):
        summary = line.strip()
    para.append(line); i += 1
flush_para(); close_list()

date, author = meta.split(" · ", 1) if meta else ("", "")
toc_html = "".join(f'<li><a href="#s{n}">{html.escape(t)}</a></li>' for n, t in toc)
extra_css = """
<style>
.table-wrap{overflow-x:auto;margin:16px 0}
.table-wrap table{min-width:640px}
.diagram{overflow-x:auto;padding:16px;border:1px solid var(--border, #E2E8F0);border-radius:12px;background:var(--bg-soft, #F8FAFC);margin:16px 0}
.diagram pre.mermaid{margin:0;background:transparent;border:0;padding:0;font-size:13px;white-space:pre}
.checklist{list-style:none;padding-left:0}
.checklist li{display:flex;gap:8px;align-items:flex-start}
.checklist input{margin-top:6px}
h3{margin-top:28px}
</style>"""
body = f"""
<body>
<div class="doc">
  <header class="doc-header">
    <div class="doc-eyebrow">PRD</div>
    <h1>{html.escape(title)}</h1>
    <div class="doc-meta"><span>{html.escape(date)}</span><span>작성: {html.escape(author)}</span><span class="badge">v1.0 · 인터뷰 확정</span></div>
    <p class="doc-summary">{inline(summary or "")}</p>
  </header>
  <nav class="toc"><div class="toc-title">목차</div><ol>{toc_html}</ol></nav>
  {chr(10).join(out)}
  <footer class="doc-footer">정본은 Claude Doc(개인 테크 블로그 PRD)이며 이 파일은 docs/PRD.md에서 tools/md2report.py로 생성한 읽기용 사본이다.</footer>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.1/mermaid.min.js"></script>
<script>if(window.mermaid){{mermaid.initialize({{startOnLoad:true,theme:'neutral',flowchart:{{htmlLabels:true}}}});}}</script>
</body>
</html>"""
pathlib.Path(sys.argv[3]).write_text(head + extra_css + "\n</head>" + body, encoding="utf-8")
print("sections", len(toc), "blocks", len(out))
