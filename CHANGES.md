# Scope Generator Change Log

---
CHANGE: Overhaul system prompt — ban markdown formatting, integrate deliverables into each section, enforce correct phase naming
FILE: src/lib/scopeGenerator.ts
BEFORE: Used **bold** section headers (rendered as asterisks in plain text); had a separate "Deliverables" section; used "Design / Production" as a phase name
AFTER: Explicit "no markdown, no asterisks" rule; deliverables are the last bullet(s) within each phase section; phase names locked to: Strategy, Creative Development, Design Development, Production (shoots only), Website Creative Direction
---

---
CHANGE: PDF upload now extracts text-only via pdf.js, ignoring embedded images — fixes token overflow on image-heavy PDFs; remove pre-flight size check (no longer needed); show "Extracting text…" state in file drop zone; disable Generate button while extracting
FILE: package.json, src/components/ScopeGeneratorModal.tsx
BEFORE: FileReader.readAsText() read raw PDF binary including images; pre-flight token check blocked oversized inputs
AFTER: pdfjs-dist (^4.10.38) added to dependencies; PDF files use pdfjsLib.getDocument() to extract text per page; non-PDF files still use FileReader.readAsText(); isExtracting state drives UI feedback; pre-flight check removed
---

---
CHANGE: Add pre-flight token size check in handleGenerate() — catches oversized inputs (e.g. image-heavy PDFs) before hitting the API, with a helpful error message
FILE: src/components/ScopeGeneratorModal.tsx
BEFORE: (no size check — API error returned after call)
AFTER: if estimatedTokens > 150000, show error explaining to use Paste Brief for PDFs
---

---
CHANGE: Fix demo-mode refine stripping blank lines between sections — remove split/filter/join, replace with trimEnd()
FILE: src/lib/scopeGenerator.ts
BEFORE: .split('\n').filter((line) => line.trim() !== '').slice(0, 20).join('\n')
AFTER: .trimEnd()
---

---
CHANGE: Revert flex layout; use simple fixed h-[320px] scrollable text area so Refine section is always visible below it
FILE: src/components/ScopeGeneratorModal.tsx
BEFORE: <div className="flex-1 overflow-hidden flex flex-col p-6"> / flex flex-col flex-1 wrapper / flex-1 overflow-y-auto text area / shrink-0 refine
AFTER: <div className="flex-1 overflow-y-auto p-6"> / plain div wrapper / h-[320px] overflow-y-auto text area / plain div refine
---

---
CHANGE: Fix Refine section being hidden by adding shrink-0 so it always holds its height at the bottom; label row also shrink-0
FILE: src/components/ScopeGeneratorModal.tsx
BEFORE: {/* Refinement input */}
              <div>
AFTER: {/* Refinement input */}
              <div className="shrink-0">

BEFORE: <div className="flex items-center justify-between mb-2">
AFTER: <div className="flex items-center justify-between mb-2 shrink-0">
---

---
CHANGE: Generated scope text area now flex-expands to fill dead space in modal instead of being capped at max-h-52
FILE: src/components/ScopeGeneratorModal.tsx
BEFORE: <div className="flex-1 overflow-y-auto p-6">
AFTER: <div className="flex-1 overflow-hidden flex flex-col p-6">

BEFORE: {generatedText && (
            <div>
AFTER: {generatedText && (
            <div className="flex flex-col flex-1">

BEFORE: <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 max-h-52 overflow-y-auto mb-4">
AFTER: <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-1 overflow-y-auto mb-4">
---

---
CHANGE: Increase modal width by ~25% (max-w-2xl → max-w-[840px]) and enforce minimum height of 580px; grow brief textarea from 8 to 10 rows
FILE: src/components/ScopeGeneratorModal.tsx
BEFORE: <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
AFTER: <div className="bg-white rounded-xl max-w-[840px] w-full max-h-[90vh] min-h-[580px] overflow-hidden flex flex-col shadow-2xl">

BEFORE: rows={8}
AFTER: rows={10}
---
