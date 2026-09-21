#!/usr/bin/env python3
"""Scaffold the expansion categories/blocks (components, layouts, ecommerce, forms, mobile, notices)."""
import json
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "packages", "blocks", "src")
CATALOG = os.path.join(ROOT, "packages", "blocks", "catalog.json")
TESTS = os.path.join(ROOT, "packages", "blocks", "test")

def v(label, props="{}", size=None, slug=None):
    return {"label": label, "propsRaw": props, "size": size, "slug": slug}

def core_variants():
    return [
        v("default", "{}", None, "000-default"),
    ]

# (category, file, name, description, kind, variants, cols)
BLOCKS = [
    # components — complex
    ("components", "tabs", "Tabs", "Underlined tabs with animated indicator and panel content.", "component", [
        v("default", "{}"), v("three tabs", "{tabs:[`Overview`,`Activity`,`Settings`],active:1}"),
        v("panels", "{panels:!0}"), v("icons", "{icons:!0}"),
    ], 2),
    ("components", "dialog", "Dialog", "Modal dialog with overlay, title, description and actions.", "component", [
        v("default", "{}"), v("form", "{form:!0,title:`Invite teammate`}"),
        v("danger", "{variant:`danger`,title:`Delete project`}"), v("wide", "{width:`wide`}"),
    ], 2),
    ("components", "dropdown-menu", "Dropdown Menu", "Menu with items, separators, icons, shortcuts and a danger zone.", "component", [
        v("default", "{}"), v("with shortcuts", "{shortcuts:!0}"), v("danger", "{danger:!0}"), v("checkbox items", "{checks:!0}"),
    ], 2),
    ("components", "command", "Command Palette", "Command menu with search, groups, shortcuts and footer hints.", "component", [
        v("default", "{}"), v("with results", "{query:`dep`}"), v("empty", "{empty:!0}"), v("nested", "{groups:[`Actions`,`Navigation`,`Deploy`]}"),
    ], 2),
    ("components", "tooltip", "Tooltip", "Tooltips on the four sides with an arrow.", "component", [
        v("default", "{}"), v("rich", "{rich:!0,title:`Pro tip`}"),
    ], 2),
    ("components", "accordion", "Accordion", "Single-open accordion with smooth height animation.", "component", [
        v("default", "{}"), v("multiple", "{count:4}"), v("icons", "{icons:!0}"),
    ], 2),
    # components — simple
    ("components", "progress", "Progress", "Determinate and indeterminate progress bars.", "component", [
        v("default", "{value:64}"), v("thin", "{value:32,thin:!0}"), v("colored", "{value:78,color:`success`}"), v("indeterminate", "{}"),
    ], 3),
    ("components", "skeleton", "Skeleton", "Loading placeholders for text, avatar and media.", "component", [
        v("default", "{layout:`text`}"), v("avatar", "{layout:`avatar`}"), v("media", "{layout:`media`}"), v("card", "{layout:`card`}"),
    ], 3),
    ("components", "avatar", "Avatar", "Avatar with image, initials, presence dot and ring.", "component", [
        v("default", "{fallback:`SC`}"), v("image", "{img:!0}"), v("presence", "{presence:`online`}"), v("ring", "{ring:!0}"), v("sizes", "{sizes:!0}"),
    ], 3),
    ("components", "breadcrumb", "Breadcrumb", "Breadcrumb trail with separators and ellipsis.", "component", [
        v("default", "{}"), v("slash", "{separator:`slash`}"), v("ellipsis", "{ellipsis:!0}"),
    ], 3),
    ("components", "alert", "Alert", "Inline alerts: info, success, warning and destructive.", "component", [
        v("default", "{variant:`info`}"), v("success", "{variant:`success`}"), v("warning", "{variant:`warning`}"), v("destructive", "{variant:`destructive`}"),
    ], 3),
    ("components", "switch", "Switch", "Toggle switch with labels and checked states.", "component", [
        v("default", "{checked:!0,label:`Email notifications`}"), v("off", "{label:`Usage analytics`}"), v("disabled", "{disabled:!0,checked:!0,label:`Required`"),
    ], 3),
    ("components", "checkbox", "Checkbox", "Checkbox with labels, mixed state and cards.", "component", [
        v("default", "{checked:!0,label:`Accept terms`}"), v("unchecked", "{label:`Subscribe`}"), v("mixed", "{mixed:!0,label:`Select all`}"), v("card", "{card:!0,checked:!0,label:`Pro plan`}"),
    ], 3),
    ("components", "select", "Select", "Native-feel select with chevron and floating options.", "component", [
        v("default", "{value:`eu-west-1`}"), v("open", "{open:!0}"), v("invalid", "{invalid:!0,value:``}"),
    ], 3),
    ("components", "pagination", "Pagination", "Page navigation with numbers, arrows and compact mode.", "component", [
        v("default", "{page:2,total:9}"), v("compact", "{compact:!0,page:4,total:12}"), v("rounded", "{rounded:!0}"),
    ], 3),
    ("components", "kbd", "Keyboard", "Keyboard key chips and combos.", "component", [
        v("single", "{keys:[`⌘`]}"), v("combo", "{keys:[`⌘`,`Shift`,`P`]}"), v("arrows", "{keys:[`↑`,`↓`]}"),
    ], 3),
    ("components", "table", "Data Table", "Table with header, rows, status pills and hover states.", "component", [
        v("default", "{}"), v("with checkboxes", "{checkboxes:!0}"), v("loading rows", "{loading:!0}"),
    ], 2),
    ("components", "toast", "Toast", "Toast notifications: default, success, error and with action.", "component", [
        v("default", "{}"), v("success", "{variant:`success`}"), v("error", "{variant:`error`}"), v("with action", "{action:!0}"), v("stacked", "{stack:2}"),
    ], 3),
    # layouts
    ("layouts", "dashboard-shell", "Dashboard Shell", "A full analytics dashboard: collapsible sidebar, topbar, KPI row and chart card.", "layout", [
        v("default", "{}"), v("collapsed sidebar", "{collapsed:!0}"), v("mobile", "{viewport:`mobile`}"),
    ], 1),
    ("layouts", "docs-shell", "Docs Shell", "Documentation layout with sidebar nav, article and on-this-page list.", "layout", [
        v("default", "{}"), v("with code block", "{code:!0}"),
    ], 1),
    ("layouts", "marketing-shell", "Marketing Shell", "Landing page scaffold: header, hero, feature grid, CTA and footer.", "layout", [
        v("default", "{}"), v("dark hero", "{darkHero:!0}"),
    ], 1),
    ("layouts", "auth-shell", "Auth Shell", "Split-screen authentication layout with form and brand panel.", "layout", [
        v("default", "{}"), v("signup", "{mode:`signup`}"),
    ], 1),
    ("layouts", "settings-shell", "Settings Shell", "Settings layout with sectioned sidebar nav and form panels.", "layout", [
        v("default", "{}"), v("danger zone", "{danger:!0}"),
    ], 1),
    ("layouts", "mobile-app-shell", "Mobile App Shell", "A phone-framed app: status bar, scrollable feed and floating tab bar.", "layout", [
        v("default", "{}"), v("dark", "{dark:!0}"),
    ], 1),
    # ecommerce
    ("ecommerce", "product-card", "Product Card", "Product card with image, price, rating and add-to-cart.", "block", [
        v("default", "{}"), v("on sale", "{sale:!0}"), v("out of stock", "{stock:`out`}"), v("hover add", "{hoverAdd:!0}"),
    ], 2),
    ("ecommerce", "product-grid", "Product Grid", "Responsive grid of product cards with filter chips.", "block", [
        v("default", "{}"), v("filtered", "{filter:`Shoes`}"),
    ], 1),
    ("ecommerce", "cart-drawer", "Cart Drawer", "Slide-over cart with line items, quantities and checkout summary.", "block", [
        v("default", "{}"), v("discount", "{discount:!0}"), v("empty", "{empty:!0}"),
    ], 2),
    ("ecommerce", "order-row", "Order Row", "Compact order line with status, total and tracking.", "block", [
        v("default", "{}"), v("shipped", "{status:`shipped`}"), v("refunded", "{status:`refunded`}"),
    ], 2),
    ("ecommerce", "checkout-summary", "Checkout Summary", "Order summary with lines, totals and pay button.", "block", [
        v("default", "{}"), v("with promo", "{promo:!0}"),
    ], 2),
    # forms
    ("forms", "login", "Login", "Sign-in card with email, password, remember me and social buttons.", "block", [
        v("default", "{}"), v("error", "{error:!0}"), v("loading", "{loading:!0}"),
    ], 2),
    ("forms", "signup", "Signup", "Registration form with password strength meter.", "block", [
        v("default", "{}"), v("strong", "{strength:4}"), v("weak", "{strength:1}"),
    ], 2),
    ("forms", "onboarding-wizard", "Onboarding Wizard", "Multi-step form with progress dots and step transitions.", "block", [
        v("default", "{step:1}"), v("step 2", "{step:2}"), v("step 3", "{step:3}"),
    ], 2),
    ("forms", "settings-form", "Settings Form", "Grouped settings inputs with save bar on change.", "block", [
        v("default", "{}"), v("dirty", "{dirty:!0}"), v("saved", "{saved:!0}"),
    ], 2),
    ("forms", "feedback", "Feedback", "NPS-style feedback widget with score chips and comment.", "block", [
        v("default", "{score:9}"), v("with comment", "{comment:!0}"), v("submitted", "{submitted:!0}"),
    ], 2),
    # mobile
    ("mobile", "tab-bar", "Tab Bar", "Floating mobile tab bar with active indicator and badge.", "block", [
        v("default", "{}"), v("labels", "{labels:!0}"), v("with center action", "{center:!0}"), v("dark", "{dark:!0}"),
    ], 3),
    ("mobile", "app-bar", "App Bar", "Mobile top bar with back, title and trailing actions.", "block", [
        v("default", "{}"), v("large title", "{large:!0}"), v("scrolled", "{scrolled:!0}"),
    ], 3),
    ("mobile", "action-sheet", "Action Sheet", "Bottom action sheet with options and cancel.", "block", [
        v("default", "{}"), v("destructive", "{danger:!0}"),
    ], 3),
    ("mobile", "list-rows", "List Rows", "iOS-style grouped list rows with chevrons and values.", "block", [
        v("default", "{}"), v("grouped", "{groups:2}"), v("with icons", "{icons:!0}"),
    ], 3),
    # notices
    ("notices", "cookie-banner", "Cookie Banner", "Bottom cookie consent banner with accept and manage.", "block", [
        v("default", "{}"), v("minimal", "{minimal:!0}"),
    ], 2),
    ("notices", "callout", "Callout", "Page-level callout banners with icons and actions.", "block", [
        v("default", "{variant:`info`}"), v("warning", "{variant:`warning`}"), v("update", "{variant:`update`}"),
    ], 3),
    ("notices", "update-banner", "Update Banner", "Top-of-page release banner with changelog link.", "block", [
        v("default", "{}"), v("with action", "{action:!0}"),
    ], 3),
]

def pascal(s):
    return "".join(w.capitalize() for w in s.split("-"))

for cat_slug, file, name, desc, kind, variants, cols in BLOCKS:
    d = os.path.join(SRC, cat_slug, file)
    os.makedirs(os.path.join(d, "golden"), exist_ok=True)
    # slug the variants
    for i, var in enumerate(variants):
        if not var["slug"]:
            import re, unicodedata
            base = unicodedata.normalize("NFKD", var["label"]).encode("ascii", "ignore").decode()
            var["slug"] = f"{i:03d}-" + (re.sub(r"[^a-z0-9]+", "-", base.lower()).strip("-") or "variant")
    meta = {
        "category": cat_slug.capitalize(),
        "file": file,
        "name": name,
        "description": desc,
        "added": "2026-09-21",
        "kind": kind,
        "sourcePath": f"{cat_slug}/{file}.tsx",
        "page": {"cols": cols, "animated": True, "trigger": "inViewRepeat"},
        "chunks": {"page": None, "components": []},
        "variants": variants,
    }
    with open(os.path.join(d, "block.json"), "w") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
    react = os.path.join(d, "react.tsx")
    if not os.path.exists(react):
        with open(react, "w") as fh:
            fh.write("// TODO: implement per docs/authoring-guide.md — reference: packages/blocks/src/components/button/react.tsx\n")
    test_name = f"{cat_slug}-{file}.parity.test.tsx"
    test_path = os.path.join(TESTS, test_name)
    if not os.path.exists(test_path):
        with open(test_path, "w") as fh:
            fh.write(
                "import { dirname, join } from \"node:path\";\n"
                "import { fileURLToPath } from \"node:url\";\n"
                f'import {{ {pascal(file)} }} from "../src/{cat_slug}/{file}/react.js";\n'
                'import { runGoldenParity } from "./helpers/run-golden-parity.js";\n\n'
                f'const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/{cat_slug}/{file}");\n\n'
                f'runGoldenParity("{cat_slug}/{file}", {{\n'
                "  blockDir,\n"
                f"  Component: {pascal(file)},\n"
                "});\n"
            )
    print(f"scaffolded {cat_slug}/{file}")

# update catalog.json
cat = json.load(open(CATALOG))
existing = {(g["slug"], i["file"]) for g in cat for i in g["items"]}
for cat_slug, file, name, desc, kind, variants, cols in BLOCKS:
    if (cat_slug, file) in existing:
        continue
    for g in cat:
        if g["slug"] == cat_slug:
            g["items"].append({"file": file, "name": name, "description": desc, "added": "2026-09-21"})
            break
    else:
        cat.append({
            "category": cat_slug.capitalize(),
            "slug": cat_slug,
            "items": [{"file": file, "name": name, "description": desc, "added": "2026-09-21"}],
        })
cat.sort(key=lambda g: g["category"])
with open(CATALOG, "w") as fh:
    json.dump(cat, fh, indent=2, ensure_ascii=False)
total = sum(len(g["items"]) for g in cat)
print(f"catalog: {len(cat)} categories, {total} blocks")
