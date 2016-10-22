import BaseWidgetSetting = require("jimu/BaseWidgetSetting");
import { applyMixins } from "../Utils";

interface SettingConfig {
  serviceUrl: string;
}

class SettingImpl extends BaseWidgetSetting<SettingConfig> {

  public baseClass: string = "<%= baseClass %>-setting";

  public getConfig(): SettingConfig {
    return {
      serviceUrl: this.textNode.value
    }
  }

  public setConfig(config: SettingConfig): void {
    this.textNode.value = config.serviceUrl;
  }
}

// This allows to emulate multiple inheritance
// applyMixins(class, [inherited classes]);
applyMixins(SettingImpl, []);

export = SettingImpl;
