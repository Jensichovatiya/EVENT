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

    // public class EventSlotDropdownItem
    // {
    //     public long Value { get; set; }
    //     public string Label { get; set; } = string.Empty;
    //     public long SlotId { get; set; }
    //     public long EventId { get; set; }
    //     public string EventName { get; set; } = string.Empty;
    //     public System.DateTime SlotDate { get; set; }
    //     public string StartTime { get; set; } = string.Empty;
    //     public string EndTime { get; set; } = string.Empty;
    //     public string SlotName { get; set; } = string.Empty;
    //     public decimal TicketPrice { get; set; }
    // }


public class EventSlotDropdownItem
{
    public long Value { get; set; }

    public string Label { get; set; } = string.Empty;

    public long SlotId { get; set; }

    public long EventId { get; set; }

    public string EventName { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string StartTime { get; set; } = string.Empty;

    public string EndTime { get; set; } = string.Empty;

    public string SlotName { get; set; } = string.Empty;

    public decimal TicketPrice { get; set; }

    public int Capacity { get; set; }

    public int BookedSeats { get; set; }

    public int AvailableSeats { get; set; }

    public string EventMode { get; set; } = string.Empty;

    public string Timezone { get; set; } = string.Empty;

    public bool AllDay { get; set; }
}

    public class BookingDDLResponse
    {
        public List<EventSlotDropdownItem> EventSlots { get; set; } = new List<EventSlotDropdownItem>();
        public List<ZoneDropdownItem> Zones { get; set; } = new List<ZoneDropdownItem>();
    }

    public class ZoneDropdownItem
    {
        public long Value { get; set; }
        public string Label { get; set; } = string.Empty;
        public decimal SeatPrice { get; set; }
        public int Capacity { get; set; }
        public long BlueprintId { get; set; }
        public long EventId { get; set; }
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
        public List<StringDropdownItem> Timezones { get; set; } = new List<StringDropdownItem>();
        public List<StringDropdownItem> VenueTypes { get; set; } = new List<StringDropdownItem>();
        public List<StringDropdownItem> VenueCategories { get; set; } = new List<StringDropdownItem>();
        // Added to support additional dropdowns returned by USP_GetEventDropdowns
        public List<DropdownItem> EmployeeCounts { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> Industries { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> BusinessTypes { get; set; } = new List<DropdownItem>();
        // Organizer types from general master (ORGANIZER_TYPE)
        public List<DropdownItem> OrganizerTypes { get; set; } = new List<DropdownItem>();
        // Ticket-step dropdowns (added in tables 15-18)
        public List<DropdownItem> TicketCategories { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> AddonRequired { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> CalculationTypes { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> ChargeToOptions { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> Taxes { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> PassIncludes { get; set; } = new List<DropdownItem>();
        public List<StringDropdownItem> RepeatsConfig { get; set; } = new List<StringDropdownItem>();
        public List<DropdownItem> EventZones { get; set; } = new List<DropdownItem>();
        public List<StringDropdownItem> ArrangementTypes { get; set; } = new List<StringDropdownItem>();

        // Component dropdown properties (Tables 24 to 29)
        public List<DropdownItem> BookableAs { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> Accessibility { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> ShapeTypes { get; set; } = new List<DropdownItem>();
        public List<CurrencyDropdownItem> ComponentCurrencies { get; set; } = new List<CurrencyDropdownItem>();
        public List<DropdownItem> LabelPositions { get; set; } = new List<DropdownItem>();
        public List<DropdownItem> ComponentCategories { get; set; } = new List<DropdownItem>();
    }
}
