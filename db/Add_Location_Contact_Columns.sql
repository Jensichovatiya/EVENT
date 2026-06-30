USE EVENT_Master;
GO

SET NOCOUNT ON;

-- Add Capacity column
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'Capacity') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD Capacity INT NULL;
    PRINT 'Added Capacity column.';
END

-- Add ContactPerson column
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactPerson') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactPerson NVARCHAR(200) NULL;
    PRINT 'Added ContactPerson column.';
END

-- Add ContactDesignation column
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactDesignation') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactDesignation NVARCHAR(200) NULL;
    PRINT 'Added ContactDesignation column.';
END

-- Add ContactPhoneCode column
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactPhoneCode') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactPhoneCode NVARCHAR(10) NULL;
    PRINT 'Added ContactPhoneCode column.';
END

-- Add ContactPhone column
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactPhone') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactPhone NVARCHAR(50) NULL;
    PRINT 'Added ContactPhone column.';
END

-- Add ContactEmail column
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'ContactEmail') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD ContactEmail NVARCHAR(200) NULL;
    PRINT 'Added ContactEmail column.';
END

-- Add Notes column
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'Notes') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD Notes NVARCHAR(500) NULL;
    PRINT 'Added Notes column.';
END

-- Add OtherFacility column
IF COL_LENGTH('dbo.Tracket_Master_Event_Location', 'OtherFacility') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Location ADD OtherFacility NVARCHAR(200) NULL;
    PRINT 'Added OtherFacility column.';
END
GO

PRINT 'Location columns updated successfully.';
GO
