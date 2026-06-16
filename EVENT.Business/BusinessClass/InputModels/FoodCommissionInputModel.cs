using EVENT.Entities.DbClass;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Business.BusinessClass.InputModels
{
    public class FoodCommissionInputModel { 
        public long FoodItemId { get; set; }
        public string FoodItemType { get; set; }
        public long Commission { get; set; }
        public string CommissionType { get; set; }
        public long CommissionSetBy { get; set; }
        //[XmlIgnore]
        //public DateTime? CommissionSetDate { get; set; }
    }
}
