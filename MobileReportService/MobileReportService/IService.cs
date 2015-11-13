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
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Xml, UriTemplate = "/dashboard/{itemId}&token={token}")]
        XElement GetDashboardByName(string itemId, string token);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json, UriTemplate = "/dashboards&token={token}")]
        List<XmlFileDTO> GetAllXMLName(string token);


        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json, UriTemplate = "/data")]
        List<Dictionary<string, object>> GetData(DataModel model);

        //LOGIN OPERATIONS

        [OperationContract]
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json,  UriTemplate = "/users/create")] //ændre til f.eks. login/create
        int CreateLogin(LoginDTO login);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json, UriTemplate = "/login/{username}&{password}")]
        LoginDTO GetUserByUsername(string username, string password);

        [OperationContract]
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, UriTemplate = "/users/delete/{stringId}")]
        int DeleteUser(string stringId);
    }
}
