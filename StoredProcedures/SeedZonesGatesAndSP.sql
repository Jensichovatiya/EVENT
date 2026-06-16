USE [EVENT_Master];
GO

PRINT '1. Seeding ZoneType and GateType Categories and Values...';

-- ZoneType Category
DECLARE @ZoneTypeCategoryId INT;
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'ZoneType')
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate, CreatedFrom)
    VALUES ('ZoneType', 'Zone Type', 1, 'Admin', GETDATE(), 'Script');
    SET @ZoneTypeCategoryId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @ZoneTypeCategoryId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'ZoneType';
END

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @ZoneTypeCategoryId)
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, IsActive, CreatedBy, CreatedDate, CreatedFrom)
    VALUES 
    (@ZoneTypeCategoryId, 'VIP', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'Platinum', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'Gold', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'Silver', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'General', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'Couple', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'Lounge', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'Standing', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'Kids', 1, 'Admin', GETDATE(), 'Script'),
    (@ZoneTypeCategoryId, 'Staff', 1, 'Admin', GETDATE(), 'Script');
END

-- GateType Category
DECLARE @GateTypeCategoryId INT;
IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'GateType')
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate, CreatedFrom)
    VALUES ('GateType', 'Gate Type', 1, 'Admin', GETDATE(), 'Script');
    SET @GateTypeCategoryId = SCOPE_IDENTITY();
END
ELSE
BEGIN
    SELECT @GateTypeCategoryId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'GateType';
END

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @GateTypeCategoryId)
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, IsActive, CreatedBy, CreatedDate, CreatedFrom)
    VALUES 
    (@GateTypeCategoryId, 'Main Entry', 1, 'Admin', GETDATE(), 'Script'),
    (@GateTypeCategoryId, 'VIP Entry', 1, 'Admin', GETDATE(), 'Script'),
    (@GateTypeCategoryId, 'Staff Entry', 1, 'Admin', GETDATE(), 'Script'),
    (@GateTypeCategoryId, 'Exit Only', 1, 'Admin', GETDATE(), 'Script'),
    (@GateTypeCategoryId, 'Emergency Exit', 1, 'Admin', GETDATE(), 'Script');
END
GO

PRINT '2. Updating USP_GetEventDropdowns Stored Procedure...';
GO
CREATE OR ALTER PROCEDURE USP_GetEventDropdowns
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
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ZoneType' AND V.IsActive = 1;

    -- GateTypes Table (6)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'GateType' AND V.IsActive = 1;

    -- EntryGates Table (7)
    SELECT EntryGateId AS Value, GateName AS Label
    FROM Tracket_Master_Event_Entry_Gate
    WHERE EventId = @EventId AND IsDeleted = 0;
END;
GO
