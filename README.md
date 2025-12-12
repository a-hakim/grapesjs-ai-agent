# GrapesJS AI Agent

A GrapesJS plugin that adds an AI-powered chatbot interface for component modification assistance.

## Features

- 🎯 **Draggable FAB** - Floating Action Button that can be positioned anywhere in the editor
- 💬 **Chatbot Interface** - Clean, modern chat panel for AI interactions
- 🔗 **Component Integration** - Select components and reference them in your chat messages
- 🔄 **Live Modifications** - AI responses can directly update component HTML
- 💾 **Session Persistence** - FAB position and chat history persist during the session

## Demo

![GrapesJS AI Agent Demo](https://via.placeholder.com/800x400/1a1a2e/667eea?text=GrapesJS+AI+Agent)

## Installation

### CDN

```html
<link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet">
<script src="https://unpkg.com/grapesjs"></script>
<script src="https://unpkg.com/grapesjs-ai-agent"></script>
```

### NPM

```bash
npm i grapesjs-ai-agent
```

### Git

```bash
git clone https://github.com/a-hakim/grapesjs-ai-agent.git
```

## Usage

### Browser

```html
<link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet"/>
<script src="https://unpkg.com/grapesjs"></script>
<script src="path/to/grapesjs-ai-agent.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
    container: '#gjs',
    plugins: ['grapesjs-ai-agent'],
    pluginsOpts: {
      'grapesjs-ai-agent': {
        api: 'https://your-api-endpoint.com/chat',
        // ... other options
      }
    }
  });
</script>
```

### Modern JavaScript

```js
import grapesjs from 'grapesjs';
import aiAgentPlugin from 'grapesjs-ai-agent';
import 'grapesjs/dist/css/grapes.min.css';

const editor = grapesjs.init({
  container: '#gjs',
  plugins: [aiAgentPlugin],
  pluginsOpts: {
    [aiAgentPlugin]: {
      api: 'https://your-api-endpoint.com/chat',
      panelWidth: 400,
      panelHeight: 500,
    }
  }
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `api` | `string` | `''` | **Required.** API endpoint for chatbot requests. |
| `fabPosition` | `object` | `{ x: null, y: null }` | Starting coordinates for the FAB. |
| `panelWidth` | `number` | `360` | Width of the chatbot panel in pixels. |
| `panelHeight` | `number` | `480` | Height of the chatbot panel in pixels. |
| `classPrefix` | `string` | `'gaia'` | CSS class prefix to avoid conflicts. |
| `i18n` | `object` | `{}` | Localization overrides. |

## API Integration

### Request Format

When a user submits a message, the plugin sends a POST request to your API endpoint:

```json
{
  "history": [
    { "role": "assistant", "content": "Hello!" },
    { "role": "user", "content": "Change the button color", "components": ["c123"] }
  ],
  "message": "Make it red",
  "components": ["c123", "c456"],
  "componentData": {
    "c123": "<button class=\"btn\">Click me</button>",
    "c456": "<div class=\"container\">...</div>"
  }
}
```

### Response Format

Your API should return:

```json
{
  "reply": "I've updated the button color to red.",
  "modifications": {
    "c123": "<button class=\"btn\" style=\"background: red;\">Click me</button>"
  }
}
```

## Component Toolbar Integration

When you select any component in the editor, a new **"Send to AI Chat"** button appears in the component toolbar. Clicking it adds the component's ID as a badge in the chat input, allowing you to reference multiple components in a single message.

## Public API

The plugin exposes methods via `editor.AiAgent`:

```js
// Open/close the chatbot panel
editor.AiAgent.open();
editor.AiAgent.close();
editor.AiAgent.toggle();

// Check if panel is open
editor.AiAgent.isOpen();

// Manage components in chat
editor.AiAgent.addComponent('component-id');
editor.AiAgent.removeComponent('component-id');
editor.AiAgent.getPendingComponents();

// Manage chat history
editor.AiAgent.getHistory();
editor.AiAgent.clearHistory();

// Access API module directly
const api = editor.AiAgent.api();
```

## Styling

The plugin uses a CSS class prefix (default: `gaia`) to avoid conflicts. You can customize the appearance by overriding these CSS classes or setting a custom `classPrefix`.

Key classes:
- `.gaia-fab` - Floating Action Button
- `.gaia-panel` - Chatbot panel container
- `.gaia-message` - Chat message bubbles
- `.gaia-badge` - Component reference badges
- `.gaia-input` - Text input field

## Development

Clone the repository:

```bash
git clone https://github.com/a-hakim/grapesjs-ai-agent.git
cd grapesjs-ai-agent
```

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

## File Structure

```
src/
├── index.js      # Main plugin entry point
├── styles.js     # CSS injection module
├── fab.js        # Floating Action Button
├── chatbot.js    # Chatbot panel UI
├── api.js        # API communication
├── toolbar.js    # Component toolbar integration
├── blocks.js     # (Empty - plugin adds no blocks)
└── locale/
    └── en.js     # English translations
```

## License

MIT

## Author

[a-hakim](https://github.com/a-hakim)
