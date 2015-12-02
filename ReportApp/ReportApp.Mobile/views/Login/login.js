ReportApp.login = function (params) {
    //baseAddress is the URL to the service
    var baseAddress = ReportApp.config.baseAddress;
    //Debug URL (Debugable with use of the MobileReportServiceDebug in the WCF service)
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';
    
    window.loggedInUser = null;
    //Removing the menu point from the SlideOut menu as soon as you're on the login view
    ReportApp.config.navigation[1].visible(false);
    ReportApp.config.navigation[2].visible(false);
    //Showing the Login action
    ReportApp.config.navigation[3].visible(true);
   
    function authenticate(username, password, callback) {
        var baseAddress = ReportApp.config.baseAddress;
        console.log(baseAddress)
        //Making the call to the service to login
        DevExpress.ui.notify(baseAddress + 'login/' + username + '&' + password);
        //DevExpress.ui.notify(baseAddress + 'login/' + username + '&' + password, 500000);
        $.getJSON(baseAddress + 'login/' + username + '&' + password)
         //Receiving the data with the specific username
        .done(function (data) {
            //If Code = -1, something went wrong: Handle the error
            if (data.Code === -1) {
                DevExpress.ui.notify('Something went wrong. Please try again!', 'error', 3000);
            }
                //If Code = -2, the user doesn't exist in the DB: Handle the error
            else if (data.Code === -2) {
                DevExpress.ui.notify('User not found. Please try again!', 'error', 3000);
            }

                //Check whether the password we retrieve from the DB matches with the password the user entered
            else if (data.Code === -4) {
                //If not: Handle the error
                DevExpress.ui.notify('Incorrect password. Please try again!', 'error', 3000);
            }
                //Otherwise login
            else {
                alert("login in ramt")
                window.loggedInUser = data;
                window.loggedInUser.Password = password;
                //If call back method is recieved, run it
                if (callback) {
                    _loginCallback = callback();
                }
            }
        })
        //If anything goes wrong with the call (service can't be reached, etc.): Handle the error
        .error(function (err) {
            DevExpress.ui.notify('Something went wrong. Service cannot be reached', 3000);
            //Log the error
            console.log(err)
        })
    };

      //LOGIN: using username and password to login
   function Login() {
        //console.log("hsfhs3333")
       DevExpress.ui.notify('Welcome back ' + window.loggedInUser.Username, 'success', 5000);
       alert("S ER IDiot")
                //Show the menu points
                ReportApp.config.navigation[1].visible(true);
                ReportApp.config.navigation[2].visible(true);
                //As the usér is now logged in, remove the Login action from the menu
                ReportApp.config.navigation[3].visible(false);
                //Navigate the user to the Main view (Select dashboard view)
                ReportApp.app.navigate({
                    view: 'main'
                });
            }
    

    var viewModel = {
        //Function being called whenever the user presses "Login"
        loginClicked: function (params) {
            var result = params.validationGroup.validate();
            if (result.isValid) {
                //If the validation is true: Login
                authenticate($('#username').dxTextBox('option', 'value'), CryptoJS.MD5($('#password').dxTextBox('option', 'value')), Login);
                
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