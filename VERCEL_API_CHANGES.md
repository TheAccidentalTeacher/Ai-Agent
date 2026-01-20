# Vercel Migration - API URL Changes Required

## Summary

This document lists every file that contains `/.netlify/functions/` references that must be changed to `/api/` for Vercel migration.

**Total Files to Modify**: 13
**Total API Calls to Update**: 27

---

## Files to Update

### 1. editor.js (2 changes)
```
Line 1555: console.log('[AI Message] 🌐 Making fetch request to /.netlify/functions/chat');
Line 1560: const response = await fetch('/.netlify/functions/chat', {
```
**Change to**: `/api/chat`

---

### 2. transcript-fetcher.js (3 changes)
```
Line 48:  fetch('/.netlify/functions/youtube-transcript', {
Line 116: fetch('/.netlify/functions/youtube-whisper-transcript', {
Line 223: fetch('/.netlify/functions/youtube-transcript', {
```
**Change to**: `/api/youtube-transcript`, `/api/whisper-transcript`

---

### 3. video-ui.js (3 changes)
```
Line 197: fetch('/.netlify/functions/youtube-search', {
Line 231: fetch('/.netlify/functions/youtube-search', {
Line 989: fetch('/.netlify/functions/youtube-search', {
```
**Change to**: `/api/youtube-search`

---

### 4. video-batch-ui.js (4 changes)
```
Line 248: fetch('/.netlify/functions/video-batch-summary', {
Line 263: fetch('/.netlify/functions/video-batch-quiz', {
Line 278: fetch('/.netlify/functions/video-batch-vocabulary', {
Line 293: fetch('/.netlify/functions/video-batch-study-guide', {
```
**Change to**: `/api/video-batch-summary`, etc.

---

### 5. video-analyzer.js (1 change)
```
Line 10: this.apiEndpoint = '/.netlify/functions/video-analyze';
```
**Change to**: `/api/video-analyze`

---

### 6. expert-panels.js (3 changes)
```
Line 301: fetch('/.netlify/functions/chat', {
Line 358: fetch('/.netlify/functions/chat', {
Line 395: fetch('/.netlify/functions/chat', {
```
**Change to**: `/api/chat`

---

### 7. multi-model.js (2 changes)
```
Line 120: fetch('/.netlify/functions/multi-model', {
Line 186: fetch('/.netlify/functions/chat', {
```
**Change to**: `/api/multi-model`, `/api/chat`

---

### 8. multi-file-handler.js (2 changes)
```
Line 207: fetch('/.netlify/functions/extract-documents', {
Line 380: fetch('/.netlify/functions/extract-documents', {
```
**Change to**: `/api/extract-documents`

---

### 9. document-upload.js (2 changes)
```
Line 298: fetch('/.netlify/functions/document-upload', {
Line 331: fetch('/.netlify/functions/document-process', {
```
**Change to**: `/api/document-upload`, `/api/document-process`

---

### 10. memory-ui.js (1 change)
```
Line 469: fetch('/.netlify/functions/memory-auto-connect', {
```
**Change to**: `/api/memory-auto-connect`

---

### 11. memory-analytics.js (1 change)
```
Line 30: fetch(`/.netlify/functions/memory-analytics?userId=${userId}`, {
```
**Change to**: `/api/memory-analytics`

---

### 12. autonomous-agents.js (2 changes)
```
Line 655: '/.netlify/functions/deep-research' : 
Line 656: '/.netlify/functions/research';
```
**Change to**: `/api/deep-research`, `/api/research`

---

### 13. app-init.js (1 change)
```
Line 124: fetch('/.netlify/functions/chat', {
```
**Change to**: `/api/chat`

---

## Functions to Create in /api/

Based on the above, here are all the Vercel API routes needed:

| Vercel Route | Netlify Source |
|--------------|----------------|
| `/api/chat.js` | `netlify/functions/chat.cjs` |
| `/api/youtube-transcript.js` | `netlify/functions/youtube-transcript.cjs` |
| `/api/whisper-transcript.js` | `netlify/functions/youtube-whisper-transcript.cjs` |
| `/api/gemini-transcript.js` | `netlify/functions/youtube-gemini-transcript.cjs` |
| `/api/youtube-search.js` | `netlify/functions/youtube-search.cjs` |
| `/api/video-analyze.js` | `netlify/functions/video-analyze.cjs` |
| `/api/video-batch-summary.js` | `netlify/functions/video-batch-summary.cjs` |
| `/api/video-batch-quiz.js` | `netlify/functions/video-batch-quiz.cjs` |
| `/api/video-batch-vocabulary.js` | `netlify/functions/video-batch-vocabulary.cjs` |
| `/api/video-batch-study-guide.js` | `netlify/functions/video-batch-study-guide.cjs` |
| `/api/multi-model.js` | `netlify/functions/multi-model.cjs` |
| `/api/extract-documents.js` | `netlify/functions/extract-documents.cjs` |
| `/api/document-upload.js` | `netlify/functions/document-upload.cjs` |
| `/api/document-process.js` | `netlify/functions/document-process.cjs` |
| `/api/memory-auto-connect.js` | `netlify/functions/memory-auto-connect.cjs` |
| `/api/memory-analytics.js` | `netlify/functions/memory-analytics.cjs` |
| `/api/deep-research.js` | `netlify/functions/deep-research.cjs` |
| `/api/research.js` | `netlify/functions/research.cjs` |

---

## Quick Find & Replace

For each file, use this pattern:

**Find**: `/.netlify/functions/`
**Replace**: `/api/`

This will work for most cases. Then manually review to ensure endpoint names match.

---

## Validation Command

After migration, run:
```bash
grep -rn "\.netlify/functions" --include="*.js" --include="*.html" .
```

Should return 0 results (only documentation files).

---

*Generated: January 19, 2026*
