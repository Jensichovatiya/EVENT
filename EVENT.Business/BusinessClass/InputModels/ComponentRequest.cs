namespace EVENT.Business.BusinessClass
{
    /// <summary>
    /// Request model for USP_AddEditComponent — mirrors all columns the SP accepts.
    /// </summary>
    public class ComponentRequest
    {
        public long   ComponentId   { get; set; }
        public string? ComponentRId  { get; set; } = string.Empty;
        public string? ComponentName { get; set; } = string.Empty;
        public string? ComponentCode { get; set; } = string.Empty;
        public string? Category      { get; set; } = string.Empty;   // e.g. Structural, Furniture, Utility
        public string? Description   { get; set; } = string.Empty;
        public string? IconUrl       { get; set; } = string.Empty;   // resolved server-side if IconFile uploaded

        // Shape & Size
        public string?  Shape         { get; set; } = "Rectangle";
        public decimal DefaultWidth  { get; set; }
        public decimal DefaultHeight { get; set; }
        public int     Rotation      { get; set; }
        public string?  WidthUnit     { get; set; } = "m";
        public string?  HeightUnit    { get; set; } = "m";

        // Appearance
        public string?  DefaultColor  { get; set; } = "#A47BFA";
        public string?  BorderColor   { get; set; } = "#6D2DD9";
        public int     BorderWidth   { get; set; } = 1;
        public int     Opacity       { get; set; } = 100;

        // Booking & Access
        public bool   AllowBooking   { get; set; }
        public string? BookableAs     { get; set; } = "Individual";   // Individual | Multiple
        public string? Accessibility  { get; set; } = "Accessible";
        public string? AccessType     { get; set; } = "Public";

        // Placement & Behaviour
        public bool   SnapToGrid     { get; set; } = true;
        public bool   Stackable      { get; set; }
        public bool   Movable        { get; set; } = true;
        public bool   Resizable      { get; set; } = true;
        public bool   IsFixed        { get; set; }

        // Additional
        public string?  DefaultLabel   { get; set; } = string.Empty;
        public string?  LabelPosition  { get; set; } = "Center";
        public bool    ShowLabel      { get; set; } = true;
        public int     ZIndex         { get; set; } = 1;
        public decimal DefaultPrice   { get; set; }
        public string?  Currency       { get; set; } = "INR";
        public string?  Notes          { get; set; } = string.Empty;

        public bool   IsActive  { get; set; } = true;
        public string? CreatedBy   { get; set; } = string.Empty;
        public string? CreatedFrom { get; set; } = string.Empty;
        public string? UpdatedBy   { get; set; } = string.Empty;
        public string? UpdatedFrom { get; set; } = string.Empty;

        // Lookup ID values mapped to the database schema
        public long? CategoryId { get; set; }
        public long? BookableAsId { get; set; }
        public long? AccessibilityId { get; set; }
        public long? AccessTypeId { get; set; }
        public long? ShapeTypeId { get; set; }
        public long? CurrencyId { get; set; }
        public long? LabelPositionId { get; set; }
    }
}