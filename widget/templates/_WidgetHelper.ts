import BaseWidget = require("jimu/BaseWidget");
import { applyMixins } from "libs/widgets/utils";

class WidgetImpl extends BaseWidget {

  public baseClass: string = "<%= baseClass %>";

  private bw: BaseWidget;

  public createWidgetProps(): any {
    let props: any = {
      baseClass: this.baseClass,
      // The remaining functions use lambda expressions so that "this" is the WidgetHelper instance
      // onOpen: () => { this.onOpen(); }
      // onClose: () => { this.onClose(); }
    }
    return props;
  };

  public initialize(widget: BaseWidget) {
    this.bw = widget;
  }

}
// This allows to emulate multiple inheritance
// applyMixins(class, [inherited classes]);
applyMixins(WidgetImpl, []);

export = WidgetImpl;
