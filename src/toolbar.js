/**
 * Toolbar Module for GrapesJS AI Agent Plugin
 * Adds a "Send to Chat" button to the component toolbar
 */

// SVG icon for the toolbar button (chat/send icon)
const toolbarIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <g><path d="M6 6h12a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 18h-6l-4 3 0-3H6a2.25 2.25 0 01-2.25-2.25v-7.5A2.25 2.25 0 016 6zM12 3v3M9 3h6M8.25 12a.75.75 0 110-1.5.75.75 0 010 1.5zM15.75 12a.75.75 0 110-1.5.75.75 0 010 1.5zM9 15h6"></path></g>
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
