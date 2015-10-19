// NOTE object below must be a valid JSON
window.ReportApp = $.extend(true, window.ReportApp, {
    "config": {
        "endpoints": {
            "db": {
                "local": "",
                "production": ""
            }
        },
        "services": {
            "db": {
                "entities": {
                }
            }
        }
    }
});
