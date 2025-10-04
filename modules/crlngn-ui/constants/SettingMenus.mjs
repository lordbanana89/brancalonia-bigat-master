import { ModuleSettings } from '../components/settings-dialogs/ModuleSettings.mjs';
// import * as lang from '../lang/en.json' assert { type: "json" };

// Opens Patreon URL when instantiated
class PatreonSupport extends FormApplication {
  constructor(object = {}, options = {}) {
    super(object, options);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'crlngn-patreon-support',
      title: game.i18n.localize('CRLNGN_UI.settings.supportPatreon.title'),
      template: 'modules/crlngn-ui/templates/patreon-support.hbs',
      width: 480,
      height: 'auto',
      classes: ['crlngn-ui', 'crlngn-patreon-modal'],
      submitOnChange: false,
      closeOnSubmit: true,
      resizable: false
    });
  }

  async getData() {
    return {
      patreonUrl: 'https://www.patreon.com/c/carolingiandev/membership'
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('[data-action="open-patreon"]').on('click', (event) => {
      event.preventDefault();
      window.open('https://www.patreon.com/c/carolingiandev/membership', '_blank', 'noopener');
      this.close();
    });
  }

  async _updateObject(event, formData) {
    return;
  }
}

export function getSettingMenus() {
  return {
    moduleSettingsMenu: {
      tab: '',
      tag: game.i18n.localize('CRLNGN_UI.settings.moduleSettingsMenu.label'),
      name: game.i18n.localize('CRLNGN_UI.settings.moduleSettingsMenu.title'),
      label: game.i18n.localize('CRLNGN_UI.settings.moduleSettingsMenu.title'),
      hint: game.i18n.localize('CRLNGN_UI.settings.moduleSettingsMenu.hint'),
      icon: 'fas fa-sliders-h',
      propType: ModuleSettings,
      restricted: false
    },
    supportPatreon: {
      tab: '',
      tag: game.i18n.localize('CRLNGN_UI.settings.supportPatreon.label'),
      name: game.i18n.localize('CRLNGN_UI.settings.supportPatreon.label'),
      label: game.i18n.localize('CRLNGN_UI.settings.supportPatreon.buttonLabel'),
      hint: game.i18n.localize('CRLNGN_UI.settings.supportPatreon.hint'),
      icon: 'fas fa-heart',
      propType: PatreonSupport,
      restricted: false
    }
  };
}