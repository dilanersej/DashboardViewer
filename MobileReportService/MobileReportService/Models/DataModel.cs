using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace MobileReportService.Models
{
    [DataContract]
    public class DataModel
    {
        [DataMember]
        public ConnectionStringDTO CsDTO { get; set; }

        [DataMember]
        public string Query { get; set; }
    }
}
