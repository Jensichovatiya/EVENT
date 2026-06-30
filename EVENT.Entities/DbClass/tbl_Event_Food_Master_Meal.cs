using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    [Table("tbl_Event_Food_Master_Meal")]
    public class tbl_Event_Food_Master_Meal {
        [Key]
        public long MealId { get; set; }

        public long? EventId { get; set; }

        public long StallId { get; set; }
        public string? ImageFile { get; set; }
        
        public string MealName { get; set; }

        public decimal? Price { get; set; }

        public string Description { get; set; }

        public long? EntryBy { get; set; }

        public DateTime? EntryDate { get; set; }

        public long? UpdateBy { get; set; }

        public DateTime? UpdateDate { get; set; }

        public long SrNo {  get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public decimal Commission { get; set; }
        public List<tbl_Event_Food_Master_Meal_Item_Mapping> MealItems { get; set; }

    }
}