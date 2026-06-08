using EVENT.Entities.DbClass;

namespace EVENT.Web.ViewModel.OutputModel {
    public class GetEventMealOutputModel {
        public long EventId { get; set; }
        public long MealId { get; set; }
        public long StallId { get; set; }
        public string ImageFile { get; set; }
        public string MealName { get; set; }
        public decimal Price { get; set; }
        public string Description { get; set; }
        public string EntryBy { get; set; }
        public DateTime EntryDate { get; set; }
        public string? UpdateBy { get; set; }
        public DateTime UpdateDate { get; set; }
        public long SrNo { get; set; }
        public decimal Commission { get; set; }
        public string? CommissionType { get; set; }

        public List<MealItemMapping> MealItems { get; set; }
    }

    public class MealItemMapping {
        public int SrNo { get; set; }
        public long MealId { get; set; }
        public long EventId { get; set; }
        public long FoodItemId { get; set; }
        public string FoodItemName { get; set; }
        public string ImageFile { get; set; }
    }
}
