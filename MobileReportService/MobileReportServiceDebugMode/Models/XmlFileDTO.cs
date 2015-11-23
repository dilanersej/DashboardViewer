using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace MobileReportServiceDebugMode.Models
{
    [DataContract]
    public class XmlFileDTO
    {
        [DataMember]
        public System.Guid ItemID { get; set; }

        [DataMember]
        public string Name { get; set; }

    }
}
