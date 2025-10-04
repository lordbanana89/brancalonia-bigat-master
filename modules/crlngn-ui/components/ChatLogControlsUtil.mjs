import { ChatUtil } from "./ChatUtil.mjs";

/**
 * Chat Log Controls Utility - Gestisce i controlli della chat log
 */
export class ChatLogControls {
  static fadeOutEnabled = true;
  static fadeOutDelay = 5000; // 5 secondi
  static currentStyle = 'default';

  /**
   * Inizializza i controlli della chat
   */
  static init() {
    // Configura i listener per i messaggi chat
    this.setupChatMessageListeners();
    this.applyCustomStyle(this.currentStyle);
  }

  /**
   * Setup listener per i messaggi chat
   */
  static setupChatMessageListeners() {
    Hooks.on('createChatMessage', (message) => {
      if (this.fadeOutEnabled) {
        // Applica fade out ai messaggi dopo un delay
        setTimeout(() => {
          this.applyFadeOut(message);
        }, this.fadeOutDelay);
      }
    });
  }

  /**
   * Applica fade out a un messaggio
   * @param {ChatMessage} message - Il messaggio da far scomparire
   */
  static applyFadeOut(message) {
    if (!message || !message.id) return;

    // Trova l'elemento HTML del messaggio
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (!messageElement) return;

    // Applica animazione fade out
    messageElement.style.transition = 'opacity 2s ease-out';
    messageElement.style.opacity = '0';

    // Rimuovi completamente dopo l'animazione
    setTimeout(() => {
      if (messageElement && messageElement.parentNode) {
        messageElement.remove();
      }
    }, 2000);
  }

  /**
   * Aggiorna le impostazioni del fade out
   * @param {boolean} enabled - Se il fade out è abilitato
   * @param {number} delay - Delay in millisecondi
   */
  static updateFadeOutSettings(enabled = true, delay = 5000) {
    this.fadeOutEnabled = enabled;
    this.fadeOutDelay = delay;
  }

  /**
   * Forza fade out immediato di tutti i messaggi
   */
  static fadeOutAll() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
      message.style.transition = 'opacity 0.5s ease-out';
      message.style.opacity = '0';
      setTimeout(() => {
        if (message.parentNode) {
          message.remove();
        }
      }, 500);
    });
  }

  /**
   * Nascondi/mostra i controlli della chat log
   * @param {boolean} hide - Se nascondere i controlli
   */
  static applyHide(hide = false) {
    const chatControls = document.querySelector('#chat-controls');
    if (!chatControls) return;

    if (hide) {
      chatControls.style.display = 'none';
      chatControls.classList.add('hidden');
    } else {
      chatControls.style.display = '';
      chatControls.classList.remove('hidden');
    }
  }

  /**
   * Applica il flush della chat (pulizia messaggi)
   * @param {boolean} enabled - Se abilitato
   */
  static applyFlush(enabled = false) {
    if (enabled) {
      // Pulisci i messaggi più vecchi automaticamente
      const maxMessages = 100;
      const messages = document.querySelectorAll('#chat-log .message');
      
      if (messages.length > maxMessages) {
        const messagesToRemove = messages.length - maxMessages;
        for (let i = 0; i < messagesToRemove; i++) {
          messages[i].remove();
        }
      }
    }
  }

  /**
   * Applica stile personalizzato alla chat log
   * @param {string} style - Stile da applicare
   */
  static applyCustomStyle(style = 'default') {
    this.currentStyle = style;

    const chatLog = document.querySelector('#chat-log');
    const controls = document.querySelector('#chat-controls');
    if (!chatLog && !controls) return;

    const styleClassMap = {
      default: 'chat-style-default',
      compact: 'chat-style-compact',
      minimal: 'chat-style-minimal',
      renaissance: 'chat-style-renaissance',
      hidden: 'chat-style-hidden'
    };

    const classList = Object.values(styleClassMap);

    const applyToElement = (element) => {
      if (!element) return;
      element.classList.remove(...classList);
      const appliedClass = styleClassMap[style] ?? styleClassMap.default;
      element.classList.add(appliedClass);
    };

    applyToElement(chatLog);
    applyToElement(controls);

    const resetInlineStyles = (element) => {
      if (!element) return;
      element.style.fontSize = '';
      element.style.lineHeight = '';
      element.style.padding = '';
      element.style.fontFamily = '';
      element.style.backgroundColor = '';
      element.style.borderImage = '';
      element.style.opacity = '';
    };

    const applyInlineStyles = (element) => {
      if (!element) return;
      switch (style) {
        case 'compact':
          element.style.fontSize = '12px';
          element.style.lineHeight = '1.2';
          element.style.padding = '4px 6px';
          break;
        case 'minimal':
          element.style.padding = '5px';
          break;
        case 'renaissance':
          element.style.fontFamily = 'EB Garamond, serif';
          element.style.backgroundColor = '#f5f1e8';
          break;
        case 'hidden':
          element.style.opacity = '0';
          break;
        default:
          // styles già resettati
          break;
      }
    };

    resetInlineStyles(chatLog);
    resetInlineStyles(controls);
    applyInlineStyles(chatLog);
    applyInlineStyles(controls);

    // Mantieni compatibilità con altre personalizzazioni
    ChatUtil.applyCustomStyle?.(style);
  }

  /**
   * Refresh dei controlli
   */
  static refresh() {
    // Aggiorna i controlli UI se necessario
    this.updateFadeOutSettings();
  }
}