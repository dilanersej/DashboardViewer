using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace MobileReportServiceDebugMode.Models
{//
    [DataContract]
    public class ConnectionStringDTO
    {
        [DataMember]
        public string Server { get; set; }

        [DataMember]
        public string Database { get; set; }

        [DataMember]
        public string UserID { get; set; }

        [DataMember]
        public string Password { get; set; }

    }
}
