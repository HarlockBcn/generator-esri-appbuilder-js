define(["dojo/_base/declare", "jimu/BaseWidget", "./WidgetHelper"], function (declare, BaseWidget, WidgetHelper) {

  var helper = new WidgetHelper();
  var props = helper.createWidgetProps();

  props.startup = function startup() {
    this.inherited(arguments);
    helper.initialize(this);
  };

	return declare([BaseWidget], props);
});
