USE EVENT_Master;
GO

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

    -- OrganizerTypes Table (11)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ORGANIZER_TYPE' AND V.IsActive = 1;
END;
GO

PRINT 'USP_GetEventDropdowns updated successfully.';
GO
