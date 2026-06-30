using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace EVENT.Entities.DbClass {
    [Table("tbl_Event_Food_Master_Item")]
    public class tbl_Event_Food_Master_Item {
        [Key]
        public int FoodItemId { get; set; }

        public long EventId { get; set; }

        public long StallId { get; set; }

        public string FoodCategory {  get; set; }
        [XmlIgnore]
        public string? FoodCategoryName { get; set; }

        public string? ImageFile { get; set; }
        public string FoodItemName { get; set; }

        public int Quantity { get; set; }
        public string QuantityUOM { get; set; }
        [XmlIgnore]
        public string? QuantityUOMName { get; set; }
        public decimal Price { get; set; }

        public string Description { get; set; }

        public long EntryBy { get; set; }

        public DateTime EntryDate { get; set; }

        public long UpdateBy { get; set; }

        public DateTime UpdateDate { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public decimal Commission { get; set; }
        public string? CommissionType { get; set; }

    }
}