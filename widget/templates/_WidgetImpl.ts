import BaseWidget = require("jimu/BaseWidget");
import Map = require("esri/map");
import { applyMixins } from "./Utils";

class WidgetImpl extends BaseWidget {

  public baseClass: string = "<%= baseClass %>";

}
// This allows to emulate multiple inheritance
// applyMixins(class, [inherited classes]);
applyMixins(WidgetImpl, []);

export = WidgetImpl;
