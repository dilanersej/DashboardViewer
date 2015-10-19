using MobileReportServiceDebugMode.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MobileReportServiceDebugMode
{
    public class ConnectionStringBuilder
    {

        public string CsBuilder(DataModel model)
        {
            //SqlConnection myConnection = new SqlConnection();

            SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();

            builder.UserID = model.CsDTO.UserID;
            builder.Password = model.CsDTO.Password;
            builder.InitialCatalog = model.CsDTO.Database;
            builder.DataSource = model.CsDTO.Server;
            builder.ConnectTimeout = 30;
            return builder.ConnectionString;
        }
    }
}
