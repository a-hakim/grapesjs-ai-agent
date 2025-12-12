/**
 * Floating Action Button (FAB) Module for GrapesJS AI Agent Plugin
 * Creates a draggable FAB that toggles the chatbot panel
 */

// SVG icon for the chat bubble
const chatIcon = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
  </svg>
`;

export default (editor, opts = {}, state) => {
  const pfx = opts.classPrefix || 'gaia';
  const storageKey = `${pfx}-fab-position`;
  
  let fab = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  /**
   * Creates the FAB element and injects it into the DOM
   */
  const createFAB = () => {
    fab = document.createElement('button');
    fab.className = `${pfx}-fab`;
    fab.innerHTML = chatIcon;
    fab.setAttribute('title', 'AI Assistant');
    fab.setAttribute('aria-label', 'Open AI Assistant');

    // Apply saved or default position
    const savedPosition = getSavedPosition();
    if (savedPosition) {
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.left = `${savedPosition.x}px`;
      fab.style.top = `${savedPosition.y}px`;
    } else if (opts.fabPosition && opts.fabPosition.x !== null) {
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
      fab.style.left = `${opts.fabPosition.x}px`;
      fab.style.top = `${opts.fabPosition.y}px`;
    }

    // Attach event listeners
    fab.addEventListener('pointerdown', handlePointerDown);
    fab.addEventListener('click', handleClick);

    // Inject into editor container
    const editorEl = editor.getContainer();
    if (editorEl) {
      editorEl.style.position = 'relative';
      editorEl.appendChild(fab);
    } else {
      document.body.appendChild(fab);
    }

    return fab;
  };

  /**
   * Retrieves saved FAB position from sessionStorage
   */
  const getSavedPosition = () => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load FAB position:', e);
    }
    return null;
  };

  /**
   * Saves FAB position to sessionStorage
   */
  const savePosition = (x, y) => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ x, y }));
    } catch (e) {
      console.warn('Failed to save FAB position:', e);
    }
  };

  /**
   * Handles pointer down for drag initiation
   */
  const handlePointerDown = (e) => {
    const rect = fab.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  /**
   * Handles pointer move during drag
   */
  const handlePointerMove = (e) => {
    if (!isDragging) {
      // Start dragging after small movement threshold
      isDragging = true;
      fab.classList.add(`${pfx}-dragging`);
    }

    const container = editor.getContainer() || document.body;
    const containerRect = container.getBoundingClientRect();

    // Calculate new position relative to container
    let newX = e.clientX - containerRect.left - dragOffset.x;
    let newY = e.clientY - containerRect.top - dragOffset.y;

    // Constrain within container bounds
    const fabWidth = fab.offsetWidth;
    const fabHeight = fab.offsetHeight;
    
    newX = Math.max(0, Math.min(newX, containerRect.width - fabWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - fabHeight));

    // Apply position
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    fab.style.left = `${newX}px`;
    fab.style.top = `${newY}px`;

    // Also update panel position if open
    if (state.isOpen) {
      updatePanelPosition(newX, newY);
    }
  };

  /**
   * Handles pointer up to end drag
   */
  const handlePointerUp = (e) => {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);

    if (isDragging) {
      // Save final position
      const container = editor.getContainer() || document.body;
      const containerRect = container.getBoundingClientRect();
      const fabRect = fab.getBoundingClientRect();
      
      const x = fabRect.left - containerRect.left;
      const y = fabRect.top - containerRect.top;
      savePosition(x, y);

      fab.classList.remove(`${pfx}-dragging`);
      isDragging = false;
    }
  };

  /**
   * Handles FAB click to toggle chatbot panel
   */
  const handleClick = (e) => {
    // Only toggle if not ending a drag
    if (!isDragging) {
      state.togglePanel();
    }
  };

  /**
   * Updates the chatbot panel position relative to FAB
   */
  const updatePanelPosition = (fabX, fabY) => {
    const panel = document.querySelector(`.${pfx}-panel`);
    if (panel) {
      const container = editor.getContainer() || document.body;
      const containerRect = container.getBoundingClientRect();
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;
      const fabWidth = fab.offsetWidth;

      // Position panel above FAB, adjusting if near edges
      let panelX = fabX + fabWidth - panelWidth;
      let panelY = fabY - panelHeight - 10;

      // Ensure panel stays within viewport
      if (panelX < 10) panelX = 10;
      if (panelY < 10) panelY = fabY + fab.offsetHeight + 10;

      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      panel.style.left = `${panelX}px`;
      panel.style.top = `${panelY}px`;
    }
  };

  /**
   * Gets the current FAB element
   */
  const getFAB = () => fab;

  /**
   * Gets the current FAB position for panel positioning
   */
  const getPosition = () => {
    if (!fab) return { x: 0, y: 0 };
    const rect = fab.getBoundingClientRect();
    const container = editor.getContainer() || document.body;
    const containerRect = container.getBoundingClientRect();
    return {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top
    };
  };

  /**
   * Destroys the FAB element
   */
  const destroy = () => {
    if (fab) {
      fab.removeEventListener('pointerdown', handlePointerDown);
      fab.removeEventListener('click', handleClick);
      fab.remove();
      fab = null;
    }
  };

  // Initialize FAB
  createFAB();

  return {
    getFAB,
    getPosition,
    updatePanelPosition,
    destroy
  };
};
