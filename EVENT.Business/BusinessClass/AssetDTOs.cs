using System;

namespace EVENT.Business.BusinessClass
{
    public class AssetTypeRequest
    {
        public long AssetTypeId { get; set; }
        public string AssetTypeRId { get; set; } = string.Empty;
        public string AssetTypeName { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty; // Keep as alias/backup
        public string Description { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class AssetTypeResponse
    {
        public long AssetTypeId { get; set; }
        public string AssetTypeRId { get; set; } = string.Empty;
        public string AssetTypeName { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class AssetRequest
    {
        public long AssetId { get; set; }
        public string AssetRId { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public long AssetTypeId { get; set; }
        public string AssetCode { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty; // Keep as alias/backup
        public string Description { get; set; } = string.Empty;
        public int TotalQty { get; set; }
        public int TotalQuantity { get; set; } // Keep as alias/backup
        public int AvailableQty { get; set; }
        public int AvailableQuantity { get; set; } // Keep as alias/backup
        public int DamageQty { get; set; }
        public decimal? UnitPrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class AssetResponse
    {
        public long AssetId { get; set; }
        public string AssetRId { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public long AssetTypeId { get; set; }
        public string AssetTypeName { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string AssetCode { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TotalQty { get; set; }
        public int TotalQuantity { get; set; }
        public int AvailableQty { get; set; }
        public int AvailableQuantity { get; set; }
        public int DamageQty { get; set; }
        public decimal? UnitPrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class AssetAllocationRequest
    {
        public long AssetId { get; set; }
        public long EventId { get; set; }
        public int Quantity { get; set; }
        public string ActionType { get; set; } = "ALLOCATE"; // "ALLOCATE" or "RETURN"
    }

    public class AssetInventoryResponse
    {
        public long AssetId { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
        public int AllocatedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
    }
}
