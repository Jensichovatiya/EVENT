
using EVENT.Entities.DbClass;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Business.BusinessClass.OutputModels {
    public class GetEventAllFoodForCommissionOutputModel {
        public long EventId { get; set; }
        public long StallId { get; set; }
        public string StallName { get; set; }
        public long Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string ImageFile { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
        public decimal Commission { get; set; }
        public string CommissionType { get; set; }
        public string EntryBy { get; set; }
        public string EntryDate { get; set; }
        public string UpdateBy { get; set; }
        public string UpdateDate { get; set; }
    }
}
