using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace MobileReportServiceDebugMode.Models
{
    [DataContract]
    public class LoginDTO
    {
        [DataMember]
        public long ID { get; set; }

        [DataMember]
        public string Username { get; set; }

        [DataMember]
        public string Password { get; set; }

        [DataMember]
        public int Code { get; set; }
    }

}
