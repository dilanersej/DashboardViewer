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
   
    function authenticate(username, password)
    {
        auth(username, CryptoJS.MD5(password), Login);
    }

      //LOGIN: using username and password to login
   function Login() {
        //console.log("hsfhs3333")
                DevExpress.ui.notify('Welcome back ' + window.loggedInUser.Username, 'success', 5000);
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
                authenticate($('#username').dxTextBox('option', 'value'), $('#password').dxTextBox('option', 'value'));
                
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