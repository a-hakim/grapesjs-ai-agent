/**
 * API Module for GrapesJS AI Agent Plugin
 * Handles communication with the AI backend and applies HTML modifications
 */

export default (editor, opts = {}) => {
  const apiEndpoint = opts.api || '';
  const customHeaders = opts.headers || {};

  /**
   * Sends a message to the AI API
   * @param {string} message - The user's message
   * @param {string[]} componentIds - Array of selected component IDs
   * @param {Object[]} history - Conversation history
   * @returns {Promise<Object>} - API response with reply and modifications
   */
  const sendMessage = async (message, componentIds = [], history = []) => {
    if (!apiEndpoint) {
      throw new Error('API endpoint not configured. Please set the "api" option.');
    }

    // Gather component data for context
    const componentData = {};
    componentIds.forEach((id) => {
      const component = findComponentById(id);
      if (component) {
        componentData[id] = component.toHTML();
      }
    });

    // Build request payload
    const payload = {
      history: history.map((msg) => ({
        role: msg.role,
        content: msg.content,
        components: msg.components || []
      })),
      message: message,
      components: componentIds,
      componentData: componentData
    };

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...customHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  };

  /**
   * Finds a component by its ID (cid) in the editor
   * @param {string} id - Component ID
   * @returns {Object|null} - GrapesJS component or null
   */
  const findComponentById = (id) => {
    const wrapper = editor.getWrapper();
    if (!wrapper) return null;

    // Search recursively through all components
    const findInComponents = (components) => {
      for (const component of components.models || []) {
        if (component.cid === id || component.getId() === id) {
          return component;
        }
        // Search in children
        const found = findInComponents(component.components());
        if (found) return found;
      }
      return null;
    };

    // Check wrapper itself
    if (wrapper.cid === id || wrapper.getId() === id) {
      return wrapper;
    }

    return findInComponents(wrapper.components());
  };

  /**
   * Applies HTML modifications to components
   * @param {Object} modifications - Map of component IDs to new HTML
   */
  const applyModifications = (modifications) => {
    const results = {
      success: [],
      failed: []
    };

    Object.entries(modifications).forEach(([id, newHtml]) => {
      try {
        const component = findComponentById(id);
        
        if (!component) {
          console.warn(`Component with ID "${id}" not found`);
          results.failed.push({ id, error: 'Component not found' });
          return;
        }

        // Preserve component type and basic attributes
        const componentType = component.get('type');
        const attributes = component.getAttributes();
        const classes = component.getClasses();

        // Clear existing children and replace with new content
        component.components().reset();

        // Parse new HTML and determine how to apply it
        if (newHtml.trim()) {
          // Check if the new HTML is a full element replacement or just inner content
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newHtml.trim();

          const firstChild = tempDiv.firstElementChild;
          
          if (firstChild && tempDiv.children.length === 1 && 
              firstChild.tagName.toLowerCase() === component.get('tagName')?.toLowerCase()) {
            // Full element replacement - merge attributes and use inner content
            const newAttrs = {};
            Array.from(firstChild.attributes).forEach((attr) => {
              if (attr.name !== 'id') { // Preserve original ID
                newAttrs[attr.name] = attr.value;
              }
            });
            
            // Merge attributes (new ones take precedence, but keep original ID)
            component.setAttributes({ ...attributes, ...newAttrs, id: attributes.id });
            
            // Set inner content
            component.components(firstChild.innerHTML);
          } else {
            // Inner content only
            component.components(newHtml);
          }
        }

        // Restore classes if they were removed
        // if (classes.length > 0) {
        //   const currentClasses = component.getClasses();
        //   classes.forEach((cls) => {
        //     if (!currentClasses.includes(cls)) {
        //       component.addClass(cls);
        //     }
        //   });
        // }

        // Trigger re-render
        if (component.view) {
          component.view.render();
        }

        // Trigger change event for undo stack
        component.trigger('change');

        results.success.push({ id, component });
        console.log(`Successfully updated component "${id}"`);

      } catch (error) {
        console.error(`Failed to update component "${id}":`, error);
        results.failed.push({ id, error: error.message });
      }
    });

    // Log summary
    if (results.success.length > 0) {
      console.log(`Updated ${results.success.length} component(s)`);
    }
    if (results.failed.length > 0) {
      console.warn(`Failed to update ${results.failed.length} component(s)`);
    }

    // Trigger canvas refresh
    editor.refresh();

    return results;
  };

  /**
   * Gets the HTML content of a component by ID
   * @param {string} id - Component ID
   * @returns {string|null} - HTML content or null
   */
  const getComponentHtml = (id) => {
    const component = findComponentById(id);
    return component ? component.toHTML() : null;
  };

  return {
    sendMessage,
    findComponentById,
    applyModifications,
    getComponentHtml
  };
};
