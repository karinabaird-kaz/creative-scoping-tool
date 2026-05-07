# Scope Generator Change Log

---
CHANGE: Increase modal width by ~25% (max-w-2xl → max-w-[840px]) and enforce minimum height of 580px; grow brief textarea from 8 to 10 rows
FILE: src/components/ScopeGeneratorModal.tsx
BEFORE: <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
AFTER: <div className="bg-white rounded-xl max-w-[840px] w-full max-h-[90vh] min-h-[580px] overflow-hidden flex flex-col shadow-2xl">

BEFORE: rows={8}
AFTER: rows={10}
---
