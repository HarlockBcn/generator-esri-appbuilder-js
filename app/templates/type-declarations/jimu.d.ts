///<reference path="./dijit/1.11/modules.d.ts" />
// Simple declaration for BaseWidget base class
declare module "jimu/BaseWidget"
{
	class BaseWidget
	{
    constructor ();
		// should always be 'widget'
		type: string;

		/**** Properties that  can be configured (be overrided) in app's config.json ****/

		//    the unique id of the widget: if not set in the config file,
		//    ConfigManager will generate one
		id: string;

		//    the display name of the widget
		label: string;

		//    the uri of the icon: use images/icon.png if not set
		icon: string;

		//    used in the config.json to locate where the widget is
		uri: string;

		/*======
		{
		  //left: int
		  //top: int
		  //right: int
		  //bottom: int
		  //width: int
		  //height: int
		}
		======*/
		//    preload widget should config position property if it's not in group.
		//    the meaning of the property is the same as of the CSS
		position: any;

		//    config info in config.json, url or json object
		//    if url is configured in the config.json, json file is parsed and stored in this property
		config: any;

		openAtStart: boolean;

		/**** Properties set by the framework ****/

		//    can be esri/Map or esri3d/Map
		map: any;

		//    the app's config.json
		appConfig: any;

		//    the folder url of the widget
		folderUrl: string;

		//    the current state of the widget, the available states are:
		//    opened, closed, active
		state: string;

		//    the available states are normal, minimized, maximized
		windowState: string;

		//    whether the widget has started
		started: boolean;

		//    the name is used to identify the widget. The name is the same as the widget folder name
		name: string;

		/**** Properties set by the developer ****/

		// **** REQUIRED ****
		//    HTML CSS class name: will be of the form 'jimu-widget-widgetname'
		baseClass: string;

		//    widget UI part: the content of the file Widget.html will be set to this property
		templateString: string;

		moveTopOnActive: boolean;

		// Widget communication

		/**** Methods for communication to app container ****/

		//    this function will be called when widget is opened everytime.
		//    state will be changed to "opened".
		//    this function will be called in two cases:
		//      1. after widget's startup
		//      2. if widget is re-opened after having been closed
		onOpen(): void;

		//    this function will be called when widget is closed.
		//    state has been changed to "closed".
		onClose(): void;

		//    this function will be called when widget window is normalized.
		//    windowState has been changed to "normal".
		onNormalize(): void;

		//    this function will be called when widget window is minimized.
		//    windowState has been changed to "minimized".
		onMinimize(): void;

		//    this function will be called when widget window is maximized.
		//    windowState has been changed to "maximized"
		onMaximize(): void;

		//    this function will be called when widget is clicked.
		onActive(): void;

		//    this function will be called when another widget is clicked.
		onDeActive(): void;

		//    this function will be called after user sign in to ArcGIS Online or Portal.
		onSignIn(credential: any): void;

		//    this function will be called after user sign out.
		onSignOut(): void;

		//  this function will be called when position changes,
		//  widget's position will be changed when layout change
		//  the position object may contain w/h/t/l/b/r
		onPositionChange(position: any): void;

		// this function will be called when window resizes
		resize(): void;

		//For on-screen off-panel widget, layout manager will call this function
		//to set widget's position after load widget. If your widget will position by itself,
		//please override this function.
		setPosition(position: any, containerNode: any): void;

		/**** Methods for communication between widgets ****/

		//if set keepHistory = true, all published data will be stored in datamanager,
		//this may cause memory problem.
		publishData(data: any, keepHistory: boolean): void;

		//widgetId, the widget id that you want to read data. it is optional.
		fetchData(widgetId: string): void;

		//widgetName, the widget name that you want to read data. it is required.
		fetchDataByName(widgetName: string): void;

		//  this function will be called when data is available
		/****************About historyData:
		The historyData maybe: undefined, true, object(data)
			undefined: means data published without history
			true: means data published with history. If this widget want to fetch history data,
				Please call fetch data.
			object: the history data.
		*********************************/
		onReceiveData(name: string, widgetId: string, data: any, historyData: any): void;

		// Other stuff, not well documented
		widgetManager: any;
		listenWidgetIds: Array<string>;

		// Returns dojo/Deferred object
		openWidgetById(widgetId: string): any;

	}
  export = BaseWidget;

}


declare module "jimu/BaseWidgetSetting"
{

	class BaseWidgetSetting<Config>
	{
    constructor();

    baseClass: string;
    textNode: any;

    getConfig(): Config;
    setConfig(config: Config): void;
  }

  export = BaseWidgetSetting;

}
