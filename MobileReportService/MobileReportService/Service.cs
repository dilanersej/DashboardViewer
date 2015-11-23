using MobileReportService.Models;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Text;
using System.Timers;
using System.Web.Script.Serialization;
using System.Xml.Linq;

namespace MobileReportService
{
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class Service : IService
    {
        enum codes { success = 1, fail = -1, no_user = -2, user_exists = -3, wrong_password = -4 }
        private Timer timer;
        public Service()
        {
            timer = new Timer(1000*60*5);
            timer.Enabled = true;
            timer.Elapsed += timer_Elapsed;
        }


        private static Dictionary<string, LoginDTO> dic = new Dictionary<string, LoginDTO>();

        public static void timer_Elapsed(object sender, ElapsedEventArgs e)
        {
#if DEBUG
            var expiredTokens = dic.Where(p => p.Value.LoginDate.AddSeconds(15) <= DateTime.Now)
#else
            var expiredTokens = dic.Where(p => p.Value.LoginDate.AddDays(1) <= DateTime.Now)
#endif
.Select(p => p.Key);
            List<string> itemsToAdd = new List<string>();
            foreach (var key in expiredTokens)
            {
                if (key != null)
                {
                    itemsToAdd.Add(key);
                }
            }
            lock (itemsToAdd)
            {
                foreach (var key in itemsToAdd)
                {
                    dic.Remove(key);
                }
            }
            
        }

        public void GetOptions()
        {
            WebOperationContext.Current.OutgoingResponse.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            WebOperationContext.Current.OutgoingResponse.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept");
        }

        /// <summary>
        /// Returns the dashboard (XML) with the given name
        /// </summary>
        /// <param name="name"></param>
        /// <returns>XElement (XML)</returns>
        public XElement GetDashboardByName(string itemId, string token)
        {
            if (dic.ContainsKey(token))
            {
                using (var db = new ReportEntities())
                {
                    XElement xelement = XElement.Parse(db.Database.SqlQuery<string>("SELECT CAST(CAST(Content AS VARBINARY(MAX)) AS XML) AS DashboardXML FROM ReportServer$SRVSQL2012.dbo.Catalog WHERE ItemID = '" + itemId + "'").FirstOrDefault<string>());
                    return xelement;
                }
            }
            else
            {
                return null;
            }
        }
            

        /// <summary>
        /// Return a list of with all the names of all XML files on the server
        /// </summary>
        /// <returns>List of names (string)</returns>
        public List<XmlFileDTO> GetAllXMLName(string token)
        {
            var xmlList = new List<XmlFileDTO>();
            if (dic.ContainsKey(token))
            {
                var accesPath =
                dic.Where(p => p.Value.Token == token)
                                  .Select(p => p.Value.AccesPath).Single();
                   
                using (var db = new ReportEntities())
                {
                    var dbList = db.Catalog.Where(x => x.Path.Contains("/Dashboard/" + accesPath) && x.Path.Contains(".xml")).Select(x => new { x.ItemID, x.Name }).ToList();
                    foreach (var item in dbList)
                    {

                        xmlList.Add(new XmlFileDTO()
                        {
                            ItemID = item.ItemID,
                            Name = item.Name.Substring(0, item.Name.Length - 4)
                        });
                    }
                    return xmlList;
                }
            }

            else
            {
                return null;
            }

        }

        /// <summary>
        /// Return the data given in the model.Query
        /// </summary>
        /// <param name="model"></param>
        /// <returns>List of Key/Value pairs</returns>
        public List<Dictionary<string, object>> GetData(DataModel model)
        {
            string query = model.Query;
            ArrayList al = new ArrayList();

            using (SqlConnection sqlConnect = new SqlConnection())
            {
                sqlConnect.ConnectionString = new ConnectionStringBuilder().CsBuilder(model);

                SqlCommand command = new SqlCommand(query, sqlConnect);
                sqlConnect.Open();

                SqlDataReader reader = command.ExecuteReader();

                var columns = new List<string>();

                for (int i = 0; i < reader.FieldCount; i++)
                {
                    columns.Add(reader.GetName(i));
                }

                var list = new List<Dictionary<string, object>>();

                while (reader.Read())
                {
                    object[] values = new object[reader.FieldCount];
                    reader.GetValues(values);
                    var item = new Dictionary<string, object>();
                    for (int i = 0; i < columns.Count; i++)
                    {
                        var columnName = columns[i];
                        var value = values[i];
                        item[columnName] = value;
                    }
                    list.Add(item);
                }
                reader.Close();
                return list;
            }
        }

        /// <summary>
        /// Creates a login with the given parameters
        /// </summary>
        /// <param name="login"></param>
        public int CreateLogin(LoginDTO login)
        {
            try
            {
                using (var db = new ReportAppLoginEntities())
                {
                    db.Login.Add(new Login()
                    {
                        Username = login.Username,
                        Password = login.Password
                    });
                    db.SaveChanges();
                }
                return (int)codes.success;
            }
            catch (DbUpdateException e)
            {
                return (int)codes.user_exists;
            }
            catch (Exception e)
            {
                return (int)codes.fail;
            }

        }

        /// <summary>
        /// Return the Login with the given username
        /// </summary>
        /// <param name="username"></param>
        /// <returns>A LoginDTO</returns>
        public LoginDTO GetUserByUsername(string username, string password)
        {            
            try
            {
                using (var db = new ReportAppLoginEntities())
                {

                    var login = db.Login.FirstOrDefault(x => x.Username.Equals(username));
                    
                    if (login == null)
                    {
                        return new LoginDTO()
                        {   
                            Code = (int)codes.no_user,
                            Token = null,
                            ID = 0,
                            Username = null,
                            LoginDate = DateTime.Now,
                            AccesPath = null,

                        };
                    }

                    else if (login.Password != password)
                    {
                        return new LoginDTO()
                        {
                            Code = (int)codes.wrong_password,
                            Token = null,
                            ID = 0,
                            Username = login.Username,
                            LoginDate = DateTime.Now,
                            AccesPath = null,

                        };
                    }
                    else
                    {
                        string token = null;
                        while (token == null || token.Contains("/"))
                        {
                            token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
                        }
                        var loginCred = new LoginDTO() 
                        { Code = (int)codes.success, 
                            Token = token,
                            ID = login.ID,
                            Username = login.Username,
                            LoginDate = DateTime.Now,
                            AccesPath = login.AccesPath,

                        };
                        dic.Add(token, loginCred);
                        return loginCred;
                    }

                    //return new LoginDTO()
                    //{
                    //    ID = login.ID,
                    //    Username = login.Username,
                    //    Password = login.Password,
                    //    Code = (int)codes.success
                    //};
                }
            }
            catch (Exception e)
            {
                return new LoginDTO() { Code = (int)codes.fail };
            }
        }

        /// <summary>
        /// Deletes the login with the given stringId
        /// </summary>
        /// <param name="stringId"></param>
        public int DeleteUser(string stringId)
        {
            try
            {
                var id = Int64.Parse(stringId);
                using (var db = new ReportAppLoginEntities())
                {
                    db.Login.Remove(db.Login.FirstOrDefault(x => x.ID == id));
                    db.SaveChanges();
                }
                return (int)codes.success;
            }
            catch (Exception e)
            {
                return (int)codes.fail;
            }
        }
    }
}
