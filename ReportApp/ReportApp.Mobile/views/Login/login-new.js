ReportApp.loginNew = function (params) {

    var baseAddress = 'http://172.20.40.126:7741/MobileReportService.Service.svc/';
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    function CreateLogin(username, password, passwordRepeat) {
        if(password === passwordRepeat){
            $.ajax({
                type: 'POST',
                url: baseAddress + 'users/create',
                data: JSON.stringify({
                    'Username': username,
                    'Password': password
                }),
                contentType: 'application/json; charset=utf-8',
                success: function (code) {
                    if(code === 1){
                        DevExpress.ui.notify('Your account has been created ' + username, 'success', 3000);
                        ReportApp.app.navigate({
                            view: 'login'
                        });
                    } else if(code === -1){
                        DevExpress.ui.notify('Something went wrong, please try again.', 'error', 3000);
                    } else if (code === -3) {
                        DevExpress.ui.notify('A user with the same username already exists. Please choose another and try again!', 'error', 3000);
                    }
                },
                error: function (err) {
                    DevExpress.ui.notify('Something went wrong, please try again. CODE: ' + err.status, 'error', 3000);
                    console.log(err);
                }
            })
        }
    }

    var viewModel = {
        createUser: function (params) {
            var result = params.validationGroup.validate();
            if(result.isValid){
                CreateLogin($("#username").dxTextBox('option', 'value'),
                        $("#password").dxTextBox('option', 'value'),
                        $("#password-repeat").dxTextBox('option', 'value'));
            }
        },
        password: ko.observable(""),
        confirmedPassword: ko.observable(),
        comparisonTarget: function () {
            if(viewModel.password()){
                return viewModel.password();
            }
        }
    };

    return viewModel;
};