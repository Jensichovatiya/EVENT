USE EVENT_Master;
GO

-- 1. Insert Category for ArrangementType if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'ArrangementType')
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate, CreatedFrom)
    VALUES ('ArrangementType', 'Arrangement Type', 1, 'system', GETDATE(), 'Migration');
END

-- 2. Insert Values for ArrangementType if they don't exist
DECLARE @ArrangementCatId INT;
SELECT @ArrangementCatId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'ArrangementType';

IF @ArrangementCatId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @ArrangementCatId AND Description = 'Auto Arrange')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, IsActive, CreatedBy, CreatedDate, CreatedFrom) VALUES (@ArrangementCatId, 'Auto Arrange', 1, 'system', GETDATE(), 'Migration');
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @ArrangementCatId AND Description = 'Manual Arrange')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, IsActive, CreatedBy, CreatedDate, CreatedFrom) VALUES (@ArrangementCatId, 'Manual Arrange', 1, 'system', GETDATE(), 'Migration');
END
GO

-- 3. Update USP_GetEventDropdowns Stored Procedure
ALTER PROCEDURE [dbo].[USP_GetEventDropdowns]
    @EventId BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- ResultStatus
    SELECT 200 AS ResultStatus, 'Dropdowns fetched successfully' AS ResultMessage;

    -- Currencies Table (1)
    SELECT CurrencyId AS Value, Code AS Code, Name AS Label, Symbol AS Symbol 
    FROM Tracket_Master_Settings_Currencies 
    WHERE IsDeleted = 0;

    -- ListingTypes Table (2)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ListingType' AND V.IsActive = 1;

    -- BookingTypes Table (3)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'BookingType' AND V.IsActive = 1;

    -- EventTypes Table (4)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'EventType' AND V.IsActive = 1;

    -- ZoneTypes Table (5)
    SELECT V.Description AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ZoneType' AND V.IsActive = 1;

    -- GateTypes Table (6)
    SELECT V.Description AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'GateType' AND V.IsActive = 1;

    -- EntryGates Table (7)
    SELECT EntryGateId AS Value, GateName AS Label
    FROM Tracket_Master_Event_Entry_Gate
    WHERE EventId = @EventId AND IsDeleted = 0;

    -- Timezones Table (8)
    SELECT V.AdditionalField AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'Timezone' AND V.IsActive = 1;

    -- VenueTypes Table (9)
    SELECT V.AdditionalField AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'VenueType' AND V.IsActive = 1;

    -- VenueCategories Table (10)
    SELECT V.AdditionalField AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'VenueCategory' AND V.IsActive = 1;

    -- Employee Count Table (11)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'EMPLOYEE_COUNT' AND V.IsActive = 1;

    -- Industry Table (12)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'INDUSTRY' AND V.IsActive = 1;

    -- Business Type Table (13)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'BUSINESS_TYPE' AND V.IsActive = 1;

    -- Organizer Type Table (14)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ORGANIZER_TYPE' AND V.IsActive = 1;

    -- Ticket Category Table (15)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'TICKET_CATEGORY' AND V.IsActive = 1;

    -- Add-On Required Table (16)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ADDON_REQUIRED' AND V.IsActive = 1;

    -- Calculation Type Table (17)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'CALCULATION_TYPE' AND V.IsActive = 1;

    -- Charge To Table (18)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'CHARGE_TO' AND V.IsActive = 1;

    -- Taxes Table (19)
    SELECT 
        TaxId AS Value,
        TaxName + ' (' + CAST(CAST(TaxPercentage AS FLOAT) AS VARCHAR) + '%)' AS Label
    FROM Tracket_Master_Tax
    WHERE IsActive = 1 AND IsDeleted = 0;

    -- PassIncludes Table (20)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'PASS_INCLUDE' AND V.IsActive = 1;

    -- RepeatsConfig Table (21)
    SELECT V.AdditionalField AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'REPEATS_CONFIG' AND V.IsActive = 1;

    -- Event Zones Table (22) (Returns ZoneId as Value for mapping seats)
    SELECT
        ZoneId AS Value,
        ZoneName AS Label
    FROM Tracket_Master_Event_Zone
    WHERE EventId = @EventId
      AND IsDeleted = 0
      AND IsActive = 1
    ORDER BY SortOrder, ZoneName;

    -- ArrangementTypes Table (23) - from general master
    SELECT V.Description AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ArrangementType' AND V.IsActive = 1;

END;
GO
