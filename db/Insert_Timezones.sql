USE EVENT_Master;
GO

SET NOCOUNT ON;

-- 1. Ensure Timezone Category exists
DECLARE @CategoryId INT;
SELECT @CategoryId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'Timezone';

IF @CategoryId IS NULL
BEGIN
    INSERT INTO Tracket_Master_GeneralMasterCategory (DDL_ID, DisplayName, IsActive, CreatedBy, CreatedDate)
    VALUES ('Timezone', 'Timezone', 1, 'Admin', GETDATE());
    SET @CategoryId = SCOPE_IDENTITY();
    PRINT 'Inserted Timezone category with ID ' + CAST(@CategoryId AS NVARCHAR(10));
END
ELSE
BEGIN
    PRINT 'Timezone category already exists with ID ' + CAST(@CategoryId AS NVARCHAR(10));
END

-- 2. Insert timezone values
IF @CategoryId IS NOT NULL
BEGIN
    -- India Standard Time
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @CategoryId AND AdditionalField = 'Asia/Kolkata')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
        VALUES (@CategoryId, '(GMT+05:30) Asia/Kolkata – India Standard Time', 'Asia/Kolkata', 1, 'Admin', GETDATE());

    -- UTC
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @CategoryId AND AdditionalField = 'UTC')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
        VALUES (@CategoryId, '(GMT+00:00) UTC', 'UTC', 1, 'Admin', GETDATE());

    -- Dubai
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @CategoryId AND AdditionalField = 'Asia/Dubai')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
        VALUES (@CategoryId, '(GMT+04:00) Asia/Dubai', 'Asia/Dubai', 1, 'Admin', GETDATE());

    -- Singapore
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @CategoryId AND AdditionalField = 'Asia/Singapore')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
        VALUES (@CategoryId, '(GMT+08:00) Asia/Singapore', 'Asia/Singapore', 1, 'Admin', GETDATE());

    -- New York
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @CategoryId AND AdditionalField = 'America/New_York')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
        VALUES (@CategoryId, '(GMT-05:00) America/New_York', 'America/New_York', 1, 'Admin', GETDATE());

    -- Los Angeles
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @CategoryId AND AdditionalField = 'America/Los_Angeles')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
        VALUES (@CategoryId, '(GMT-08:00) America/Los_Angeles', 'America/Los_Angeles', 1, 'Admin', GETDATE());

    -- London
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @CategoryId AND AdditionalField = 'Europe/London')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, AdditionalField, IsActive, CreatedBy, CreatedDate)
        VALUES (@CategoryId, '(GMT+01:00) Europe/London', 'Europe/London', 1, 'Admin', GETDATE());

    PRINT 'Timezone values populated.';
END
GO
