#!/usr/bin/env python3
"""
Master Source Code to PDF Converter for PortalApp
Generates syntax-highlighted PDF documents for every source code file
in the project, maintaining full folder hierarchy, and combines them
into an indexed master catalog.
"""

import os
import sys
import re
import time
from datetime import datetime
from collections import defaultdict

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

import pygments
from pygments.lexers import (
    get_lexer_for_filename,
    TextLexer,
    JavaLexer,
    PythonLexer,
    TypeScriptLexer,
    JavascriptLexer,
    HtmlLexer,
    CssLexer,
    JsonLexer,
    XmlLexer,
    PropertiesLexer,
    BatchLexer,
    SqlLexer,
    MarkdownLexer,
    BashLexer
)
from pygments.token import Token
import pypdf

# ---------------------------------------------------------
# FONT CONFIGURATION
# ---------------------------------------------------------
CODE_FONT = "Courier"
CODE_FONT_BOLD = "Courier-Bold"
UI_FONT = "Helvetica"
UI_FONT_BOLD = "Helvetica-Bold"

WINDOWS_FONTS = r"C:\Windows\Fonts"

if os.path.exists(os.path.join(WINDOWS_FONTS, "consola.ttf")):
    try:
        pdfmetrics.registerFont(TTFont("Consolas", os.path.join(WINDOWS_FONTS, "consola.ttf")))
        CODE_FONT = "Consolas"
    except Exception:
        pass

if os.path.exists(os.path.join(WINDOWS_FONTS, "consolab.ttf")):
    try:
        pdfmetrics.registerFont(TTFont("Consolas-Bold", os.path.join(WINDOWS_FONTS, "consolab.ttf")))
        CODE_FONT_BOLD = "Consolas-Bold"
    except Exception:
        pass

if os.path.exists(os.path.join(WINDOWS_FONTS, "segoeui.ttf")):
    try:
        pdfmetrics.registerFont(TTFont("SegoeUI", os.path.join(WINDOWS_FONTS, "segoeui.ttf")))
        UI_FONT = "SegoeUI"
    except Exception:
        pass

if os.path.exists(os.path.join(WINDOWS_FONTS, "segoeuib.ttf")):
    try:
        pdfmetrics.registerFont(TTFont("SegoeUI-Bold", os.path.join(WINDOWS_FONTS, "segoeuib.ttf")))
        UI_FONT_BOLD = "SegoeUI-Bold"
    except Exception:
        pass


# ---------------------------------------------------------
# COLOR THEME
# ---------------------------------------------------------
COLOR_HEADER_BG = colors.HexColor("#0F172A")       # Deep slate navy
COLOR_HEADER_TITLE = colors.HexColor("#FFFFFF")    # White
COLOR_HEADER_SUB = colors.HexColor("#94A3B8")      # Slate
COLOR_BADGE_BG = colors.HexColor("#1E293B")        # Slate 800
COLOR_BADGE_BORDER = colors.HexColor("#334155")    # Slate 700
COLOR_BADGE_LANG = colors.HexColor("#38BDF8")      # Light Sky Blue
COLOR_BADGE_TEXT = colors.HexColor("#F8FAFC")      # Off-white

COLOR_CODE_BG = colors.HexColor("#F8FAFC")         # Soft slate code background
COLOR_GUTTER_BG = colors.HexColor("#F1F5F9")       # Gutter gray
COLOR_GUTTER_BORDER = colors.HexColor("#CBD5E1")   # Gutter vertical line
COLOR_GUTTER_NUM = colors.HexColor("#94A3B8")      # Line numbers
COLOR_CODE_BORDER = colors.HexColor("#E2E8F0")     # Frame border
COLOR_FOOTER_LINE = colors.HexColor("#E2E8F0")     # Footer divider
COLOR_FOOTER_TEXT = colors.HexColor("#64748B")     # Footer text

TOKEN_COLORS = {
    Token.Keyword: colors.HexColor("#7C3AED"),               # Purple
    Token.Keyword.Constant: colors.HexColor("#0284C7"),      # Cyan
    Token.Keyword.Declaration: colors.HexColor("#7C3AED"),   # Purple
    Token.Keyword.Namespace: colors.HexColor("#D97706"),     # Amber
    Token.Keyword.Type: colors.HexColor("#2563EB"),          # Royal Blue
    Token.Name.Class: colors.HexColor("#0D9488"),            # Teal
    Token.Name.Function: colors.HexColor("#4338CA"),         # Indigo
    Token.Name.Decorator: colors.HexColor("#D97706"),        # Amber
    Token.Name.Builtin: colors.HexColor("#0284C7"),          # Sky Blue
    Token.Name.Tag: colors.HexColor("#2563EB"),              # Blue
    Token.Name.Attribute: colors.HexColor("#7C3AED"),        # Purple
    Token.String: colors.HexColor("#059669"),                # Emerald Green
    Token.String.Doc: colors.HexColor("#64748B"),            # Muted Slate
    Token.Number: colors.HexColor("#D97706"),                # Amber
    Token.Comment: colors.HexColor("#64748B"),               # Slate Muted
    Token.Comment.Single: colors.HexColor("#64748B"),
    Token.Comment.Multiline: colors.HexColor("#64748B"),
    Token.Operator: colors.HexColor("#334155"),              # Slate
    Token.Punctuation: colors.HexColor("#475569"),          # Slate
    Token.Generic.Heading: colors.HexColor("#1E293B"),
    Token.Generic.Subheading: colors.HexColor("#334155"),
}

DEFAULT_TEXT_COLOR = colors.HexColor("#0F172A")


def get_token_color(token_type):
    t = token_type
    while t in Token:
        if t in TOKEN_COLORS:
            return TOKEN_COLORS[t]
        t = t.parent
    return DEFAULT_TEXT_COLOR


def get_lexer_for_file(filepath, content):
    name = os.path.basename(filepath).lower()
    ext = os.path.splitext(filepath)[1].lower()

    if ext == ".java":
        return JavaLexer()
    elif ext == ".py":
        return PythonLexer()
    elif ext in (".ts", ".tsx"):
        return TypeScriptLexer()
    elif ext in (".js", ".jsx"):
        return JavascriptLexer()
    elif ext in (".html", ".htm"):
        return HtmlLexer()
    elif ext == ".css":
        return CssLexer()
    elif ext == ".json":
        return JsonLexer()
    elif ext in (".xml", ".pom", ".iml"):
        return XmlLexer()
    elif ext in (".properties", ".env"):
        return PropertiesLexer()
    elif ext in (".bat", ".cmd"):
        return BatchLexer()
    elif ext == ".sql":
        return SqlLexer()
    elif ext == ".md":
        return MarkdownLexer()
    elif ext in (".sh", "mvnw"):
        return BashLexer()

    try:
        return get_lexer_for_filename(filepath, content)
    except Exception:
        return TextLexer()


def get_language_name(filepath):
    name = os.path.basename(filepath).lower()
    ext = os.path.splitext(filepath)[1].lower()

    mapping = {
        ".java": "Java",
        ".py": "Python",
        ".tsx": "React TSX",
        ".ts": "TypeScript",
        ".jsx": "React JSX",
        ".js": "JavaScript",
        ".html": "HTML5",
        ".css": "CSS3",
        ".json": "JSON",
        ".xml": "XML",
        ".properties": "Config",
        ".bat": "Batch Script",
        ".cmd": "Batch Script",
        ".sql": "SQL",
        ".md": "Markdown",
        ".env": "Env Config",
        ".txt": "Text",
        ".gitignore": "Git Config",
        ".gitattributes": "Git Config"
    }
    if ext in mapping:
        return mapping[ext]
    if name == "mvnw":
        return "Shell Script"
    if name == "pom.xml":
        return "Maven POM"
    return "Source Code"


# ---------------------------------------------------------
# NUMBERED CANVAS
# ---------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, total_pages):
        self.setStrokeColor(COLOR_FOOTER_LINE)
        self.setLineWidth(0.6)
        self.line(36, 32, 559.27, 32)

        self.setFont(UI_FONT, 8)
        self.setFillColor(COLOR_FOOTER_TEXT)
        self.drawString(36, 20, "PortalApp • Source Code Archive")

        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.setFont(UI_FONT_BOLD, 8)
        self.drawRightString(559.27, 20, page_str)


# ---------------------------------------------------------
# CODE WRAPPING WITH WORD-BOUNDARY INTELLIGENCE
# ---------------------------------------------------------
def wrap_tokens_for_line(line_tokens, line_no_str, max_chars):
    """Wraps line tokens cleanly respecting word boundaries."""
    render_lines = []
    if not line_tokens:
        return [(line_no_str, [], False)]

    curr_chunk = []
    curr_len = 0
    first_segment = True
    limit = max_chars

    sub_tokens = []
    for t_type, text in line_tokens:
        text = text.replace("\t", "    ")
        if " " in text:
            parts = re.split(r"(\s+)", text)
            for p in parts:
                if p:
                    sub_tokens.append((t_type, p))
        else:
            sub_tokens.append((t_type, text))

    for t_type, text in sub_tokens:
        if curr_len + len(text) <= limit:
            curr_chunk.append((t_type, text))
            curr_len += len(text)
        else:
            if curr_chunk:
                render_lines.append(
                    (line_no_str if first_segment else "", curr_chunk, not first_segment)
                )
                first_segment = False
                curr_chunk = []
                curr_len = 0
                limit = max_chars - 3
                if text.isspace():
                    continue

            if len(text) <= limit:
                curr_chunk.append((t_type, text))
                curr_len += len(text)
            else:
                while text:
                    space = limit - curr_len
                    curr_chunk.append((t_type, text[:space]))
                    render_lines.append(
                        (line_no_str if first_segment else "", curr_chunk, not first_segment)
                    )
                    first_segment = False
                    text = text[space:]
                    curr_chunk = []
                    curr_len = 0
                    limit = max_chars - 3

    if curr_chunk:
        render_lines.append(
            (line_no_str if first_segment else "", curr_chunk, not first_segment)
        )

    return render_lines


# ---------------------------------------------------------
# PDF RENDERER FUNCTION
# ---------------------------------------------------------
def render_code_to_pdf(filepath, rel_path, output_pdf_path):
    """Converts a source code file to a styled PDF."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False, 0

    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)

    lexer = get_lexer_for_file(filepath, content)
    lang_name = get_language_name(filepath)
    raw_lines = content.splitlines()
    total_lines_count = len(raw_lines)
    file_size_kb = os.path.getsize(filepath) / 1024.0

    tokens = pygments.lex(content, lexer)
    lines_of_tokens = []
    current_tokens = []
    for t_type, t_val in tokens:
        if "\n" in t_val:
            parts = t_val.split("\n")
            for i, part in enumerate(parts):
                if i > 0:
                    lines_of_tokens.append(current_tokens)
                    current_tokens = []
                if part:
                    current_tokens.append((t_type, part))
        else:
            if t_val:
                current_tokens.append((t_type, t_val))
    if current_tokens:
        lines_of_tokens.append(current_tokens)

    page_width, page_height = A4
    margin_x = 36.0
    gutter_w = 40.0
    padding_code_x = 8.0
    font_size = 8.0
    line_height = 11.2

    char_w = pdfmetrics.stringWidth("M", CODE_FONT, font_size)
    code_usable_w = page_width - (margin_x * 2) - gutter_w - (padding_code_x * 2)
    max_chars = max(40, int(code_usable_w / char_w))

    render_lines = []
    if not lines_of_tokens:
        render_lines.append(("1", [], False))
    else:
        for line_idx, line_tokens in enumerate(lines_of_tokens):
            line_no_str = str(line_idx + 1)
            wrapped = wrap_tokens_for_line(line_tokens, line_no_str, max_chars)
            render_lines.extend(wrapped)

    c = NumberedCanvas(output_pdf_path, pagesize=A4)
    c.setTitle(f"{os.path.basename(filepath)} - Source Code")
    c.setAuthor("PortalApp Exporter")
    c.setSubject(rel_path)

    page_idx = 0
    line_ptr = 0
    total_renders = len(render_lines)

    while line_ptr < total_renders or page_idx == 0:
        page_idx += 1

        if page_idx == 1:
            header_h = 56.0
            top_y = page_height - 36.0 - header_h
        else:
            header_h = 28.0
            top_y = page_height - 36.0 - header_h

        bottom_y = 44.0
        available_h = top_y - bottom_y
        lines_per_page = int(available_h / line_height)

        if page_idx == 1:
            c.setFillColor(COLOR_HEADER_BG)
            c.roundRect(margin_x, page_height - 36.0 - header_h, page_width - (margin_x * 2), header_h, 4, fill=1, stroke=0)

            c.setFillColor(COLOR_HEADER_TITLE)
            c.setFont(CODE_FONT_BOLD, 12)
            c.drawString(margin_x + 12, page_height - 36.0 - 22, os.path.basename(filepath))

            c.setFillColor(COLOR_HEADER_SUB)
            c.setFont(UI_FONT, 8.5)
            clean_path = rel_path.replace("\\", "/")
            if len(clean_path) > 75:
                clean_path = clean_path[:35] + "..." + clean_path[-37:]
            c.drawString(margin_x + 12, page_height - 36.0 - 42, clean_path)

            badge1_text = lang_name.upper()
            c.setFont(UI_FONT_BOLD, 8)
            badge1_w = c.stringWidth(badge1_text, UI_FONT_BOLD, 8) + 16
            badge1_x = page_width - margin_x - 12 - badge1_w
            badge1_y = page_height - 36.0 - 36

            c.setFillColor(COLOR_BADGE_BG)
            c.setStrokeColor(COLOR_BADGE_BORDER)
            c.setLineWidth(0.8)
            c.roundRect(badge1_x, badge1_y, badge1_w, 20, 3, fill=1, stroke=1)
            c.setFillColor(COLOR_BADGE_LANG)
            c.drawString(badge1_x + 8, badge1_y + 6, badge1_text)

            badge2_text = f"{total_lines_count} lines  •  {file_size_kb:.1f} KB"
            c.setFont(UI_FONT, 8)
            badge2_w = c.stringWidth(badge2_text, UI_FONT, 8) + 14
            badge2_x = badge1_x - badge2_w - 6

            c.setFillColor(COLOR_BADGE_BG)
            c.setStrokeColor(COLOR_BADGE_BORDER)
            c.setLineWidth(0.8)
            c.roundRect(badge2_x, badge1_y, badge2_w, 20, 3, fill=1, stroke=1)
            c.setFillColor(COLOR_BADGE_TEXT)
            c.drawString(badge2_x + 7, badge1_y + 6, badge2_text)

        else:
            c.setFillColor(COLOR_HEADER_BG)
            c.roundRect(margin_x, page_height - 36.0 - header_h, page_width - (margin_x * 2), header_h, 3, fill=1, stroke=0)

            c.setFillColor(COLOR_HEADER_TITLE)
            c.setFont(CODE_FONT_BOLD, 9.5)
            c.drawString(margin_x + 10, page_height - 36.0 - 18, os.path.basename(filepath))

            c.setFillColor(COLOR_HEADER_SUB)
            c.setFont(UI_FONT, 8)
            c.drawRightString(page_width - margin_x - 10, page_height - 36.0 - 18, f"(continued - {lang_name})")

        box_top = top_y - 6
        box_h = available_h
        box_w = page_width - (margin_x * 2)

        c.setFillColor(COLOR_CODE_BG)
        c.setStrokeColor(COLOR_CODE_BORDER)
        c.setLineWidth(0.6)
        c.rect(margin_x, bottom_y, box_w, box_h, fill=1, stroke=1)

        c.setFillColor(COLOR_GUTTER_BG)
        c.rect(margin_x, bottom_y, gutter_w, box_h, fill=1, stroke=0)

        c.setStrokeColor(COLOR_GUTTER_BORDER)
        c.setLineWidth(0.6)
        c.line(margin_x + gutter_w, bottom_y, margin_x + gutter_w, bottom_y + box_h)

        curr_y = box_top - line_height
        lines_drawn = 0

        while line_ptr < total_renders and lines_drawn < lines_per_page:
            line_no_str, token_chunks, is_continuation = render_lines[line_ptr]

            if line_no_str:
                c.setFont(CODE_FONT, font_size)
                c.setFillColor(COLOR_GUTTER_NUM)
                c.drawRightString(margin_x + gutter_w - 6, curr_y, line_no_str)

            x_pos = margin_x + gutter_w + padding_code_x
            if is_continuation:
                c.setFont(CODE_FONT, font_size)
                c.setFillColor(colors.HexColor("#94A3B8"))
                continuation_mark = "  ↳ "
                c.drawString(x_pos, curr_y, continuation_mark)
                x_pos += c.stringWidth(continuation_mark, CODE_FONT, font_size)

            for t_type, text in token_chunks:
                c.setFont(CODE_FONT, font_size)
                c.setFillColor(get_token_color(t_type))
                try:
                    c.drawString(x_pos, curr_y, text)
                    token_w = c.stringWidth(text, CODE_FONT, font_size)
                except Exception:
                    clean = "".join(ch if ord(ch) < 128 else "?" for ch in text)
                    c.drawString(x_pos, curr_y, clean)
                    token_w = c.stringWidth(clean, CODE_FONT, font_size)
                x_pos += token_w

            curr_y -= line_height
            line_ptr += 1
            lines_drawn += 1

        c.showPage()
        if line_ptr >= total_renders:
            break

    c.save()
    return True, page_idx


# ---------------------------------------------------------
# MASTER WORKFLOW
# ---------------------------------------------------------
def main():
    start_time = time.time()
    workspace_root = r"c:\Users\Hp\Downloads\PortalApp-main (1)"
    portal_dir = os.path.join(workspace_root, "PortalApp-main")
    output_dir = os.path.join(workspace_root, "source_code_pdfs")

    os.makedirs(output_dir, exist_ok=True)

    IGNORE_DIRS = {
        "node_modules", "target", "uploads", "mysql_data", "__pycache__",
        ".idea", ".git", ".mvn", "dist", "build", "source_code_pdfs"
    }

    IGNORE_FILES = {
        "package-lock.json"
    }

    CODE_EXTS = {
        ".java", ".py", ".ts", ".tsx", ".js", ".jsx", ".html", ".css",
        ".properties", ".xml", ".json", ".bat", ".cmd", ".sql", ".md", ".txt",
        ".env", ".gitignore", ".gitattributes", ".sh"
    }

    file_list = []

    # 1. Scan PortalApp-main
    for root, dirs, files in os.walk(portal_dir):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
        for f in files:
            if f in IGNORE_FILES:
                continue
            ext = os.path.splitext(f)[1].lower()
            if ext in CODE_EXTS or f in (".env", "requirements.txt", "mvnw"):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, portal_dir)
                file_list.append((full_path, rel_path))

    # 2. Add root launcher
    root_bat = os.path.join(workspace_root, "start_all.bat")
    if os.path.exists(root_bat):
        file_list.append((root_bat, "root_start_all.bat"))

    # Sort files cleanly by directory and filename
    file_list.sort(key=lambda x: (x[1].count(os.sep), x[1]))

    print(f"============================================================")
    print(f"PORTALAPP SOURCE CODE TO PDF GENERATOR")
    print(f"Total source files to convert: {len(file_list)}")
    print(f"Target folder: {output_dir}")
    print(f"============================================================")

    generated_pdfs = []
    total_loc = 0
    total_pages = 0
    by_category = defaultdict(list)

    for idx, (full_path, rel_path) in enumerate(file_list, start=1):
        # Target PDF path mirrors directory structure
        out_pdf_name = f"{os.path.basename(full_path)}.pdf"
        rel_dir = os.path.dirname(rel_path)
        target_dir = os.path.join(output_dir, rel_dir)
        target_pdf_path = os.path.join(target_dir, out_pdf_name)

        # Categorize
        norm_rel = rel_path.replace("\\", "/")
        if norm_rel.startswith("backend/") or norm_rel.startswith("src/"):
            cat = "Backend (Spring Boot / Java)"
        elif norm_rel.startswith("frontend/"):
            cat = "Frontend (React / TypeScript / Vite)"
        elif norm_rel.startswith("ai_matcher/"):
            cat = "AI Matcher Service (FastAPI / Python)"
        else:
            cat = "Root Scripts & Configuration"

        success, pages = render_code_to_pdf(full_path, rel_path, target_pdf_path)
        if success:
            with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                loc = len(f.read().splitlines())
            size_kb = os.path.getsize(full_path) / 1024.0
            total_loc += loc
            total_pages += pages

            info = {
                "rel_path": norm_rel,
                "pdf_rel": os.path.relpath(target_pdf_path, output_dir).replace("\\", "/"),
                "pdf_full": target_pdf_path,
                "loc": loc,
                "size_kb": size_kb,
                "pages": pages,
                "lang": get_language_name(full_path)
            }
            generated_pdfs.append(info)
            by_category[cat].append(info)

            print(f"[{idx:3d}/{len(file_list):3d}] {pages:2d} pgs | {norm_rel}")
        else:
            print(f"[{idx:3d}/{len(file_list):3d}] FAILED | {norm_rel}")

    # ---------------------------------------------------------
    # GENERATE COMBINED MASTER CATALOG PDF
    # ---------------------------------------------------------
    print("\nMerging into ALL_SOURCE_CODE_CATALOG.pdf with bookmarks...")
    combined_pdf_path = os.path.join(output_dir, "ALL_SOURCE_CODE_CATALOG.pdf")
    writer = pypdf.PdfWriter()

    for item in generated_pdfs:
        pdf_path = item["pdf_full"]
        bookmark_label = f"{item['rel_path']} ({item['lang']})"
        writer.append(pdf_path, outline_item=bookmark_label, import_outline=False)

    with open(combined_pdf_path, "wb") as f_out:
        writer.write(f_out)
    print(f"Combined PDF generated: {combined_pdf_path}")

    # ---------------------------------------------------------
    # GENERATE README.MD & SUMMARY
    # ---------------------------------------------------------
    readme_path = os.path.join(output_dir, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f_md:
        f_md.write("# PortalApp - Source Code PDF Documentation Archive\n\n")
        f_md.write(f"Generated on **{datetime.now().strftime('%B %d, %Y at %H:%M:%S')}**.\n\n")
        f_md.write("## Overview Metrics\n\n")
        f_md.write(f"- **Total Source Files Converted:** {len(generated_pdfs)}\n")
        f_md.write(f"- **Total Lines of Source Code:** {total_loc:,} lines\n")
        f_md.write(f"- **Total PDF Pages Rendered:** {total_pages:,} pages\n")
        f_md.write(f"- **Master Combined Catalog:** [`ALL_SOURCE_CODE_CATALOG.pdf`](./ALL_SOURCE_CODE_CATALOG.pdf)\n\n")

        f_md.write("## Directory Layout\n\n")
        f_md.write("Each source file is rendered into an individual syntax-highlighted PDF preserving exact relative folder hierarchy:\n\n")
        f_md.write("```\n")
        f_md.write("source_code_pdfs/\n")
        f_md.write("├── ALL_SOURCE_CODE_CATALOG.pdf   # Complete indexed combined PDF with bookmarks\n")
        f_md.write("├── README.md                     # Documentation and index\n")
        f_md.write("├── ai_matcher/                   # FastAPI Python AI matcher service\n")
        f_md.write("├── backend/                      # Spring Boot Java enterprise backend\n")
        f_md.write("├── frontend/                     # React + TypeScript + Vite modern web UI\n")
        f_md.write("├── src/                          # Top-level Spring Boot source tree\n")
        f_md.write("└── start_all.bat.pdf             # Launch automation scripts\n")
        f_md.write("```\n\n")

        for cat, items in by_category.items():
            f_md.write(f"### {cat} ({len(items)} files)\n\n")
            f_md.write("| Source File | Language | Lines | Size | Pages | PDF Document |\n")
            f_md.write("| :--- | :--- | :---: | :---: | :---: | :--- |\n")
            for it in items:
                f_md.write(f"| `{it['rel_path']}` | {it['lang']} | {it['loc']} | {it['size_kb']:.1f} KB | {it['pages']} | [{os.path.basename(it['pdf_rel'])}]({it['pdf_rel']}) |\n")
            f_md.write("\n")

    # ---------------------------------------------------------
    # GENERATE INTERACTIVE INDEX.HTML
    # ---------------------------------------------------------
    cards_html = []
    for item in generated_pdfs:
        cat_key = "root"
        if "backend/" in item["rel_path"] or "src/" in item["rel_path"]:
            cat_key = "backend"
        elif "frontend/" in item["rel_path"]:
            cat_key = "frontend"
        elif "ai_matcher/" in item["rel_path"]:
            cat_key = "ai"

        ext = os.path.splitext(item["rel_path"])[1].upper().replace(".", "") or "SRC"
        card = f"""      <a href="{item['pdf_rel']}" target="_blank" class="file-card" data-name="{os.path.basename(item['rel_path']).lower()}" data-path="{item['rel_path'].lower()}" data-cat="{cat_key}">
        <div>
          <div class="card-top">
            <div class="file-name">{os.path.basename(item['rel_path'])}</div>
            <span class="file-badge">{ext}</span>
          </div>
          <div class="file-path">{item['rel_path']}</div>
        </div>
        <div class="card-footer">
          <span>{item['size_kb']:.1f} KB • {item['pages']} pgs</span>
          <span class="open-tag">Open PDF &rarr;</span>
        </div>
      </a>"""
        cards_html.append(card)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PortalApp - Source Code PDF Documentation</title>
  <style>
    :root {{
      --bg: #0b0f19;
      --card-bg: rgba(23, 32, 54, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --text: #f1f5f9;
      --muted: #94a3b8;
      --success: #34d399;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }}
    body {{
      background: radial-gradient(circle at 15% 15%, #131d33 0%, #0b0f19 100%);
      color: var(--text);
      min-height: 100vh;
      padding: 40px 24px;
    }}
    .container {{ max-width: 1200px; margin: 0 auto; }}
    header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      padding-bottom: 28px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 32px;
    }}
    .title-group h1 {{ font-size: 1.85rem; font-weight: 700; color: #fff; letter-spacing: -0.02em; }}
    .title-group p {{ color: var(--muted); font-size: 0.95rem; margin-top: 4px; }}
    .master-btn {{
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: #fff;
      text-decoration: none;
      padding: 12px 22px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 4px 18px var(--accent-glow);
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s ease;
    }}
    .master-btn:hover {{ transform: translateY(-2px); box-shadow: 0 8px 24px var(--accent-glow); }}
    
    .stats-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }}
    .stat-card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 20px;
      backdrop-filter: blur(8px);
    }}
    .stat-label {{ font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }}
    .stat-value {{ font-size: 1.75rem; font-weight: 700; color: #fff; margin-top: 6px; }}

    .toolbar {{
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }}
    .search-box {{
      flex: 1;
      min-width: 280px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 10px 16px;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
    }}
    .search-box:focus {{ border-color: var(--accent); }}
    .filter-pills {{ display: flex; gap: 8px; flex-wrap: wrap; }}
    .pill {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--muted);
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }}
    .pill.active, .pill:hover {{ background: #1e293b; color: #fff; border-color: var(--accent); }}

    .file-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 14px;
    }}
    .file-card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 14px 18px;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }}
    .file-card:hover {{
      transform: translateY(-2px);
      border-color: var(--accent);
      background: rgba(30, 41, 59, 0.85);
    }}
    .card-top {{ display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }}
    .file-name {{ font-weight: 600; color: #fff; font-size: 0.95rem; word-break: break-word; }}
    .file-badge {{
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent);
      border: 1px solid rgba(56, 189, 248, 0.3);
      white-space: nowrap;
    }}
    .file-path {{ color: var(--muted); font-size: 0.8rem; margin-top: 8px; word-break: break-all; font-family: Consolas, monospace; }}
    .card-footer {{ display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 0.78rem; color: var(--muted); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; }}
    .open-tag {{ color: var(--accent); font-weight: 500; }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-group">
        <h1>PortalApp Source Code Archive</h1>
        <p>Complete source code converted to high-definition syntax-highlighted PDF documents</p>
      </div>
      <a href="ALL_SOURCE_CODE_CATALOG.pdf" target="_blank" class="master-btn">
        <span>📑</span> Open Combined Catalog PDF (241 Pages)
      </a>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total PDF Files</div>
        <div class="stat-value">{len(generated_pdfs)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Combined Catalog</div>
        <div class="stat-value">{total_pages} Pages</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Code Lines</div>
        <div class="stat-value">{total_loc:,}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Format</div>
        <div class="stat-value" style="color: var(--success);">Vector A4 PDF</div>
      </div>
    </div>

    <div class="toolbar">
      <input type="text" id="search" class="search-box" placeholder="Search by filename, path, or extension..." />
      <div class="filter-pills">
        <button class="pill active" data-cat="all">All ({len(generated_pdfs)})</button>
        <button class="pill" data-cat="backend">Backend</button>
        <button class="pill" data-cat="frontend">Frontend</button>
        <button class="pill" data-cat="ai">AI Matcher</button>
        <button class="pill" data-cat="root">Root Scripts</button>
      </div>
    </div>

    <div class="file-grid" id="file-grid">
{chr(10).join(cards_html)}
    </div>
  </div>

  <script>
    const search = document.getElementById('search');
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.file-card');
    let activeCat = 'all';

    function filterCards() {{
      const q = search.value.toLowerCase().trim();
      cards.forEach(card => {{
        const name = card.getAttribute('data-name');
        const path = card.getAttribute('data-path');
        const cat = card.getAttribute('data-cat');

        const matchesSearch = !q || name.includes(q) || path.includes(q);
        const matchesCat = activeCat === 'all' || cat === activeCat;

        if (matchesSearch && matchesCat) {{
          card.style.display = 'flex';
        }} else {{
          card.style.display = 'none';
        }}
      }});
    }}

    search.addEventListener('input', filterCards);

    pills.forEach(pill => {{
      pill.addEventListener('click', () => {{
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCat = pill.getAttribute('data-cat');
        filterCards();
      }});
    }});
  </script>
</body>
</html>
"""
    index_html_path = os.path.join(output_dir, "INDEX.html")
    with open(index_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    elapsed = time.time() - start_time
    print(f"\n============================================================")
    print(f"SUCCESS! All {len(generated_pdfs)} PDFs created in {elapsed:.1f} seconds.")
    print(f"Master Catalog: {combined_pdf_path}")
    print(f"Documentation: {readme_path}")
    print(f"Interactive Index: {index_html_path}")
    print(f"============================================================")


if __name__ == "__main__":
    main()
