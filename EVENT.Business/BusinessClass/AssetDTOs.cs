using System;

namespace EVENT.Business.BusinessClass
{
    public class AssetTypeRequest
    {
        public long AssetTypeId { get; set; }
        public string? AssetTypeRId { get; set; }
        public string AssetTypeName { get; set; } = string.Empty;
        public string? TypeName { get; set; }
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public string? CreatedBy { get; set; }
        public string? CreatedFrom { get; set; }
        public string? UpdatedBy { get; set; }
        public string? UpdatedFrom { get; set; }
    }

    public class AssetTypeResponse
    {
        public long AssetTypeId { get; set; }
        public string AssetTypeRId { get; set; } = string.Empty;
        public string AssetTypeName { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IconUrl { get; set; } = string.Empty;  // Icon/image URL for this asset type
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class AssetRequest
    {
        public long AssetId { get; set; }
        public string? AssetRId { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public long AssetTypeId { get; set; }
        public string? AssetCode { get; set; }
        public string? SerialNumber { get; set; }
        public string? Description { get; set; }
        public int TotalQty { get; set; }
        public int TotalQuantity { get; set; }
        public int AvailableQty { get; set; }
        public int AvailableQuantity { get; set; }
        public int DamageQty { get; set; }
        public decimal? UnitPrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public string? VendorName { get; set; }
        // Note: No IconUrl here — icon is managed at AssetType level
        public string? CreatedBy { get; set; }
        public string? CreatedFrom { get; set; }
        public string? UpdatedBy { get; set; }
        public string? UpdatedFrom { get; set; }
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
        public string IconUrl { get; set; } = string.Empty;  // Sourced from AssetType via JOIN in SP
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
