// NOTE object below must be a valid JSON
window.ReportApp = $.extend(true, window.ReportApp, {
    "config": {
        "baseAddress": "http://dashboard.thorvalddata.com/MobileReportService.Service.svc/",

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
