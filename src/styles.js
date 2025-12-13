/**
 * Styles Module for GrapesJS AI Agent Plugin
 * Injects all CSS styles into the editor document
 */

export default (editor, opts = {}) => {
  const pfx = opts.classPrefix || 'gaia';
  
  const css = `
    /* ========================================
       Floating Action Button (FAB)
       ======================================== */
    .${pfx}-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007370 0%, #007370 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 15;
      outline: none;
    }

    .${pfx}-fab:hover {
      transform: scale(1.1);
    }

    .${pfx}-fab:active {
      transform: scale(0.95);
    }

    .${pfx}-fab.${pfx}-dragging {
      cursor: grabbing;
      transition: none;
    }

    .${pfx}-fab svg {
      width: 32px;
      height: 32px;
      stroke: white;
    }

    /* ========================================
       Chatbot Panel
       ======================================== */
    .${pfx}-panel {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: ${opts.panelWidth || 360}px;
      height: ${opts.panelHeight || 480}px;
      background: #09090B;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      z-index: 15;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .${pfx}-panel.${pfx}-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Header */
    .${pfx}-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 8px 8px 16px;
      background: linear-gradient(135deg, #007370 0%, #007370 100%);
      color: white;
    }

    .${pfx}-header-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .${pfx}-close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .${pfx}-close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .${pfx}-close-btn svg {
      width: 14px;
      height: 14px;
      fill: white;
    }

    /* Messages Area */
    .${pfx}-messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .${pfx}-messages::-webkit-scrollbar {
      width: 6px;
    }

    .${pfx}-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .${pfx}-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    /* Message Bubbles */
    .${pfx}-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .${pfx}-message-assistant {
      align-self: flex-start;
      background: #ffffff1a;
      color: #e0e0e0;
      border-bottom-left-radius: 4px;
    }

    .${pfx}-message-user {
      align-self: flex-end;
      background: linear-gradient(135deg, #007370 0%, #007370 100%);
      color: white;
      border-bottom-right-radius: 4px;
    }

    /* Component Badges in Messages */
    .${pfx}-message-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin: 2px 4px 2px 0;
      font-family: 'Monaco', 'Menlo', monospace;
    }

    /* Loading Indicator */
    .${pfx}-loading {
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #ffffff1a;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
    }

    .${pfx}-loading-dots {
      display: flex;
      gap: 4px;
    }

    .${pfx}-loading-dot {
      width: 8px;
      height: 8px;
      background: #007370;
      border-radius: 50%;
      animation: ${pfx}-bounce 1.4s infinite ease-in-out;
    }

    .${pfx}-loading-dot:nth-child(1) { animation-delay: -0.32s; }
    .${pfx}-loading-dot:nth-child(2) { animation-delay: -0.16s; }
    .${pfx}-loading-dot:nth-child(3) { animation-delay: 0s; }

    @keyframes ${pfx}-bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Badge Area */
    .${pfx}-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 12px;
      background: #18181B;
      min-height: 36px;
      border-top: 1px solid #ffffff1a;
    }

    .${pfx}-badges:empty {
      display: none;
    }

    .${pfx}-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #007370 0%, #007370 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
    }

    .${pfx}-badge-remove {
      background: rgba(255, 255, 255, 0.3);
      border: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: background 0.2s;
    }

    .${pfx}-badge-remove:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    .${pfx}-badge-remove svg {
      width: 8px;
      height: 8px;
      fill: white;
    }

    /* Input Area */
    .${pfx}-input-area {
      display: flex;
      gap: 8px;
      padding: 12px 12px;
      background: #18181B;
      border-top: 1px solid #ffffff1a;
    }

    .${pfx}-input {
      flex: 1;
      background: #ffffff1a;
      border: 1px solid #3d3d5c;
      border-radius: 8px;
      padding: 10px 16px;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      resize: none;
      min-height: 40px;
      max-height: 100px;
    }

    .${pfx}-input:focus {
      border-color: #007370;
    }

    .${pfx}-input::placeholder {
      color: #a3a3a3;
    }

    .${pfx}-submit-btn {
      width: 40px;
      height: 40px;
      min-width: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007370 0%, #007370 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .${pfx}-submit-btn:hover {
      transform: scale(1.05);
    }

    .${pfx}-submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .${pfx}-submit-btn svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    /* Error Message */
    .${pfx}-error {
      background: #ff4757;
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin: 8px 16px;
    }

    /* Empty State */
    .${pfx}-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #a3a3a3;
      text-align: center;
      padding: 20px;
    }

    .${pfx}-empty svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .${pfx}-empty p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Toolbar Button */
    .${pfx}-toolbar-btn {
      display: inline-block;
      align-items: center;
      justify-content: center;
    }

    .${pfx}-toolbar-btn svg {
      width: 16px;
      height: 16px;
      fill: none;
    }
  `;

  // Inject styles into the document
  const injectStyles = () => {
    const styleEl = document.createElement('style');
    styleEl.id = `${pfx}-styles`;
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  };

  // Remove existing styles if any (for hot reload)
  const existingStyles = document.getElementById(`${pfx}-styles`);
  if (existingStyles) {
    existingStyles.remove();
  }

  injectStyles();

  return { css, pfx };
};
