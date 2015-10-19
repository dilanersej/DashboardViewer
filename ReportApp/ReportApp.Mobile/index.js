$(function() {
    var startupView = "login";

    // Uncomment the line below to disable platform-specific look and feel and to use the Generic theme for all devices
    // DevExpress.devices.current({ platform: "generic" });

    if(DevExpress.devices.real().platform === "win8") {
        $("body").css("background-color", "#000");
    }

    $(document).on("deviceready", function () {
        navigator.splashscreen.hide();
        if (window.devextremeaddon) {
            window.devextremeaddon.setup();
        }
        $(document).on("backbutton", function () {
            DevExpress.processHardwareBackButton();
        });
    });

    function onNavigatingBack(e) {
        if(e.isHardwareButton && !ReportApp.app.canBack()) {
            e.cancel = true;
            exitApp();
        }
    }

    function exitApp() {
        switch (DevExpress.devices.real().platform) {
            case "android":
                navigator.app.exitApp();
                break;
            case "win8":
                window.external.Notify("DevExpress.ExitApp");
                break;
        }
    }

    ReportApp.app = new DevExpress.framework.html.HtmlApplication({
        namespace: ReportApp,
        layoutSet: DevExpress.framework.html.layoutSets[ReportApp.config.layoutSet],
        animationSet: DevExpress.framework.html.animationSets[ReportApp.config.animationSet],
        navigation: ReportApp.config.navigation,
        commandMapping: ReportApp.config.commandMapping,
        navigateToRootViewMode: "keepHistory",
        useViewTitleAsBackText: true
    });

    $(window).unload(function() {
        ReportApp.app.saveState();
    });

    ReportApp.app.router.register(":view/:id", { view: startupView, id: undefined });
    ReportApp.app.on("navigatingBack", onNavigatingBack);
    ReportApp.app.navigate();
});