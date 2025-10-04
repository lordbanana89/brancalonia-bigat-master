/**
 * BRANCALONIA ICON INTERCEPTOR
 * Sistema di intercettazione per trasformare classi Font Awesome in icone reali
 * 
 * @module brancalonia-icon-interceptor
 * @version 9.0.0
 * 
 * Funzionalità:
 * - Intercetta elementi <i> con classi fa-*
 * - Applica codici Unicode Font Awesome corretti
 * - Observer DOM per nuove icone dinamiche
 * - Configurabile tramite game settings
 * - Performance ottimizzate con lazy loading
 * 
 * @author Brancalonia Development Team
 */

import logger from './brancalonia-logger.js';

/**
 * Classe principale per la gestione delle icone Font Awesome
 * Implementa pattern Singleton
 */
class IconInterceptor {
  /**
   * Nome del modulo per logging
   * @type {string}
   */
  static MODULE_NAME = 'Icon Interceptor';

  /**
   * Versione del modulo
   * @type {string}
   */
  static VERSION = '9.0.0';

  /**
   * Istanza singleton
   * @type {IconInterceptor|null}
   * @private
   */
  static _instance = null;

  /**
   * Mappa classi Font Awesome → Unicode
   * Caricata lazy quando necessaria
   * @type {Object|null}
   * @private
   */
  static _iconMap = null;

  /**
   * MutationObserver attivo
   * @type {MutationObserver|null}
   * @private
   */
  static _observer = null;

  /**
   * Intervallo scan periodico
   * @type {number|null}
   * @private
   */
  static _scanInterval = null;

  /**
   * Statistiche performance
   * @type {Object}
   * @private
   */
  static _stats = {
    totalScanned: 0,
    totalFixed: 0,
    totalUnmapped: 0,
    lastScanTime: 0,
    startTime: Date.now()
  };

  /**
   * Flag inizializzazione
   * @type {boolean}
   * @private
   */
  static _initialized = false;

  /**
   * Riferimento all'createElement originale
   * @type {Function|null}
   * @private
   */
  static _originalCreateElement = null;

  /**
   * Inizializza il sistema di intercettazione icone
   * @returns {Promise<void>}
   */
  static async initialize() {
    if (this._initialized) {
      logger.warn(this.MODULE_NAME, 'Già inizializzato, skip');
      return;
    }

    try {
      logger.info(this.MODULE_NAME, `Inizializzazione v${this.VERSION}...`);

      // Registra settings
      this._registerSettings();

      // Verifica se abilitato
      if (!game.settings.get('brancalonia-bigat', 'enableIconInterceptor')) {
        logger.info(this.MODULE_NAME, 'Disabilitato nelle impostazioni, skip');
        return;
      }

      // Carica Font Awesome
      await this._ensureFontAwesomeLoaded();

      // Installa interceptor
      this._installCreateElementInterceptor();

      // Avvia observer
      this._startObserver();

      // Avvia scan periodico
      this._startPeriodicScan();

      // Registra hooks
      this._registerHooks();

      // Scan iniziale
      await this._scanAndFixAll();

      this._initialized = true;
      logger.info(this.MODULE_NAME, '✅ Inizializzato con successo');

      // Esponi API globale
      window.IconInterceptor = this._createPublicAPI();

    } catch (error) {
      logger.error(this.MODULE_NAME, 'Errore durante inizializzazione:', error);
    }
  }

  /**
   * Registra game settings per configurazione
   * @private
   */
  static _registerSettings() {
    game.settings.register('brancalonia-bigat', 'enableIconInterceptor', {
      name: 'Abilita Icon Interceptor',
      hint: 'Attiva il sistema di correzione automatica delle icone Font Awesome',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true,
      onChange: (enabled) => {
        if (enabled && !this._initialized) {
          this.initialize();
        } else if (!enabled && this._initialized) {
          this.shutdown();
        }
      }
    });

    game.settings.register('brancalonia-bigat', 'iconInterceptorPerformanceMode', {
      name: 'Modalità Performance',
      hint: 'Modalità prestazioni: "Alta" (scan più frequenti), "Media" (bilanciato), "Bassa" (risparmio CPU)',
      scope: 'client',
      config: true,
      type: String,
      choices: {
        high: 'Alta - Scan ogni 10s',
        medium: 'Media - Scan ogni 30s (raccomandato)',
        low: 'Bassa - Scan ogni 60s'
      },
      default: 'medium',
      onChange: () => {
        if (this._initialized) {
          this._restartPeriodicScan();
        }
      }
    });

    game.settings.register('brancalonia-bigat', 'iconInterceptorDebug', {
      name: 'Debug Icon Interceptor',
      hint: 'Mostra log dettagliati per debugging (impatta performance)',
      scope: 'client',
      config: true,
      type: Boolean,
      default: false
    });
  }

  /**
   * Carica la mappa Unicode (lazy loading)
   * @returns {Object}
   * @private
   */
  static _loadIconMap() {
    if (this._iconMap) return this._iconMap;

    logger.debug(this.MODULE_NAME, 'Caricamento mappa Unicode...');

    // Mappa COMPLETA di TUTTE le icone Font Awesome
    this._iconMap = {
      // Users & People
      'fa-user': '\uf007',
      'fa-users': '\uf0c0',
      'fa-user-plus': '\uf234',
      'fa-user-minus': '\uf503',
      'fa-user-times': '\uf235',
      'fa-user-xmark': '\uf235',
      'fa-user-check': '\uf4fc',
      'fa-user-friends': '\uf500',
      'fa-user-circle': '\uf2bd',
      'fa-circle-user': '\uf2bd',
      'fa-user-edit': '\uf4ff',
      'fa-user-pen': '\uf4ff',
      'fa-user-gear': '\uf4fe',
      'fa-user-cog': '\uf4fe',
      'fa-user-shield': '\uf505',
      'fa-user-tie': '\uf508',
      'fa-user-tag': '\uf507',
      'fa-user-secret': '\uf21b',
      'fa-user-graduate': '\uf501',
      'fa-user-md': '\uf0f0',
      'fa-user-doctor': '\uf0f0',
      'fa-person': '\uf183',

      // Folders
      'fa-folder': '\uf07b',
      'fa-folder-open': '\uf07c',
      'fa-folder-plus': '\uf65e',
      'fa-folder-minus': '\uf65d',
      'fa-folder-tree': '\uf802',
      'fa-folder-blank': '\uf07b',

      // Files
      'fa-file': '\uf15b',
      'fa-file-alt': '\uf15c',
      'fa-file-lines': '\uf15c',
      'fa-file-plus': '\uf319',
      'fa-file-minus': '\uf318',
      'fa-file-circle-plus': '\ue494',
      'fa-file-circle-minus': '\ue4ed',
      'fa-file-pen': '\uf31c',
      'fa-file-edit': '\uf31c',

      // Plus/Minus/Actions
      'fa-plus': '\uf067',
      'fa-plus-circle': '\uf055',
      'fa-plus-square': '\uf0fe',
      'fa-square-plus': '\uf0fe',
      'fa-circle-plus': '\uf055',
      'fa-minus': '\uf068',
      'fa-minus-circle': '\uf056',
      'fa-minus-square': '\uf146',
      'fa-square-minus': '\uf146',
      'fa-circle-minus': '\uf056',
      'fa-horizontal-rule': '\uf86c',
      'fa-game-board': '\uf867',
      'fa-toolbox': '\uf552',
      'fa-book-open': '\uf518',
      'fa-gamepad': '\uf11b',
      'fa-ghost': '\uf6e2',
      'fa-crown': '\uf521',
      'fa-coins': '\uf51e',
      'fa-scroll': '\uf70e',
      'fa-scroll-old': '\uf70e',
      'fa-skull-crossbones': '\uf714',

      // Settings
      'fa-cog': '\uf013',
      'fa-cogs': '\uf085',
      'fa-gear': '\uf013',
      'fa-gears': '\uf085',
      'fa-sliders': '\uf1de',
      'fa-sliders-h': '\uf1de',
      'fa-wrench': '\uf0ad',
      'fa-tools': '\uf7d9',
      'fa-screwdriver-wrench': '\uf7d9',
      'fa-hammer': '\uf6e3',

      // Modules/Packages
      'fa-cube': '\uf1b2',
      'fa-cubes': '\uf1b3',
      'fa-rectangles-mixed': '\ue323',
      'fa-box': '\uf466',
      'fa-boxes': '\uf468',
      'fa-package': '\uf49e',
      'fa-puzzle-piece': '\uf12e',
      'fa-puzzle': '\uf12e',
      'fa-shapes': '\uf61f',
      'fa-object-group': '\uf247',
      'fa-object-ungroup': '\uf248',
      'fa-layer-group': '\uf5fd',
      'fa-layers': '\uf5fd',
      'fa-user-group-crown': '\ue591',

      // Search
      'fa-search': '\uf002',
      'fa-magnifying-glass': '\uf002',
      'fa-search-plus': '\uf00e',
      'fa-magnifying-glass-plus': '\uf00e',
      'fa-search-minus': '\uf010',
      'fa-magnifying-glass-minus': '\uf010',
      'fa-filter': '\uf0b0',

      // Compress/Expand icons
      'fa-compress': '\uf066',
      'fa-compress-alt': '\uf422',
      'fa-compress-arrows-alt': '\uf78c',
      'fa-expand': '\uf065',
      'fa-expand-alt': '\uf424',
      'fa-expand-arrows-alt': '\uf31e',
      'fa-maximize': '\uf31e',
      'fa-minimize': '\uf78c',

      // Edit/Delete
      'fa-edit': '\uf044',
      'fa-pen': '\uf304',
      'fa-pen-to-square': '\uf044',
      'fa-pencil': '\uf303',
      'fa-pencil-alt': '\uf303',
      'fa-pen-fancy': '\uf5ac',
      'fa-pen-nib': '\uf5ad',
      'fa-trash': '\uf1f8',
      'fa-trash-alt': '\uf2ed',
      'fa-trash-can': '\uf2ed',
      'fa-trash-restore': '\uf829',
      'fa-trash-can-arrow-up': '\uf829',

      // Arrows
      'fa-chevron-up': '\uf077',
      'fa-chevron-down': '\uf078',
      'fa-chevron-left': '\uf053',
      'fa-chevron-right': '\uf054',
      'fa-angle-up': '\uf106',
      'fa-angle-down': '\uf107',
      'fa-angle-left': '\uf104',
      'fa-angle-right': '\uf105',
      'fa-angle-double-up': '\uf102',
      'fa-angle-double-down': '\uf103',
      'fa-angle-double-left': '\uf100',
      'fa-angle-double-right': '\uf101',
      'fa-angles-up': '\uf102',
      'fa-angles-down': '\uf103',
      'fa-angles-left': '\uf100',
      'fa-angles-right': '\uf101',
      'fa-arrow-up': '\uf062',
      'fa-arrow-down': '\uf063',
      'fa-arrow-left': '\uf060',
      'fa-arrow-right': '\uf061',
      'fa-arrow-down-short-wide': '\uf884',
      'fa-arrow-down-a-z': '\uf15d',
      'fa-arrow-rotate-left': '\uf0e2',
      'fa-arrow-rotate-right': '\uf01e',
      'fa-arrows-rotate': '\uf021',
      'fa-caret-up': '\uf0d8',
      'fa-caret-down': '\uf0d7',
      'fa-caret-left': '\uf0d9',
      'fa-caret-right': '\uf0da',

      // Common UI
      'fa-times': '\uf00d',
      'fa-xmark': '\uf00d',
      'fa-close': '\uf00d',
      'fa-check': '\uf00c',
      'fa-check-circle': '\uf058',
      'fa-circle-check': '\uf058',
      'fa-check-square': '\uf14a',
      'fa-square-check': '\uf14a',
      'fa-times-circle': '\uf057',
      'fa-circle-xmark': '\uf057',
      'fa-xmark-circle': '\uf057',
      'fa-exclamation': '\uf12a',
      'fa-exclamation-circle': '\uf06a',
      'fa-circle-exclamation': '\uf06a',
      'fa-exclamation-triangle': '\uf071',
      'fa-triangle-exclamation': '\uf071',
      'fa-info': '\uf129',
      'fa-info-circle': '\uf05a',
      'fa-circle-info': '\uf05a',
      'fa-question': '\uf128',
      'fa-question-circle': '\uf059',
      'fa-circle-question': '\uf059',
      'fa-ban': '\uf05e',
      'fa-cancel': '\uf05e',
      'fa-lightbulb': '\uf0eb',
      'fa-lightbulb-on': '\uf0eb',
      'fa-lightbulb-exclamation': '\uf671',
      'fa-lightbulb-exclamation-on': '\uf671',

      // Bars & Lists
      'fa-bars': '\uf0c9',
      'fa-navicon': '\uf0c9',
      'fa-list': '\uf03a',
      'fa-list-ul': '\uf0ca',
      'fa-list-dots': '\uf0ca',
      'fa-list-ol': '\uf0cb',
      'fa-list-numeric': '\uf0cb',
      'fa-list-check': '\uf0ae',
      'fa-tasks': '\uf0ae',
      'fa-th': '\uf00a',
      'fa-th-list': '\uf00b',
      'fa-th-large': '\uf009',
      'fa-grip': '\uf58d',
      'fa-grip-horizontal': '\uf58d',
      'fa-grip-vertical': '\uf58e',
      'fa-grip-lines': '\uf7a4',
      'fa-grip-lines-vertical': '\uf7a5',
      'fa-ellipsis': '\uf141',
      'fa-ellipsis-h': '\uf141',
      'fa-ellipsis-horizontal': '\uf141',
      'fa-ellipsis-v': '\uf142',
      'fa-ellipsis-vertical': '\uf142',

      // Gaming
      'fa-dice': '\uf522',
      'fa-dice-d20': '\uf6cf',
      'fa-dice-d6': '\uf6d1',
      'fa-cards': '\uf0e6',
      'fa-playing-card': '\uf2de',
      'fa-dice-one': '\uf525',
      'fa-dice-two': '\uf528',
      'fa-dice-three': '\uf527',
      'fa-dice-four': '\uf524',
      'fa-dice-five': '\uf523',
      'fa-dice-six': '\uf526',
      'fa-dragon': '\uf6d5',
      'fa-dungeon': '\uf6d9',
      'fa-skull': '\uf54c',
      'fa-gamepad-modern': '\ue5a2',
      'fa-chess': '\uf439',
      'fa-chess-board': '\uf43c',
      'fa-chess-king': '\uf43f',
      'fa-chess-queen': '\uf445',
      'fa-chess-rook': '\uf447',
      'fa-chess-bishop': '\uf43a',
      'fa-chess-knight': '\uf441',
      'fa-chess-pawn': '\uf443',

      // Books & Documents
      'fa-book': '\uf02d',
      'fa-book-reader': '\uf5da',
      'fa-book-open-reader': '\uf5da',
      'fa-book-atlas': '\uf558',
      'fa-code': '\uf121',
      'fa-book-medical': '\uf7e6',
      'fa-book-dead': '\uf6b7',
      'fa-book-skull': '\uf6b7',
      'fa-bookmark': '\uf02e',
      'fa-atlas': '\uf558',
      'fa-journal-whills': '\uf66a',
      'fa-newspaper': '\uf1ea',

      // Maps
      'fa-map': '\uf279',
      'fa-map-marked': '\uf59f',
      'fa-map-marked-alt': '\uf5a0',
      'fa-map-marker': '\uf041',
      'fa-map-marker-alt': '\uf3c5',
      'fa-map-pin': '\uf276',
      'fa-map-location': '\uf5a0',
      'fa-map-location-dot': '\uf5a0',
      'fa-location-dot': '\uf3c5',
      'fa-location-pin': '\uf041',
      'fa-compass': '\uf14e',
      'fa-globe': '\uf0ac',
      'fa-earth-americas': '\uf57d',

      // Communication
      'fa-comments': '\uf086',
      'fa-comment': '\uf075',
      'fa-comment-alt': '\uf27a',
      'fa-comment-dots': '\uf4ad',
      'fa-message': '\uf27a',
      'fa-messages': '\uf4b6',
      'fa-envelope': '\uf0e0',
      'fa-envelope-open': '\uf2b6',
      'fa-paper-plane': '\uf1d8',
      'fa-bell': '\uf0f3',
      'fa-bell-slash': '\uf1f6',

      // Media
      'fa-image': '\uf03e',
      'fa-images': '\uf302',
      'fa-image-portrait': '\uf3e0',
      'fa-photo': '\uf03e',
      'fa-camera': '\uf030',
      'fa-camera-retro': '\uf083',
      'fa-video': '\uf03d',
      'fa-film': '\uf008',
      'fa-music': '\uf001',
      'fa-volume-up': '\uf028',
      'fa-volume-high': '\uf028',
      'fa-volume-down': '\uf027',
      'fa-volume-low': '\uf027',
      'fa-volume-off': '\uf026',
      'fa-volume-mute': '\uf6a9',
      'fa-volume-xmark': '\uf6a9',
      'fa-microphone': '\uf130',
      'fa-microphone-slash': '\uf131',
      'fa-text-slash': '\uf87d',
      'fa-speaker': '\uf8df',
      'fa-speakers': '\uf8e0',
      'fa-headphones': '\uf025',
      'fa-headphones-alt': '\uf58f',
      'fa-headphones-simple': '\uf58f',
      'fa-radio': '\uf8d7',
      'fa-podcast': '\uf2ce',
      'fa-play': '\uf04b',
      'fa-pause': '\uf04c',
      'fa-stop': '\uf04d',
      'fa-forward': '\uf04e',
      'fa-backward': '\uf04a',
      'fa-fast-forward': '\uf050',
      'fa-fast-backward': '\uf049',
      'fa-step-forward': '\uf051',
      'fa-step-backward': '\uf048',

      // Visibility
      'fa-eye': '\uf06e',
      'fa-eye-slash': '\uf070',
      'fa-eye-dropper': '\uf1fb',
      'fa-low-vision': '\uf2a8',
      'fa-mask': '\uf6fa',

      // Security
      'fa-lock': '\uf023',
      'fa-unlock': '\uf09c',
      'fa-unlock-alt': '\uf13e',
      'fa-unlock-keyhole': '\uf13e',
      'fa-lock-open': '\uf3c1',
      'fa-key': '\uf084',
      'fa-sign-out': '\uf08b',
      'fa-sign-out-alt': '\uf2f5',
      'fa-arrow-right-from-bracket': '\uf08b',
      'fa-right-from-bracket': '\uf2f5',
      'fa-shield': '\uf132',
      'fa-shield-alt': '\uf3ed',
      'fa-shield-halved': '\uf3ed',
      'fa-shield-virus': '\ue06c',
      'fa-shield-check': '\uf2f7',
      'fa-shield-heart': '\ue574',
      'fa-balance-scale': '\uf24e',
      'fa-scale-balanced': '\uf24e',

      // Common Actions
      'fa-home': '\uf015',
      'fa-house': '\uf015',
      'fa-download': '\uf019',
      'fa-upload': '\uf093',
      'fa-save': '\uf0c7',
      'fa-floppy-disk': '\uf0c7',
      'fa-sync': '\uf021',
      'fa-sync-alt': '\uf2f1',
      'fa-refresh': '\uf021',
      'fa-rotate': '\uf2f1',
      'fa-rotate-right': '\uf2f9',
      'fa-rotate-left': '\uf2ea',
      'fa-redo': '\uf01e',
      'fa-redo-alt': '\uf2f9',
      'fa-undo': '\uf0e2',
      'fa-undo-alt': '\uf2ea',
      'fa-copy': '\uf0c5',
      'fa-clone': '\uf24d',
      'fa-paste': '\uf0ea',
      'fa-clipboard': '\uf328',
      'fa-cut': '\uf0c4',
      'fa-scissors': '\uf0c4',

      // Links & Share
      'fa-link': '\uf0c1',
      'fa-unlink': '\uf127',
      'fa-chain': '\uf0c1',
      'fa-chain-broken': '\uf127',
      'fa-chain-slash': '\uf127',
      'fa-share': '\uf064',
      'fa-share-alt': '\uf1e0',
      'fa-share-nodes': '\uf1e0',
      'fa-share-square': '\uf14d',
      'fa-external-link': '\uf08e',
      'fa-external-link-alt': '\uf35d',
      'fa-external-link-square': '\uf360',
      'fa-up-right-from-square': '\uf35d',
      'fa-arrow-up-right-from-square': '\uf08e',

      // Combat & Items
      'fa-sword': '\uf71c',
      'fa-swords': '\uf71d',
      'fa-shield-sword': '\ue4d5',
      'fa-hand-fist': '\uf6de',
      'fa-fist-raised': '\uf6de',
      'fa-hand': '\uf256',
      'fa-hand-paper': '\uf256',
      'fa-hand-rock': '\uf255',
      'fa-hand-scissors': '\uf257',
      'fa-hand-spock': '\uf259',
      'fa-hand-pointer': '\uf25a',
      'fa-hand-peace': '\uf25b',
      'fa-handshake': '\uf2b5',
      'fa-handshake-angle': '\uf4c4',
      'fa-handshake-simple': '\uf4c6',
      'fa-hands': '\uf2a7',
      'fa-hands-helping': '\uf4c4',
      'fa-hands-clapping': '\ue1a8',
      'fa-heart': '\uf004',
      'fa-heart-broken': '\uf7a9',
      'fa-heart-crack': '\uf7a9',
      'fa-heartbeat': '\uf21e',
      'fa-heart-pulse': '\uf21e',
      'fa-trophy': '\uf091',
      'fa-medal': '\uf5a2',
      'fa-award': '\uf559',
      'fa-star': '\uf005',
      'fa-star-half': '\uf089',
      'fa-star-half-alt': '\uf5c0',
      'fa-star-half-stroke': '\uf5c0',
      'fa-gem': '\uf3a5',
      'fa-ring': '\uf70b',
      'fa-sack-dollar': '\uf81d',
      'fa-money-bag': '\uf81d',
      'fa-suitcase': '\uf0f2',
      'fa-briefcase': '\uf0b1',
      'fa-suitcase-medical': '\uf0fa',
      'fa-suitcase-rolling': '\uf5c1',

      // Tables & Data
      'fa-table': '\uf0ce',
      'fa-table-cells': '\uf00a',
      'fa-table-list': '\uf00b',
      'fa-table-columns': '\uf0db',
      'fa-database': '\uf1c0',
      'fa-server': '\uf233',
      'fa-hard-drive': '\uf0a0',
      'fa-hdd': '\uf0a0',
      'fa-memory': '\uf538',
      'fa-microchip': '\uf2db',
      'fa-sim-card': '\uf7c4',

      // System & Tech
      'fa-wifi': '\uf1eb',
      'fa-signal': '\uf012',
      'fa-plug': '\uf1e6',
      'fa-power-off': '\uf011',
      'fa-battery-full': '\uf240',
      'fa-battery-three-quarters': '\uf241',
      'fa-battery-half': '\uf242',
      'fa-battery-quarter': '\uf243',
      'fa-battery-empty': '\uf244',
      'fa-desktop': '\uf390',
      'fa-laptop': '\uf109',
      'fa-tablet': '\uf3fb',
      'fa-mobile': '\uf3ce',
      'fa-mobile-alt': '\uf3cd',
      'fa-mobile-screen': '\uf3cf',
      'fa-tv': '\uf26c',
      'fa-computer': '\ue4e5',

      // Magic & Fantasy
      'fa-hat-wizard': '\uf6e8',
      'fa-magic': '\uf0d0',
      'fa-wand-magic': '\uf0d0',
      'fa-wand-magic-sparkles': '\ue2ca',
      'fa-wand-sparkles': '\uf72b',
      'fa-hand-sparkles': '\ue05d',
      'fa-sparkles': '\uf890',
      'fa-fire': '\uf06d',
      'fa-fire-alt': '\uf7e4',
      'fa-fire-flame-curved': '\uf7e4',
      'fa-fire-flame-simple': '\uf46a',
      'fa-bolt': '\uf0e7',
      'fa-bolt-lightning': '\ue0b7',
      'fa-thunder': '\uf0e7',
      'fa-snowflake': '\uf2dc',
      'fa-sun': '\uf185',
      'fa-moon': '\uf186',
      'fa-cloud': '\uf0c2',
      'fa-cloud-sun': '\uf6c4',
      'fa-cloud-moon': '\uf6c3',
      'fa-cloud-rain': '\uf73d',
      'fa-cloud-showers-heavy': '\uf740',
      'fa-cloud-bolt': '\uf76c',
      'fa-wind': '\uf72e',
      'fa-water': '\uf773',
      'fa-temperature-high': '\uf769',
      'fa-temperature-low': '\uf76b',

      // Misc Common
      'fa-calendar': '\uf133',
      'fa-calendar-alt': '\uf073',
      'fa-calendar-days': '\uf073',
      'fa-calendar-check': '\uf274',
      'fa-calendar-plus': '\uf271',
      'fa-calendar-minus': '\uf272',
      'fa-calendar-times': '\uf273',
      'fa-calendar-xmark': '\uf273',
      'fa-clock': '\uf017',
      'fa-toggle-off': '\uf204',
      'fa-toggle-on': '\uf205',
      'fa-weight-hanging': '\uf5cd',
      'fa-feather': '\uf52d',
      'fa-utensils': '\uf2e7',
      'fa-hourglass': '\uf254',
      'fa-hourglass-start': '\uf251',
      'fa-hourglass-half': '\uf252',
      'fa-hourglass-end': '\uf253',
      'fa-stopwatch': '\uf2f2',
      'fa-tag': '\uf02b',
      'fa-tags': '\uf02c',
      'fa-barcode': '\uf02a',
      'fa-qrcode': '\uf029',
      'fa-print': '\uf02f',
      'fa-cart-shopping': '\uf07a',
      'fa-shopping-cart': '\uf07a',
      'fa-basket-shopping': '\uf291',
      'fa-shopping-basket': '\uf291',
      'fa-bag-shopping': '\uf290',
      'fa-shopping-bag': '\uf290',
      'fa-credit-card': '\uf09d',
      'fa-wallet': '\uf555',
      'fa-receipt': '\uf543',
      'fa-dollar-sign': '\uf155',
      'fa-dollar': '\uf155',
      'fa-euro-sign': '\uf153',
      'fa-euro': '\uf153',
      'fa-pound-sign': '\uf154',
      'fa-yen-sign': '\uf157',
      'fa-percent': '\uf295',
      'fa-percentage': '\uf541',
      'fa-chart-line': '\uf201',
      'fa-chart-bar': '\uf080',
      'fa-chart-pie': '\uf200',
      'fa-chart-area': '\uf1fe',
      'fa-chart-column': '\ue0e3',
      'fa-chart-simple': '\ue473',

      // Buildings
      'fa-building': '\uf1ad',
      'fa-building-columns': '\uf19c',
      'fa-block-brick': '\ue3db',
      'fa-block-brick-fire': '\ue3dc',
      'fa-store': '\uf54e',
      'fa-shop': '\uf54f',
      'fa-hotel': '\uf594',
      'fa-hospital': '\uf0f8',
      'fa-school': '\uf549',
      'fa-university': '\uf19c',
      'fa-church': '\uf51d',
      'fa-mosque': '\uf678',
      'fa-synagogue': '\uf69b',
      'fa-landmark': '\uf66f',
      'fa-monument': '\uf5a6',
      'fa-archway': '\uf557',
      'fa-igloo': '\uf7ae',
      'fa-tent': '\ue57d',
      'fa-campground': '\uf6bb',
      'fa-warehouse': '\uf494',
      'fa-factory': '\uf275',
      'fa-door-closed': '\uf52a',
      'fa-door-open': '\uf52b',
      'fa-window-close': '\uf410',
      'fa-window-maximize': '\uf2d0',
      'fa-window-minimize': '\uf2d1',
      'fa-window-restore': '\uf2d2',

      // Transportation
      'fa-car': '\uf1b9',
      'fa-automobile': '\uf1b9',
      'fa-truck': '\uf0d1',
      'fa-bus': '\uf207',
      'fa-train': '\uf238',
      'fa-subway': '\uf239',
      'fa-taxi': '\uf1ba',
      'fa-cab': '\uf1ba',
      'fa-bicycle': '\uf206',
      'fa-motorcycle': '\uf21c',
      'fa-plane': '\uf072',
      'fa-jet': '\uf072',
      'fa-helicopter': '\uf533',
      'fa-ship': '\uf21a',
      'fa-anchor': '\uf13d',
      'fa-rocket': '\uf135',
      'fa-hiking': '\uf6ec',
      'fa-person-hiking': '\uf6ec',
      'fa-walking': '\uf554',
      'fa-person-walking': '\uf554',

      // Nature
      'fa-tree': '\uf1bb',
      'fa-leaf': '\uf06c',
      'fa-seedling': '\uf4d8',
      'fa-plant-wilt': '\ue5aa',
      'fa-mountain': '\uf6fc',
      'fa-mountain-sun': '\ue52f',
      'fa-campfire': '\uf6ba',
      'fa-fish': '\uf578',
      'fa-fish-fins': '\ue4f2',
      'fa-shrimp': '\ue448',
      'fa-bug': '\uf188',
      'fa-spider': '\uf717',
      'fa-mosquito': '\ue52b',
      'fa-bacteria': '\ue059',
      'fa-virus': '\ue074',
      'fa-disease': '\uf7fa',
      'fa-biohazard': '\uf780',
      'fa-radiation': '\uf7b9',
      'fa-atom': '\uf5d2',
      'fa-dna': '\uf471'
    };

    logger.debug(this.MODULE_NAME, `Mappa caricata: ${Object.keys(this._iconMap).length} icone`);
    return this._iconMap;
  }

  /**
   * Installa interceptor su createElement
   * @private
   */
  static _installCreateElementInterceptor() {
    if (this._originalCreateElement) {
      logger.debug(this.MODULE_NAME, 'Interceptor già installato, skip');
      return;
    }

    logger.debug(this.MODULE_NAME, 'Installazione interceptor createElement...');

    // Salva il createElement originale
    this._originalCreateElement = document.createElement;

    // Override createElement
    const self = this;
    document.createElement = function (tagName) {
      const element = self._originalCreateElement.call(this, tagName);

      if (tagName.toLowerCase() === 'i') {
        // Intercetta setAttribute per catturare le classi
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function (name, value) {
          originalSetAttribute.call(this, name, value);

          if (name === 'class' && value.includes('fa-')) {
            setTimeout(() => self._interceptIcon(this), 0);
          }
        };

        // Intercetta className setter
        Object.defineProperty(element, 'className', {
          set(value) {
            this.setAttribute('class', value);
          },
          get() {
            return this.getAttribute('class') || '';
          }
        });

        // Intercetta classList
        const originalAdd = element.classList.add;
        element.classList.add = function (...classes) {
          originalAdd.apply(this, classes);
          if (classes.some(cls => cls.includes('fa-'))) {
            setTimeout(() => self._interceptIcon(element), 0);
          }
        };
      }

      return element;
    };

    logger.debug(this.MODULE_NAME, '✅ Interceptor installato');
  }

  /**
   * Avvia MutationObserver per monitorare DOM
   * @private
   */
  static _startObserver() {
    if (this._observer) {
      logger.debug(this.MODULE_NAME, 'Observer già attivo, skip');
      return;
    }

    logger.debug(this.MODULE_NAME, 'Avvio MutationObserver...');

    const self = this;
    this._observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        // Controlla nodi aggiunti
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.tagName === 'I' && node.className && node.className.includes('fa-')) {
              self._interceptIcon(node);
            }
            // Cerca icone nei figli
            const icons = node.querySelectorAll?.('i[class*="fa-"]');
            if (icons) {
              icons.forEach(icon => self._interceptIcon(icon));
            }
          }
        });

        // Controlla modifiche agli attributi
        if (mutation.type === 'attributes' && mutation.target.tagName === 'I') {
          self._interceptIcon(mutation.target);
        }
      });
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    logger.debug(this.MODULE_NAME, '✅ Observer attivo');
  }

  /**
   * Avvia scan periodico basato su performance mode
   * @private
   */
  static _startPeriodicScan() {
    if (this._scanInterval) {
      logger.debug(this.MODULE_NAME, 'Scan periodico già attivo, skip');
      return;
    }

    const mode = game.settings.get('brancalonia-bigat', 'iconInterceptorPerformanceMode');
    const intervals = {
      high: 10000,   // 10s
      medium: 30000, // 30s
      low: 60000     // 60s
    };

    const interval = intervals[mode] || intervals.medium;
    logger.debug(this.MODULE_NAME, `Avvio scan periodico: ${interval / 1000}s`);

    this._scanInterval = setInterval(() => {
      this._scanAndFixAll();
    }, interval);
  }

  /**
   * Riavvia scan periodico (dopo cambio settings)
   * @private
   */
  static _restartPeriodicScan() {
    if (this._scanInterval) {
      clearInterval(this._scanInterval);
      this._scanInterval = null;
    }
    this._startPeriodicScan();
  }

  /**
   * Registra hooks Foundry
   * @private
   */
  static _registerHooks() {
    const self = this;

    // Scan dopo render comune UI
    ['renderSidebarTab', 'renderActorSheet', 'renderApplication'].forEach(hookName => {
      Hooks.on(hookName, () => {
        setTimeout(() => self._scanAndFixAll(), 100);
      });
    });

    // Scan dopo render scene controls
    Hooks.on('renderSceneControls', () => {
      setTimeout(() => self._scanAndFixAll(), 50);
    });

    logger.debug(this.MODULE_NAME, 'Hooks registrati');
  }

  /**
   * Assicura che Font Awesome sia caricato
   * @returns {Promise<void>}
   * @private
   */
  static async _ensureFontAwesomeLoaded() {
    const faStyleId = 'fa-cdn-style';

    if (document.getElementById(faStyleId)) {
      logger.debug(this.MODULE_NAME, 'Font Awesome già caricato');
      return;
    }

    logger.debug(this.MODULE_NAME, 'Caricamento Font Awesome CDN...');

    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.id = faStyleId;
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';

      link.onload = () => {
        logger.debug(this.MODULE_NAME, '✅ Font Awesome caricato da CDN');
        resolve();
      };

      link.onerror = () => {
        logger.warn(this.MODULE_NAME, 'CDN fallito, carico font locali...');
        this._injectLocalFontAwesomeStyles();
        resolve();
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Inietta stili Font Awesome locali (fallback)
   * @private
   */
  static _injectLocalFontAwesomeStyles() {
    const existing = document.getElementById('brancalonia-fontawesome-local');
    if (existing) return;

    const style = document.createElement('style');
    style.id = 'brancalonia-fontawesome-local';
    style.textContent = `
      @font-face {
        font-family: "Font Awesome 6 Free";
        font-style: normal;
        font-weight: 900;
        font-display: block;
        src: url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.woff2") format("woff2"),
             url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-solid-900.ttf") format("truetype");
      }

      @font-face {
        font-family: "Font Awesome 6 Free";
        font-style: normal;
        font-weight: 400;
        font-display: block;
        src: url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-regular-400.woff2") format("woff2"),
             url("modules/brancalonia-bigat/assets/fonts/fontawesome/webfonts/fa-regular-400.ttf") format("truetype");
      }

      i[class*="fa-"] {
        font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important;
        font-style: normal !important;
        font-weight: 900 !important;
        display: inline-block !important;
        line-height: 1 !important;
        -webkit-font-smoothing: antialiased !important;
      }

      i[class*="fa-"]::before {
        font-size: 1.25rem !important;
        line-height: 1 !important;
      }
    `;
    document.head.appendChild(style);

    logger.debug(this.MODULE_NAME, '✅ Stili locali iniettati');
  }

  /**
   * Intercetta e corregge una singola icona
   * @param {HTMLElement} icon - Elemento <i> da correggere
   * @private
   */
  static _interceptIcon(icon) {
    if (!icon || icon.hasAttribute('data-intercepted')) return;

    const classes = Array.from(icon.classList);

    // Classi di stile da ignorare
    const styleClasses = [
      'fa-duotone', 'fa-solid', 'fa-regular', 'fa-light', 'fa-thin', 'fa-brands',
      'fas', 'far', 'fal', 'fat', 'fab', 'fad',
      'fa-fw', 'fa-ul', 'fa-li', 'fa-spin', 'fa-pulse', 'fa-border',
      'fa-pull-left', 'fa-pull-right', 'fa-stack', 'fa-inverse',
      'fa-flip-horizontal', 'fa-flip-vertical',
      'fa-rotate-90', 'fa-rotate-180', 'fa-rotate-270', 'fa-flip-both'
    ];

    const faClasses = classes.filter(cls => cls.startsWith('fa-') && !styleClasses.includes(cls));

    if (faClasses.length === 0) return;

    // Marca come intercettato
    icon.setAttribute('data-intercepted', 'true');

    // Carica mappa se necessario
    const iconMap = this._loadIconMap();

    // Cerca il codice unicode
    let unicode = null;
    let matchedClass = null;

    for (const cls of faClasses) {
      if (iconMap[cls]) {
        unicode = iconMap[cls];
        matchedClass = cls;
        break;
      }
    }

    if (unicode) {
      // Applica fix inline
      const style = `
        font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome", sans-serif !important;
        font-weight: 900 !important;
        font-style: normal !important;
        font-variant: normal !important;
        text-rendering: auto !important;
        -webkit-font-smoothing: antialiased !important;
        display: inline-block !important;
      `;

      icon.style.cssText = style;

      // Inietta pseudo-element style
      if (!document.getElementById(`icon-fix-${matchedClass}`)) {
        const styleEl = document.createElement('style');
        styleEl.id = `icon-fix-${matchedClass}`;
        styleEl.textContent = `
          i.${matchedClass}::before,
          i.fas.${matchedClass}::before,
          i.far.${matchedClass}::before {
            content: "${unicode}" !important;
            font-family: "Font Awesome 6 Free", "FontAwesome" !important;
            font-weight: 900 !important;
          }
        `;
        document.head.appendChild(styleEl);
      }

      // Svuota testo se presente
      if (icon.textContent && icon.textContent.trim()) {
        icon.textContent = '';
      }

      // Attributi debug
      icon.setAttribute('data-unicode', unicode);
      icon.setAttribute('data-icon-fixed', matchedClass);

      // Statistiche
      this._stats.totalFixed++;

      // Log solo in debug mode
      if (game.settings.get('brancalonia-bigat', 'iconInterceptorDebug')) {
        logger.debug(this.MODULE_NAME, `Intercettata: ${matchedClass} → ${unicode}`);
      }

    } else {
      // Non trovata nella mappa
      const allClasses = Array.from(icon.classList);
      const hasStyleOnly = allClasses.every(cls =>
        !cls.startsWith('fa-') ||
        styleClasses.includes(cls)
      );

      if (!hasStyleOnly) {
        this._stats.totalUnmapped++;
        if (game.settings.get('brancalonia-bigat', 'iconInterceptorDebug')) {
          logger.warn(this.MODULE_NAME, `Nessun mapping per: ${faClasses.join(', ')}`);
        }
      }

      // Pulisci comunque il testo
      if (icon.textContent && icon.textContent.trim()) {
        icon.textContent = '';
        icon.style.minWidth = '1em';
        icon.style.display = 'inline-block';
      }
    }
  }

  /**
   * Scansiona e corregge tutte le icone nel DOM
   * @returns {Promise<Object>} Statistiche scan
   * @private
   */
  static async _scanAndFixAll() {
    const startTime = performance.now();

    const allIcons = document.querySelectorAll('i[class*="fa-"]');
    this._stats.totalScanned += allIcons.length;

    allIcons.forEach(icon => {
      // Rimuovi marker per riscansione
      icon.removeAttribute('data-intercepted');
      this._interceptIcon(icon);
    });

    this._stats.lastScanTime = performance.now() - startTime;

    if (game.settings.get('brancalonia-bigat', 'iconInterceptorDebug')) {
      logger.debug(this.MODULE_NAME, `Scan completato: ${allIcons.length} icone in ${this._stats.lastScanTime.toFixed(2)}ms`);
    }

    return {
      scanned: allIcons.length,
      time: this._stats.lastScanTime
    };
  }

  /**
   * Crea API pubblica per debug
   * @returns {Object} API pubblica
   * @private
   */
  static _createPublicAPI() {
    const self = this;

    return {
      /**
       * Scansiona e mostra statistiche
       */
      scan() {
        const all = document.querySelectorAll('i[class*="fa-"]');
        const fixed = document.querySelectorAll('i[data-intercepted]');
        const withText = Array.from(all).filter(i => i.textContent.trim().length > 0);
        const unmapped = [];

        const iconMap = self._loadIconMap();
        all.forEach(icon => {
          const classes = Array.from(icon.classList).filter(cls => cls.startsWith('fa-'));
          classes.forEach(cls => {
            if (!iconMap[cls] && !unmapped.includes(cls)) {
              unmapped.push(cls);
            }
          });
        });

        const stats = {
          total: all.length,
          fixed: fixed.length,
          withText: withText.length,
          unmapped: unmapped.length,
          unmappedClasses: unmapped,
          performance: self._stats
        };

        logger.info(this.MODULE_NAME, `
🎯 ICON INTERCEPTOR STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Statistiche Correnti:
  - Icone totali: ${stats.total}
  - Icone corrette: ${stats.fixed}
  - Con testo: ${stats.withText}
  - Classi non mappate: ${stats.unmapped}

⏱️ Performance:
  - Scansioni totali: ${self._stats.totalScanned}
  - Icone corrette: ${self._stats.totalFixed}
  - Non mappate: ${self._stats.totalUnmapped}
  - Ultimo scan: ${self._stats.lastScanTime.toFixed(2)}ms
  - Uptime: ${((Date.now() - self._stats.startTime) / 1000 / 60).toFixed(1)} minuti
        `);

        if (withText.length > 0) {
          logger.warn(this.MODULE_NAME, '❌ Icone con testo:', withText);
        }

        if (unmapped.length > 0) {
          logger.warn(this.MODULE_NAME, '⚠️ Classi non mappate:', unmapped);
        }

        return stats;
      },

      /**
       * Aggiungi mapping custom
       * @param {string} className - Classe CSS
       * @param {string} unicode - Codice Unicode
       */
      fix(className, unicode) {
        const iconMap = self._loadIconMap();
        iconMap[className] = unicode;

        document.querySelectorAll(`i.${className}`).forEach(icon => {
          icon.removeAttribute('data-intercepted');
          self._interceptIcon(icon);
        });

        logger.info(this.MODULE_NAME, `✅ Aggiunto mapping: ${className} → ${unicode}`);
      },

      /**
       * Forza riscansione totale
       */
      forceFixAll() {
        logger.info(this.MODULE_NAME, '🔄 Forzatura riscansione...');
        self._scanAndFixAll().then(result => {
          logger.info(this.MODULE_NAME, `✅ Completato: ${result.scanned} icone in ${result.time.toFixed(2)}ms`);
        });
      },

      /**
       * Mostra statistiche performance
       */
      stats() {
        logger.info(this.MODULE_NAME, '📊 Statistiche correnti:');
        logger.table(self._stats);
        return self._stats;
      },

      /**
       * Reset statistiche
       */
      resetStats() {
        self._stats = {
          totalScanned: 0,
          totalFixed: 0,
          totalUnmapped: 0,
          lastScanTime: 0,
          startTime: Date.now()
        };
        logger.info(this.MODULE_NAME, '✅ Statistiche resettate');
      }
    };
  }

  /**
   * Shutdown del sistema (per disable)
   */
  static shutdown() {
    logger.info(this.MODULE_NAME, 'Shutdown in corso...');

    // Ferma observer
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    // Ferma scan periodico
    if (this._scanInterval) {
      clearInterval(this._scanInterval);
      this._scanInterval = null;
    }

    // Ripristina createElement
    if (this._originalCreateElement) {
      document.createElement = this._originalCreateElement;
      this._originalCreateElement = null;
    }

    this._initialized = false;
    logger.info(this.MODULE_NAME, '✅ Shutdown completato');
  }
}

// Inizializza al ready
Hooks.once('init', () => {
  IconInterceptor.initialize();
});

// Forza fix finale al ready
Hooks.once('ready', () => {
  if (IconInterceptor._initialized && window.IconInterceptor) {
    window.IconInterceptor.forceFixAll();
  }
});

// Esporta per uso esterno
export default IconInterceptor;
