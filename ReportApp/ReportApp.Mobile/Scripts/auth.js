//LOGIN: using username and password to login
auth = function authenticate(username, password, callback) {
    var baseAddress = ReportApp.config.baseAddress;
        //Making the call to the service to login
        console.log("hsfhs")
        $.getJSON(baseAddress + 'login/' + username + '&' + password)
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
            if (data.Code === -4) {
                //If not: Handle the error
                DevExpress.ui.notify('Incorrect password. Please try again!', 'error', 3000);
            }
            //Otherwise login
            else {
                console.log("hsfhs2222")
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
    }