using System;

namespace EVENT.Business.BusinessClass
{
    public class CurrencyRequest
    {
        public long CurrencyId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
        public decimal ExchangeRate { get; set; } = 1.000000m;
        public string Status { get; set; } = "Active";
        public bool IsDefault { get; set; }
        public bool AutoUpdateRate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public string UpdatedFrom { get; set; } = string.Empty;
    }

    public class CurrencyResponse
    {
        public long CurrencyId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
        public decimal ExchangeRate { get; set; }
        public string Status { get; set; } = "Active";
        public bool IsDefault { get; set; }
        public bool AutoUpdateRate { get; set; }
        public bool IsDeleted { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public string CreatedFrom { get; set; } = string.Empty;
        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedDate { get; set; }
        public string UpdatedFrom { get; set; } = string.Empty;
    }
}
