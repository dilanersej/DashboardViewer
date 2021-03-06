﻿ReportApp.main = function (params) {
    //baseAddress = service URL
    //var auth = require('auth');
    var baseAddress = ReportApp.config.baseAddress;
    var dataSource = new DevExpress.data.DataSource(baseAddress + "dashboards&token=" + window.loggedInUser.Token);
    if (dataSource == null) {
        auth(window.loggedInUser.Username , window.loggedInUser.Password, initDatabase);
    } else {
        //initDatabase();
    }
    
    function initDatabase() {
        try {
            if (!window.openDatabase) {
                alert('Databases are not supported in this browser.');
            } else {
                var shortName = 'DEMODB';
                var version = '1.0';
                var displayName = 'DEMO Database';
                var maxSize = 100000000; //  bytes   = 100 mb
                DEMODB = openDatabase(shortName, version, displayName, maxSize);
                //dropTables();
                createTables();
                selectAll();
            }
        } catch (e) {

            if (e == 2) {
                // Version number mismatch.
                console.log("Invalid database version.");
            } else {
                console.log("Unknown error " + e + ".");
            }
            return;
        }
    }

    function createTables() {
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql('CREATE TABLE IF NOT EXISTS XML_Files(id TEXT NOT NULL PRIMARY KEY, XMLName TEXT NOT NULL);', [], nullDataHandler, errorHandler);
            }
        );
        populateXMLFiles();
    }


    // DELETE DB TABLE
    function dropTables() {
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("DROP TABLE XML_Files;", [], nullDataHandler, errorHandler);
            }
        );
        console.log("Table 'page_settings' has been dropped.");
        //location.reload();			
      
	    

};


    function populateXMLFiles() {
        dataSource.load().done(function (results) {
            for (var i = 0; i < results.length ; i++) {
                DEMODB.transaction(
            function (transaction) {
                var query = 'INSERT INTO XML_Files(id, XMLName) VALUES ("' + results[i - 1].ItemID + '","' + results[i - 1].Name + '")';
                console.log(query);
                transaction.executeSql(query);

            }
        );
            }
        });
    }

    function selectAll() {
        DEMODB.transaction(
            function (transaction) {
                transaction.executeSql("SELECT * FROM XML_Files;", [], dataSelectHandler, errorHandler);
            }
        );
    }

    function dataSelectHandler(transaction, results) {

        // Handle the results
        for (var i = 0; i < results.rows.length; i++) {

            var row = results.rows.item(i);
            var newFeature = new Object();
            console.log(row['XMLName'])
            newFeature.XMLName = row['XMLName'];
k
        }
    }


    function errorHandler( transaction, error ) {
	    
        if (error.code===1){
            // DB Table already exists
        } else {
            // Error is a human-readable string.
            console.log('Oops.  Error was '+error.message+' (Code '+ error.code +')');
        }
        return false;		    
    }
	    
    function nullDataHandler() {
        console.log("SQL Query Succeeded");
    }



    
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    //Retrieve all dashboards from service
    console.log(baseAddress + "dashboards&token=" + window.loggedInUser.Token)
    
    //Function to navigate to the current dashboard, using the dashboards name
    function graphNavigation(xmlItem) {
        //URI to the correct view, setting the params.Id = to the xmlItem (name of XML)
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