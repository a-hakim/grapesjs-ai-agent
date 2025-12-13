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
  const DRAG_THRESHOLD = 5;
  
  let fab = null;
  let isDragging = false;
  let hasDragged = false;
  let offsetX = 0;
  let offsetY = 0;
  let startMouseX = 0;
  let startMouseY = 0;

  /**
   * Creates the FAB element
   */
  const createFAB = () => {
    fab = document.createElement('button');
    fab.className = `${pfx}-fab`;
    fab.innerHTML = chatIcon;
    fab.setAttribute('title', 'AI Assistant');
    fab.setAttribute('aria-label', 'Open AI Assistant');

    // Apply saved position or use default (bottom-right via CSS)
    const saved = getSavedPosition();
    if (saved) {
      fab.style.left = `${saved.x}px`;
      fab.style.top = `${saved.y}px`;
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
    }

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
   * Get/save position from sessionStorage
   */
  const getSavedPosition = () => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  const savePosition = () => {
    try {
      const rect = fab.getBoundingClientRect();
      sessionStorage.setItem(storageKey, JSON.stringify({ 
        x: rect.left, 
        y: rect.top 
      }));
    } catch (e) {}
  };

  /**
   * Mouse/touch event handlers
   */
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  };

  /**
   * Start drag - capture offset of cursor within FAB
   */
  const startDrag = (clientX, clientY) => {
    isDragging = true;
    hasDragged = false;
    startMouseX = clientX;
    startMouseY = clientY;
    
    // Store where on the FAB the user clicked (viewport coords)
    const rect = fab.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
  };

  /**
   * Disable canvas pointer events to prevent GrapesJS from intercepting drag
   */
  const disableCanvasEvents = () => {
    const canvas = editor.Canvas?.getElement();
    const frame = editor.Canvas?.getFrameEl();
    if (canvas) canvas.style.pointerEvents = 'none';
    if (frame) frame.style.pointerEvents = 'none';
  };

  /**
   * Re-enable canvas pointer events after drag
   */
  const enableCanvasEvents = () => {
    const canvas = editor.Canvas?.getElement();
    const frame = editor.Canvas?.getFrameEl();
    if (canvas) canvas.style.pointerEvents = '';
    if (frame) frame.style.pointerEvents = '';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    updateDrag(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    updateDrag(e.touches[0].clientX, e.touches[0].clientY);
  };

  /**
   * Update position during drag - use viewport coordinates directly
   */
  const updateDrag = (clientX, clientY) => {
    // Check drag threshold
    if (!hasDragged) {
      const dx = clientX - startMouseX;
      const dy = clientY - startMouseY;
      if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
      
      hasDragged = true;
      fab.classList.add(`${pfx}-dragging`);
      
      // Disable canvas events so it doesn't intercept our drag
      disableCanvasEvents();
      
      if (state.isOpen) {
        state.togglePanel();
      }
    }
    
    // Calculate new position in viewport coords
    // Simply: cursor position minus the offset where we grabbed the FAB
    let newX = clientX - offsetX;
    let newY = clientY - offsetY;
    
    // Constrain to viewport
    const fabWidth = fab.offsetWidth;
    const fabHeight = fab.offsetHeight;
    newX = Math.max(0, Math.min(newX, window.innerWidth - fabWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - fabHeight));
    
    // Apply position
    fab.style.left = `${newX}px`;
    fab.style.top = `${newY}px`;
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    endDrag();
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
    endDrag();
  };

  /**
   * End drag - save position or toggle panel
   */
  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    fab.classList.remove(`${pfx}-dragging`);
    
    // Re-enable canvas events
    enableCanvasEvents();
    
    if (hasDragged) {
      savePosition();
    } else {
      state.togglePanel();
    }
    hasDragged = false;
  };

  const getFAB = () => fab;

  const getPosition = () => {
    if (!fab) return { x: 0, y: 0 };
    const rect = fab.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  };

  const destroy = () => {
    if (fab) {
      fab.removeEventListener('mousedown', handleMouseDown);
      fab.removeEventListener('touchstart', handleTouchStart);
      fab.remove();
      fab = null;
    }
  };

  createFAB();

  return { getFAB, getPosition, destroy };
};
