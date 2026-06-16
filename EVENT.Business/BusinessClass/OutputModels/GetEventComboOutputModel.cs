using EVENT.Entities.DbClass;

namespace EVENT.Web.ViewModel.OutputModel {
    public class GetEventComboOutputModel {
        public long EquipmentComboId { get; set; }
        public long EventId { get; set; }
        public long StallId { get; set; }
        public string ComboName { get; set; }
        public decimal Commission { get; set; }
        public string? CommissionType { get; set; }
        public decimal? Price { get; set; }
        public long SrNo { get; set; }
        public string Description { get; set; }
        public string ImageFile { get; set; }
        public long? EntryBy { get; set; }
        public DateTime? EntryDate { get; set; }
        public long? UpdateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public List<MealComboMapping> TEECIM { get; set; }
        public bool? isDeleted { get; set; }
        public long? DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
    }

    public class MealComboMapping {
        public int SrNo { get; set; }
        public long EquipmentComboId { get; set; }
        public long EventId { get; set; }
        public long EquipmentItemId { get; set; }
        public string EquipmentItemName { get; set; }
        public string ImageFile { get; set; }

    }
}
