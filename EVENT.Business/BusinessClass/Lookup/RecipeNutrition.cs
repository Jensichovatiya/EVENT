using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EVENT.Business.BusinessClass.Lookup
{
    public class RecipeNutrition
    {
        public int RecipeId { get; set; }
        public double Calories { get; set; }
        public double Fat { get; set; }
        public double Carbs { get; set; }
        public double Fiber { get; set; }
        public double Protein { get; set; }
        public double Quantity { get; set; }
    }
}
