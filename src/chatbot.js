/**
 * Chatbot Panel Module for GrapesJS AI Agent Plugin
 * Creates and manages the chatbot interface UI
 */

// SVG icons
const closeIcon = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
`;

const sendIcon = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
`;

const removeIcon = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
`;

const emptyIcon = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
`;

export default (editor, opts = {}, state, fabModule, apiModule) => {
  const pfx = opts.classPrefix || 'gaia';
  
  let panel = null;
  let messagesContainer = null;
  let badgesContainer = null;
  let inputEl = null;
  let submitBtn = null;

  /**
   * Creates the chatbot panel and injects it into the DOM
   */
  const createPanel = () => {
    panel = document.createElement('div');
    panel.className = `${pfx}-panel`;

    panel.innerHTML = `
      <div class="${pfx}-header">
        <h3 class="${pfx}-header-title">AI Assistant</h3>
        <button class="${pfx}-close-btn" aria-label="Close">${closeIcon}</button>
      </div>
      <div class="${pfx}-messages"></div>
      <div class="${pfx}-badges"></div>
      <div class="${pfx}-input-area">
        <textarea class="${pfx}-input" placeholder="Type your message..." rows="1"></textarea>
        <button class="${pfx}-submit-btn" aria-label="Submit">${sendIcon}</button>
      </div>
    `;

    // Get references to elements
    messagesContainer = panel.querySelector(`.${pfx}-messages`);
    badgesContainer = panel.querySelector(`.${pfx}-badges`);
    inputEl = panel.querySelector(`.${pfx}-input`);
    submitBtn = panel.querySelector(`.${pfx}-submit-btn`);

    // Attach event listeners
    const closeBtn = panel.querySelector(`.${pfx}-close-btn`);
    closeBtn.addEventListener('click', () => state.togglePanel());

    submitBtn.addEventListener('click', handleSubmit);
    inputEl.addEventListener('keydown', handleKeyDown);
    inputEl.addEventListener('input', autoResizeInput);

    // Inject into editor container
    const editorEl = editor.getContainer();
    if (editorEl) {
      editorEl.appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }

    // Initial render
    renderMessages();
    renderEmptyState();

    return panel;
  };

  /**
   * Auto-resize textarea based on content
   */
  const autoResizeInput = () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
  };

  /**
   * Handles keyboard events in the input
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    const message = inputEl.value.trim();
    const components = [...state.pendingComponents];

    if (!message && components.length === 0) {
      return;
    }

    // Disable input during submission
    setSubmitting(true);

    // Add user message to history
    const userMessage = {
      role: 'user',
      content: message,
      components: components.length > 0 ? components : undefined
    };
    state.history.push(userMessage);

    // Clear input and badges
    inputEl.value = '';
    autoResizeInput();
    state.pendingComponents = [];
    renderBadges();
    renderMessages();

    // Send to API
    try {
      const response = await apiModule.sendMessage(message, components, state.history);
      
      // Add assistant response to history
      const assistantMessage = {
        role: 'assistant',
        content: response.reply || 'I have processed your request.'
      };
      state.history.push(assistantMessage);

      // Apply modifications if any
      if (response.modifications) {
        apiModule.applyModifications(response.modifications);
      }

      renderMessages();
    } catch (error) {
      console.error('API Error:', error);
      
      // Add error message to history
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to process request. Please try again.'}`,
        isError: true
      };
      state.history.push(errorMessage);
      renderMessages();
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Sets the submitting state (loading)
   */
  const setSubmitting = (isSubmitting) => {
    state.isLoading = isSubmitting;
    submitBtn.disabled = isSubmitting;
    inputEl.disabled = isSubmitting;

    if (isSubmitting) {
      // Add loading indicator
      const loadingEl = document.createElement('div');
      loadingEl.className = `${pfx}-loading`;
      loadingEl.id = `${pfx}-loading-indicator`;
      loadingEl.innerHTML = `
        <div class="${pfx}-loading-dots">
          <div class="${pfx}-loading-dot"></div>
          <div class="${pfx}-loading-dot"></div>
          <div class="${pfx}-loading-dot"></div>
        </div>
      `;
      messagesContainer.appendChild(loadingEl);
      scrollToBottom();
    } else {
      // Remove loading indicator
      const loadingEl = document.getElementById(`${pfx}-loading-indicator`);
      if (loadingEl) {
        loadingEl.remove();
      }
    }
  };

  /**
   * Renders all messages in the history
   */
  const renderMessages = () => {
    if (!messagesContainer) return;

    // Clear container
    messagesContainer.innerHTML = '';

    if (state.history.length === 0) {
      renderEmptyState();
      return;
    }

    // Render each message
    state.history.forEach((msg) => {
      const messageEl = document.createElement('div');
      messageEl.className = `${pfx}-message ${pfx}-message-${msg.role}`;
      
      if (msg.isError) {
        messageEl.classList.add(`${pfx}-error`);
      }

      // Build message content
      let content = escapeHtml(msg.content);

      // Add component badges if present
      if (msg.components && msg.components.length > 0) {
        const badges = msg.components.map(id => 
          `<span class="${pfx}-message-badge">[component: ${escapeHtml(id)}]</span>`
        ).join('');
        content = badges + '<br>' + content;
      }

      messageEl.innerHTML = content;
      messagesContainer.appendChild(messageEl);
    });

    scrollToBottom();
  };

  /**
   * Renders the empty state when no messages
   */
  const renderEmptyState = () => {
    if (state.history.length > 0) return;

    const emptyEl = document.createElement('div');
    emptyEl.className = `${pfx}-empty`;
    emptyEl.innerHTML = `
      ${emptyIcon}
      <p>Hello! Select components and describe what changes you'd like me to make.</p>
    `;
    messagesContainer.appendChild(emptyEl);
  };

  /**
   * Renders the component badges
   */
  const renderBadges = () => {
    if (!badgesContainer) return;

    badgesContainer.innerHTML = '';

    state.pendingComponents.forEach((id) => {
      const badge = document.createElement('div');
      badge.className = `${pfx}-badge`;
      badge.innerHTML = `
        <span>[component: ${escapeHtml(id)}]</span>
        <button class="${pfx}-badge-remove" data-id="${escapeHtml(id)}" aria-label="Remove">${removeIcon}</button>
      `;

      // Add remove handler
      const removeBtn = badge.querySelector(`.${pfx}-badge-remove`);
      removeBtn.addEventListener('click', () => {
        removeComponentBadge(id);
      });

      badgesContainer.appendChild(badge);
    });
  };

  /**
   * Adds a component badge to the pending list
   */
  const addComponentBadge = (componentId) => {
    if (!state.pendingComponents.includes(componentId)) {
      state.pendingComponents.push(componentId);
      renderBadges();
    }
  };

  /**
   * Removes a component badge from the pending list
   */
  const removeComponentBadge = (componentId) => {
    const index = state.pendingComponents.indexOf(componentId);
    if (index > -1) {
      state.pendingComponents.splice(index, 1);
      renderBadges();
    }
  };

  /**
   * Opens the chatbot panel
   */
  const openPanel = () => {
    if (panel) {
      panel.classList.add(`${pfx}-open`);
      inputEl.focus();
    }
  };

  /**
   * Closes the chatbot panel
   */
  const closePanel = () => {
    if (panel) {
      panel.classList.remove(`${pfx}-open`);
    }
  };

  /**
   * Scrolls the messages container to the bottom
   */
  const scrollToBottom = () => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  /**
   * Escapes HTML to prevent XSS
   */
  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  /**
   * Gets the panel element
   */
  const getPanel = () => panel;

  /**
   * Destroys the chatbot panel
   */
  const destroy = () => {
    if (panel) {
      panel.remove();
      panel = null;
    }
  };

  // Initialize panel
  createPanel();

  return {
    getPanel,
    openPanel,
    closePanel,
    addComponentBadge,
    removeComponentBadge,
    renderMessages,
    renderBadges,
    destroy
  };
};
