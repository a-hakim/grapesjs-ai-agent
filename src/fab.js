/**
 * Floating Action Button (FAB) Module for GrapesJS AI Agent Plugin
 * Creates a draggable FAB that toggles the chatbot panel
 */

// SVG icon for the chat bubble
const chatIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
    <g><path d="M6 6h12a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 18h-6l-4 3 0-3H6a2.25 2.25 0 01-2.25-2.25v-7.5A2.25 2.25 0 016 6zM12 3v3M9 3h6M8.25 12a.75.75 0 110-1.5.75.75 0 010 1.5zM15.75 12a.75.75 0 110-1.5.75.75 0 010 1.5zM9 15h6"></path></g>
  </svg>
`;

export default (editor, opts = {}, state) => {
  const pfx = opts.classPrefix || 'gaia';
  const storageKey = `${pfx}-fab-position`;
  const DRAG_THRESHOLD = 5; // pixels before considering it a drag
  
  let fab = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let hasDragged = false;

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
      applyPosition(savedPosition.x, savedPosition.y);
    } else if (opts.fabPosition && opts.fabPosition.x !== null) {
      applyPosition(opts.fabPosition.x, opts.fabPosition.y);
    }

    // Use mousedown for better control over drag vs click
    fab.addEventListener('mousedown', handleMouseDown);
    fab.addEventListener('touchstart', handleTouchStart, { passive: false });

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
   * Applies position to FAB
   */
  const applyPosition = (x, y) => {
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    fab.style.left = `${x}px`;
    fab.style.top = `${y}px`;
  };

  /**
   * Retrieves saved FAB position from sessionStorage
   */
  const getSavedPosition = () => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  /**
   * Saves FAB position to sessionStorage
   */
  const savePosition = (x, y) => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ x, y }));
    } catch (e) {
      // Ignore storage errors
    }
  };

  /**
   * Handle mouse down - start potential drag
   */
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  /**
   * Handle touch start - start potential drag
   */
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  };

  /**
   * Initialize drag tracking
   */
  const startDrag = (clientX, clientY) => {
    startX = clientX;
    startY = clientY;
    hasDragged = false;
    
    // Get current position
    const rect = fab.getBoundingClientRect();
    const container = editor.getContainer() || document.body;
    const containerRect = container.getBoundingClientRect();
    
    startLeft = rect.left - containerRect.left;
    startTop = rect.top - containerRect.top;
  };

  /**
   * Handle mouse move during drag
   */
  const handleMouseMove = (e) => {
    e.preventDefault();
    updateDrag(e.clientX, e.clientY);
  };

  /**
   * Handle touch move during drag
   */
  const handleTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    updateDrag(touch.clientX, touch.clientY);
  };

  /**
   * Update drag position
   */
  const updateDrag = (clientX, clientY) => {
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    
    // Check if we've moved past threshold
    if (!hasDragged) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < DRAG_THRESHOLD) return;
      
      hasDragged = true;
      fab.classList.add(`${pfx}-dragging`);
      
      // Close chatbot panel when dragging starts
      if (state.isOpen) {
        state.togglePanel();
      }
    }
    
    // Calculate new position
    const container = editor.getContainer() || document.body;
    const containerRect = container.getBoundingClientRect();
    const fabWidth = fab.offsetWidth;
    const fabHeight = fab.offsetHeight;
    
    let newX = startLeft + deltaX;
    let newY = startTop + deltaY;
    
    // Constrain to container
    newX = Math.max(0, Math.min(newX, containerRect.width - fabWidth));
    newY = Math.max(0, Math.min(newY, containerRect.height - fabHeight));
    
    applyPosition(newX, newY);
  };

  /**
   * Handle mouse up - end drag or trigger click
   */
  const handleMouseUp = (e) => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    endDrag();
  };

  /**
   * Handle touch end - end drag or trigger click
   */
  const handleTouchEnd = (e) => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
    endDrag();
  };

  /**
   * End drag and save position or toggle panel
   */
  const endDrag = () => {
    fab.classList.remove(`${pfx}-dragging`);
    
    if (hasDragged) {
      // Save final position
      const rect = fab.getBoundingClientRect();
      const container = editor.getContainer() || document.body;
      const containerRect = container.getBoundingClientRect();
      
      savePosition(rect.left - containerRect.left, rect.top - containerRect.top);
    } else {
      // It was a click, not a drag
      state.togglePanel();
    }
    
    hasDragged = false;
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
      fab.removeEventListener('mousedown', handleMouseDown);
      fab.removeEventListener('touchstart', handleTouchStart);
      fab.remove();
      fab = null;
    }
  };

  // Initialize FAB
  createFAB();

  return {
    getFAB,
    getPosition,
    destroy
  };
};
