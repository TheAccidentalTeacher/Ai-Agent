# Phase 10: Auto-Memory System 🤖💾

## Automatic Session Capture

**No more manual buttons!** The system now **automatically saves** summaries of your work sessions.

## How It Works

### Auto-Save Triggers

Memory summaries are automatically saved when:

1. **Every 10 interactions** (clicking buttons, generating content, loading videos, etc.)
2. **Every 5 minutes** (time-based)
3. **When you close/refresh the page** (session end)

### What Gets Captured

The system intelligently tracks:

- 🎥 **Video activities**: Loading videos, transcripts, summaries
- 🎨 **Creative work**: Image/audio/music/video generation
- 💬 **AI conversations**: Chat interactions
- 📚 **Research**: Web searches and analysis
- 🎮 **Project work**: Saving/loading game projects
- 📝 **Content creation**: Educational tools (quizzes, lesson plans, etc.)

### Activity Weights

Activities are prioritized by importance:
- **Weight 5** (highest): Video summaries, content creation, creative generation
- **Weight 4**: Transcripts, AI chat, project saves
- **Weight 3**: Video loads, research searches
- **Weight 2**: Project loads, level edits
- **Weight 1**: Asset additions

The most important activity becomes the **session title**.

## Auto-Generated Summaries

### Example Summary

```
Title: "Video Analysis Session (2:45 PM)"

Content:
Session at 2:45 PM on December 21, 2024

Generated AI summary and analysis

Activities:
- Video loaded: 1x
- Transcript loaded: 1x
- Summary generated: 1x
- Content created: 2x

Total interactions: 12

Metadata:
- activityCount: 8
- interactionCount: 12
- sessionDuration: 328000ms
- autoSaved: true
```

### Smart Categorization

Summaries are automatically categorized:
- **video**: Video Intelligence activities
- **creative**: Creative Studio work
- **research**: Web research and analysis
- **conversation**: AI chat sessions
- **manual**: General project work

### Auto-Tag Generation

Each auto-saved memory includes:
- AI-generated tags (via Claude)
- Activity metadata
- Session duration
- Interaction count

## Features

### 1. Silent Background Operation

- No popups or interruptions
- Runs automatically when signed in
- Only shows subtle notification after save

### 2. Intelligent Summarization

- Groups related activities
- Identifies primary focus
- Creates descriptive titles
- Captures context

### 3. Notification Toast

After auto-save, a subtle notification appears:

```
💾 Auto-saved to Memory
   Video Analysis Session (2:45 PM)
```

- Appears bottom-right corner
- Slides in smoothly
- Auto-dismisses after 3 seconds

### 4. Activity Monitoring

Automatically detects:
- Button clicks (Video, Creative Studio, Project)
- Form submissions (AI chat)
- Content generation
- File operations

### 5. Threshold System

**Interaction-based**:
- Counts every meaningful action
- Saves after 10 interactions
- Prevents saving trivial sessions

**Time-based**:
- Checks every minute
- Saves after 5 minutes of activity
- Ensures regular backups

### 6. Minimum Content Filter

- Won't save sessions with <50 characters
- Skips trivial activity
- Only captures meaningful work

## Usage

### Automatic (Default)

Just work normally! The system tracks everything:

```javascript
// User loads video → Auto-tracked
// User generates summary → Auto-tracked
// 10 interactions later → Auto-saved!
```

### Manual Trigger (Advanced)

Force save current session:

```javascript
import { saveSessionNow } from './auto-memory.js';

// Save now regardless of thresholds
await saveSessionNow();
```

### Enable/Disable

```javascript
import { setAutoMemoryEnabled } from './auto-memory.js';

// Disable auto-memory
setAutoMemoryEnabled(false);

// Re-enable
setAutoMemoryEnabled(true);
```

### Check Activity Stats

```javascript
import { getActivityStats } from './auto-memory.js';

const stats = getActivityStats();
console.log(stats);
// {
//   activityCount: 8,
//   interactionCount: 12,
//   timeSinceLastSave: 120000,
//   nextAutoSave: 180000
// }
```

## Integration Points

### Existing Code Integration

The system automatically monitors:

1. **Video Intelligence**
   - Load video button
   - Load transcript button
   - Generate summary button
   - Content creation tools

2. **Creative Studio**
   - All "Generate" buttons
   - Tracks active tab (Image/Audio/Music/Video)

3. **AI Chat**
   - Form submissions
   - Message previews (first 50 chars)

4. **Project Management**
   - Save project
   - Load project
   - Add asset

### Adding Custom Tracking

For new features, add tracking:

```javascript
import { trackActivity } from './auto-memory.js';

// Track custom activity
button.addEventListener('click', () => {
  trackActivity('my-feature', { 
    detail1: 'value',
    detail2: 123 
  });
});
```

## Configuration

Edit `AUTO_MEMORY_CONFIG` in `auto-memory.js`:

```javascript
const AUTO_MEMORY_CONFIG = {
  INTERACTION_THRESHOLD: 10,    // Save after N interactions
  TIME_THRESHOLD: 5 * 60 * 1000, // 5 minutes in ms
  MIN_CONTENT_LENGTH: 50,        // Minimum chars to save
  ENABLED: true                  // Global on/off
};
```

## Memory Tab Integration

Auto-saved memories appear in the **🧠 Memory** tab:

- Marked with `autoSaved: true` in metadata
- Show up in search results
- Include full activity history
- AI-generated tags for discovery

### Searching Auto-Memories

```
Search: "video analysis"
→ Finds all video session summaries

Search: "creative studio"
→ Finds all creative generation sessions
```

## Privacy & Control

### What's Saved

- Activity types and counts
- Timestamps
- Video IDs (public YouTube IDs only)
- Message previews (first 50 chars of chat)
- NO personal data, passwords, or sensitive content

### User Control

- Only saves when **signed in**
- Respects Supabase RLS (user data isolation)
- Can disable anytime: `setAutoMemoryEnabled(false)`
- Can delete memories from Memory tab

## Technical Details

### Activity Log Structure

```javascript
{
  type: 'video-load',
  timestamp: 1703174400000,
  details: { videoId: 'dQw4w9WgXcQ' },
  weight: 3
}
```

### Auto-Save Flow

1. User performs action → `trackActivity()` called
2. Activity added to log, counter incremented
3. Check threshold (10 interactions or 5 minutes)
4. Generate summary from activity log
5. Call `/api/memory-save` endpoint
6. Show notification
7. Reset log and counter

### Session Duration

Calculated as:
```javascript
sessionDuration = lastActivity.timestamp - firstActivity.timestamp
```

## Performance

### Minimal Overhead

- **Monitoring**: Lightweight event listeners
- **Storage**: In-memory array (cleared after save)
- **API calls**: Only when thresholds met
- **No polling**: Event-driven architecture

### Memory Usage

- ~1KB per 100 activities in log
- Cleared after every auto-save
- No memory leaks

## Cost Estimate

**Per User Per Month** (assuming 20 sessions):

- Embeddings: 20 × $0.0001 = **$0.002**
- Auto-tags: 20 × $0.003 = **$0.06**
- **Total**: ~**$0.062/month** per active user

Still incredibly affordable! 🎉

## Examples

### Example 1: Video Analysis Session

**User actions**:
1. Load video
2. Load transcript
3. Generate summary
4. Create quiz
5. Create lesson plan
6. Export summary

**Auto-saved as**:
```
Title: "Content Creation: Quiz Maker (3:20 PM)"
Type: video
Activities: 6
```

### Example 2: Creative Studio Session

**User actions**:
1. Generate image (DALL-E)
2. Generate image (Flux)
3. Generate audio
4. Generate music

**Auto-saved as**:
```
Title: "Creative Studio: Image (4:15 PM)"
Type: creative
Activities: 4
```

### Example 3: AI Chat Session

**User actions**:
1. Ask about neural networks
2. Ask for code example
3. Request explanation
4. Follow-up question

**Auto-saved as**:
```
Title: "AI Conversation (5:00 PM)"
Type: conversation
Activities: 4
```

## Troubleshooting

### Auto-save not working

1. **Check if signed in**: Auto-memory requires authentication
2. **Check console**: Look for `[Auto-Memory]` logs
3. **Verify threshold**: Need 10 interactions or 5 minutes
4. **Check enabled**: `getActivityStats()` to verify

### Notifications not showing

- Hard refresh (Ctrl+Shift+R)
- Check z-index conflicts
- Verify notification element in DOM

### Too many saves

Increase thresholds:
```javascript
AUTO_MEMORY_CONFIG.INTERACTION_THRESHOLD = 20; // Save after 20 actions
AUTO_MEMORY_CONFIG.TIME_THRESHOLD = 10 * 60 * 1000; // 10 minutes
```

### Too few saves

Decrease thresholds:
```javascript
AUTO_MEMORY_CONFIG.INTERACTION_THRESHOLD = 5; // Save after 5 actions
AUTO_MEMORY_CONFIG.TIME_THRESHOLD = 2 * 60 * 1000; // 2 minutes
```

## Future Enhancements

Potential improvements:

1. **Smart summarization**: Use Claude to write better summaries
2. **Activity clustering**: Group related sessions
3. **Session replay**: Reconstruct what you did
4. **Insights dashboard**: "You created 20 quizzes this week"
5. **Export sessions**: Download as Markdown/PDF
6. **Collaborative sessions**: Share with team
7. **Search suggestions**: "Similar to your session last Tuesday"

## Files Modified

- ✅ `auto-memory.js` (520 lines) - NEW
- ✅ `index.html` - Added auto-memory script imports

## Testing

### Manual Test

1. **Sign in** with Google/GitHub
2. **Perform 10 actions** (load video, generate, etc.)
3. **Watch console** for `[Auto-Memory]` logs
4. **See notification** bottom-right after save
5. **Open Memory tab** and find auto-saved summary

### Expected Console Logs

```
🤖 [Auto-Memory] Initializing...
✅ [Auto-Memory] Initialized (save every 10 actions or 5 minutes)
📊 [Auto-Memory] Activity: video-load (1 interactions) { videoId: 'dQw4w9WgXcQ' }
📊 [Auto-Memory] Activity: video-transcript (2 interactions) { videoId: 'dQw4w9WgXcQ' }
...
🎯 [Auto-Memory] Interaction threshold reached, auto-saving...
💾 [Auto-Memory] Saving session summary... { title: '...', content: '...', ... }
✅ [Auto-Memory] Session saved! { memory: {...}, tags: [...], cost: {...} }
```

---

**Phase 10 Auto-Memory Status**: 🟢 Live & Tracking!

**Next**: Test with real sessions and refine thresholds based on usage patterns.
