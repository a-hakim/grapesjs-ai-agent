/**
 * GrapesJS AI Agent Plugin
 * 
 * A plugin that adds an AI-powered chatbot interface to GrapesJS editor.
 * Features:
 * - Draggable Floating Action Button (FAB)
 * - Chatbot panel with message history
 * - Component selection integration
 * - API communication for AI-assisted modifications
 * 
 * @author a-hakim
 * @license MIT
 */

import loadStyles from './styles';
import loadFAB from './fab';
import loadChatbot from './chatbot';
import loadAPI from './api';
import loadToolbar from './toolbar';
import en from './locale/en';

/**
 * Plugin default options
 */
const defaults = {
  // Required: API endpoint for chatbot requests
  api: '',
  
  // Optional: Starting FAB position { x: number, y: number }
  fabPosition: { x: null, y: null },
  
  // Optional: Chatbot panel width in pixels
  panelWidth: 360,
  
  // Optional: Chatbot panel height in pixels
  panelHeight: 480,
  
  // Optional: CSS class prefix to avoid conflicts
  classPrefix: 'gaia',
  
  // Optional: i18n overrides
  i18n: {}
};

/**
 * Main plugin export
 * @param {Object} editor - GrapesJS editor instance
 * @param {Object} opts - Plugin options
 */
export default (editor, opts = {}) => {
  // Merge options with defaults
  const options = { ...defaults, ...opts };

  // Validate required options
  if (!options.api) {
    console.warn('grapesjs-ai-agent: "api" option is required but not provided. The plugin will load but API calls will fail.');
  }

  /**
   * Shared state object for all modules
   */
  const state = {
    // Chat message history
    history: [],
    
    // Component IDs pending submission
    pendingComponents: [],
    
    // Whether the chatbot panel is open
    isOpen: false,
    
    // Whether an API request is in progress
    isLoading: false,
    
    // Toggle panel visibility
    togglePanel: null // Will be set after chatbot module loads
  };

  // Module references
  let fabModule = null;
  let chatbotModule = null;
  let apiModule = null;
  let toolbarModule = null;

  /**
   * Initialize all modules when editor loads
   */
  const initModules = () => {
    // Load styles
    loadStyles(editor, options);

    // Load API module (no DOM dependencies)
    apiModule = loadAPI(editor, options);

    // Create toggle function
    state.togglePanel = () => {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        chatbotModule?.openPanel();
      } else {
        chatbotModule?.closePanel();
      }
    };

    // Load FAB
    fabModule = loadFAB(editor, options, state);

    // Load Chatbot
    chatbotModule = loadChatbot(editor, options, state, fabModule, apiModule);

    // Load Toolbar integration
    toolbarModule = loadToolbar(editor, options, state, chatbotModule);
  };

  /**
   * Load i18n messages
   */
  const loadI18n = () => {
    if (editor.I18n) {
      editor.I18n.addMessages({
        en,
        ...options.i18n,
      });
    }
  };

  /**
   * Cleanup function for when editor is destroyed
   */
  const destroy = () => {
    fabModule?.destroy();
    chatbotModule?.destroy();
  };

  // Initialize when editor is ready
  editor.on('load', () => {
    initModules();
    loadI18n();
  });

  // Cleanup when editor is destroyed
  editor.on('destroy', () => {
    destroy();
  });

  /**
   * Public API exposed by the plugin
   * Accessible via editor.AiAgent
   */
  editor.AiAgent = {
    /**
     * Opens the chatbot panel
     */
    open: () => {
      if (!state.isOpen) {
        state.togglePanel();
      }
    },

    /**
     * Closes the chatbot panel
     */
    close: () => {
      if (state.isOpen) {
        state.togglePanel();
      }
    },

    /**
     * Toggles the chatbot panel
     */
    toggle: () => {
      state.togglePanel();
    },

    /**
     * Adds a component ID to the chat input as a badge
     * @param {string} componentId - The component ID to add
     */
    addComponent: (componentId) => {
      chatbotModule?.addComponentBadge(componentId);
    },

    /**
     * Removes a component ID from the chat input
     * @param {string} componentId - The component ID to remove
     */
    removeComponent: (componentId) => {
      chatbotModule?.removeComponentBadge(componentId);
    },

    /**
     * Gets the current chat history
     * @returns {Object[]} Array of message objects
     */
    getHistory: () => {
      return [...state.history];
    },

    /**
     * Clears the chat history
     */
    clearHistory: () => {
      state.history = [];
      chatbotModule?.renderMessages();
    },

    /**
     * Gets the pending component IDs
     * @returns {string[]} Array of component IDs
     */
    getPendingComponents: () => {
      return [...state.pendingComponents];
    },

    /**
     * Checks if the panel is currently open
     * @returns {boolean}
     */
    isOpen: () => state.isOpen,

    /**
     * Gets the API module for direct access
     * @returns {Object} API module
     */
    api: () => apiModule
  };
};