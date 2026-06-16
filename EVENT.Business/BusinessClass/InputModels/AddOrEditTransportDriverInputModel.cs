using EVENT.Entities.DbClass;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Business.BusinessClass.InputModels {
    public class AddOrEditTransportDriverInputModel {
        public tbl_Event_TransportDriver tbl_Event_TransportDriver { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? FrontLicenseImage { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? BackLicenseImage { get; set; }
        [XmlIgnore]
        [NotMapped]
        public IFormFile? ImageFile { get; set; }
    }
}
