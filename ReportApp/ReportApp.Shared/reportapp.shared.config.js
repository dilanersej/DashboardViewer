// NOTE object below must be a valid JSON
window.ReportApp = $.extend(true, window.ReportApp, {
    "config": {
        "baseAddress": "http://localhost:8733/Design_Time_Addresses/MobileReportService/Service/",

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
