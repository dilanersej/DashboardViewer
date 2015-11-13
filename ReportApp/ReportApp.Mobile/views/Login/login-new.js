ReportApp.loginNew = function (params) {

    var baseAddress = ReportApp.config.baseAddress;
    //var baseAddress = 'http://localhost:8733/Design_Time_Addresses/MobileReportServiceDebugMode/Service/';

    function CreateLogin(username, password, passwordRepeat) {
        if (password === passwordRepeat) {
            var hashPass = CryptoJS.MD5(password);
            $.ajax({
                type: 'POST',
                url: baseAddress + 'users/create',
                data: JSON.stringify({
                    'Username': username,
                    'Password': hashPass.toString()
                }),
                contentType: 'application/json; charset=utf-8',
                success: function (code) {
                    if(code === 1){
                        DevExpress.ui.notify('Your account has been created ' + username, 'success', 3000);
                        ReportApp.app.navigate({
                            view: 'login'
                        });
                    } else if (code === -3) {
                        DevExpress.ui.notify('A user with the same username already exists. Please choose another and try again!', 'error', 3000);
                    }
                },
                error: function (err) {
                    DevExpress.ui.notify('Something went wrong, Service cannot be reached', 3000);
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