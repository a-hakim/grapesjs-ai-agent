/**
 * Toolbar Module for GrapesJS AI Agent Plugin
 * Adds a "Send to Chat" button to the component toolbar
 */

// SVG icon for the toolbar button (chat/send icon)
const toolbarIcon = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
`;

export default (editor, opts = {}, state, chatbotModule) => {
  const pfx = opts.classPrefix || 'gaia';
  const commandId = `${pfx}:add-to-chat`;
  const toolbarBtnId = `${pfx}-send-to-chat`;

  /**
   * Registers the command for adding component to chat
   */
  const registerCommand = () => {
    editor.Commands.add(commandId, {
      run(editor) {
        const selected = editor.getSelected();
        if (selected) {
          // Get the component's unique ID
          const componentId = selected.cid || selected.getId();
          
          // Add to chatbot
          if (chatbotModule) {
            chatbotModule.addComponentBadge(componentId);
            
            // Open panel if not already open
            if (!state.isOpen) {
              state.togglePanel();
            }
          }
        }
      }
    });
  };

  /**
   * Adds the toolbar button to a component
   * @param {Object} component - GrapesJS component
   */
  const addToolbarButton = (component) => {
    if (!component) return;

    const toolbar = component.get('toolbar') || [];
    
    // Check if button already exists
    const exists = toolbar.some(btn => btn.id === toolbarBtnId);
    if (exists) return;

    // Add the button
    const newToolbar = [
      ...toolbar,
      {
        id: toolbarBtnId,
        command: commandId,
        attributes: { 
          class: `${pfx}-toolbar-btn`,
          title: 'Send to AI Chat' 
        },
        label: toolbarIcon
      }
    ];

    component.set('toolbar', newToolbar);
  };

  /**
   * Sets up event listeners for component selection
   */
  const setupEventListeners = () => {
    // Add toolbar button when component is selected
    editor.on('component:selected', (component) => {
      addToolbarButton(component);
    });

    // Also handle when switching between components
    editor.on('component:toggled', (component) => {
      if (component) {
        addToolbarButton(component);
      }
    });
  };

  /**
   * Initializes the toolbar integration
   */
  const init = () => {
    registerCommand();
    setupEventListeners();
  };

  // Initialize
  init();

  return {
    addToolbarButton,
    commandId,
    toolbarBtnId
  };
};
