-- ============================================================
-- MASTER SETUP: Venue & Facility Full Setup (Run Once)
-- Idempotent: safe to run multiple times.
-- ============================================================
USE EVENT_Master;
GO

SET NOCOUNT ON;
PRINT '=== Starting Venue & Facility Setup ===';

-- ============================================================
-- STEP 1: Add columns to Tracket_Master_Event_Location
-- ============================================================

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'VenueType') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD VenueType NVARCHAR(100) NULL;
    PRINT 'Added VenueType column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'VenueCategory') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD VenueCategory NVARCHAR(100) NULL;
    PRINT 'Added VenueCategory column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'Facilities') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD Facilities NVARCHAR(MAX) NULL;
    PRINT 'Added Facilities column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'Capacity') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD Capacity INT NULL;
    PRINT 'Added Capacity column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactPerson') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactPerson NVARCHAR(200) NULL;
    PRINT 'Added ContactPerson column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactDesignation') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactDesignation NVARCHAR(200) NULL;
    PRINT 'Added ContactDesignation column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactPhoneCode') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactPhoneCode NVARCHAR(10) NULL;
    PRINT 'Added ContactPhoneCode column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactPhone') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactPhone NVARCHAR(50) NULL;
    PRINT 'Added ContactPhone column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactEmail') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactEmail NVARCHAR(200) NULL;
    PRINT 'Added ContactEmail column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'Notes') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD Notes NVARCHAR(500) NULL;
    PRINT 'Added Notes column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'OtherFacility') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD OtherFacility NVARCHAR(200) NULL;
    PRINT 'Added OtherFacility column.';
END

PRINT 'Step 1 complete: Tracket_Master_Event_Location columns ready.';
GO

-- ============================================================
-- STEP 2: Create Tracket_Master_Event_Master_Facility table
-- ============================================================

IF OBJECT_ID('dbo.Tracket_Master_Event_Master_Facility', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tracket_Master_Event_Master_Facility (
        FacilityId   BIGINT IDENTITY(1,1) PRIMARY KEY,
        EventId      BIGINT NULL,
        FacilityName NVARCHAR(200) NOT NULL,
        EntryBy      BIGINT NULL,
        EntryDate    DATETIME NOT NULL DEFAULT GETDATE(),
        UpdateBy     BIGINT NULL,
        UpdateDate   DATETIME NULL
    );
    PRINT 'Created Tracket_Master_Event_Master_Facility table.';
END
ELSE
BEGIN
    PRINT 'Tracket_Master_Event_Master_Facility table already exists.';
END
GO

-- ============================================================
-- STEP 3: Seed VenueType in GeneralMasterCategory/Value
-- ============================================================

DECLARE @VenueTypeCatId INT;
SELECT @VenueTypeCatId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'VenueType';

IF @VenueTypeCatId IS NULL
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate)
    VALUES ('VenueType', 'Venue Type', 1, 'Admin', GETDATE());
    SET @VenueTypeCatId = SCOPE_IDENTITY();
    PRINT 'Created VenueType category.';
END

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueTypeCatId AND Description = 'Physical')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueTypeCatId, 'Physical', 'physical', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueTypeCatId AND Description = 'Virtual')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueTypeCatId, 'Virtual', 'virtual', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueTypeCatId AND Description = 'Hybrid')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueTypeCatId, 'Hybrid', 'hybrid', 1, 'Admin', GETDATE());

PRINT 'Step 3 complete: VenueType values seeded.';
GO

-- ============================================================
-- STEP 4: Seed VenueCategory in GeneralMasterCategory/Value
-- ============================================================

DECLARE @VenueCategoryCatId INT;
SELECT @VenueCategoryCatId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'VenueCategory';

IF @VenueCategoryCatId IS NULL
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate)
    VALUES ('VenueCategory', 'Venue Category', 1, 'Admin', GETDATE());
    SET @VenueCategoryCatId = SCOPE_IDENTITY();
    PRINT 'Created VenueCategory category.';
END

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueCategoryCatId AND Description = 'Indoor')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueCategoryCatId, 'Indoor', 'indoor', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueCategoryCatId AND Description = 'Outdoor')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueCategoryCatId, 'Outdoor', 'outdoor', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueCategoryCatId AND Description = 'Hybrid')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueCategoryCatId, 'Hybrid', 'hybrid', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueCategoryCatId AND Description = 'Rooftop')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueCategoryCatId, 'Rooftop', 'rooftop', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueCategoryCatId AND Description = 'Banquet Hall')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueCategoryCatId, 'Banquet Hall', 'banquet_hall', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueCategoryCatId AND Description = 'Hotel / Resort')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueCategoryCatId, 'Hotel / Resort', 'hotel_resort', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueCategoryCatId AND Description = 'Sports Stadium')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueCategoryCatId, 'Sports Stadium', 'sports_stadium', 1, 'Admin', GETDATE());

IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @VenueCategoryCatId AND Description = 'Conference Center')
    INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
    VALUES (@VenueCategoryCatId, 'Conference Center', 'conference_center', 1, 'Admin', GETDATE());

PRINT 'Step 4 complete: VenueCategory values seeded.';
GO

-- ============================================================
-- STEP 5: Seed default master facilities
-- (EventId is always NULL for master entries - no per-event mapping)
-- ============================================================

DECLARE @FacilitySeedList TABLE (FacilityName NVARCHAR(200));
INSERT INTO @FacilitySeedList VALUES
    ('Wi-Fi'), ('Parking'), ('Wheelchair Access'), ('Air Conditioning'),
    ('Audio / Sound System'), ('Projector / Screen'), ('Stage'), ('Green Room'),
    ('Catering Area'), ('Power Backup'), ('Restrooms'), ('Lodging Nearby'),
    ('Exhibition Space'), ('Security');

INSERT INTO Tracket_Master_Event_Master_Facility (FacilityName, EntryDate)
SELECT s.FacilityName, GETDATE()
FROM @FacilitySeedList s
WHERE s.FacilityName != ''
  AND NOT EXISTS (
    SELECT 1 FROM Tracket_Master_Event_Master_Facility
    WHERE FacilityName = s.FacilityName
);

PRINT 'Step 5 complete: Default facilities seeded.';
GO

-- ============================================================
-- STEP 6: Create/update Facility CRUD stored procedures
-- ============================================================

IF OBJECT_ID('dbo.USP_GetEventMasterFacilities', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_GetEventMasterFacilities;
GO

CREATE PROCEDURE dbo.USP_GetEventMasterFacilities
AS
BEGIN
    SET NOCOUNT ON;
    -- Master facilities only (EventId IS NULL = master list, not per-event)
    SELECT FacilityId, FacilityName, EntryBy, EntryDate, UpdateBy, UpdateDate 
    FROM Tracket_Master_Event_Master_Facility
    WHERE EventId IS NULL
    ORDER BY FacilityName ASC;
END;
GO

IF OBJECT_ID('dbo.USP_AddEditEventMasterFacility', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_AddEditEventMasterFacility;
GO

CREATE PROCEDURE dbo.USP_AddEditEventMasterFacility
    @FacilityId   BIGINT,
    @FacilityName NVARCHAR(200),
    @UserId       BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 FROM Tracket_Master_Event_Master_Facility 
        WHERE FacilityName = @FacilityName AND EventId IS NULL AND (@FacilityId = 0 OR FacilityId <> @FacilityId)
    )
    BEGIN
        SELECT 400 AS ResultStatus, 'Facility with this name already exists.' AS ResultMessage;
        RETURN;
    END

    IF @FacilityId = 0
    BEGIN
        -- Pure master facility insert (no EventId)
        INSERT INTO Tracket_Master_Event_Master_Facility (FacilityName, EntryBy, EntryDate)
        VALUES (@FacilityName, @UserId, GETDATE());
        
        DECLARE @NewId BIGINT = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Facility created successfully.' AS ResultMessage;
        SELECT FacilityId, FacilityName, EntryBy, EntryDate, UpdateBy, UpdateDate 
        FROM Tracket_Master_Event_Master_Facility WHERE FacilityId = @NewId;
    END
    ELSE
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM Tracket_Master_Event_Master_Facility WHERE FacilityId = @FacilityId)
        BEGIN
            SELECT 404 AS ResultStatus, 'Facility not found.' AS ResultMessage;
            RETURN;
        END

        UPDATE Tracket_Master_Event_Master_Facility
        SET FacilityName = @FacilityName, UpdateBy = @UserId, UpdateDate = GETDATE()
        WHERE FacilityId = @FacilityId;

        SELECT 200 AS ResultStatus, 'Facility updated successfully.' AS ResultMessage;
        SELECT FacilityId, FacilityName, EntryBy, EntryDate, UpdateBy, UpdateDate 
        FROM Tracket_Master_Event_Master_Facility WHERE FacilityId = @FacilityId;
    END
END;
GO

IF OBJECT_ID('dbo.USP_DeleteEventMasterFacility', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_DeleteEventMasterFacility;
GO

CREATE PROCEDURE dbo.USP_DeleteEventMasterFacility
    @FacilityId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_Event_Master_Facility WHERE FacilityId = @FacilityId)
    BEGIN
        SELECT 404 AS ResultStatus, 'Facility not found.' AS ResultMessage;
        RETURN;
    END

    DELETE FROM Tracket_Master_Event_Master_Facility WHERE FacilityId = @FacilityId;
    SELECT 200 AS ResultStatus, 'Facility deleted successfully.' AS ResultMessage;
END;
GO

PRINT 'Step 6 complete: Facility CRUD stored procedures created.';
GO

PRINT '=== All Setup Complete! ===';
GO
