ReportApp.login = function (params) {

    //baseAddress is the URL to the service
    var baseAddress = 'http://172.20.40.126:7741/MobileReportService.Service.svc/';
    //Debug URL (Debugable with use of the MobileReportServiceDebug in the WCF service)
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    window.loggedInUser = null;
    //Removing the menu point from the SlideOut menu as soon as you're on the login view
    ReportApp.config.navigation[1].visible(false);
    ReportApp.config.navigation[2].visible(false);
    //Showing the Login action
    ReportApp.config.navigation[3].visible(true);

    //LOGIN: using username and password to login
    function Login(username, password) {
        //Making the call to the service to login
        $.getJSON(baseAddress + 'users/' + username)
         //Receiving the data with the specific username
        .done(function (data) {
            //If Code = -1, something went wrong: Handle the error
            if(data.Code === -1){
                DevExpress.ui.notify('Something went wrong. Please try again!', 'error', 3000);
            }
            //If Code = -2, the user doesn't exist in the DB: Handle the error
            else if (data.Code === -2) {
                DevExpress.ui.notify('User not found. Please try again!', 'error', 3000);
            }

            //Check whether the password we retrieve from the DB matches with the password the user entered
            if (data.Password != password) {
                //If not: Handle the error
                DevExpress.ui.notify('Incorrect username or password. Please try again!', 'error', 3000);
            }
            //Otherwise login
            else {
                window.loggedInUser = data;
                DevExpress.ui.notify('Welcome back ' + data.Username, 'success', 5000);
                //Show the menu points
                ReportApp.config.navigation[1].visible(true);
                ReportApp.config.navigation[2].visible(true);
                //As the usr is now logged in, remove the Login action from the menu
                ReportApp.config.navigation[3].visible(false);
                //Navigate the user to the Main view (Select dashboard view)
                ReportApp.app.navigate({
                    view: 'main'
                });
            }
        })
        //If anything goes wrong with the call (service can't be reached, etc.): Handle the error
        .error(function (err) {
            DevExpress.ui.notify('Something went wrong. Please try again! CODE: ' + err.statusCode, 'error', 3000);
            //Log the error
            console.log(err)
        })
    }

    var viewModel = {
        //Function being called whenever the user presses "Login"
        loginClicked: function (params) {
            var result = params.validationGroup.validate();
            if (result.isValid) {
                //If the validation is true: Login
                Login($('#username').dxTextBox('option', 'value'), $('#password').dxTextBox('option', 'value'));
            }
        },
        //Function being called whenever the user presses "New login"
        newLoginClicked: function () {
            //Navigate to the appropriate view
            ReportApp.app.navigate({
                view: 'loginNew'
            });
        }
    };

    return viewModel;
};