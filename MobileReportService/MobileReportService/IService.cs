using MobileReportService.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Xml.Linq;

namespace MobileReportService
{
    
    [ServiceContract]
    public interface IService
    {

        [OperationContract]
        [WebInvoke(Method = "OPTIONS", UriTemplate = "*")]
        void GetOptions();

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat=WebMessageFormat.Xml, UriTemplate="/dashboard/{itemId}")]
        XElement GetDashboardByName(string itemId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json, UriTemplate = "/dashboards")]
        List<XmlFileDTO> GetAllXMLName();


        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, UriTemplate = "/data")]
        List<Dictionary<string, object>> GetData(DataModel model);

        //LOGIN OPERATIONS

        [OperationContract]
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json,  UriTemplate = "/users/create")]
        int CreateLogin(LoginDTO login);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json, UriTemplate = "/users/{Username}")]
        LoginDTO GetUserByUsername(string Username);

        [OperationContract]
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "/users/delete/{stringId}")]
        int DeleteUser(string stringId);
    }
}
