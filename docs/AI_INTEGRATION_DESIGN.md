# AI Integration Design Document
**Created**: December 11, 2025  
**Version**: 2.0.0 (AI-Enhanced)  
**Purpose**: Transform MVP into AI-powered collaborative level editor

---

## Vision Statement

Transform the Universal Game Level Editor from a simple tool into an **AI-powered design assistant** that:
- Understands the current level state
- Answers questions about game design
- Performs actions on behalf of the user
- Analyzes layouts for balance and playability
- Suggests improvements
- Automates repetitive tasks

**Philosophy**: "AI as collaborative co-designer, not just chatbot"

---

## Core Requirements

### Non-Negotiable #1: Universal Tooltips
- **Every** button, input, panel, icon needs tooltip
- Tooltips explain what the element does
- Tooltips appear on hover (desktop) or tap-hold (future mobile)
- Consistent styling and positioning
- No exceptions - 100% UI coverage

### Non-Negotiable #2: Integrated AI Assistant
- Chat panel similar to VS Code Copilot
- Full access to editor state and help documentation
- Can perform actions in the application (not just talk)
- Uses Anthropic (Claude) or OpenAI (GPT-4) APIs
- No artificial token/context limits (single-user app)
- Conversation persists during session

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                               │
│  ┌────────────┬──────────────┬────────────┬──────────────────┐  │
│  │  Toolbar   │   Canvas     │ Properties │  AI Assistant    │  │
│  │  (Tooltips)│   Viewport   │   Panel    │  Chat Panel      │  │
│  │            │              │ (Tooltips) │  (Collapsible)   │  │
│  └────────────┴──────────────┴────────────┴──────────────────┘  │
│                          ↓                        ↓               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              GameEditor + AI Controller                      ││
│  │  - Editor state access                                       ││
│  │  - Tool calling functions                                    ││
│  │  - Conversation management                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                          ↓                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   AI API Layer                               ││
│  │  - Anthropic Claude API (primary)                            ││
│  │  - OpenAI GPT-4 API (fallback/alternative)                   ││
│  │  - Tool calling implementation                               ││
│  │  - Context window management (no limits)                     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Universal Tooltips

### Implementation Strategy

**1. Create Tooltip System**
```javascript
class TooltipManager {
  constructor() {
    this.tooltip = null;
    this.currentTarget = null;
    this.showDelay = 500; // ms
    this.hideDelay = 100;
  }
  
  init() {
    this.createTooltipElement();
    this.bindGlobalEvents();
  }
  
  register(element, text, position = 'bottom') {
    element.dataset.tooltip = text;
    element.dataset.tooltipPosition = position;
  }
  
  show(element) { /* ... */ }
  hide() { /* ... */ }
}
```

**2. Tooltip Definitions**
```javascript
const TOOLTIPS = {
  // Toolbar
  'load-background': 'Load a background image for your level (Ctrl+B)',
  'add-asset': 'Add game objects like sprites, enemies, items (Ctrl+A)',
  'export-json': 'Export level data as JSON for your game (Ctrl+E)',
  'save-project': 'Save complete project with images (Ctrl+S)',
  'load-project': 'Load a previously saved project (Ctrl+O)',
  'clear-all': 'Remove all objects and background from canvas',
  'toggle-ai': 'Open/close AI assistant chat panel',
  
  // Properties Panel
  'prop-name': 'Display name for this object',
  'prop-x': 'Horizontal position in pixels (0 = left edge)',
  'prop-y': 'Vertical position in pixels (0 = top edge)',
  'prop-width': 'Object width in pixels',
  'prop-height': 'Object height in pixels',
  'prop-rotation': 'Rotation angle in degrees (0-360)',
  'btn-duplicate-obj': 'Create a copy of this object (Ctrl+D)',
  'btn-delete-obj': 'Remove this object from the level (Delete key)',
  
  // Canvas
  'canvas': 'Click to select objects, drag to move them. Arrow keys for precise movement.',
  
  // Status Bar
  'mouse-coords': 'Current mouse position on canvas',
  'object-count': 'Total number of objects in your level',
  
  // AI Panel
  'ai-chat-input': 'Ask questions or request actions. AI can analyze your level and make changes.',
  'ai-send-button': 'Send message to AI assistant (Enter key)',
  'ai-clear-button': 'Clear conversation history',
  'ai-settings-button': 'Configure AI provider and API keys'
};
```

**3. CSS Styling**
```css
.tooltip {
  position: fixed;
  background: #2d2d2d;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  max-width: 300px;
  z-index: 10000;
  pointer-events: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid #444;
  opacity: 0;
  transition: opacity 0.2s;
}

.tooltip.visible {
  opacity: 1;
}

.tooltip::before {
  content: '';
  position: absolute;
  border: 6px solid transparent;
}

.tooltip.bottom::before {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: #2d2d2d;
}
```

---

## Phase 2: AI Chat Panel (UI)

### Layout Changes

**New Structure**:
```html
<div class="workspace">
  <div class="canvas-wrapper">
    <canvas id="canvas"></canvas>
  </div>
  <aside class="properties-panel">
    <!-- Existing properties -->
  </aside>
  <aside class="ai-panel" id="ai-panel">
    <div class="ai-header">
      <h3>AI Assistant</h3>
      <div class="ai-header-actions">
        <button id="ai-settings" title="Configure AI">⚙️</button>
        <button id="ai-clear" title="Clear chat">🗑️</button>
        <button id="ai-collapse" title="Collapse panel">◀</button>
      </div>
    </div>
    <div class="ai-messages" id="ai-messages">
      <!-- Messages appear here -->
    </div>
    <div class="ai-input-area">
      <textarea id="ai-input" placeholder="Ask about your level or request changes..."></textarea>
      <button id="ai-send">Send</button>
    </div>
  </aside>
</div>
```

**Responsive Layout**:
```css
.workspace {
  display: grid;
  grid-template-columns: 1fr 320px 400px; /* canvas + properties + AI */
  gap: 0;
  height: calc(100vh - 90px);
}

.ai-panel {
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  border-left: 1px solid #333;
}

.ai-panel.collapsed {
  width: 50px;
  grid-template-columns: 1fr 320px 50px;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.ai-message {
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
}

.ai-message.user {
  background: #264f78;
  margin-left: 40px;
}

.ai-message.assistant {
  background: #2d2d2d;
  margin-right: 40px;
}

.ai-message.system {
  background: #1e1e1e;
  font-size: 12px;
  font-style: italic;
  color: #888;
  text-align: center;
}
```

---

## Phase 3: AI Backend Integration

### API Configuration

**localStorage Structure**:
```javascript
{
  "ai_config": {
    "provider": "anthropic", // or "openai"
    "anthropic_api_key": "sk-ant-...",
    "openai_api_key": "sk-...",
    "model": "claude-3-5-sonnet-20241022", // or "gpt-4"
    "max_tokens": 8096,
    "temperature": 0.7
  }
}
```

**Settings Modal**:
```html
<div id="ai-settings-modal" class="modal">
  <div class="modal-content">
    <h2>AI Assistant Configuration</h2>
    
    <label>Provider</label>
    <select id="ai-provider">
      <option value="anthropic">Anthropic (Claude)</option>
      <option value="openai">OpenAI (GPT-4)</option>
    </select>
    
    <label>Anthropic API Key</label>
    <input type="password" id="anthropic-key" placeholder="sk-ant-...">
    
    <label>OpenAI API Key</label>
    <input type="password" id="openai-key" placeholder="sk-...">
    
    <label>Model</label>
    <select id="ai-model">
      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
      <option value="gpt-4">GPT-4</option>
      <option value="gpt-4-turbo">GPT-4 Turbo</option>
    </select>
    
    <button id="save-ai-config">Save Configuration</button>
    <button id="cancel-ai-config">Cancel</button>
  </div>
</div>
```

---

## Phase 4: AI Tool Calling System

### Available Tools for AI

The AI will have access to these functions to manipulate the editor:

```javascript
const AI_TOOLS = [
  {
    name: "get_editor_state",
    description: "Get complete current state of the level editor",
    parameters: { type: "object", properties: {} },
    handler: () => ({
      canvas: { width: editor.canvas.width, height: editor.canvas.height },
      background: editor.background ? "loaded" : null,
      objects: editor.objects.map(obj => ({
        id: obj.id,
        name: obj.name,
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        rotation: obj.rotation
      })),
      selectedObject: editor.selectedObject ? editor.selectedObject.id : null
    })
  },
  
  {
    name: "add_object",
    description: "Add a new object to the canvas at specified position",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Object name" },
        x: { type: "number", description: "X position" },
        y: { type: "number", description: "Y position" },
        width: { type: "number", description: "Width in pixels" },
        height: { type: "number", description: "Height in pixels" }
      },
      required: ["name", "x", "y"]
    },
    handler: (params) => {
      // Create placeholder object (user must provide image)
      return { success: true, message: `Object ${params.name} marked at position` };
    }
  },
  
  {
    name: "move_object",
    description: "Move an object to a new position",
    parameters: {
      type: "object",
      properties: {
        object_id: { type: "string", description: "ID of object to move" },
        x: { type: "number", description: "New X position" },
        y: { type: "number", description: "New Y position" }
      },
      required: ["object_id", "x", "y"]
    },
    handler: (params) => {
      const obj = editor.objects.find(o => o.id === params.object_id);
      if (!obj) return { success: false, message: "Object not found" };
      obj.x = params.x;
      obj.y = params.y;
      editor.updateProperties();
      return { success: true, message: `Moved ${obj.name} to (${params.x}, ${params.y})` };
    }
  },
  
  {
    name: "delete_object",
    description: "Delete an object from the canvas",
    parameters: {
      type: "object",
      properties: {
        object_id: { type: "string", description: "ID of object to delete" }
      },
      required: ["object_id"]
    },
    handler: (params) => {
      const index = editor.objects.findIndex(o => o.id === params.object_id);
      if (index === -1) return { success: false, message: "Object not found" };
      const name = editor.objects[index].name;
      editor.objects.splice(index, 1);
      editor.updateObjectCount();
      return { success: true, message: `Deleted ${name}` };
    }
  },
  
  {
    name: "duplicate_object",
    description: "Duplicate an existing object",
    parameters: {
      type: "object",
      properties: {
        object_id: { type: "string", description: "ID of object to duplicate" },
        offset_x: { type: "number", description: "X offset from original", default: 20 },
        offset_y: { type: "number", description: "Y offset from original", default: 20 }
      },
      required: ["object_id"]
    },
    handler: (params) => {
      const original = editor.objects.find(o => o.id === params.object_id);
      if (!original) return { success: false, message: "Object not found" };
      
      const duplicate = {
        id: Date.now() + Math.random(),
        name: original.name + ' (copy)',
        image: original.image,
        x: original.x + (params.offset_x || 20),
        y: original.y + (params.offset_y || 20),
        width: original.width,
        height: original.height,
        rotation: original.rotation,
        imageSrc: original.imageSrc
      };
      editor.objects.push(duplicate);
      editor.updateObjectCount();
      return { success: true, message: `Duplicated ${original.name}` };
    }
  },
  
  {
    name: "select_object",
    description: "Select an object by ID",
    parameters: {
      type: "object",
      properties: {
        object_id: { type: "string", description: "ID of object to select" }
      },
      required: ["object_id"]
    },
    handler: (params) => {
      const obj = editor.objects.find(o => o.id === params.object_id);
      if (!obj) return { success: false, message: "Object not found" };
      editor.selectedObject = obj;
      editor.updateProperties();
      return { success: true, message: `Selected ${obj.name}` };
    }
  },
  
  {
    name: "resize_object",
    description: "Resize an object",
    parameters: {
      type: "object",
      properties: {
        object_id: { type: "string", description: "ID of object" },
        width: { type: "number", description: "New width" },
        height: { type: "number", description: "New height" }
      },
      required: ["object_id", "width", "height"]
    },
    handler: (params) => {
      const obj = editor.objects.find(o => o.id === params.object_id);
      if (!obj) return { success: false, message: "Object not found" };
      obj.width = params.width;
      obj.height = params.height;
      editor.updateProperties();
      return { success: true, message: `Resized ${obj.name}` };
    }
  },
  
  {
    name: "rotate_object",
    description: "Rotate an object",
    parameters: {
      type: "object",
      properties: {
        object_id: { type: "string", description: "ID of object" },
        rotation: { type: "number", description: "Rotation in degrees" }
      },
      required: ["object_id", "rotation"]
    },
    handler: (params) => {
      const obj = editor.objects.find(o => o.id === params.object_id);
      if (!obj) return { success: false, message: "Object not found" };
      obj.rotation = params.rotation;
      editor.updateProperties();
      return { success: true, message: `Rotated ${obj.name} to ${params.rotation}°` };
    }
  },
  
  {
    name: "analyze_level_layout",
    description: "Analyze the current level for spacing, balance, and design patterns",
    parameters: { type: "object", properties: {} },
    handler: () => {
      const objects = editor.objects;
      const analysis = {
        object_count: objects.length,
        average_spacing: calculateAverageSpacing(objects),
        density_map: calculateDensityMap(objects, editor.canvas),
        object_types: countObjectTypes(objects),
        potential_issues: findLayoutIssues(objects)
      };
      return analysis;
    }
  },
  
  {
    name: "arrange_objects_grid",
    description: "Arrange selected objects in a grid pattern",
    parameters: {
      type: "object",
      properties: {
        columns: { type: "number", description: "Number of columns" },
        spacing: { type: "number", description: "Spacing between objects" },
        start_x: { type: "number", description: "Starting X position" },
        start_y: { type: "number", description: "Starting Y position" }
      },
      required: ["columns", "spacing"]
    },
    handler: (params) => {
      // Arrange objects in grid
      let col = 0, row = 0;
      editor.objects.forEach((obj, i) => {
        obj.x = (params.start_x || 50) + (col * (obj.width + params.spacing));
        obj.y = (params.start_y || 50) + (row * (obj.height + params.spacing));
        col++;
        if (col >= params.columns) {
          col = 0;
          row++;
        }
      });
      editor.updateProperties();
      return { success: true, message: `Arranged ${editor.objects.length} objects in grid` };
    }
  },
  
  {
    name: "export_level",
    description: "Export the current level as JSON",
    parameters: { type: "object", properties: {} },
    handler: () => {
      editor.exportJSON();
      return { success: true, message: "Level exported to JSON" };
    }
  }
];
```

---

## Phase 5: AI System Prompt

The AI needs comprehensive context about the editor:

```javascript
const AI_SYSTEM_PROMPT = `You are an AI assistant integrated into the Universal Game Level Editor. You help users design 2D game levels by answering questions, analyzing layouts, and performing actions.

## Your Capabilities

You can:
1. **Answer questions** about game design, level layout, object placement
2. **Analyze levels** for balance, difficulty, spacing, and design patterns
3. **Perform actions** using the tool calling system:
   - Move, resize, rotate objects
   - Add/delete/duplicate objects
   - Arrange objects in patterns (grids, circles, etc.)
   - Select objects
   - Export levels
4. **Read the complete editor state** including all objects and their properties
5. **Access help documentation** with answers to common questions

## Current Editor State

${generateEditorStateDescription()}

## Available Tools

You have access to these functions to manipulate the editor:
${AI_TOOLS.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

## Guidelines

1. **Be proactive**: Don't just describe - actually DO things using tools
2. **Confirm actions**: Before making major changes, confirm with user
3. **Be specific**: When referencing objects, use their IDs or names
4. **Analyze thoughtfully**: Consider game design principles (balance, flow, difficulty curve)
5. **Explain reasoning**: When suggesting changes, explain why
6. **Use tools liberally**: If user asks "move that to the left", actually move it
7. **Context aware**: Remember the conversation history and previous actions

## Game Design Knowledge

You know about:
- Level design principles (pacing, difficulty curves, risk/reward)
- Object placement (spacing, density, visual clarity)
- Tower Defense specifics (paths, spawn points, tower placement zones)
- Platformer design (jump distances, hazard placement, collectibles)
- Common game patterns and best practices

## Example Interactions

User: "Make this level more challenging"
You: *analyze layout* → *increase enemy density* → *add obstacles* → *explain changes*

User: "What's wrong with this layout?"
You: *analyze* → *identify issues* → *suggest specific fixes* → *offer to implement them*

User: "Arrange these randomly"
You: *use tools to randomly place objects* → *ensure no overlaps* → *confirm completion*

Remember: You're a collaborative co-designer, not just a chatbot. Take action!`;
```

---

## Phase 6: Implementation Plan

### Step 1: Tooltips (Quick Win)
**Time**: 1-2 hours  
**Files**: index.html, style.css, editor.js  
**Deliverable**: Every UI element has informative tooltip

### Step 2: AI Panel UI
**Time**: 2-3 hours  
**Files**: index.html, style.css  
**Deliverable**: Collapsible AI chat panel, settings modal

### Step 3: API Integration
**Time**: 3-4 hours  
**Files**: editor.js (new AIController class)  
**Deliverable**: Working API calls to Anthropic/OpenAI

### Step 4: Tool Calling System
**Time**: 4-5 hours  
**Files**: editor.js  
**Deliverable**: All 12 tools implemented and tested

### Step 5: Conversation Management
**Time**: 2-3 hours  
**Files**: editor.js  
**Deliverable**: Message history, context building

### Step 6: Polish & Testing
**Time**: 2-3 hours  
**Deliverable**: Smooth UX, error handling, edge cases

**Total Estimated Time**: 14-20 hours

---

## Technical Considerations

### API Calls (Browser-Based)

Since this is a client-side app, we'll make direct API calls:

```javascript
async function callAI(messages, tools) {
  const config = getAIConfig();
  
  if (config.provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.anthropic_api_key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.max_tokens,
        messages: messages,
        tools: tools,
        system: AI_SYSTEM_PROMPT
      })
    });
    return await response.json();
  }
  
  // Similar for OpenAI...
}
```

**Note**: API keys stored in localStorage (acceptable for single-user desktop app)

### Context Window Management

- No artificial limits (user specified)
- Full conversation history sent each time
- Editor state included in system prompt
- Tool results added to conversation

### Performance

- API calls are async (UI remains responsive)
- Show "thinking..." indicator during requests
- Stream responses if possible (better UX)
- Cache help documentation locally

---

## User Experience Flow

### First Time Setup

1. User clicks "Toggle AI" button
2. AI panel opens, shows setup prompt
3. User clicks settings, enters API key
4. AI greets user, offers to help

### Typical Interaction

1. User: "I'm making a tower defense level. Where should I place the towers?"
2. AI: *analyzes layout* → *identifies choke points* → *suggests tower zones*
3. User: "Add tower spots at those locations"
4. AI: *uses tools to add marker objects* → "Added 5 tower placement zones. Would you like me to adjust spacing?"

### Advanced Usage

1. User: "Make this level flow better"
2. AI: *deep analysis* → *identifies flow issues* → *proposes specific changes*
3. User: "Do it"
4. AI: *moves 10 objects* → *adjusts spacing* → *rotates path elements* → "Improved flow by 40%. Test it out!"

---

## Documentation Updates Needed

- **AI_CONTEXT.md**: Add AI integration section
- **API_REFERENCE.md**: Document AIController class
- **ARCHITECTURE.md**: Add AI system architecture
- **ADDING_FEATURES.md**: Guidelines for adding new AI tools
- **TROUBLESHOOTING.md**: AI-specific issues
- **README.md**: AI features overview
- **CHANGELOG.md**: Version 2.0.0 entry

---

## Security Considerations

### API Key Storage

- localStorage (acceptable for single-user desktop app)
- Keys never sent to our servers (direct API calls)
- User controls their own keys
- Option to clear keys

### CORS Issues

- Anthropic/OpenAI APIs support CORS
- If issues arise, may need simple proxy server
- Or use Netlify Functions as proxy

### Rate Limiting

- User responsible for their API usage
- Display token usage estimates
- Allow configuring max_tokens per request

---

## Next Steps

1. **Get user approval** on this design
2. **Start with tooltips** (non-negotiable #1)
3. **Build AI panel UI** (visual foundation)
4. **Integrate one API** (probably Anthropic first)
5. **Implement core tools** (move, delete, analyze)
6. **Test with real scenarios**
7. **Add remaining tools**
8. **Polish and deploy**

---

**Status**: Design Complete - Ready for Implementation  
**Estimated Total Time**: 14-20 hours across multiple sessions  
**Risk Level**: Medium (API integration + tool calling is complex)  
**User Impact**: High (transforms tool into AI-powered assistant)

---

Would you like me to start implementing Phase 1 (Universal Tooltips)?
