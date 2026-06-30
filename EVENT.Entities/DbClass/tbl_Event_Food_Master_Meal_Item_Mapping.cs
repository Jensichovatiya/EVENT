using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Entities.DbClass {
    public class tbl_Event_Food_Master_Meal_Item_Mapping {
        public long? MealId { get; set; }
        public long? EventId { get; set; }
        public long? FoodItemId { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? SrNo { get; set; }
    }
}