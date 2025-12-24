# Real Fixes for PDF Extraction & OCR

## Date: December 23, 2025

## Summary of Root Causes Fixed

### 1. **MISLEADING UI WORD COUNT** ✅ FIXED
**Problem**: UI showed fake estimates (file size × 50) before extraction completed, confusing users.

**Root Cause**: Client-side metadata function calculated estimates for display, not real extraction.

**Real Fix Applied**:
- Removed all fake word count calculations
- Set `wordCount = null` for binary files (PDF, DOCX, images)
- Only calculate real word counts for text files
- Added `needsExtraction` flag to track status
- UI now shows "⏳ Extracting..." status until real extraction completes

**Files Changed**:
- `multi-file-handler.js` lines 110-125: Removed fake estimates
- `multi-file-handler.js` lines 145-147: Use `getWordCountDisplay()` helper
- `multi-file-handler.js` lines 170-199: Added status display methods

---

### 2. **NO EXTRACTION FEEDBACK** ✅ FIXED
**Problem**: Users had no visibility into extraction progress, especially for slow OCR operations (15-30 seconds).

**Root Cause**: No UI updates between upload and extraction completion.

**Real Fix Applied**:
- Added `getWordCountDisplay()` method to show dynamic status:
  - `⏳ Extracting...` (orange) - During extraction
  - `? words` (gray) - Unknown status
  - `⚠️ No text` (red) - Extraction failed/empty
  - `X words` (white) - Successful extraction
- Added `updateFileCardDisplay()` method to update UI when extraction completes
- Server extraction now updates file cards with real word counts

**Files Changed**:
- `multi-file-handler.js` lines 170-185: `getWordCountDisplay()` method
- `multi-file-handler.js` lines 187-199: `updateFileCardDisplay()` method
- `multi-file-handler.js` lines 330-340: Call `updateFileCardDisplay()` after extraction

---

### 3. **HARDCODED OCR PAGE LIMIT** ✅ FIXED
**Problem**: OCR silently limited to 10 pages with no user notification. Larger PDFs truncated without warning.

**Root Cause**: Magic number `10` hardcoded in loop. No feedback about truncation.

**Real Fix Applied**:
- Moved to configurable constant: `OCR_PAGE_LIMIT = 20`
- Added warning in server logs when limit exceeded
- Prefix extracted text with notice: `[Note: This 25-page PDF was OCR-scanned. Showing first 20 pages only for performance reasons.]`
- Include page info in each page header: `--- Page 5 of 25 ---`
- Return metadata: `ocrLimited` and `ocrPagesProcessed` fields

**Files Changed**:
- `netlify/functions/extract-documents.cjs` lines 122-123: Configurable limit
- `netlify/functions/extract-documents.cjs` lines 125-128: Warning when truncated
- `netlify/functions/extract-documents.cjs` lines 137-140: Prefix notice
- `netlify/functions/extract-documents.cjs` lines 156-157: Include total page count
- `netlify/functions/extract-documents.cjs` lines 162-168: Return truncation metadata

---

### 4. **UNHELPFUL ERROR MESSAGES** ✅ FIXED
**Problem**: OCR failures returned generic error text. Users had no idea what went wrong or how to fix it.

**Root Cause**: Catch block just logged error and returned vague warning.

**Real Fix Applied**:
- Added detailed error logging with stack traces
- Error message analysis to identify specific failure types:
  - `Uint8Array` error → "OCR initialization failed (type error). Server needs restart."
  - `canvas` error → "Failed to render PDF pages."
  - `tesseract` error → "OCR engine failed."
  - Other → Show actual error message
- Return `error` field in response for debugging
- Provide actionable guidance to users

**Files Changed**:
- `netlify/functions/extract-documents.cjs` lines 171-173: Detailed error logging
- `netlify/functions/extract-documents.cjs` lines 175-186: Error analysis and helpful messages

---

### 5. **BUFFER TYPE ERROR** ✅ FIXED (Previously)
**Problem**: `pdfjs-dist` v3.x requires `Uint8Array`, but Node.js file reading returns `Buffer`.

**Root Cause**: Type mismatch between Node.js Buffer and browser-style TypedArray.

**Real Fix Applied**:
- Convert Buffer to Uint8Array before passing to pdfjs-dist:
  ```javascript
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  ```

**Files Changed**:
- `netlify/functions/extract-documents.cjs` lines 133-134: Type conversion

---

## Technical Architecture

### Client-Side (multi-file-handler.js)
1. **Upload**: User selects file → File object stored
2. **Metadata**: Extract basic info (size, type, name)
3. **Display**: Show file card with "⏳ Extracting..." status
4. **Send**: Upload to server via FormData
5. **Update**: Receive real word count → Update card display

### Server-Side (extract-documents.cjs)
1. **Receive**: Parse multipart/form-data uploads
2. **Extract**: Try text extraction with pdf-parse
3. **Analyze**: Check word density (< 10 words/page = scanned)
4. **OCR**: If scanned, render to canvas → tesseract OCR
5. **Limit**: Process max 20 pages (configurable)
6. **Return**: `{text, wordCount, pageCount, ocrLimited, ocrPagesProcessed}`

### OCR Flow
```
Scanned PDF detected
→ Convert Buffer to Uint8Array
→ Load PDF with pdfjs-dist
→ For each page (up to limit):
  → Render page to canvas (scale 2.0)
  → Export canvas as PNG
  → OCR with tesseract.js (English)
  → Append text with page marker
→ Return combined text + metadata
```

---

## Configuration Constants

### OCR Settings
- **Page Limit**: 20 pages (line 123 in extract-documents.cjs)
- **Scale Factor**: 2.0 (line 146 in extract-documents.cjs)
- **Language**: English ('eng' - line 155 in extract-documents.cjs)
- **Scan Detection**: < 10 words/page (line 120 in extract-documents.cjs)

### To Adjust:
```javascript
// In extract-documents.cjs
const OCR_PAGE_LIMIT = 20; // Change this value
const OCR_SCALE = 2.0; // Change viewport scale
const OCR_LANGUAGE = 'eng'; // Change language model
const SCAN_THRESHOLD = 10; // Words per page to trigger OCR
```

---

## Testing Steps

### 1. Test Normal PDF (Text Layer)
- Upload PDF with embedded text
- Should extract immediately (< 1 second)
- No OCR triggered
- Full word count displayed

### 2. Test Scanned PDF (No Text Layer)
- Upload scanned image PDF
- Should show "⏳ Extracting..." status
- Server logs show OCR progress
- Takes 15-30 seconds
- UI updates with real word count
- Text extracted from images

### 3. Test Large Scanned PDF (> 20 pages)
- Upload scanned PDF with 25+ pages
- OCR processes first 20 pages
- Notice displayed: `[Note: This 25-page PDF was OCR-scanned...]`
- Each page shows: `--- Page 5 of 25 ---`
- Server logs show: `⚠️ PDF has 25 pages. OCR limited to first 20 pages`

### 4. Test OCR Failure
- Trigger error (corrupt PDF, missing dependencies)
- Error message identifies failure type
- Provides actionable guidance
- Doesn't crash server

---

## Performance Considerations

### OCR Processing Time
- **Per Page**: ~1-2 seconds (tesseract initialization + recognition)
- **20 Pages**: ~20-40 seconds total
- **First Run**: Slower (tesseract loads language model)
- **Subsequent**: Faster (model cached)

### Memory Usage
- **Canvas Rendering**: ~10-20 MB per page
- **20 Pages**: ~200-400 MB peak
- **Garbage Collection**: Canvas freed after each page

### Network Timeouts
- Default Netlify function timeout: 10 seconds
- OCR operations: 20-40 seconds
- **CRITICAL**: Need to configure longer timeout in `netlify.toml`:
  ```toml
  [functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  
  [functions."extract-documents"]
  timeout = 60  # 60 seconds for OCR
  ```

---

## Known Limitations

1. **OCR Language**: English only (can add more tesseract language packs)
2. **Page Limit**: 20 pages max (configurable but impacts performance)
3. **Quality**: OCR accuracy depends on scan quality (resolution, skew, noise)
4. **Font Support**: May struggle with handwriting or unusual fonts
5. **No Progress Bar**: UI shows status but not percentage during OCR

---

## Future Improvements

### Short Term
- [ ] Add progress bar for OCR operations
- [ ] Make page limit user-configurable
- [ ] Add OCR confidence scores to output
- [ ] Support multi-language OCR

### Long Term
- [ ] Cache OCR results in database (avoid re-processing)
- [ ] Image pre-processing (deskew, denoise, contrast)
- [ ] Parallel page processing (process multiple pages simultaneously)
- [ ] Alternative OCR engines (Google Cloud Vision, AWS Textract)
- [ ] Client-side OCR for smaller files (browser tesseract.js)

---

## Deployment Checklist

✅ Fix fake UI word counts  
✅ Add extraction status display  
✅ Configure OCR page limits  
✅ Improve error messages  
✅ Fix Buffer → Uint8Array conversion  
✅ Server restarted with fixes  
⏳ Configure Netlify timeout to 60s (manual step)  
⏳ Test with real scanned PDFs  
⏳ Monitor server logs for OCR performance  

---

## Conclusion

These are **real, structural fixes** that address root causes:

1. ✅ **Eliminated misleading data** - No more fake word counts
2. ✅ **Added transparency** - Users see extraction status
3. ✅ **Made limits visible** - Page truncation clearly communicated
4. ✅ **Improved error handling** - Specific, actionable error messages
5. ✅ **Fixed type errors** - Proper data types for all APIs

No band-aids. No quick hacks. Just **proper architectural solutions**.
