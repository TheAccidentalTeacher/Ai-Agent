// Phase 9: Creative Studio UI
// Full-screen modal for AI content generation (images, audio, music, video)
// Design: 98vw × 98vh modal with tabbed interface

console.log('%c🎨 [Creative Studio] Module loading...', 'color: #FF00FF; font-weight: bold');

import { supabase } from './supabase-client.js';

class CreativeStudioUI {
    constructor() {
        this.modal = null;
        this.currentTab = 'images';
        this.generationHistory = [];
        this.isGenerating = false;
        
        // Generation settings
        this.settings = {
            image: {
                model: 'flux-2',
                width: 1024,
                height: 1024,
                steps: 20,
                guidance: 7.5,
                style: 'realistic'
            },
            audio: {
                model: 'coqui-tts',
                voice: 'default',
                speed: 1.0,
                language: 'en'
            },
            music: {
                model: 'lyria-2',
                duration: 30,
                genre: 'ambient',
                tempo: 120
            },
            video: {
                model: 'veo-3',
                duration: 5,
                fps: 24,
                resolution: '1280x720'
            }
        };
    }

    // Initialize and show the modal
    async show() {
        try {
            console.log('%c🎨 [Creative Studio] show() called', 'color: #FF00FF; font-weight: bold');
            
            if (this.modal) {
                console.log('%c🎨 [Creative Studio] Modal already exists, showing it', 'color: #00FF00; font-weight: bold');
                this.modal.style.display = 'flex';
                return;
            }

            console.log('%c🎨 [Creative Studio] Creating modal...', 'color: #FFAA00; font-weight: bold');
            await this.createModal();
            
            console.log('%c🎨 [Creative Studio] Loading history...', 'color: #FFAA00; font-weight: bold');
            await this.loadHistory();
            
            console.log('%c🎨 [Creative Studio] Displaying modal', 'color: #00FF00; font-weight: bold');
            console.log('%c🎨 [Creative Studio] Modal element:', 'color: #FFAA00', this.modal);
            console.log('%c🎨 [Creative Studio] Modal in DOM?', 'color: #FFAA00', document.body.contains(this.modal));
            console.log('%c🎨 [Creative Studio] Modal computed display:', 'color: #FFAA00', window.getComputedStyle(this.modal).display);
            
            // Force all visibility properties via inline styles
            this.modal.style.display = 'flex';
            this.modal.style.zIndex = '10000';
            this.modal.style.position = 'fixed';
            this.modal.style.top = '0';
            this.modal.style.left = '0';
            this.modal.style.width = '100vw';
            this.modal.style.height = '100vh';
            this.modal.style.opacity = '1';
            this.modal.style.visibility = 'visible';
            this.modal.style.pointerEvents = 'auto';
            
            // Force centering via flexbox
            this.modal.style.justifyContent = 'center';
            this.modal.style.alignItems = 'center';
            this.modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            
            console.log('%c🎨 [Creative Studio] After setting inline styles:', 'color: #00FF00');
            console.log('%c🎨 [Creative Studio] Modal style.display:', 'color: #FFAA00', this.modal.style.display);
            console.log('%c🎨 [Creative Studio] Modal computed display:', 'color: #FFAA00', window.getComputedStyle(this.modal).display);
            console.log('%c🎨 [Creative Studio] Modal z-index:', 'color: #FFAA00', window.getComputedStyle(this.modal).zIndex);
            console.log('%c🎨 [Creative Studio] Modal visibility:', 'color: #FFAA00', window.getComputedStyle(this.modal).visibility);
            console.log('%c🎨 [Creative Studio] Modal opacity:', 'color: #FFAA00', window.getComputedStyle(this.modal).opacity);
            console.log('%c🎨 [Creative Studio] Modal justifyContent:', 'color: #FFAA00', window.getComputedStyle(this.modal).justifyContent);
            console.log('%c🎨 [Creative Studio] Modal alignItems:', 'color: #FFAA00', window.getComputedStyle(this.modal).alignItems);
            
            // Check if key elements are present
            const container = this.modal.querySelector('.creative-studio-container');
            const header = this.modal.querySelector('.creative-studio-header');
            const tabs = this.modal.querySelector('.creative-studio-tabs');
            const content = this.modal.querySelector('.creative-studio-content');
            console.log('%c🎨 [Creative Studio] Elements check:', 'color: #FFAA00');
            console.log('  Container:', container ? '✓ Found' : '✗ MISSING');
            console.log('  Header:', header ? '✓ Found' : '✗ MISSING');
            console.log('  Tabs:', tabs ? '✓ Found' : '✗ MISSING');
            console.log('  Content:', content ? '✓ Found' : '✗ MISSING');
        } catch (error) {
            console.error('%c🎨 [Creative Studio] ERROR in show():', 'color: #FF0000; font-weight: bold', error);
            alert('Error opening Creative Studio: ' + error.message);
        }
    }

    // Create the full modal UI
    async createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'creative-studio-modal';
        this.modal.innerHTML = `
            <div class="creative-studio-container">
                <!-- Header -->
                <div class="creative-studio-header">
                    <h2>🎨 Creative Studio</h2>
                    <button class="creative-studio-close" onclick="window.creativeStudio.hide()">×</button>
                </div>

                <!-- Tab Navigation -->
                <div class="creative-studio-tabs">
                    <button class="creative-tab active" data-tab="images">
                        🖼️ Images
                    </button>
                    <button class="creative-tab" data-tab="audio">
                        🎤 Audio
                    </button>
                    <button class="creative-tab" data-tab="music">
                        🎵 Music
                    </button>
                    <button class="creative-tab" data-tab="video">
                        🎬 Video
                        <span class="coming-soon">Soon</span>
                    </button>
                </div>

                <!-- Main Content Area -->
                <div class="creative-studio-content" style="display: flex !important; flex-direction: row !important;">
                    <!-- Left Panel: Creation Controls (40%) -->
                    <div class="creative-creation-panel" style="width: 40% !important; height: calc(98vh - 120px) !important; overflow-y: scroll !important; overflow-x: hidden !important;">
                        <!-- Images Tab -->
                        <div class="creative-tab-content active" data-tab="images">
                            ${this.createImagePanel()}
                        </div>

                        <!-- Audio Tab -->
                        <div class="creative-tab-content" data-tab="audio">
                            ${this.createAudioPanel()}
                        </div>

                        <!-- Music Tab -->
                        <div class="creative-tab-content" data-tab="music">
                            ${this.createMusicPanel()}
                        </div>

                        <!-- Video Tab -->
                        <div class="creative-tab-content" data-tab="video">
                            ${this.createVideoPanel()}
                        </div>
                    </div>

                    <!-- Right Panel: Preview/Gallery (60%) -->
                    <div class="creative-preview-panel" style="width: 60% !important; display: flex !important; flex-direction: column !important;">
                        <div class="creative-preview-header">
                            <h3>Generated Content</h3>
                            <div class="creative-view-toggle">
                                <button class="view-btn active" data-view="preview">Preview</button>
                                <button class="view-btn" data-view="gallery">Gallery</button>
                                <button class="view-btn" data-view="history">History</button>
                            </div>
                        </div>

                        <!-- Preview View -->
                        <div class="creative-preview-area active" data-view="preview">
                            <div class="creative-preview-empty">
                                <p>✨ Your generated content will appear here</p>
                                <p class="preview-hint">Select a tool and click Generate to begin</p>
                            </div>
                            <div class="creative-preview-content" style="display: none;">
                                <!-- Generated content displays here -->
                            </div>
                        </div>

                        <!-- Gallery View -->
                        <div class="creative-preview-area" data-view="gallery">
                            <div class="creative-gallery-grid">
                                <!-- Gallery items will be loaded here -->
                            </div>
                        </div>

                        <!-- History View -->
                        <div class="creative-preview-area" data-view="history">
                            <div class="creative-history-list">
                                <!-- History items will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        
        // Debug: Check if modal was appended correctly
        console.log('%c🎨 [Creative Studio] Modal appended to body', 'color: #00FF00; font-weight: bold');
        console.log('%c🎨 [Creative Studio] Modal children count:', 'color: #FFAA00', this.modal.children.length);
        console.log('%c🎨 [Creative Studio] Modal innerHTML length:', 'color: #FFAA00', this.modal.innerHTML.length);
        console.log('%c🎨 [Creative Studio] Modal first child:', 'color: #FFAA00', this.modal.firstElementChild);
        
        // Force container styling for visibility
        const container = this.modal.querySelector('.creative-studio-container');
        if (container) {
            container.style.width = '98vw';
            container.style.height = '98vh';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.background = '#1e1e1e';
            container.style.borderRadius = '12px';
            container.style.overflow = 'hidden';
            console.log('%c🎨 [Creative Studio] Container forced styling applied', 'color: #00FF00; font-weight: bold');
        }
        
        this.attachEventListeners();
    }

    // Image Generation Panel
    createImagePanel() {
        console.log('%c[DEBUG] createImagePanel() called - INLINE HEIGHT STYLES VERSION', 'background: #00ff00; color: #000; font-weight: bold; padding: 4px;');
        return `
            <div class="creation-section">
                <h3>Generate Image</h3>
                
                <div class="form-group">
                    <label>Prompt *</label>
                    <textarea 
                        id="image-prompt" 
                        style="height: 150px; width: 100%;" 
                        placeholder="Describe the image you want to create...
Example: A serene mountain landscape at sunset, with vibrant orange and purple skies reflecting on a calm lake"
                        maxlength="2000"
                    ></textarea>
                    <small class="char-count">0 / 2000</small>
                </div>

                <button class="generate-btn" onclick="window.creativeStudio.generateImage()" style="margin: 20px 0;">
                    <span class="btn-icon">✨</span>
                    Generate Image
                </button>

                <div class="generation-status" style="display: none;">
                    <div class="status-spinner"></div>
                    <p class="status-text">Generating your image...</p>
                    <small class="status-hint">This usually takes 10-30 seconds</small>
                </div>

                <div class="form-group">
                    <label>Negative Prompt (Optional)</label>
                    <textarea 
                        id="image-negative-prompt" 
                        style="height: 100px; width: 100%;" 
                        placeholder="Things to avoid... (e.g., blurry, distorted, low quality)"
                    ></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Model</label>
                        <select id="image-model">
                            <option value="flux-2">Flux 2 (Best Quality)</option>
                            <option value="dall-e-3">DALL-E 3</option>
                            <option value="stable-diffusion">Stable Diffusion XL</option>
                            <option value="dreamshaper">DreamShaper</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Style Preset</label>
                        <select id="image-style">
                            <option value="realistic">Realistic</option>
                            <option value="artistic">Artistic</option>
                            <option value="anime">Anime</option>
                            <option value="3d-render">3D Render</option>
                            <option value="watercolor">Watercolor</option>
                            <option value="oil-painting">Oil Painting</option>
                            <option value="pencil-sketch">Pencil Sketch</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Dimensions</label>
                        <select id="image-dimensions">
                            <option value="1024x1024">Square (1024×1024)</option>
                            <option value="1024x768">Landscape (1024×768)</option>
                            <option value="768x1024">Portrait (768×1024)</option>
                            <option value="1280x720">Wide (1280×720)</option>
                            <option value="1920x1080">Full HD (1920×1080)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <select id="image-quantity">
                            <option value="1">1 image</option>
                            <option value="2">2 images</option>
                            <option value="4">4 images</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Quality Steps</label>
                        <input type="range" id="image-steps" min="10" max="50" value="20" step="5">
                        <span class="range-value">20</span>
                    </div>
                    <div class="form-group">
                        <label>Guidance Scale</label>
                        <input type="range" id="image-guidance" min="1" max="20" value="7.5" step="0.5">
                        <span class="range-value">7.5</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Audio/TTS Panel
    createAudioPanel() {
        return `
            <div class="creation-section">
                <h3>Generate Speech</h3>
                
                <div class="form-group">
                    <label>Text to Speak *</label>
                    <textarea 
                        id="audio-text" 
                        style="height: 180px; width: 100%;" 
                        placeholder="Enter the text you want to convert to speech..."
                        maxlength="5000"
                    ></textarea>
                    <small class="char-count">0 / 5000</small>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Voice Engine</label>
                        <select id="audio-engine">
                            <option value="coqui">Coqui TTS (Free)</option>
                            <option value="google-cloud">Google Cloud (380 voices, FREE 1M chars/mo)</option>
                            <option value="elevenlabs">ElevenLabs (Premium)</option>
                            <option value="openai">OpenAI TTS</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Voice Preset</label>
                        <select id="audio-voice">
                            <option value="default">Default (English)</option>
                        </select>
                    </div>
                </div>

                <!-- Custom Voice Input (for Google Cloud's 380 voices) -->
                <div class="form-group" id="custom-voice-container" style="display: none;">
                    <label>Custom Voice Name (380 voices available)</label>
                    <input 
                        type="text" 
                        id="audio-custom-voice" 
                        placeholder="e.g., en-US-Neural2-F, es-ES-Wavenet-B, ja-JP-Neural2-C"
                        style="width: 100%; padding: 8px; font-family: monospace;"
                    >
                    <small style="display: block; margin-top: 4px; color: #888;">
                        📚 <a href="https://cloud.google.com/text-to-speech/docs/voices" target="_blank" style="color: #4A9EFF;">Browse all 380 voices</a> 
                        • Format: languageCode-name (e.g., en-US-Neural2-F)
                    </small>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Language</label>
                        <select id="audio-language">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="pt">Portuguese</option>
                            <option value="zh">Chinese</option>
                            <option value="ja">Japanese</option>
                            <option value="ko">Korean</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Speed</label>
                        <input type="range" id="audio-speed" min="0.5" max="2.0" value="1.0" step="0.1">
                        <span class="range-value">1.0x</span>
                    </div>
                </div>

                <div class="form-group">
                    <label>Voice Cloning (Optional)</label>
                    <div class="file-upload-area">
                        <input type="file" id="audio-clone-file" accept="audio/*" style="display: none;">
                        <button class="file-upload-btn" onclick="document.getElementById('audio-clone-file').click()">
                            📁 Upload Reference Audio
                        </button>
                        <small>Upload a 10-30 second audio sample for voice cloning</small>
                    </div>
                </div>

                <button class="generate-btn" onclick="window.creativeStudio.generateAudio()">
                    <span class="btn-icon">🎤</span>
                    Generate Speech
                </button>

                <div class="generation-status" style="display: none;">
                    <div class="status-spinner"></div>
                    <p class="status-text">Generating speech...</p>
                </div>
            </div>
        `;
    }

    // Music Generation Panel
    createMusicPanel() {
        return `
            <div class="creation-section">
                <h3>Generate Music</h3>
                
                <div class="form-group">
                    <label>Music Description *</label>
                    <textarea 
                        id="music-prompt" 
                        style="height: 140px; width: 100%;" 
                        placeholder="Describe the music you want...
Example: Upbeat electronic dance music with energetic synths and a catchy melody"
                        maxlength="1000"
                    ></textarea>
                    <small class="char-count">0 / 1000</small>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Genre</label>
                        <select id="music-genre">
                            <option value="ambient">Ambient</option>
                            <option value="classical">Classical</option>
                            <option value="electronic">Electronic</option>
                            <option value="jazz">Jazz</option>
                            <option value="rock">Rock</option>
                            <option value="pop">Pop</option>
                            <option value="cinematic">Cinematic</option>
                            <option value="lo-fi">Lo-Fi</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Duration</label>
                        <select id="music-duration">
                            <option value="15">15 seconds</option>
                            <option value="30" selected>30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="120">2 minutes</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Tempo (BPM)</label>
                        <input type="range" id="music-tempo" min="60" max="180" value="120" step="5">
                        <span class="range-value">120 BPM</span>
                    </div>
                    <div class="form-group">
                        <label>Mood</label>
                        <select id="music-mood">
                            <option value="happy">Happy</option>
                            <option value="sad">Sad</option>
                            <option value="energetic">Energetic</option>
                            <option value="calm">Calm</option>
                            <option value="mysterious">Mysterious</option>
                            <option value="epic">Epic</option>
                        </select>
                    </div>
                </div>

                <button class="generate-btn" onclick="window.creativeStudio.generateMusic()">
                    <span class="btn-icon">🎵</span>
                    Generate Music
                </button>

                <div class="generation-status" style="display: none;">
                    <div class="status-spinner"></div>
                    <p class="status-text">Composing music...</p>
                    <small class="status-hint">This may take 30-60 seconds</small>
                </div>
            </div>
        `;
    }

    // Video Generation Panel (Coming Soon)
    createVideoPanel() {
        return `
            <div class="creation-section">
                <h3>Generate Video</h3>
                
                <div class="coming-soon-message">
                    <h4>🎬 Video Generation Coming Soon!</h4>
                    <p>We're working on integrating:</p>
                    <ul>
                        <li>Google Veo 3.1 - Text to Video</li>
                        <li>WAN 2.6 - Image to Video</li>
                        <li>OpenAI Sora 2 - High-quality video</li>
                        <li>Luma AI Dream Machine</li>
                    </ul>
                    <p class="eta">Expected: Phase 9.5 (Next Week)</p>
                </div>
            </div>
        `;
    }

    // Attach all event listeners
    attachEventListeners() {
        // Tab switching
        this.modal.querySelectorAll('.creative-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // View toggle (Preview/Gallery/History)
        this.modal.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Range input displays
        this.modal.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const valueSpan = e.target.nextElementSibling;
                if (valueSpan) {
                    let suffix = '';
                    if (e.target.id.includes('speed')) suffix = 'x';
                    if (e.target.id.includes('tempo')) suffix = ' BPM';
                    valueSpan.textContent = e.target.value + suffix;
                }
            });
        });

        // Character counters
        this.modal.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const counter = e.target.parentElement.querySelector('.char-count');
                if (counter) {
                    const max = e.target.maxLength;
                    const current = e.target.value.length;
                    counter.textContent = `${current} / ${max}`;
                }
            });
        });

        // Audio engine change - filter voices
        const audioEngine = this.modal.querySelector('#audio-engine');
        if (audioEngine) {
            audioEngine.addEventListener('change', (e) => {
                this.updateVoiceOptions(e.target.value);
            });
            // Set initial voices
            this.updateVoiceOptions(audioEngine.value);
        }

        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }

    // Update voice dropdown based on selected engine
    updateVoiceOptions(engine) {
        const voiceSelect = this.modal.querySelector('#audio-voice');
        const customVoiceContainer = this.modal.querySelector('#custom-voice-container');
        if (!voiceSelect) return;

        const voices = {
            'coqui': [
                { value: 'default', label: 'Default (English)' }
            ],
            'google-cloud': [
                // United States (Neural2 - Highest Quality)
                { value: 'en-US-Neural2-A', label: '🇺🇸 Neural2-A (US Female)' },
                { value: 'en-US-Neural2-C', label: '🇺🇸 Neural2-C (US Female)' },
                { value: 'en-US-Neural2-E', label: '🇺🇸 Neural2-E (US Female)' },
                { value: 'en-US-Neural2-F', label: '🇺🇸 Neural2-F (US Female)' },
                { value: 'en-US-Neural2-G', label: '🇺🇸 Neural2-G (US Female)' },
                { value: 'en-US-Neural2-H', label: '🇺🇸 Neural2-H (US Female)' },
                { value: 'en-US-Neural2-D', label: '🇺🇸 Neural2-D (US Male)' },
                { value: 'en-US-Neural2-I', label: '🇺🇸 Neural2-I (US Male)' },
                { value: 'en-US-Neural2-J', label: '🇺🇸 Neural2-J (US Male)' },
                
                // United States (Wavenet - High Quality)
                { value: 'en-US-Wavenet-A', label: '🇺🇸 Wavenet-A (US Female)' },
                { value: 'en-US-Wavenet-C', label: '🇺🇸 Wavenet-C (US Female)' },
                { value: 'en-US-Wavenet-E', label: '🇺🇸 Wavenet-E (US Female)' },
                { value: 'en-US-Wavenet-F', label: '🇺🇸 Wavenet-F (US Female)' },
                { value: 'en-US-Wavenet-G', label: '🇺🇸 Wavenet-G (US Female)' },
                { value: 'en-US-Wavenet-H', label: '🇺🇸 Wavenet-H (US Female)' },
                { value: 'en-US-Wavenet-B', label: '🇺🇸 Wavenet-B (US Male)' },
                { value: 'en-US-Wavenet-D', label: '🇺🇸 Wavenet-D (US Male)' },
                { value: 'en-US-Wavenet-I', label: '🇺🇸 Wavenet-I (US Male)' },
                { value: 'en-US-Wavenet-J', label: '🇺🇸 Wavenet-J (US Male)' },
                
                // United Kingdom (Neural2)
                { value: 'en-GB-Neural2-A', label: '🇬🇧 Neural2-A (UK Female)' },
                { value: 'en-GB-Neural2-B', label: '🇬🇧 Neural2-B (UK Male)' },
                { value: 'en-GB-Neural2-C', label: '🇬🇧 Neural2-C (UK Female)' },
                { value: 'en-GB-Neural2-D', label: '🇬🇧 Neural2-D (UK Male)' },
                { value: 'en-GB-Neural2-F', label: '🇬🇧 Neural2-F (UK Female)' },
                
                // United Kingdom (Wavenet)
                { value: 'en-GB-Wavenet-A', label: '🇬🇧 Wavenet-A (UK Female)' },
                { value: 'en-GB-Wavenet-B', label: '🇬🇧 Wavenet-B (UK Male)' },
                { value: 'en-GB-Wavenet-C', label: '🇬🇧 Wavenet-C (UK Female)' },
                { value: 'en-GB-Wavenet-D', label: '🇬🇧 Wavenet-D (UK Male)' },
                { value: 'en-GB-Wavenet-F', label: '🇬🇧 Wavenet-F (UK Female)' },
                
                // Australia (Neural2)
                { value: 'en-AU-Neural2-A', label: '🇦🇺 Neural2-A (AU Female)' },
                { value: 'en-AU-Neural2-B', label: '🇦🇺 Neural2-B (AU Male)' },
                { value: 'en-AU-Neural2-C', label: '🇦🇺 Neural2-C (AU Female)' },
                { value: 'en-AU-Neural2-D', label: '🇦🇺 Neural2-D (AU Male)' },
                
                // Australia (Wavenet)
                { value: 'en-AU-Wavenet-A', label: '🇦🇺 Wavenet-A (AU Female)' },
                { value: 'en-AU-Wavenet-B', label: '🇦🇺 Wavenet-B (AU Male)' },
                { value: 'en-AU-Wavenet-C', label: '🇦🇺 Wavenet-C (AU Female)' },
                { value: 'en-AU-Wavenet-D', label: '🇦🇺 Wavenet-D (AU Male)' },
                
                // India (English)
                { value: 'en-IN-Neural2-A', label: '🇮🇳 Neural2-A (Indian Female)' },
                { value: 'en-IN-Neural2-B', label: '🇮🇳 Neural2-B (Indian Male)' },
                { value: 'en-IN-Neural2-C', label: '🇮🇳 Neural2-C (Indian Male)' },
                { value: 'en-IN-Neural2-D', label: '🇮🇳 Neural2-D (Indian Female)' },
                { value: 'en-IN-Wavenet-A', label: '🇮🇳 Wavenet-A (Indian Female)' },
                { value: 'en-IN-Wavenet-B', label: '🇮🇳 Wavenet-B (Indian Male)' },
                { value: 'en-IN-Wavenet-C', label: '🇮🇳 Wavenet-C (Indian Male)' },
                { value: 'en-IN-Wavenet-D', label: '🇮🇳 Wavenet-D (Indian Female)' },
                
                { value: 'CUSTOM', label: '✏️ Custom Voice (330+ more options)' }
            ],
            'openai': [
                { value: 'alloy', label: 'Alloy (Neutral)' },
                { value: 'echo', label: 'Echo (Male)' },
                { value: 'fable', label: 'Fable (British)' },
                { value: 'onyx', label: 'Onyx (Deep)' },
                { value: 'nova', label: 'Nova (Female)' },
                { value: 'shimmer', label: 'Shimmer (Soft)' }
            ],
            'elevenlabs': [
                { value: 'default', label: 'Default Voice' }
            ]
        };

        const engineVoices = voices[engine] || voices['coqui'];
        
        voiceSelect.innerHTML = engineVoices.map(v => 
            `<option value="${v.value}">${v.label}</option>`
        ).join('');

        // Show/hide custom voice input based on selection
        voiceSelect.addEventListener('change', (e) => {
            if (customVoiceContainer) {
                customVoiceContainer.style.display = (e.target.value === 'CUSTOM') ? 'block' : 'none';
            }
        });

        // Hide custom voice input when switching engines (unless Google Cloud)
        if (customVoiceContainer) {
            customVoiceContainer.style.display = 'none';
        }

        console.log(`%c🎤 [Audio] Voices updated for engine: ${engine} (${engineVoices.length - 1} presets + custom option)`, 'color: #00FF00');
    }

    // Switch between tabs
    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        this.modal.querySelectorAll('.creative-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content panels
        this.modal.querySelectorAll('.creative-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
    }

    // Switch between views (Preview/Gallery/History)
    switchView(viewName) {
        // Update view buttons
        this.modal.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update view areas
        this.modal.querySelectorAll('.creative-preview-area').forEach(area => {
            area.classList.toggle('active', area.dataset.view === viewName);
        });

        // Load data for specific views
        if (viewName === 'gallery') {
            this.loadGallery();
        } else if (viewName === 'history') {
            this.loadHistory();
        }
    }

    // Hide the modal
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    // Generate Image
    async generateImage() {
        const prompt = document.getElementById('image-prompt').value.trim();
        if (!prompt) {
            alert('Please enter a prompt for the image');
            return;
        }

        const settings = {
            prompt,
            negativePrompt: document.getElementById('image-negative-prompt').value.trim(),
            model: document.getElementById('image-model').value,
            style: document.getElementById('image-style').value,
            dimensions: document.getElementById('image-dimensions').value,
            quantity: parseInt(document.getElementById('image-quantity').value),
            steps: parseInt(document.getElementById('image-steps').value),
            guidance: parseFloat(document.getElementById('image-guidance').value)
        };

        await this.runGeneration('image', settings);
    }

    // Generate Audio/TTS
    async generateAudio() {
        const text = document.getElementById('audio-text').value.trim();
        if (!text) {
            alert('Please enter text to convert to speech');
            return;
        }

        let voice = document.getElementById('audio-voice').value;
        
        // If custom voice selected, use the custom input value
        if (voice === 'CUSTOM') {
            const customVoice = document.getElementById('audio-custom-voice')?.value.trim();
            if (!customVoice) {
                alert('Please enter a custom voice name (e.g., en-US-Neural2-F)');
                return;
            }
            voice = customVoice;
            console.log(`%c🎤 [Audio] Using custom voice: ${voice}`, 'color: #00FF00; font-weight: bold');
        }

        const settings = {
            text,
            engine: document.getElementById('audio-engine').value,
            voice: voice,
            language: document.getElementById('audio-language').value,
            speed: parseFloat(document.getElementById('audio-speed').value)
        };

        await this.runGeneration('audio', settings);
    }

    // Generate Music
    async generateMusic() {
        const prompt = document.getElementById('music-prompt').value.trim();
        if (!prompt) {
            alert('Please describe the music you want to generate');
            return;
        }

        const settings = {
            prompt,
            genre: document.getElementById('music-genre').value,
            duration: parseInt(document.getElementById('music-duration').value),
            tempo: parseInt(document.getElementById('music-tempo').value),
            mood: document.getElementById('music-mood').value
        };

        await this.runGeneration('music', settings);
    }

    // Run generation (unified)
    async runGeneration(type, settings) {
        if (this.isGenerating) {
            alert('Please wait for the current generation to complete');
            return;
        }

        this.isGenerating = true;
        this.showGenerationStatus(type);

        try {
            // Use /api/ endpoint for local development (server.cjs handles this)
            const response = await fetch(`/api/creative-${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error(`Generation failed: ${response.statusText}`);
            }

            const result = await response.json();
            await this.displayResult(type, result, settings);
            await this.saveToHistory(type, settings, result);

        } catch (error) {
            console.error('Generation error:', error);
            this.showError(error.message);
        } finally {
            this.isGenerating = false;
            this.hideGenerationStatus();
        }
    }

    // Show generation status
    showGenerationStatus(type) {
        const panel = this.modal.querySelector(`.creative-tab-content[data-tab="${this.currentTab}"]`);
        const statusDiv = panel.querySelector('.generation-status');
        const generateBtn = panel.querySelector('.generate-btn');
        
        if (statusDiv && generateBtn) {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.5';
            statusDiv.style.display = 'block';
        }
    }

    // Hide generation status
    hideGenerationStatus() {
        const panel = this.modal.querySelector(`.creative-tab-content[data-tab="${this.currentTab}"]`);
        const statusDiv = panel.querySelector('.generation-status');
        const generateBtn = panel.querySelector('.generate-btn');
        
        if (statusDiv && generateBtn) {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            statusDiv.style.display = 'none';
        }
    }

    // Display generation result
    async displayResult(type, result, settings) {
        const previewArea = this.modal.querySelector('.creative-preview-area[data-view="preview"]');
        const emptyState = previewArea.querySelector('.creative-preview-empty');
        const contentArea = previewArea.querySelector('.creative-preview-content');

        emptyState.style.display = 'none';
        contentArea.style.display = 'block';

        let html = '';

        if (type === 'image') {
            // Handle both real and placeholder responses
            const imageUrl = result.imageUrl || result.url;
            const message = result.message ? `<div class="placeholder-notice">${result.message}</div>` : '';
            
            html = `
                ${message}
                <div class="result-image-container">
                    <img src="${imageUrl}" alt="Generated Image" class="result-image">
                    <div class="result-actions">
                        <button onclick="window.creativeStudio.downloadResult('${imageUrl}', 'image')">
                            📥 Download
                        </button>
                        <button onclick="window.creativeStudio.upscaleImage('${imageUrl}')">
                            ⬆️ Upscale 4x
                        </button>
                        <button onclick="window.creativeStudio.copyToClipboard('${imageUrl}')">
                            📋 Copy URL
                        </button>
                    </div>
                    <div class="result-metadata">
                        <small>Model: ${settings.model} | ${settings.dimensions} | ${settings.steps} steps</small>
                    </div>
                </div>
            `;
        } else if (type === 'audio') {
            html = `
                <div class="result-audio-container">
                    <audio controls src="${result.url}" class="result-audio"></audio>
                    <div class="result-actions">
                        <button onclick="window.creativeStudio.downloadResult('${result.url}', 'audio')">
                            📥 Download MP3
                        </button>
                    </div>
                    <div class="result-metadata">
                        <small>Voice: ${settings.voice} | Speed: ${settings.speed}x</small>
                    </div>
                </div>
            `;
        } else if (type === 'music') {
            html = `
                <div class="result-music-container">
                    <audio controls src="${result.url}" class="result-audio"></audio>
                    <div class="result-actions">
                        <button onclick="window.creativeStudio.downloadResult('${result.url}', 'music')">
                            📥 Download MP3
                        </button>
                    </div>
                    <div class="result-metadata">
                        <small>Genre: ${settings.genre} | ${settings.duration}s | ${settings.tempo} BPM</small>
                    </div>
                </div>
            `;
        }

        contentArea.innerHTML = html;
    }

    // Save to history
    async saveToHistory(type, settings, result) {
        try {
            // TODO: Enable Supabase once RLS policies are configured on creative_generations table
            // const { data: user } = await supabase.auth.getUser();
            // if (!user) return;

            // const { error } = await supabase
            //     .from('creative_generations')
            //     .insert({
            //         user_id: user.id,
            //         type,
            //         prompt: settings.prompt || settings.text,
            //         model: settings.model || settings.engine,
            //         settings: settings,
            //         result_url: result.url,
            //         thumbnail_url: result.thumbnail || result.url
            //     });

            // if (error) throw error;

            // Add to local history (always works)
            this.generationHistory.unshift({
                type,
                settings,
                result,
                timestamp: new Date()
            });

            console.log('✓ Saved to local history');

        } catch (error) {
            console.error('Failed to save to history:', error);
        }
    }

    // Load history from database
    async loadHistory() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                this.showHistoryEmpty('Please sign in to view history');
                return;
            }

            const { data, error } = await supabase
                .from('creative_generations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const historyList = this.modal.querySelector('.creative-history-list');
            if (!data || data.length === 0) {
                historyList.innerHTML = '<p class="history-empty">No generations yet. Start creating!</p>';
                return;
            }

            historyList.innerHTML = data.map(item => `
                <div class="history-item" data-type="${item.type}">
                    <div class="history-thumbnail">
                        ${item.type === 'image' ? 
                            `<img src="${item.thumbnail_url}" alt="Generated content">` :
                            `<div class="history-icon">${this.getTypeIcon(item.type)}</div>`
                        }
                    </div>
                    <div class="history-details">
                        <strong>${item.prompt.substring(0, 100)}${item.prompt.length > 100 ? '...' : ''}</strong>
                        <small>${new Date(item.created_at).toLocaleString()} | Model: ${item.model}</small>
                    </div>
                    <div class="history-actions">
                        <button onclick="window.creativeStudio.viewHistoryItem('${item.id}')">View</button>
                        <button onclick="window.creativeStudio.deleteHistoryItem('${item.id}')">Delete</button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load history:', error);
            this.showHistoryEmpty('Failed to load history');
        }
    }

    // Load gallery
    async loadGallery() {
        // Similar to loadHistory but with thumbnail grid layout
        const galleryGrid = this.modal.querySelector('.creative-gallery-grid');
        galleryGrid.innerHTML = '<p>Loading gallery...</p>';
        // Implementation similar to video-history-ui.js gallery
    }

    // Utility: Get type icon
    getTypeIcon(type) {
        const icons = {
            image: '🖼️',
            audio: '🎤',
            music: '🎵',
            video: '🎬'
        };
        return icons[type] || '📄';
    }

    // Download result
    downloadResult(url, type) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-${type}-${Date.now()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('URL copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }

    // Show error
    showError(message) {
        const previewArea = this.modal.querySelector('.creative-preview-area[data-view="preview"]');
        const contentArea = previewArea.querySelector('.creative-preview-content');
        contentArea.style.display = 'block';
        contentArea.innerHTML = `
            <div class="result-error">
                <h3>❌ Generation Failed</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }

    // Show empty history state
    showHistoryEmpty(message) {
        const historyList = this.modal.querySelector('.creative-history-list');
        historyList.innerHTML = `<p class="history-empty">${message}</p>`;
    }
}

// Initialize global instance
console.log('%c🎨 [Creative Studio] Creating global instance...', 'color: #FF00FF; font-weight: bold');
window.creativeStudio = new CreativeStudioUI();
console.log('%c🎨 [Creative Studio] Global instance created:', 'color: #00FF00; font-weight: bold', window.creativeStudio);

export { CreativeStudioUI };
