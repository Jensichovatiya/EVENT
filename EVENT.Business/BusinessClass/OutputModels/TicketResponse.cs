using System;

namespace EVENT.Business.BusinessClass
{
    public class TicketResponse
    {
        public long TicketId { get; set; }

        public Guid PublicId { get; set; }

        public long EventId { get; set; }

        public string TicketName { get; set; } = string.Empty;

        public long TicketCategoryId { get; set; }

        public string TicketCategoryName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int AvailableLimit { get; set; }

        public int? PerOrderLimit { get; set; }

        public DateTime? SalesStartDate { get; set; }

        public DateTime? SalesEndDate { get; set; }

        public string DisplayBadge { get; set; } = string.Empty;

        public string BadgeColor { get; set; } = string.Empty;

        public string AdditionalInfo { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }

    public class EventPassResponse
    {
        public long EventPassId { get; set; }

        public Guid PublicId { get; set; }

        public long EventId { get; set; }

        public string PassName { get; set; } = string.Empty;

        public DateTime ValidFrom { get; set; }

        public DateTime ValidTo { get; set; }

        public decimal Price { get; set; }

        public int TotalLimit { get; set; }

        public string Includes { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string DisplayBadge { get; set; } = string.Empty;

        public string BadgeColor { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }

    public class EventAddOnResponse
    {
        public long AddOnId { get; set; }

        public Guid PublicId { get; set; }

        public long EventId { get; set; }

        public string AddOnName { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int AvailableLimit { get; set; }

        public long RequiredTypeId { get; set; }

        public string RequiredText { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string TicketTypeIds { get; set; } = string.Empty;

        public string DisplayBadge { get; set; } = string.Empty;

        public string BadgeColor { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }

    public class EventPromoCodeResponse
    {
        public long PromoCodeId { get; set; }

        public Guid PublicId { get; set; }

        public long EventId { get; set; }

        public string PromoCode { get; set; } = string.Empty;

        public long DiscountTypeId { get; set; }

        public string DiscountTypeName { get; set; } = string.Empty;

        public long AppliesToId { get; set; }

        public decimal DiscountValue { get; set; }

        public int? UsageLimit { get; set; }

        public decimal? MinPurchaseAmount { get; set; }

        public decimal? MaxDiscountAmount { get; set; }

        public DateTime? ValidFrom { get; set; }

        public DateTime? ValidUntil { get; set; }

        public string Description { get; set; } = string.Empty;

        public bool IsActive { get; set; }
    }

    public class EventTaxResponse
    {
        public long EventTaxId { get; set; }

        public Guid PublicId { get; set; }

        public long EventId { get; set; }

        public long TaxId { get; set; }

        public string TaxName { get; set; } = string.Empty;

        public decimal TaxPercentage { get; set; }

        public long TaxTypeId { get; set; }

        public long AppliesToId { get; set; }

        public bool IsIncludedInPrice { get; set; }

        public bool IsActive { get; set; }
    }

    public class EventFeeResponse
    {
        public long FeeId { get; set; }

        public Guid PublicId { get; set; }

        public long EventId { get; set; }

        public string FeeName { get; set; } = "";

        public long FeeTypeId { get; set; }

        public decimal Amount { get; set; }

        public long AppliesToId { get; set; }

        public long ChargeToId { get; set; }

        public bool IsIncludedInPrice { get; set; }

        public decimal? MinFee { get; set; }

        public decimal? MaxFee { get; set; }

        public bool IsActive { get; set; }
    }


}