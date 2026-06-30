-- Migration to add Step 1 & Step 2 fields and PublicId (GUID) columns to existing tables
USE EVENT_Master;
GO

SET NOCOUNT ON;

-- 1. Alter Tracket_Master_Event table
IF COL_LENGTH('dbo.Tracket_Master_Event', 'PublicId') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD PublicId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID();
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'Tagline') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD Tagline NVARCHAR(300) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'Purpose') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD Purpose NVARCHAR(100) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'TargetAudience') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD TargetAudience NVARCHAR(300) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'DateTimeMode') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD DateTimeMode NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'Timezone') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD Timezone NVARCHAR(100) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'DurationDays') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD DurationDays INT NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'DurationHours') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD DurationHours INT NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'DurationMinutes') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD DurationMinutes INT NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'AllDay') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD AllDay BIT NOT NULL DEFAULT 0;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'ShowCountdown') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD ShowCountdown BIT NOT NULL DEFAULT 1;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'VisibilityStartDate') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD VisibilityStartDate NVARCHAR(40) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'VisibilityStartTime') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD VisibilityStartTime NVARCHAR(40) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'SetupStartTime') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD SetupStartTime NVARCHAR(40) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'TeardownEndTime') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD TeardownEndTime NVARCHAR(40) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'RecurrenceFrequency') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD RecurrenceFrequency NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'RecurrenceInterval') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD RecurrenceInterval INT NULL;
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event', 'RecurrenceEndDate') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD RecurrenceEndDate NVARCHAR(40) NULL;
END
GO


-- 2. Alter Tracket_Master_Event_Slot table
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'PublicId') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD PublicId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID();
END
GO
