/* ============================================================================
   TOOLTIP MANAGER
   Universal tooltip system with smart positioning and hover delays
   ============================================================================ */

class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.showTimeout = null;
        this.hideTimeout = null;
        this.currentElement = null;
        
        // Configuration
        this.showDelay = 500; // ms to wait before showing tooltip
        this.hideDelay = 100; // ms to wait before hiding tooltip
        this.offset = 10; // px offset from element
        
        // State
        this.isVisible = false;
        this.registeredElements = new Map();
    }
    
    /**
     * Initialize the tooltip system
     * Creates the tooltip DOM element and sets up global event listeners
     */
    init() {
        this.createTooltipElement();
        this.bindGlobalEvents();
        console.log('✓ TooltipManager initialized');
    }
    
    /**
     * Create the tooltip DOM element and append to body
     */
    createTooltipElement() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tooltip';
        this.tooltip.setAttribute('role', 'tooltip');
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);
    }
    
    /**
     * Bind global events for tooltip visibility management
     */
    bindGlobalEvents() {
        // Hide tooltip on scroll
        window.addEventListener('scroll', () => this.hide(), { passive: true });
        
        // Hide tooltip on window resize
        window.addEventListener('resize', () => this.hide());
        
        // Hide tooltip on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }
    
    /**
     * Register an element to show tooltips
     * @param {HTMLElement} element - The element to add tooltip to
     * @param {string} text - Tooltip text content
     * @param {string} position - Preferred position: 'top', 'bottom', 'left', 'right', 'auto'
     */
    register(element, text, position = 'auto') {
        if (!element || !text) return;
        
        // Store tooltip data
        this.registeredElements.set(element, { text, position });
        
        // Add event listeners
        element.addEventListener('mouseenter', (e) => this.onMouseEnter(e, element));
        element.addEventListener('mouseleave', () => this.onMouseLeave());
        element.addEventListener('focus', (e) => this.onMouseEnter(e, element));
        element.addEventListener('blur', () => this.onMouseLeave());
        
        // Mark element as having tooltip
        element.setAttribute('data-has-tooltip', 'true');
    }
    
    /**
     * Register multiple elements at once
     * @param {Object} tooltips - Object with selector: text pairs
     */
    registerAll(tooltips) {
        let registered = 0;
        for (const [selector, config] of Object.entries(tooltips)) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const text = typeof config === 'string' ? config : config.text;
                const position = typeof config === 'object' ? config.position : 'auto';
                this.register(element, text, position);
                registered++;
            });
        }
        console.log(`✓ Registered ${registered} tooltips`);
        return registered;
    }
    
    /**
     * Handle mouse enter event
     */
    onMouseEnter(event, element) {
        // Clear any pending hide timeout
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        
        // If already showing for this element, don't restart timer
        if (this.currentElement === element && this.isVisible) {
            return;
        }
        
        // Clear any pending show timeout
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
        }
        
        // Set timeout to show tooltip
        this.showTimeout = setTimeout(() => {
            this.show(element);
        }, this.showDelay);
    }
    
    /**
     * Handle mouse leave event
     */
    onMouseLeave() {
        // Clear show timeout if tooltip hasn't appeared yet
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }
        
        // Set timeout to hide tooltip (allows moving to tooltip itself)
        if (this.isVisible) {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, this.hideDelay);
        }
    }
    
    /**
     * Show tooltip for element
     * @param {HTMLElement} element - Element to show tooltip for
     */
    show(element) {
        const data = this.registeredElements.get(element);
        if (!data) return;
        
        this.currentElement = element;
        
        // Set tooltip content
        this.tooltip.textContent = data.text;
        
        // Make visible to calculate dimensions
        this.tooltip.style.display = 'block';
        this.tooltip.style.opacity = '0';
        
        // Calculate and set position
        this.position(element, data.position);
        
        // Fade in
        requestAnimationFrame(() => {
            this.tooltip.style.opacity = '1';
        });
        
        this.isVisible = true;
    }
    
    /**
     * Hide the tooltip
     */
    hide() {
        if (!this.isVisible) return;
        
        this.tooltip.style.opacity = '0';
        
        setTimeout(() => {
            this.tooltip.style.display = 'none';
            this.isVisible = false;
            this.currentElement = null;
        }, 150); // Match CSS transition duration
    }
    
    /**
     * Calculate and apply tooltip position
     * @param {HTMLElement} element - Target element
     * @param {string} preferredPosition - Preferred position ('top', 'bottom', 'left', 'right', 'auto')
     */
    position(element, preferredPosition = 'auto') {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        // Calculate available space in each direction
        const space = {
            top: elementRect.top,
            bottom: window.innerHeight - elementRect.bottom,
            left: elementRect.left,
            right: window.innerWidth - elementRect.right
        };
        
        // Determine best position
        let position = preferredPosition;
        if (position === 'auto') {
            // Choose position with most space
            if (space.top >= tooltipRect.height + this.offset) {
                position = 'top';
            } else if (space.bottom >= tooltipRect.height + this.offset) {
                position = 'bottom';
            } else if (space.right >= tooltipRect.width + this.offset) {
                position = 'right';
            } else {
                position = 'left';
            }
        }
        
        // Calculate coordinates based on position
        let top, left;
        
        switch (position) {
            case 'top':
                top = elementRect.top - tooltipRect.height - this.offset;
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                this.tooltip.classList.add('tooltip-top');
                this.tooltip.classList.remove('tooltip-bottom', 'tooltip-left', 'tooltip-right');
                break;
                
            case 'bottom':
                top = elementRect.bottom + this.offset;
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                this.tooltip.classList.add('tooltip-bottom');
                this.tooltip.classList.remove('tooltip-top', 'tooltip-left', 'tooltip-right');
                break;
                
            case 'left':
                top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                left = elementRect.left - tooltipRect.width - this.offset;
                this.tooltip.classList.add('tooltip-left');
                this.tooltip.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-right');
                break;
                
            case 'right':
                top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                left = elementRect.right + this.offset;
                this.tooltip.classList.add('tooltip-right');
                this.tooltip.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-left');
                break;
        }
        
        // Keep tooltip within viewport bounds
        const padding = 8;
        top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
        
        // Apply position
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }
    
    /**
     * Update tooltip text for an element
     * @param {HTMLElement} element - Element to update
     * @param {string} newText - New tooltip text
     */
    updateText(element, newText) {
        const data = this.registeredElements.get(element);
        if (data) {
            data.text = newText;
            if (this.currentElement === element && this.isVisible) {
                this.tooltip.textContent = newText;
                this.position(element, data.position);
            }
        }
    }
    
    /**
     * Remove tooltip from element
     * @param {HTMLElement} element - Element to remove tooltip from
     */
    unregister(element) {
        if (this.currentElement === element) {
            this.hide();
        }
        this.registeredElements.delete(element);
        element.removeAttribute('data-has-tooltip');
    }
    
    /**
     * Get statistics about registered tooltips
     */
    getStats() {
        return {
            total: this.registeredElements.size,
            visible: this.isVisible,
            currentElement: this.currentElement?.id || this.currentElement?.className || 'none'
        };
    }
    
    /**
     * Destroy the tooltip system
     */
    destroy() {
        this.hide();
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
        this.registeredElements.clear();
        console.log('✓ TooltipManager destroyed');
    }
}
