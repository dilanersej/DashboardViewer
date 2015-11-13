// NOTE object below must be a valid JSON
window.ReportApp = $.extend(true, window.ReportApp, {
    "config": {
    "layoutSet": "slideout",
    "animationSet": "default",
    "navigation": [



      {
        "title": "About",
        "onExecute": "#About",
        "icon": "info"
      },
      {
        "title": "Dashboards",
        "onExecute": "#main",
        "icon": "doc",
        visible: ko.observable(false)
      },
      {
        "title": "Logout",
        "onExecute": "#login",
        "icon": "key",
        visible: ko.observable(false)
      },
      {
          "title": "Login",
          "onExecute": "#login",
          "icon": "key",
          visible: ko.observable(true)
      }
    ]
  }
});
