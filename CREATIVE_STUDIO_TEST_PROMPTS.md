# Creative Studio Test Prompts
Test prompts for Phase 9 Creative Studio feature validation and comparison

## 🖼️ Image Generation Prompts

### Test 1: Landscape
**Prompt:** A serene mountain landscape at sunset, with vibrant orange and purple skies reflecting on a calm lake, pine trees in the foreground, photorealistic style

**Negative Prompt:** blurry, distorted, low quality, oversaturated, cartoonish

**Settings:**
- Model: Flux 2 (Best Quality)
- Style: Realistic
- Dimensions: 1024×1024 (Square)
- Steps: 20
- Guidance: 7.5

---

### Test 2: Character Portrait
**Prompt:** A wise old wizard with a long white beard, wearing deep purple robes with gold embroidery, holding a glowing crystal staff, magical sparkles in the air, fantasy art style, detailed facial features

**Negative Prompt:** modern clothing, blurry face, distorted hands, low resolution, photographic

**Settings:**
- Model: Flux 2 (Best Quality)
- Style: Fantasy
- Dimensions: 768×1024 (Portrait)
- Steps: 25
- Guidance: 8.0

---

### Test 3: Abstract Art
**Prompt:** Abstract geometric composition with flowing ribbons of cyan, magenta, and gold, intersecting translucent shapes, depth of field, modern digital art, vibrant colors, high contrast

**Negative Prompt:** realistic, photographic, dull colors, muddy, cluttered

**Settings:**
- Model: Flux 2 (Best Quality)
- Style: Abstract
- Dimensions: 1024×768 (Landscape)
- Steps: 15
- Guidance: 6.5

---

### Test 4: Game Asset
**Prompt:** Isometric pixel art treasure chest overflowing with gold coins and gems, glowing magical aura, wooden planks with iron bands, sitting on cobblestone floor, game sprite style, 32-bit aesthetic

**Negative Prompt:** 3D, realistic, blurry, modern, photographic

**Settings:**
- Model: Flux Schnell (Fast)
- Style: Pixel Art
- Dimensions: 512×512 (Square)
- Steps: 10
- Guidance: 7.0

---

### Test 5: Sci-Fi Scene
**Prompt:** Futuristic cyberpunk city street at night, neon signs in Japanese and English, rain-slicked pavement reflecting colorful lights, flying cars in the distance, detailed architecture, cinematic composition

**Negative Prompt:** daytime, desert, fantasy elements, blurry, low detail

**Settings:**
- Model: Flux 2 (Best Quality)
- Style: Cinematic
- Dimensions: 1024×576 (Widescreen)
- Steps: 20
- Guidance: 7.5

---

## 🎙️ Audio/Speech Generation Prompts

### Test 1: Educational Narration
**Text:** Welcome to the world of quantum physics, where particles can exist in multiple states simultaneously and observation changes reality itself. This phenomenon, known as superposition, challenges our fundamental understanding of the universe.

**Settings:**
- Model: Coqui TTS (Free)
- Voice: Default (English)
- Speed: 1.0 (Normal)
- Language: English

---

### Test 2: Story Narration
**Text:** The ancient door creaked open, revealing a chamber filled with glittering treasures. Sarah took a cautious step forward, her torch casting dancing shadows on the stone walls. Somewhere in the darkness, she heard the sound of water dripping... and something else, something breathing.

**Settings:**
- Model: ElevenLabs Turbo v2.5 (Premium)
- Voice: Dramatic (English)
- Speed: 0.9 (Slightly Slower)
- Language: English

---

### Test 3: Quick Announcement
**Text:** Attention all players! The tournament will begin in five minutes. Please proceed to the main arena and prepare your characters. Good luck, and may the best strategist win!

**Settings:**
- Model: Coqui TTS (Free)
- Voice: Default (English)
- Speed: 1.1 (Slightly Faster)
- Language: English

---

### Test 4: Character Dialogue
**Text:** By the ancient laws of the kingdom, I hereby challenge you to a duel at dawn. Choose your weapon wisely, for this matter concerns honor... and honor must be satisfied.

**Settings:**
- Model: ElevenLabs Turbo v2.5 (Premium)
- Voice: Dramatic (English)
- Speed: 0.95 (Slightly Slower)
- Language: English

---

## 🎵 Music Generation Prompts

### Test 1: Game Menu Theme
**Prompt:** Calm ambient background music for a fantasy RPG menu screen, gentle piano melody with soft strings, peaceful and contemplative mood, loopable

**Settings:**
- Model: Lyria 2 (Best Quality)
- Duration: 30 seconds
- Genre: Ambient
- Tempo: 80 BPM
- Mood: Calm

---

### Test 2: Battle Music
**Prompt:** Epic orchestral battle theme with dramatic percussion, heroic brass section, fast-paced strings, intense and energetic, suitable for boss fight

**Settings:**
- Model: Lyria 2 (Best Quality)
- Duration: 45 seconds
- Genre: Orchestral
- Tempo: 140 BPM
- Mood: Energetic

---

### Test 3: Puzzle Theme
**Prompt:** Light and playful puzzle game music, xylophone and bells, quirky melody, curious and whimsical mood, cartoon-like atmosphere

**Settings:**
- Model: Lyria Lite (Fast)
- Duration: 30 seconds
- Genre: Casual
- Tempo: 110 BPM
- Mood: Playful

---

### Test 4: Exploration Music
**Prompt:** Mysterious exploration theme for discovering ancient ruins, ethereal synth pads, echoing sounds, sense of wonder and discovery, atmospheric

**Settings:**
- Model: Lyria 2 (Best Quality)
- Duration: 60 seconds
- Genre: Ambient
- Tempo: 70 BPM
- Mood: Mysterious

---

## 🎬 Video Generation Prompts

### Test 1: Nature Scene
**Prompt:** A gentle waterfall cascading over mossy rocks in a lush forest, sunlight filtering through the canopy, butterflies floating in the air, peaceful nature scene

**Settings:**
- Model: Veo 3 (Best Quality)
- Duration: 5 seconds
- Resolution: 1280×720 (HD)
- FPS: 24
- Style: Cinematic

---

### Test 2: Character Animation
**Prompt:** A magical fairy with glowing wings flying in a circle, leaving a trail of sparkling stardust, against a twilight sky background, smooth fluid motion

**Settings:**
- Model: Veo 3 (Best Quality)
- Duration: 3 seconds
- Resolution: 1280×720 (HD)
- FPS: 30
- Style: Fantasy

---

### Test 3: Product Showcase
**Prompt:** A golden trophy slowly rotating on a pedestal, spotlight from above, reflective surface gleaming, dark background, professional product showcase

**Settings:**
- Model: Veo 2 (Fast)
- Duration: 5 seconds
- Resolution: 1280×720 (HD)
- FPS: 24
- Style: Clean

---

### Test 4: Abstract Motion
**Prompt:** Colorful geometric shapes morphing and flowing together, vibrant gradient colors blending, abstract motion graphics, hypnotic pattern

**Settings:**
- Model: Veo 2 (Fast)
- Duration: 4 seconds
- Resolution: 1280×720 (HD)
- FPS: 30
- Style: Abstract

---

## 📋 Testing Checklist

### UI Validation
- [ ] All textareas display at correct heights (150px, 100px, 180px, 140px)
- [ ] Form inputs are responsive and styled correctly
- [ ] Dropdowns show all options properly
- [ ] Sliders function smoothly
- [ ] Generate buttons are clickable and styled
- [ ] Tab switching works between all 4 content types

### Generation Testing
- [ ] Test at least 2 prompts per content type
- [ ] Verify loading states display during generation
- [ ] Confirm results render properly in preview area
- [ ] Check download/export functionality
- [ ] Test error handling with invalid inputs

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

### Comparison Points
- Document textarea visibility and sizing
- Note any styling inconsistencies
- Track generation times per model
- Compare quality of different model options
- Note any errors or warnings in console

---

## 📝 Notes Section

Use this space to record observations as you test:

**Session 1 - [Date]:**
- 

**Session 2 - [Date]:**
- 

**Session 3 - [Date]:**
- 
