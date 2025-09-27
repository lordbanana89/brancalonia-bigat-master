/* ===================================== */
/* CHAT ENHANCEMENTS */
/* Miglioramenti avanzati per la chat */
/* ===================================== */

import { LogUtil } from '../utils/LogUtil.mjs';
import { GeneralUtil } from '../utils/GeneralUtil.mjs';

export class ChatEnhancements {
  static isInitialized = false;
  static chatObserver = null;

  /**
   * Initialize chat enhancements
   */
  static init() {
    if (this.isInitialized) return;

    LogUtil.log("Initializing Chat Enhancements");

    // Add chat container classes
    const chatLog = document.querySelector('#chat-log');
    if (chatLog) {
      chatLog.classList.add('brancalonia-chat');
    }

    // Setup mutation observer for new messages
    this.setupChatObserver();

    // Apply initial styles
    this.applyInitialStyles();

    this.isInitialized = true;
  }

  /**
   * Setup mutation observer for chat
   */
  static setupChatObserver() {
    const chatLog = document.querySelector('#chat-log');
    if (!chatLog) return;

    this.chatObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.classList?.contains('chat-message')) {
            this.enhanceMessage(node);
          }
        });
      });
    });

    this.chatObserver.observe(chatLog, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Enhance a chat message
   */
  static enhanceMessage(messageElement) {
    // Add player color border
    const message = game.messages.get(messageElement.dataset.messageId);
    if (message) {
      // Use 'author' for v12+ compatibility
      const userId = message.author || message.user;
      const user = game.users.get(userId);
      if (user?.color) {
        messageElement.style.setProperty('--player-color', user.color);
        messageElement.classList.add('player-colored');
      }
    }

    // Enhance roll messages
    if (messageElement.querySelector('.dice-roll')) {
      this.enhanceRollMessage(messageElement);
    }

    // Enhance item cards
    if (messageElement.querySelector('.dnd5e.chat-card')) {
      this.enhanceItemCard(messageElement);
    }

    // Add Brancalonia specific styling
    this.addBrancaloniaStyles(messageElement);
  }

  /**
   * Enhance roll messages
   */
  static enhanceRollMessage(messageElement) {
    const roll = messageElement.querySelector('.dice-roll');
    if (!roll) return;

    // Add roll type class
    const rollType = roll.querySelector('.dice-formula')?.textContent;
    if (rollType) {
      if (rollType.includes('d20')) {
        messageElement.classList.add('roll-d20');
      }
      if (rollType.includes('2d20')) {
        messageElement.classList.add('roll-advantage');
      }
    }

    // Check for critical
    const total = roll.querySelector('.dice-total');
    if (total) {
      const result = parseInt(total.textContent);
      const formula = roll.querySelector('.dice-formula')?.textContent || '';

      if (formula.includes('d20')) {
        if (result >= 20) {
          messageElement.classList.add('roll-critical');
        } else if (result <= 1) {
          messageElement.classList.add('roll-fumble');
        }
      }
    }
  }

  /**
   * Enhance item cards
   */
  static enhanceItemCard(messageElement) {
    const card = messageElement.querySelector('.dnd5e.chat-card');
    if (!card) return;

    // Add item type class
    const itemType = card.dataset.itemType;
    if (itemType) {
      card.classList.add(`item-${itemType}`);
    }

    // Enhance buttons
    const buttons = card.querySelectorAll('button');
    buttons.forEach(button => {
      // Add icons to buttons
      const buttonType = button.dataset.action;
      if (buttonType) {
        const icon = this.getButtonIcon(buttonType);
        if (icon && !button.querySelector('i')) {
          button.insertAdjacentHTML('afterbegin', `<i class="${icon}"></i> `);
        }
      }
    });

    // Add Brancalonia flavor
    this.addBrancaloniaFlavor(card);
  }

  /**
   * Get icon for button type
   */
  static getButtonIcon(action) {
    const icons = {
      'attack': 'fas fa-sword',
      'damage': 'fas fa-burst',
      'healing': 'fas fa-heart',
      'save': 'fas fa-shield-alt',
      'check': 'fas fa-dice-d20',
      'placeTemplate': 'fas fa-ruler-combined'
    };
    return icons[action] || '';
  }

  /**
   * Add Brancalonia specific styles
   */
  static addBrancaloniaStyles(messageElement) {
    // Add pergamena texture class
    messageElement.classList.add('pergamena-texture');

    // Check for Brancalonia keywords
    const content = messageElement.textContent.toLowerCase();
    if (content.includes('infamia')) {
      messageElement.classList.add('infamia-message');
    }
    if (content.includes('baraonda')) {
      messageElement.classList.add('baraonda-message');
    }
    if (content.includes('menagramo')) {
      messageElement.classList.add('menagramo-message');
    }
  }

  /**
   * Add Brancalonia flavor to item cards
   */
  static addBrancaloniaFlavor(card) {
    // Add scadente indicator for poor quality items
    const itemName = card.querySelector('.card-header h3')?.textContent?.toLowerCase() || '';
    if (itemName.includes('scadente') || itemName.includes('malfatto')) {
      card.classList.add('item-scadente');

      // Add warning icon
      const header = card.querySelector('.card-header');
      if (header && !header.querySelector('.scadente-icon')) {
        header.insertAdjacentHTML('beforeend', '<span class="scadente-icon" title="Oggetto Scadente">⚠️</span>');
      }
    }
  }

  /**
   * Apply initial styles
   */
  static applyInitialStyles() {
    // Add CSS for chat enhancements
    const css = `
      .brancalonia-chat .chat-message {
        position: relative;
        border-left: 3px solid transparent;
        transition: all 0.3s ease;
      }

      .brancalonia-chat .chat-message.player-colored {
        border-left-color: var(--player-color);
      }

      .brancalonia-chat .chat-message:hover {
        transform: translateX(2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .brancalonia-chat .roll-critical {
        background: linear-gradient(90deg, rgba(201,169,97,0.1) 0%, transparent 100%);
        border-color: #C9A961 !important;
      }

      .brancalonia-chat .roll-fumble {
        background: linear-gradient(90deg, rgba(139,38,53,0.1) 0%, transparent 100%);
        border-color: #8B2635 !important;
      }

      .brancalonia-chat .item-scadente {
        opacity: 0.9;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0,0,0,0.03) 10px,
          rgba(0,0,0,0.03) 20px
        );
      }

      .scadente-icon {
        float: right;
        font-size: 1.2em;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .infamia-message {
        border-left-color: #8B2635 !important;
        border-left-width: 4px !important;
      }

      .baraonda-message {
        border-left-color: #B87333 !important;
        border-left-width: 4px !important;
      }

      .menagramo-message {
        border-left-color: #5A504A !important;
        border-left-width: 4px !important;
      }
    `;

    GeneralUtil.addCustomCSS(css, 'brancalonia-chat-enhancements');
  }

  /**
   * Handle message render hook (v13+ HTMLElement)
   */
  static onRenderMessage(message, html, data) {
    // v13+ passes HTMLElement directly
    const messageElement = html instanceof HTMLElement ? html : html[0];
    if (messageElement) {
      this.enhanceMessage(messageElement);
    }
  }

  /**
   * Cleanup
   */
  static destroy() {
    if (this.chatObserver) {
      this.chatObserver.disconnect();
      this.chatObserver = null;
    }
    this.isInitialized = false;
  }
}