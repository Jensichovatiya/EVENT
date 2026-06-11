using System.Collections.Generic;

namespace EVENT.Business.BusinessClass
{
    public class DropdownItem
    {
        public long Value { get; set; }
        public string Label { get; set; } = string.Empty;
    }

    public class UserDDLResponse
    {
        public List<DropdownItem> Roles { get; set; } = new List<DropdownItem>();
    }

    public class EventDDLResponse
    {
        public List<DropdownItem> Categories { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> Organizers { get; set; } = new List<DropdownItem>();
    }

    public class AssetDDLResponse
    {
        public List<DropdownItem> AssetTypes { get; set; } = new List<DropdownItem>();
    }

    public class BookingDDLResponse
    {
        public List<DropdownItem> Events { get; set; } = new List<DropdownItem>();
    }

    public class CurrencyDropdownItem
    {
        public long Value { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
    }

    public class StringDropdownItem
    {
        public string Value { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
    }

    public class EventDropdownsResponse
    {
        public List<CurrencyDropdownItem> Currencies { get; set; } = new List<CurrencyDropdownItem>();
        public List<DropdownItem> ListingTypes { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> BookingTypes { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> EventTypes { get; set; } = new List<DropdownItem>();
        public List<StringDropdownItem> ZoneTypes { get; set; } = new List<StringDropdownItem>();
        public List<StringDropdownItem> GateTypes { get; set; } = new List<StringDropdownItem>();
        public List<DropdownItem> EntryGates { get; set; } = new List<DropdownItem>();
    }
}
