ReportApp.main = function (params) {

    //baseAddress = service URL
    var baseAddress = 'http://172.20.40.125:7741/MobileReportService.Service.svc/';
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    //Retrieve all dashboards from service
    var dataSource = new DevExpress.data.DataSource(baseAddress + "dashboards");

    //Function to navigate to the current dashboard, using the dashboards name
    function graphNavigation(xmlItem) {
        //URI to the correct view, setting the params.Id = to the xmlItm (name of XML)
        var uri = ReportApp.app.router.format({
            view: 'graph',
            id: xmlItem
        });

        //Navigate
        ReportApp.app.navigate(uri);
    }


    var viewModel = {
        //DataSource containing every XML file's name
        dataSource: dataSource,
        //Fucntion being called every time an item is clicked from the list
        itemClicked: function(item)
        {
            //Retrieveing the item data from the list
            graphNavigation(item.itemData);
        }
    };

    return viewModel;
};