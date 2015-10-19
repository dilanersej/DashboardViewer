ReportApp.graph = function (params) {

    var baseAddress = 'http://172.20.40.126:7741/MobileReportService.Service.svc/';
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    var xml;
    var dataSource;

    //GET DASHBOARD
    var GetDashboard = $.ajax({
        url: baseAddress + 'dashboard/' + params.id.ItemID,
        type: 'GET',
        contentType: 'text/xml',
        success: function (xmlObject) {
            xml = xmlObject;
            dataSource = GetData(xmlObject);
        },
        error: function (err) {
            DevExpress.ui.notify('Something went wrong, please try again. CODE: ' + err.statusCode, 'error', 3000);
            console.log(err);
        }
    })

    //GET DATA
    function GetData(xmlDoc, userIdInput, passwordInput) {
        var query = BuildQuery(xmlDoc);
        //Parameters containing data connection information
        var parameters = xmlDoc.getElementsByTagName('Parameters')[0].childNodes;
        var server = "";
        var database = "";
        var userId = userIdInput;
        var password = passwordInput;
        //Get data connection information from XML
        for (k = 0; k < parameters.length; k++){
            if(parameters[k].getAttribute('Name') === 'server'){
                server = parameters[k].getAttribute('Value');
            } else if (parameters[k].getAttribute('Name') === 'database') {
                database = parameters[k].getAttribute('Value');
            } else if (parameters[k].getAttribute('Name') === 'userid') {
                //If this parameter exists in the XML
                if(parameters[k].getAttribute('Value') != ""){
                    userId = parameters[k].getAttribute('Value');
                }
            } else if (parameters[k].getAttribute('Name') === 'password') {
                //If this parameter exists in the XML
                if (parameters[k].getAttribute('Value') != "") {
                    password = parameters[k].getAttribute('Value');
                }
            }
        }

        //If we didn't find any login information in the XML
        if (userId === undefined && password === undefined) {
            //Obtain new login credentials from pop up
            ObtainLoginCredentials();
        } else {

            var data = JSON.stringify({
                'CsDTO': {
                    'UserID': userId,
                    'Password': password,
                    'Server': server,
                    'Database': database
                },
                'Query': query
            })
            $.ajax({
                url: baseAddress + 'data',
                type: 'POST',
                data: data,
                contentType: "application/json; charset=utf-8"
            })
            .done(function (json) {
                var tmpArray = [];
                var jsonArray = json;
                //Build the array from a key/value hash
                for (i = 0; i < jsonArray.length; i++) {
                    //Create new object
                    var item = {};
                    for (j = 0; j < jsonArray[i].length; j++) {
                        //Add the object property name (key) and the assigned value (value)
                        item[jsonArray[i][j].Key] = jsonArray[i][j].Value
                    }
                    //Push this item to final array
                    tmpArray.push(item);
                }
                x = xmlDoc.getElementsByTagName('Items')[0].childNodes;
                //For each tag in the parent tag <Items>, check the type, and build the type (graph, card, etc.)
                for (i = 0; i < x.length; i++) {
                    CheckType(x[i], tmpArray);
                }
            })
            .error(function (err) {
                DevExpress.ui.notify('Something went wrong, please try again. CODE: ' + err.statusCode, 'error', 3000);
                console.log(err.message);
            })
        }
    }

    //OBTAIN LOGIN CREDENTIALS
    function ObtainLoginCredentials() {
        viewModel.popUpVisible(true);
    }

    //BUILD QUERY
    function BuildQuery(xmlDoc) {
        var columList = [];
        var tableList = [];
        var query = "SELECT";
        var relations = [];
        //Get all table information from the XML
        var tables = xmlDoc.getElementsByTagName('Table');
        //Build the SELECT using these table information
        for (h = 0; h < tables.length; h++){
            for (j = 0; j < tables[h].childNodes.length; j++) {
                if (h === 0 && j === 0) {
                    if(tables[h].childNodes[j].getAttribute('Alias') != undefined){
                        query += " [" + tables[h].getAttribute('Name') + "].[" + tables[h].childNodes[j].getAttribute('Name') + "] AS '" + tables[h].childNodes[j].getAttribute('Alias') + "'";
                    } else {
                        query += " [" + tables[h].getAttribute('Name') + "].[" + tables[h].childNodes[j].getAttribute('Name') + "]";
                    }
                } else {
                    if (tables[h].childNodes[j].getAttribute('Alias') != undefined) {
                        query += ", [" + tables[h].getAttribute('Name') + "].[" + tables[h].childNodes[j].getAttribute('Name') + "] AS '" + tables[h].childNodes[j].getAttribute('Alias') + "'";
                    } else {
                        query += ", [" + tables[h].getAttribute('Name') + "].[" + tables[h].childNodes[j].getAttribute('Name') + "]";
                    }
                }
            }
        }

        for (k = 0; k < tables.length; k++){
            tableList[k] = tables[k].getAttribute('Name');
        }

        //Get all relations from the XML
        relations = xmlDoc.getElementsByTagName('Relation');
        
        //Build the FROM
        if(relations.length != 0){
            query += " FROM [" + relations[0].getAttribute('Parent') + "]";
        } else {
            query += " FROM [" + tableList[tableList.length - 1] + "]";
        }

        //Hash to keep track of used relations, to make sure we don't JOIN twice, with the same table
        var used = {};

        //If relations exist in the XML, build the JOINs correctly
        for (k = 0; k < relations.length; k++){
            var keyColumns = relations[k].childNodes;
            var count1 = 0;
            if(!used[k]){
                if (keyColumns.length != 1) {
                    for (j = 0; j < keyColumns.length; j++) {
                        if (count1 === 0) {
                            query += " JOIN [" + relations[k].getAttribute('Nested') + "] ON [" + relations[k].getAttribute('Parent') + "].[" + keyColumns[j].getAttribute('Parent') + "] = [" + relations[k].getAttribute('Nested') + "].[" + keyColumns[j].getAttribute('Nested') + "]";
                            count1 = 1;
                        } else {
                            query += " AND  [" + relations[k].getAttribute('Parent') + "].[" + keyColumns[j].getAttribute('Parent') + "] = [" + relations[k].getAttribute('Nested') + "].[" + keyColumns[j].getAttribute('Nested') + "]";
                        }
                    }
                } else {
                    query += " JOIN [" + relations[k].getAttribute('Nested') + "] ON [" + relations[k].getAttribute('Parent') + "].[" + keyColumns[0].getAttribute('Parent') + "] = [" + relations[k].getAttribute('Nested') + "].[" + keyColumns[0].getAttribute('Nested') + "]";
                    count1 = 1;
                }

                for (l = 0; l < relations.length; l++) {
                    if (relations[k].getAttribute('Nested') === relations[l].getAttribute('Nested') && k != l) {
                        if (!used[l]) {
                            query += " AND  [" + relations[l].getAttribute('Parent') + "].[" + relations[l].firstChild.getAttribute('Parent') + "] = [" + relations[l].getAttribute('Nested') + "].[" + relations[l].firstChild.getAttribute('Nested') + "]";
                            used[l] = 1;
                        }
                    }
                }
                used[k] = 1;
            }
        }

        return query;
    }

    //CHECK TYPE
    function CheckType(xmlType, dataSource) {
        //DETECT THE WIDGET TYPE AND CREATE THE WIDGET
        switch (xmlType.nodeName) {
            //CHART
            case 'Chart':
                CreateChart(xmlType, dataSource);
                break;
                //PIE
            case 'Pie':
                CreatePie(xmlType, dataSource);
                break;
                //GAUGE
            case 'Gauge': 
                CreateGauge(xmlType, dataSource);
                break;
            case 'Card':
                CreateCard(xmlType, dataSource);
                break;
        }
    }

    //CREATE CHART 
    function CreateChart(xmlType, jsonArray) {
        var type = "";
        var seriesList = [];
        //Get title of the graph
        var title = xmlType.getAttribute('Name')
        
        if (xmlType.lastChild.firstChild.firstChild.firstChild.getAttribute('SeriesType') === null) {
            type = "bar";
        }else {
            type = xmlType.lastChild.firstChild.firstChild.firstChild.getAttribute('SeriesType').toLowerCase();
        }

        //If this graph has multiple series
        if (xmlType.getElementsByTagName('SeriesDimensions')[0] != null) {
            var seriesDimensions = xmlType.getElementsByTagName('SeriesDimensions')[0].childNodes;
            for (k = 0; k < seriesDimensions.length; k++) {
                var name = "";
                var argument = "";
                //Get all dataItems, so we can compare with the data needed for the specific axis'
                var dataItems = xmlType.getElementsByTagName('DataItems')[0].childNodes;
                for (l = 0; l < dataItems.length ; l++){
                    if (seriesDimensions[k].getAttribute('UniqueName') === dataItems[l].getAttribute('UniqueName')) {
                        //If the UniqueName of the data we need on this axis = the UniqueName of the dataItem we're currently iteration through: Use this dataItems DataMember
                        name = dataItems[l].getAttribute('DataMember');
                        argument = name;
                    }
                }
                //Push this series into the series array, with all the information needed
                seriesList.push({ name: name, argumentField:argument, valueField: xmlType.firstChild.getElementsByTagName('Measure')[0].getAttribute("DataMember"), type: type })
            }
        } else {
            //If this graph only has one series (the XML will always look the same in this case)
            seriesList.push({ name: xmlType.firstChild.getElementsByTagName('Measure')[0].getAttribute('DataMember'), argumentField: xmlType.firstChild.getElementsByTagName('Dimension')[0].getAttribute("DataMember"), valueField: xmlType.firstChild.getElementsByTagName('Measure')[0].getAttribute("DataMember"), type: type })
        }

        //Build this graph to the UI (HTML)
        $('<div class="content-style chart">').appendTo('.content').dxChart({
            dataSource: jsonArray,
            series: seriesList,
            commonSeriesSettings: {
                type: type
            },
            title: {
                text: title,
                font: {
                    color: '#afafaf',
                    size: 18
                }
            },
            size: {
                height: 300
            }
        });
    }

    //CREATE PIE CHART 
    function CreatePie(xmlType, jsonArray) {
        var series = {};
        var value = "";
        var argument = "";
        //Get title of the Pie chart
        var title = xmlType.getAttribute('Name');
        //Get all dataItems, so we can compare with the data needed for the specific argument and value
        var dataItems = xmlType.getElementsByTagName('DataItems')[0].childNodes;

        //Get the name UniqueName of the argument
        var argumentUniqueName = xmlType.getElementsByTagName('Arguments')[0].firstChild.getAttribute('UniqueName');
        //Get the name UniqueName of the value
        var valueUniqueName = xmlType.getElementsByTagName('Values')[0].firstChild.getAttribute('UniqueName');

        //Iterate through the dataItems
        for (k = 0; k < dataItems.length; k++) {
            //If the UniqueName of this dataItem = the argument name: use this dataItem's DataMember
            if(dataItems[k].getAttribute('UniqueName') === argumentUniqueName){
                argument = dataItems[k].getAttribute('DataMember');
            } else if (dataItems[k].getAttribute('UniqueName') === valueUniqueName) {
                //Otherwise, if the UniqueName of this dataItem iteration = the value name: use this dataItem's DataMember
                value = dataItems[k].getAttribute('DataMember');
            }
        }

        //Buidl the series that we need in the chart
        series = {
            name: argument,
            argumentField: argument,
            valueField: value,
            label: {
                visible: true,
                connector: {
                    visible: true,
                    width: 1
                }
            }
        };

        //Build the actual chart to the UI (HTML)
        $('<div class="content-style pie">').appendTo('.content').dxPieChart({
            dataSource: jsonArray,
            series: series,
            title: {
                text: title,
                font: {
                    color: '#afafaf',
                    size: 18
                }
            },
            onPointClick: function (e) {
                //Function making it possible to hide/show this specific item
                var point = e.target;
                point.isVisible() ? point.hide() : point.show();
            },
            size: {
                height: 300
            }
        });
    }

    //CREATE GAUGE 
    function CreateGauge(xmlType, jsonArray) {

        var endValue = 0;
        for (k = 0; k < jsonArray.length; k++) {
            //Iterate through the array, to find the biggest entry
            var value = xmlType.firstChild.lastChild.getAttribute('DataMember')
            if (jsonArray[k][value] > endValue) {
                //If this iteration's entry is bigger than endValue, apply this entry's value to the endValue
                endValue = jsonArray[k][value];
            }
        }

        //if the gauge is a LinearVertical gauge, build the gauge
        if (xmlType.getAttribute('ViewType') === 'LinearVertical') {
            //VERTICAL GAUGE
            var title = xmlType.getAttribute('Name')
            for (k = 0; k < jsonArray.length; k++) {
                var jsonItem = jsonArray[k];
                //The value will always be in the same spot
                var value = jsonItem[xmlType.firstChild.lastChild.getAttribute('DataMember')];
                $('<div class="content-style gauge">').appendTo('.content').dxLinearGauge({
                    geomerty: { orientation: 'vertical' },
                    scale: {
                        startValue: 0,
                        endValue: endValue
                    },
                    value: value,
                    title: {
                        text: title,
                        font: {
                            color: '#afafaf',
                            size: 18
                        }
                    },
                    size: {
                        height: 200
                    }
                })
            }
        }
        //If the gauge is a LinearHorizontal gauge, build the gauge
        else if (xmlType.getAttribute('ViewType') === 'LinearHorizontal') {
            //HORIZONTAL GAUGE
            var title = xmlType.getAttribute('Name')
            for (k = 0; k < jsonArray.length; k++) {
                var jsonItem = jsonArray[k];
                //The value will always be in the same spot
                var value = jsonItem[xmlType.firstChild.lastChild.getAttribute('DataMember')];
                $('<div class="content-style gauge">').appendTo('.content').dxLinearGauge({
                    scale: {
                        startValue: 0,
                        endValue: endValue
                    },
                    value: value,
                    title: {
                        text: title,
                        font: {
                            color: '#afafaf',
                            size: 18
                        }
                    },
                    size: {
                        height: 200
                    }
                })
            }
        }
        //If none above, the gauge has to be a circular gauge: build the gauge
        else {
            //CIRCULAR GAUGE
            var title = xmlType.getAttribute('Name')
            for (k = 0; k < jsonArray.length; k++) {
                var jsonItem = jsonArray[k];
                //The value will always be in the same spot
                var value = jsonItem[xmlType.firstChild.lastChild.getAttribute('DataMember')];
                $('<div class="content-style gauge">').appendTo('.content').dxCircularGauge({
                    scale: {
                        startValue: 0,
                        endValue: endValue
                    },
                    value: value,
                    title: {
                        text: title,
                        font: {
                            color: '#afafaf',
                            size: 18
                        }
                    },
                    size: {
                        height: 200
                    },
                    valueIndicator: {
                        type: 'triangleNeedle'
                    }
                })
            }
        }
    }

    //CREATE CARD
    function CreateCard(xmlType, jsonArray) {
        //Get all dataItems
        var dataItems = xmlType.getElementsByTagName('DataItems')[0].childNodes;
        //Get all cards, as multiple cards within one card, is possible
        var cards = xmlType.getElementsByTagName('Card');
        for (l = 0; l < cards.length; l++) {
            var actualKey;
            var targetKey;
            //Get the card values
            var cardValues = xmlType.getElementsByTagName('Card')[l].childNodes;
            var actualValue;
            var targetValue;
            for (k = 0; k < cardValues.length; k++){
                if (cardValues[k].nodeName === 'ActualValue') {
                    //If the nodeName is ActualTarget, iterate through the dataItems, to find this specific dataItem
                    for (j = 0; j < dataItems.length; j++){
                        if (cardValues[k].getAttribute('UniqueName') === dataItems[j].getAttribute('UniqueName')) {
                            //Hash to combine all values into one single value (Summing all entries' value)
                            var hash = {};
                            //Iterate through the jsonArray, as this value needs to be the SUM of all entries' actualValue
                            for (m = 0; m < jsonArray.length; m++) {
                                if(!hash[dataItems[j].getAttribute('DataMember')]){
                                    hash[dataItems[j].getAttribute('DataMember')] = jsonArray[m][dataItems[j].getAttribute('DataMember')];
                                } else {
                                    hash[dataItems[j].getAttribute('DataMember')] += jsonArray[m][dataItems[j].getAttribute('DataMember')];
                                }
                            }
                            actualKey = dataItems[j].getAttribute('DataMember');
                            actualValue = hash[dataItems[j].getAttribute('DataMember')];
                        }
                    }
                }
                //Otherwise, find the targetValue
                else if (cardValues[k].nodeName === 'TargetValue') {
                    for (j = 0; j < dataItems.length; j++) {
                        if (cardValues[k].getAttribute('UniqueName') === dataItems[j].getAttribute('UniqueName')) {
                            //Hash to combine all values into one single value (Summing all entries' value)
                            var hash = {};
                            //Iterate through the jsonArray, as this value needs to be the SUM of all entries' targetValue
                            for (m = 0; m < jsonArray.length; m++) {
                                //If the hash with the DataMember key doesn't exist, crate it
                                if (!hash[dataItems[j].getAttribute('DataMember')]) {
                                    hash[dataItems[j].getAttribute('DataMember')] = jsonArray[m][dataItems[j].getAttribute('DataMember')];
                                }
                                //Otherwise, just add the iterations value to the existing value defined by this key
                                else {
                                    hash[dataItems[j].getAttribute('DataMember')] += jsonArray[m][dataItems[j].getAttribute('DataMember')];
                                }
                            }
                            targetKey = dataItems[j].getAttribute('DataMember');
                            targetValue = hash[dataItems[j].getAttribute('DataMember')];
                        }
                    }
                }
            }

            var originTarget = targetValue;
            //Target value should be actual-target (eks. 20-15 = 5 (the difference is 5))
            targetValue = actualValue - targetValue;

            //Calculate percentage difference (Using *100 / 100 to only show 2 digits)
            var percentage = Math.ceil((targetValue / actualValue * 100) * 100) / 100;

            //If the actual value is greater than the target value, we need to show the upwards pointing GREEN arrow: Build the card
            if (actualValue < originTarget) {
                actualValue = actualValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                targetValue = targetValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                $('<div class="content-style card">').appendTo('.content')
                .html('<div align="center"><h1 class="card-headline">' + actualKey + ' vs. ' + targetKey + '</h1></div><div align="right"><p class="actual">' + actualValue + '</p><p class="percentage-negative percentage"><strong>' + percentage + ' %</strong></p><h2 class="target-negative target"><span class="arrow-down"></span><strong>' + targetValue + '</strong></h2></div>');
            }
            //If the actual value is less than the target, we need to show the downwards pointing RED arrow: Build the card
            else if (actualValue > originTarget) {
                actualValue = actualValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                targetValue = targetValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                $('<div class="content-style card">').appendTo('.content')
                .html('<div align="center"><h1 class="card-headline">' + actualKey + ' vs. ' + targetKey + '</h1></div><div align="right"><p class="actual">' + actualValue + '</p><p class="percentage-positive percentage"><strong>+' + percentage + ' %</strong></p><h2 class="target-positive target"><span class="arrow-up"></span><strong>+' + targetValue + '</strong></h2></div>');
            }
            //If the actual value isn't greater nor less than the target, we don't need to show any arrow, as we hit the target: Build the card
            else {
                actualValue = actualValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                targetValue = targetValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                $('<div class="content-style card">').appendTo('.content')
                .html('<div align="center"><h1 class="card-headline">' + actualKey + ' vs. ' + targetKey + '</h1></div><div align="right"><p class="actual">' + actualValue + '</p><p class="percentage-neutral percentage"><strong>' + percentage + ' %</strong></p><h2 class="target-neutral target"><strong>+' + targetValue + '</strong></h2></div>');
            }
        }
    }

    var viewModel = {
        //Headline showing the title of the dashboard
        headline: params.id.Name,
        //Variable to define whether to show the pop up or not
        popUpVisible: ko.observable(false),
        //Function to call whenever we press the "OK" in the pop up window
        popupClicked: function (params) {
            var result = params.validationGroup.validate();
            if (result.isValid) {
                //Hide the pop up if the validation is OK
                viewModel.popUpVisible(false);
                //Call the "GetData" function again, this time with the password and userId from the fields the user entered in the pop up, as parameters
                GetData(xml, $('#userId').dxTextBox('option', 'value'), $('#password').dxTextBox('option', 'value'));
            }
        }
    };

    return viewModel;

    

};