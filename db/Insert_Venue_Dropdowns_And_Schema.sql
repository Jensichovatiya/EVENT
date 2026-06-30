USE EVENT_Master;
GO

SET NOCOUNT ON;

-- 1. Ensure VenueType Category and Values exist
DECLARE @VenueTypeCatId INT;
SELECT @VenueTypeCatId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'VenueType';

IF @VenueTypeCatId IS NULL
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate)
    VALUES ('VenueType', 'Venue Type', 1, 'Admin', GETDATE());
    SET @VenueTypeCatId = SCOPE_IDENTITY();
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


-- 2. Ensure VenueCategory Category and Values exist
DECLARE @VenueCategoryCatId INT;
SELECT @VenueCategoryCatId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'VenueCategory';

IF @VenueCategoryCatId IS NULL
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate)
    VALUES ('VenueCategory', 'Venue Category', 1, 'Admin', GETDATE());
    SET @VenueCategoryCatId = SCOPE_IDENTITY();
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


-- 3. Add Columns to Tracket_Master_Event_Location table
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'VenueType') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD VenueType NVARCHAR(100) NULL;
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'VenueCategory') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD VenueCategory NVARCHAR(100) NULL;
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'Facilities') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD Facilities NVARCHAR(MAX) NULL;
END


-- 4. Create Tracket_Master_Event_Master_Facility Table
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
END
GO

PRINT 'Venue master category tables altered, columns added, and facilities table created successfully.';
GO
