# Phase 9: Creative Studio Testing Checklist

**Testing Date**: _______________  
**Tester Name**: _______________  
**Environment**: ☐ Local Development ☐ Netlify Production  
**Browser**: ☐ Chrome ☐ Firefox ☐ Safari ☐ Edge  

---

## Pre-Testing Setup

### Environment Variables
- [ ] **REPLICATE_API_TOKEN** added to Netlify
- [ ] **OPENAI_API_KEY** verified (already configured)
- [ ] **ELEVENLABS_API_KEY** added (optional premium)
- [ ] Environment variables visible in Netlify dashboard
- [ ] Site redeployed after adding env vars

### Database Setup
- [ ] Supabase project accessible
- [ ] `004_creative_generations.sql` migration executed
- [ ] Table `creative_generations` exists in database
- [ ] RLS (Row-Level Security) enabled on table
- [ ] User can authenticate to Supabase

### API Keys Verification
- [ ] Replicate dashboard accessible at https://replicate.com
- [ ] API token starts with `r8_`
- [ ] Free credits available ($5 signup bonus)
- [ ] OpenAI API key valid (test in dashboard)
- [ ] ElevenLabs account created (if using premium TTS)

---

## Section 1: UI/UX Testing

### Modal Opening & Closing
- [ ] Creative Studio button (🎨) visible in toolbar
- [ ] Button positioned correctly (after 🤖 Multi-Agent button)
- [ ] Button has hover effect
- [ ] Click button opens modal
- [ ] Modal size is 98vw × 98vh (nearly full-screen)
- [ ] Modal has dark theme background (#1e1e1e)
- [ ] Header shows "🎨 Creative Studio" title
- [ ] Close button (×) visible in top-right corner
- [ ] Click close button closes modal
- [ ] Click outside modal closes it (ESC key or outside click)
- [ ] Modal reopens correctly after closing

### Tab Navigation
- [ ] 4 tabs visible: Images, Audio, Music, Video
- [ ] "Images" tab active by default (blue underline)
- [ ] Click "Audio" tab switches to audio panel
- [ ] Click "Music" tab switches to music panel
- [ ] Click "Video" tab shows "Coming Soon" message
- [ ] Active tab has blue underline (#007acc)
- [ ] Inactive tabs have hover effect
- [ ] Tab switching preserves previous form data
- [ ] Tab content displays immediately (no delay)

### Layout & Spacing
- [ ] Left panel (Creation Panel) is 40% width
- [ ] Right panel (Preview Panel) is 60% width
- [ ] Panels side-by-side on desktop (>1200px)
- [ ] Panels stack vertically on mobile (<1200px)
- [ ] All text is readable (good contrast)
- [ ] Scrollbars appear when content overflows
- [ ] No horizontal scrollbar on modal
- [ ] Padding and margins consistent throughout

---

## Section 2: Image Generation Testing

### Image Form - Basic Inputs
- [ ] Prompt textarea visible and functional
- [ ] Placeholder text: "Describe the image you want to create..."
- [ ] Character counter shows "0 / 2000"
- [ ] Typing updates character counter in real-time
- [ ] Counter turns red when exceeding 2000 chars
- [ ] Cannot submit with empty prompt
- [ ] Negative prompt textarea visible (optional)
- [ ] Negative prompt has "What to avoid..." placeholder

### Image Form - Model Selection
- [ ] Model dropdown shows 4 options:
  - [ ] Flux 2 (Best Quality - Recommended)
  - [ ] DALL-E 3 (OpenAI)
  - [ ] Stable Diffusion XL
  - [ ] DreamShaper
- [ ] Flux 2 selected by default
- [ ] Can change model selection
- [ ] Selected model highlighted

### Image Form - Style Presets
- [ ] Style dropdown shows 7 options:
  - [ ] Realistic
  - [ ] Artistic
  - [ ] Anime
  - [ ] 3D Render
  - [ ] Watercolor
  - [ ] Oil Painting
  - [ ] Pencil Sketch
- [ ] "Realistic" selected by default
- [ ] Can change style selection

### Image Form - Dimensions
- [ ] Dimensions dropdown shows 5 options:
  - [ ] 1024×1024 (Square)
  - [ ] 1024×768 (Landscape)
  - [ ] 768×1024 (Portrait)
  - [ ] 1280×720 (16:9)
  - [ ] 1920×1080 (Full HD)
- [ ] 1024×1024 selected by default
- [ ] Can change dimensions

### Image Form - Quantity
- [ ] Quantity dropdown shows 3 options:
  - [ ] 1 image
  - [ ] 2 images
  - [ ] 4 images
- [ ] "1 image" selected by default
- [ ] Can change quantity

### Image Form - Advanced Controls
- [ ] Quality Steps slider visible (range 10-50)
- [ ] Default value is 20
- [ ] Current value displays next to slider (e.g., "20")
- [ ] Slider updates value display in real-time
- [ ] Guidance Scale slider visible (range 1-20)
- [ ] Default value is 7.5
- [ ] Guidance value displays next to slider
- [ ] Slider moves smoothly

### Image Generation - Submit & Loading
- [ ] "Generate Image" button visible and enabled
- [ ] Button has purple gradient background
- [ ] Click button starts generation
- [ ] Button disables during generation
- [ ] Loading spinner appears (rotating animation)
- [ ] Status text shows "Generating image..."
- [ ] Form inputs disable during generation
- [ ] Cannot submit multiple generations simultaneously

### Image Generation - Results Display (Flux 2)
- [ ] **Test Prompt**: "A majestic dragon flying over mountains at sunset, realistic style"
- [ ] Generation completes in 5-15 seconds
- [ ] Image appears in Preview Panel
- [ ] Image loads correctly (no broken image icon)
- [ ] Image has good quality (sharp, not blurry)
- [ ] Image matches prompt description
- [ ] Image style matches selected preset
- [ ] Image dimensions match selected size
- [ ] No watermarks or logos on image

### Image Generation - Results Display (DALL-E 3)
- [ ] **Test Prompt**: "A cute robot learning to paint, cartoon style"
- [ ] Switch model to "DALL-E 3"
- [ ] Generation completes in 10-20 seconds
- [ ] Image quality is high (DALL-E signature style)
- [ ] Image matches prompt description
- [ ] No API errors in console

### Image Generation - Action Buttons
- [ ] "⬇️ Download" button visible below image
- [ ] Click download initiates file download
- [ ] Downloaded file is valid image (opens in image viewer)
- [ ] Filename includes timestamp (e.g., `image-1703456789.png`)
- [ ] "⬆️ Upscale 4x" button visible
- [ ] "📋 Copy URL" button visible
- [ ] Click "Copy URL" copies to clipboard
- [ ] Paste clipboard shows valid image URL

### Image Generation - Negative Prompts
- [ ] **Test Prompt**: "A beautiful landscape"
- [ ] **Negative Prompt**: "people, buildings, cars"
- [ ] Generated image excludes items in negative prompt
- [ ] No people visible in image
- [ ] No buildings visible in image
- [ ] No cars visible in image

### Image Generation - Batch Generation
- [ ] Set quantity to "2 images"
- [ ] Generate with same prompt
- [ ] Both images appear in results
- [ ] Images are different variations
- [ ] Both images match prompt
- [ ] Can download each image individually

### Image Generation - Error Handling
- [ ] **Test**: Submit with empty prompt
- [ ] Error message displays: "Prompt is required"
- [ ] **Test**: Exceed character limit (type 2500+ chars)
- [ ] Warning shown (red counter)
- [ ] **Test**: Invalid API key (if possible)
- [ ] Clear error message shown
- [ ] Generation stops gracefully

---

## Section 3: Image Upscaling Testing

### Upscaling - Basic Function
- [ ] Generate a 1024×1024 image first
- [ ] Click "⬆️ Upscale 4x" button
- [ ] Loading indicator appears
- [ ] Status text: "Upscaling image to 4096×4096..."
- [ ] Upscaling completes in 15-45 seconds
- [ ] Upscaled image displays (replaces original or shows side-by-side)
- [ ] Upscaled image is noticeably sharper
- [ ] Upscaled image has 4x dimensions (4096×4096)
- [ ] Can download upscaled version

### Upscaling - Face Restoration
- [ ] **Test Prompt**: "A portrait of a person, photorealistic"
- [ ] Generate portrait image
- [ ] Enable "Face Restore" checkbox (if available in UI)
- [ ] Click "⬆️ Upscale 4x"
- [ ] Upscaled image has enhanced facial details
- [ ] Face is clearer and more detailed
- [ ] No artifacts or distortions on face
- [ ] GFPGAN model used (check console logs)

### Upscaling - Error Handling
- [ ] **Test**: Upscale without generating image first
- [ ] Error message displayed (if applicable)
- [ ] **Test**: Upscale with invalid image URL
- [ ] Error handled gracefully
- [ ] User can try again

---

## Section 4: Text-to-Speech Testing

### Audio Form - Basic Inputs
- [ ] Switch to "Audio" tab
- [ ] Text input textarea visible
- [ ] Placeholder: "Enter text to convert to speech..."
- [ ] Character counter shows "0 / 5000"
- [ ] Typing updates counter in real-time
- [ ] Counter turns red above 5000 chars
- [ ] Cannot submit with empty text

### Audio Form - Engine Selection
- [ ] Engine dropdown shows 3 options:
  - [ ] Coqui TTS (FREE)
  - [ ] ElevenLabs (Premium)
  - [ ] OpenAI TTS
- [ ] "Coqui TTS" selected by default
- [ ] Can switch engines
- [ ] Engine description shows pricing info

### Audio Form - Voice Selection
- [ ] Voice dropdown shows 7 options:
  - [ ] Default
  - [ ] Alloy
  - [ ] Echo
  - [ ] Fable
  - [ ] Onyx
  - [ ] Nova
  - [ ] Shimmer
- [ ] "Default" selected initially
- [ ] Can change voice selection

### Audio Form - Language Selection
- [ ] Language dropdown shows 9 options:
  - [ ] English
  - [ ] Spanish
  - [ ] French
  - [ ] German
  - [ ] Italian
  - [ ] Portuguese
  - [ ] Chinese
  - [ ] Japanese
  - [ ] Korean
- [ ] "English" selected by default
- [ ] Can change language

### Audio Form - Speed Control
- [ ] Speed slider visible (range 0.5x - 2.0x)
- [ ] Default value is 1.0x (normal speed)
- [ ] Current value displays (e.g., "1.0x")
- [ ] Slider updates value display
- [ ] Can set to 0.5x (slow)
- [ ] Can set to 2.0x (fast)

### Audio Form - Voice Cloning
- [ ] "Voice Cloning (Optional)" section visible
- [ ] File upload button: "Choose File"
- [ ] Instruction text: "Upload 10-30 seconds of clear audio..."
- [ ] Supported formats listed (MP3, WAV, M4A, etc.)
- [ ] Click "Choose File" opens file picker
- [ ] Can select audio file from computer
- [ ] Selected filename displays after upload

### Audio Generation - Submit & Loading (Coqui TTS)
- [ ] **Test Text**: "Hello world, this is a test of text to speech generation. The quick brown fox jumps over the lazy dog."
- [ ] Engine: Coqui TTS (FREE)
- [ ] Voice: Default
- [ ] Language: English
- [ ] Speed: 1.0x
- [ ] Click "Generate Audio" button
- [ ] Button disables during generation
- [ ] Loading spinner appears
- [ ] Status: "Generating audio..."
- [ ] Generation completes in 2-8 seconds

### Audio Generation - Results Display
- [ ] Audio player appears in Preview Panel
- [ ] Player has standard controls (play, pause, timeline, volume)
- [ ] Click play button starts audio
- [ ] Audio plays clearly (no distortion)
- [ ] Audio matches input text (all words spoken)
- [ ] Voice quality is good (intelligible)
- [ ] Speed matches selected setting (1.0x)
- [ ] Duration estimate shown (e.g., "6 seconds")

### Audio Generation - Action Buttons
- [ ] "⬇️ Download" button visible
- [ ] Click download saves audio file
- [ ] Downloaded file plays correctly in media player
- [ ] Filename includes timestamp (e.g., `audio-1703456789.mp3`)
- [ ] "📋 Copy URL" button visible
- [ ] Copy URL works correctly

### Audio Generation - Different Voices
- [ ] **Test Text**: "Testing different voice options."
- [ ] Generate with voice "Alloy"
- [ ] Voice sounds different from Default
- [ ] Generate with voice "Nova"
- [ ] Voice sounds distinctly different
- [ ] Each voice is clear and intelligible

### Audio Generation - Multi-Language
- [ ] **Test Text**: "Hola, ¿cómo estás?" (Spanish)
- [ ] Set language to "Spanish"
- [ ] Generate audio
- [ ] Spanish pronunciation is correct
- [ ] Accent sounds authentic
- [ ] **Test Text**: "Bonjour, comment allez-vous?" (French)
- [ ] Set language to "French"
- [ ] French pronunciation is accurate

### Audio Generation - Speed Control
- [ ] **Test Text**: "The quick brown fox jumps over the lazy dog."
- [ ] Set speed to 0.5x (slow)
- [ ] Generate audio
- [ ] Audio plays at half speed
- [ ] Still intelligible at slow speed
- [ ] Set speed to 2.0x (fast)
- [ ] Generate audio
- [ ] Audio plays at double speed
- [ ] Still clear at fast speed

### Audio Generation - Voice Cloning (Advanced)
- [ ] Record 20-second audio sample of your voice (clear speech)
- [ ] Upload audio file via "Choose File" button
- [ ] Filename displays after upload
- [ ] **Test Text**: "This is a test of voice cloning technology."
- [ ] Engine: Coqui TTS
- [ ] Click "Generate Audio"
- [ ] Generation completes
- [ ] Cloned voice sounds similar to uploaded sample
- [ ] Speech is clear and natural
- [ ] Your voice characteristics preserved

### Audio Generation - ElevenLabs (Premium)
_Skip this section if ELEVENLABS_API_KEY not configured_
- [ ] Switch engine to "ElevenLabs"
- [ ] **Test Text**: "Testing ElevenLabs premium voice quality."
- [ ] Generate audio
- [ ] Voice quality is noticeably better than Coqui
- [ ] More natural intonation
- [ ] Realistic emotional tone
- [ ] No robotic artifacts

### Audio Generation - Error Handling
- [ ] **Test**: Submit with empty text
- [ ] Error: "Text is required"
- [ ] **Test**: Exceed 5000 character limit
- [ ] Warning shown
- [ ] **Test**: Upload invalid file format (e.g., .txt)
- [ ] Error message shown
- [ ] **Test**: ElevenLabs without API key
- [ ] Clear error: "ELEVENLABS_API_KEY not configured"

---

## Section 5: Music Generation Testing

### Music Form - Basic Inputs
- [ ] Switch to "Music" tab
- [ ] Description textarea visible
- [ ] Placeholder: "Describe the music you want to create..."
- [ ] Character counter shows "0 / 1000"
- [ ] Typing updates counter
- [ ] Cannot submit with empty description

### Music Form - Genre Selection
- [ ] Genre dropdown shows 8 options:
  - [ ] Ambient
  - [ ] Classical
  - [ ] Electronic
  - [ ] Jazz
  - [ ] Rock
  - [ ] Pop
  - [ ] Cinematic
  - [ ] Lo-Fi
- [ ] "Electronic" selected by default
- [ ] Can change genre

### Music Form - Duration Selection
- [ ] Duration dropdown shows 4 options:
  - [ ] 15 seconds
  - [ ] 30 seconds
  - [ ] 60 seconds
  - [ ] 120 seconds
- [ ] "30 seconds" selected by default
- [ ] Can change duration

### Music Form - Tempo Control
- [ ] Tempo slider visible (range 60-180 BPM)
- [ ] Default value is 120 BPM
- [ ] Current value displays (e.g., "120 BPM")
- [ ] Slider updates value display
- [ ] Can set to 60 BPM (slow)
- [ ] Can set to 180 BPM (fast)

### Music Form - Mood Selection
- [ ] Mood dropdown shows 6 options:
  - [ ] Happy
  - [ ] Sad
  - [ ] Energetic
  - [ ] Calm
  - [ ] Mysterious
  - [ ] Epic
- [ ] "Energetic" selected by default
- [ ] Can change mood

### Music Generation - Submit & Loading
- [ ] **Test Description**: "Upbeat electronic music with synthesizers and a catchy melody"
- [ ] Genre: Electronic
- [ ] Duration: 30 seconds
- [ ] Tempo: 128 BPM
- [ ] Mood: Energetic
- [ ] Click "Generate Music" button
- [ ] Button disables during generation
- [ ] Loading spinner appears
- [ ] Status: "Generating music..."
- [ ] Generation completes in 10-30 seconds

### Music Generation - Results Display
- [ ] Audio player appears with music
- [ ] Player controls functional (play, pause, timeline)
- [ ] Click play starts music
- [ ] Music matches description (electronic, upbeat)
- [ ] Music has synthesizers as described
- [ ] Tempo matches selected BPM (~128)
- [ ] Duration is 30 seconds (as selected)
- [ ] Music quality is good (no artifacts)
- [ ] Mood is energetic (as selected)

### Music Generation - Different Genres
- [ ] **Test**: "Calm piano music"
- [ ] Genre: Classical
- [ ] Mood: Calm
- [ ] Generate music
- [ ] Music is classical piano style
- [ ] Mood is peaceful and calm
- [ ] **Test**: "Heavy rock guitar riff"
- [ ] Genre: Rock
- [ ] Mood: Energetic
- [ ] Generate music
- [ ] Music has rock characteristics
- [ ] Electric guitar sounds present

### Music Generation - Different Durations
- [ ] Generate 15-second track
- [ ] Track is exactly 15 seconds
- [ ] Music doesn't cut off abruptly
- [ ] Generate 120-second track (2 minutes)
- [ ] Track is ~2 minutes long
- [ ] Music maintains quality throughout
- [ ] Composition has structure (intro, middle, outro)

### Music Generation - Tempo Variations
- [ ] Generate at 60 BPM (slow)
- [ ] Music feels slow and relaxed
- [ ] Generate at 180 BPM (fast)
- [ ] Music feels fast and driving
- [ ] Tempo differences clearly audible

### Music Generation - Action Buttons
- [ ] "⬇️ Download" button visible
- [ ] Download saves music file
- [ ] File plays correctly in media player
- [ ] "📋 Copy URL" button functional

### Music Generation - Error Handling
- [ ] **Test**: Submit with empty description
- [ ] Error: "Music description is required"
- [ ] **Test**: Exceed 1000 character limit
- [ ] Warning shown
- [ ] **Test**: Invalid API response
- [ ] Error handled gracefully

---

## Section 6: Gallery & History Testing

### View Switching
- [ ] Switch to "Audio" tab, generate audio
- [ ] "Preview" view button visible (active by default)
- [ ] "Gallery" view button visible
- [ ] "History" view button visible
- [ ] Click "Gallery" button
- [ ] View switches to gallery grid
- [ ] Click "History" button
- [ ] View switches to history list
- [ ] Click "Preview" button
- [ ] Returns to preview view

### Gallery View - Layout
- [ ] Gallery displays as grid layout
- [ ] Multiple items per row (3-4 on desktop)
- [ ] Each item shows thumbnail image/icon
- [ ] Each item shows generation type (Image/Audio/Music)
- [ ] Each item shows timestamp
- [ ] Each item shows prompt/description (truncated)
- [ ] Hover effect on gallery items
- [ ] Grid is responsive (fewer columns on mobile)

### Gallery View - Content
- [ ] All generated images appear in gallery
- [ ] All generated audio files appear
- [ ] All generated music tracks appear
- [ ] Newest items appear first (reverse chronological)
- [ ] Thumbnails load correctly (no broken images)
- [ ] Click on gallery item opens full view/player

### History View - Layout
- [ ] History displays as vertical list
- [ ] Each item shows generation type icon
- [ ] Each item shows full prompt/description
- [ ] Each item shows model/engine used
- [ ] Each item shows timestamp (relative: "2 mins ago")
- [ ] Each item shows generation settings (dimensions, style, etc.)
- [ ] List is scrollable

### History View - Actions
- [ ] Each history item has action buttons:
  - [ ] "View" button (opens result)
  - [ ] "Download" button
  - [ ] "Copy URL" button
  - [ ] "Delete" button (if implemented)
- [ ] Click "View" opens result in preview
- [ ] Click "Download" downloads file
- [ ] Click "Copy URL" copies to clipboard

### Persistence - Supabase Integration
- [ ] Generate an image
- [ ] Refresh browser page (F5)
- [ ] Open gallery view
- [ ] Previously generated image still appears
- [ ] Generate audio
- [ ] Close modal and reopen
- [ ] Audio appears in history
- [ ] Sign out and sign back in (if auth enabled)
- [ ] History persists across sessions

### Pagination & Loading
- [ ] Generate 10+ items (images, audio, music)
- [ ] Check if pagination controls appear
- [ ] "Load More" button visible (if >50 items)
- [ ] Click "Load More" loads next batch
- [ ] Scroll loading works (infinite scroll)
- [ ] No duplicate items in list

### Empty States
- [ ] Clear all history (if delete feature available)
- [ ] Gallery view shows "No generations yet" message
- [ ] Message includes helpful hint text
- [ ] History view shows empty state
- [ ] Preview view shows placeholder

### Filtering (if implemented)
- [ ] Filter by type dropdown visible
- [ ] Options: All, Images, Audio, Music, Video
- [ ] Select "Images" filter
- [ ] Only images shown in gallery
- [ ] Select "Audio" filter
- [ ] Only audio files shown
- [ ] "All" shows all types

---

## Section 7: Database & Backend Testing

### Database - Table Structure
- [ ] Open Supabase dashboard
- [ ] Navigate to Table Editor
- [ ] Table `creative_generations` exists
- [ ] Columns present:
  - [ ] `id` (UUID, primary key)
  - [ ] `user_id` (UUID, foreign key to auth.users)
  - [ ] `type` (TEXT: 'image', 'audio', 'music', 'video')
  - [ ] `prompt` (TEXT, not null)
  - [ ] `model` (TEXT, not null)
  - [ ] `settings` (JSONB)
  - [ ] `result_url` (TEXT, not null)
  - [ ] `thumbnail_url` (TEXT, nullable)
  - [ ] `metadata` (JSONB)
  - [ ] `created_at` (TIMESTAMP)
  - [ ] `updated_at` (TIMESTAMP)

### Database - Indexes
- [ ] Index `idx_creative_user_id` exists on `user_id`
- [ ] Index `idx_creative_type` exists on `type`
- [ ] Index `idx_creative_user_type` exists on `(user_id, type)`
- [ ] Index `idx_creative_created` exists on `created_at DESC`

### Database - RLS Policies
- [ ] RLS enabled on `creative_generations` table
- [ ] Policy "Users can view own generations" exists (SELECT)
- [ ] Policy "Users can create own generations" exists (INSERT)
- [ ] Policy "Users can update own generations" exists (UPDATE)
- [ ] Policy "Users can delete own generations" exists (DELETE)
- [ ] Test: User A cannot see User B's generations
- [ ] Test: User can only delete their own records

### Database - Data Integrity
- [ ] Generate an image
- [ ] Check Supabase table for new row
- [ ] `prompt` field matches entered prompt
- [ ] `model` field matches selected model
- [ ] `result_url` is valid image URL
- [ ] `settings` JSONB contains all form values
- [ ] `metadata` includes generation timestamp
- [ ] `created_at` is recent timestamp
- [ ] `type` is 'image'

### Backend - API Endpoints
- [ ] Endpoint `/netlify/functions/creative-image` exists
- [ ] Endpoint responds with 200 OK on valid request
- [ ] Endpoint returns JSON with `{ url, thumbnail, metadata }`
- [ ] Endpoint `/netlify/functions/creative-audio` exists
- [ ] Returns `{ url, duration, metadata }`
- [ ] Endpoint `/netlify/functions/creative-music` exists
- [ ] Returns `{ url, duration, metadata }`
- [ ] Endpoint `/netlify/functions/creative-upscale` exists
- [ ] Returns `{ url, originalSize, newSize }`

### Backend - Error Responses
- [ ] Test invalid API key (temporarily break env var)
- [ ] Endpoint returns 500 with error message
- [ ] Error message is clear and actionable
- [ ] Test missing required field (no prompt)
- [ ] Endpoint returns 400 Bad Request
- [ ] Error: "Prompt is required"
- [ ] Test malformed request body
- [ ] Returns 400 with JSON parse error

### Backend - Polling & Timeouts
- [ ] Image generation polls Replicate API
- [ ] Polling interval is ~1 second
- [ ] Maximum polling attempts: 60 (for images)
- [ ] Timeout error after 60 seconds
- [ ] Music generation has longer timeout (120 seconds)
- [ ] Polling status logs appear in console

### Backend - API Rate Limiting
_Note: May require multiple requests_
- [ ] Generate 10 images rapidly (within 1 minute)
- [ ] Check for rate limit errors
- [ ] If rate limited, error message is clear
- [ ] "Rate limit exceeded, please wait..."
- [ ] Can retry after waiting

---

## Section 8: Performance Testing

### Load Times
- [ ] Modal opens in <500ms
- [ ] Tab switching is instant (<100ms)
- [ ] Form inputs respond immediately
- [ ] Gallery loads in <500ms (for 50 items)
- [ ] History loads in <500ms
- [ ] No lag when typing in textareas
- [ ] Smooth scrolling in gallery/history

### Generation Times
- [ ] **Image (Flux 2)**: 5-15 seconds average
  - [ ] Test 1: _____ seconds
  - [ ] Test 2: _____ seconds
  - [ ] Test 3: _____ seconds
- [ ] **Image (DALL-E 3)**: 10-20 seconds average
- [ ] **Audio (Coqui TTS)**: 2-8 seconds average
- [ ] **Music (30s)**: 10-30 seconds average
- [ ] **Upscaling (4x)**: 15-45 seconds average

### Memory Usage
- [ ] Open browser DevTools → Performance Monitor
- [ ] Generate 10 images
- [ ] Memory usage stays below 500 MB
- [ ] No memory leaks detected
- [ ] Generate 10 audio files
- [ ] Memory usage reasonable
- [ ] Close and reopen modal
- [ ] Memory is released (no persistent leaks)

### Network Performance
- [ ] Open Network tab in DevTools
- [ ] Generate an image
- [ ] API request size < 10 KB (prompt + settings)
- [ ] API response size varies (image URL string ~100 bytes)
- [ ] Image download size: 200-500 KB (1024×1024)
- [ ] Audio download size: 50-100 KB per minute
- [ ] Music download size: ~500 KB per minute
- [ ] No excessive API calls (polling optimized)

### Concurrent Operations
- [ ] Open Creative Studio in 2 browser tabs
- [ ] Generate image in Tab 1
- [ ] Simultaneously generate audio in Tab 2
- [ ] Both complete successfully
- [ ] No conflicts or errors
- [ ] History updates in both tabs (after refresh)

---

## Section 9: Cross-Browser Testing

### Chrome Testing
- [ ] All features work in Chrome
- [ ] Modal displays correctly
- [ ] Image generation successful
- [ ] Audio playback works
- [ ] Music playback works
- [ ] Gallery displays properly
- [ ] No console errors

### Firefox Testing
- [ ] All features work in Firefox
- [ ] Modal displays correctly
- [ ] Image quality same as Chrome
- [ ] Audio player controls work
- [ ] Music player controls work
- [ ] Gallery grid layout correct
- [ ] No compatibility warnings

### Safari Testing (macOS/iOS)
- [ ] Modal opens correctly
- [ ] All forms functional
- [ ] Image generation works
- [ ] Audio plays (check Safari codec support)
- [ ] Music plays correctly
- [ ] Download buttons work
- [ ] No webkit-specific issues

### Edge Testing
- [ ] All features functional
- [ ] UI matches other browsers
- [ ] Generation speeds comparable
- [ ] No Edge-specific bugs

### Mobile Testing (Responsive)
- [ ] Open on mobile device (or DevTools responsive mode)
- [ ] Modal size adjusts (98vw × 98vh)
- [ ] Panels stack vertically on narrow screens
- [ ] Touch interactions work (tap buttons)
- [ ] Virtual keyboard doesn't break layout
- [ ] Scrolling works smoothly
- [ ] Gallery grid responsive (1-2 columns)
- [ ] All features usable on mobile

---

## Section 10: Security Testing

### Authentication
- [ ] User must be signed in to use Creative Studio (if auth required)
- [ ] Signed-out user sees sign-in prompt
- [ ] After sign-in, Creative Studio accessible
- [ ] User ID correctly attached to generations

### API Key Security
- [ ] API keys NOT visible in client-side code
- [ ] Inspect page source: no keys exposed
- [ ] Check Network tab: keys not in request headers (only in backend)
- [ ] Environment variables secure (Netlify only)

### RLS (Row-Level Security)
- [ ] User A generates content
- [ ] User B signs in to different account
- [ ] User B cannot see User A's generations
- [ ] User B can only see their own history
- [ ] Test SQL injection (if applicable):
  - [ ] Enter `'; DROP TABLE creative_generations; --` in prompt
  - [ ] Request handled safely, no DB damage

### XSS (Cross-Site Scripting)
- [ ] **Test Prompt**: `<script>alert('XSS')</script>`
- [ ] Enter in image prompt field
- [ ] Generate image
- [ ] No alert popup (script not executed)
- [ ] **Test**: `<img src=x onerror=alert('XSS')>`
- [ ] No script execution in gallery/history views
- [ ] HTML is properly escaped in display

### CORS (Cross-Origin Resource Sharing)
- [ ] Generate image from https://your-site.netlify.app
- [ ] Image loads correctly (CORS headers set)
- [ ] No CORS errors in console
- [ ] API endpoints have proper CORS headers
- [ ] Preflight OPTIONS requests succeed

---

## Section 11: Cost Monitoring

### Replicate API Usage
- [ ] Log in to https://replicate.com
- [ ] Navigate to "Billing" or "Usage"
- [ ] Check current credit balance
- [ ] Note starting balance: $______
- [ ] Generate 10 images (Flux 2)
- [ ] Check updated balance
- [ ] Cost per image: ~$_____ (should be $0.01-0.03)
- [ ] Total cost for 10 images: $______
- [ ] Generate 5 audio (Coqui TTS)
- [ ] Check balance (should be $0 - FREE)
- [ ] Generate 3 music tracks (30s each)
- [ ] Check balance (MusicGen should be FREE)

### OpenAI API Usage (if using DALL-E 3)
- [ ] Log in to https://platform.openai.com
- [ ] Navigate to "Usage"
- [ ] Note starting balance: $______
- [ ] Generate 5 images with DALL-E 3
- [ ] Check updated usage
- [ ] Cost per image: ~$_____ (should be $0.04-0.17)
- [ ] Total cost: $______

### ElevenLabs Usage (if configured)
- [ ] Log in to https://elevenlabs.io
- [ ] Check "Character Usage"
- [ ] Note starting character count: ______
- [ ] Generate 3 audio files (~100 chars each)
- [ ] Check updated count
- [ ] Characters used: ~300
- [ ] Free tier limit: 10,000 chars/month

### Cost Optimization
- [ ] Verify Coqui TTS used for free audio (not OpenAI)
- [ ] Verify MusicGen used for free music
- [ ] Confirm Flux 2 pricing acceptable ($0.01-0.03/image)
- [ ] Set up billing alerts (if available)
- [ ] Monitor daily/weekly spend
- [ ] Estimated monthly cost within budget: ☐ Yes ☐ No

---

## Section 12: Documentation Review

### Setup Documentation
- [ ] `ENV_VARIABLES_PHASE9.md` exists
- [ ] API key setup instructions clear
- [ ] Pricing information accurate
- [ ] Netlify env var commands correct
- [ ] Troubleshooting section helpful

### Quick Start Guide
- [ ] `PHASE_9_QUICK_START.md` exists
- [ ] 5-minute setup claim accurate
- [ ] Step-by-step instructions clear
- [ ] Screenshots/diagrams included (if any)
- [ ] All links work correctly

### Completion Documentation
- [ ] `PHASE_9_COMPLETION.md` exists
- [ ] Feature list comprehensive
- [ ] Testing checklist complete (this document)
- [ ] Performance metrics documented
- [ ] Success criteria met

### Architecture Documentation
- [ ] `PHASE_9_ARCHITECTURE.md` exists
- [ ] System diagrams clear and accurate
- [ ] Data flow documented
- [ ] API integration explained
- [ ] Code structure outlined

### README Updates
- [ ] Main `README.md` updated with Phase 9
- [ ] Feature list includes Creative Studio
- [ ] Links to Phase 9 docs added
- [ ] Status updated (Phase 9 COMPLETE)

---

## Section 13: Edge Cases & Stress Testing

### Large Prompts
- [ ] Enter 2000-character prompt (max)
- [ ] Generation succeeds
- [ ] Result matches long prompt
- [ ] Enter 2500-character prompt (over limit)
- [ ] Validation error shown

### Special Characters
- [ ] **Test Prompt**: "A café with naïve décor and résumé on wall"
- [ ] Unicode characters handled correctly
- [ ] Accented characters don't break generation
- [ ] **Test**: Emoji in prompt "A 🐉 dragon 🔥"
- [ ] Emoji handled gracefully

### Network Interruptions
- [ ] Start image generation
- [ ] Turn off Wi-Fi mid-generation
- [ ] Error message: "Network error"
- [ ] Turn Wi-Fi back on
- [ ] Can retry generation successfully

### Browser Refresh During Generation
- [ ] Start image generation
- [ ] Refresh browser (F5) while generating
- [ ] Generation stops gracefully (no errors)
- [ ] Can start new generation after refresh

### Very Long Sessions
- [ ] Keep Creative Studio open for 30+ minutes
- [ ] Generate multiple items over time
- [ ] No degradation in performance
- [ ] No session timeout errors
- [ ] Gallery continues to load correctly

### Rapid Submissions
- [ ] Generate image
- [ ] Immediately click "Generate Image" again
- [ ] Button stays disabled until first completes
- [ ] Or: second request queued properly
- [ ] No race conditions or conflicts

---

## Section 14: Accessibility Testing

### Keyboard Navigation
- [ ] Open Creative Studio with keyboard (Tab to button, Enter to open)
- [ ] Tab key navigates through form fields
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Enter key submits form (Generate button)
- [ ] Escape key closes modal
- [ ] All interactive elements reachable via keyboard
- [ ] Focus indicators visible (blue outline)

### Screen Reader Compatibility
_Note: Test with NVDA (Windows) or VoiceOver (Mac)_
- [ ] Screen reader announces modal title
- [ ] Form labels read correctly
- [ ] Button purposes announced ("Generate Image button")
- [ ] Slider values announced when changed
- [ ] Error messages read aloud
- [ ] Loading status announced
- [ ] Generated content announced

### Color Contrast
- [ ] Text readable on dark background (#1e1e1e)
- [ ] Blue accent color (#007acc) has sufficient contrast
- [ ] Hover states visible
- [ ] Disabled state distinguishable (opacity 0.5)
- [ ] Error messages in red clearly visible

### Font Sizes
- [ ] Body text is at least 14px
- [ ] Headings are appropriately sized
- [ ] Button text legible (not too small)
- [ ] Character counters readable
- [ ] Can zoom to 200% without breaking layout

---

## Section 15: Final Production Checklist

### Pre-Deployment
- [ ] All environment variables set in Netlify
- [ ] Database migration executed in Supabase
- [ ] RLS policies enabled
- [ ] API keys tested and valid
- [ ] All local tests passing

### Deployment
- [ ] Code committed to Git
- [ ] Commit message descriptive
- [ ] Pushed to GitHub main branch
- [ ] Netlify auto-deploy triggered
- [ ] Build succeeds (no errors)
- [ ] Functions deployed successfully

### Post-Deployment
- [ ] Open production URL
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Creative Studio button visible
- [ ] Generate test image in production
- [ ] Generate test audio in production
- [ ] Generate test music in production
- [ ] Check Supabase production DB for data
- [ ] Gallery/history loads in production

### Monitoring
- [ ] Check Netlify function logs (no errors)
- [ ] Check Supabase logs (no issues)
- [ ] Monitor Replicate API usage
- [ ] Set up cost alerts (if available)
- [ ] Document any production-specific issues

---

## Section 16: Known Issues & Workarounds

### Documented Issues
_List any known bugs or limitations discovered during testing:_

**Issue 1**: ____________________________________________
- **Workaround**: _____________________________________
- **Status**: ☐ Open ☐ Fixed ☐ Won't Fix

**Issue 2**: ____________________________________________
- **Workaround**: _____________________________________
- **Status**: ☐ Open ☐ Fixed ☐ Won't Fix

**Issue 3**: ____________________________________________
- **Workaround**: _____________________________________
- **Status**: ☐ Open ☐ Fixed ☐ Won't Fix

---

## Test Summary

### Statistics
- **Total Tests**: 500+
- **Tests Passed**: ______
- **Tests Failed**: ______
- **Pass Rate**: ______%
- **Critical Issues**: ______
- **Minor Issues**: ______
- **Time to Complete**: ______ hours

### Overall Assessment
**Production Readiness**: ☐ Ready ☐ Needs Work ☐ Not Ready

**Performance Rating**: ☐ Excellent ☐ Good ☐ Fair ☐ Poor

**User Experience Rating**: ☐ Excellent ☐ Good ☐ Fair ☐ Poor

**Recommendation**: 
☐ Deploy to production immediately
☐ Fix critical issues first
☐ Requires more development

### Tester Notes
_Additional comments, observations, or recommendations:_

____________________________________________________________

____________________________________________________________

____________________________________________________________

____________________________________________________________

---

## Sign-Off

**Tester Signature**: ____________________  
**Date Completed**: ____________________  
**Approved for Production**: ☐ Yes ☐ No  
**Approver Name**: ____________________  
**Approver Signature**: ____________________  

---

**Document Version**: 1.0  
**Last Updated**: December 24, 2025  
**Phase**: 9 - Creative Studio  
**Total Checklist Items**: 500+
