-- ============================================================
-- Migration: Add full Step-2 Date & Time columns to
--            Tracket_Master_Event_Slot
-- Run once on EVENT_Master database.
-- All ALTER statements are guarded with COL_LENGTH checks so
-- they are safe to run multiple times.
-- ============================================================
USE EVENT_Master;
GO

SET NOCOUNT ON;

-- PublicId was already added in Migration_Step1_Step2.sql
-- but guard it here too for safety
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'PublicId') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD PublicId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID();
    PRINT 'Added PublicId';
END
GO

-- EventMode: 'single' or 'recurring'
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'EventMode') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD EventMode NVARCHAR(20) NULL;
    PRINT 'Added EventMode';
END
GO

-- Timezone
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'Timezone') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD Timezone NVARCHAR(100) NULL;
    PRINT 'Added Timezone';
END
GO

-- AllDay flag
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'AllDay') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD AllDay BIT NOT NULL DEFAULT 0;
    PRINT 'Added AllDay';
END
GO

-- ShowCountdown flag
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'ShowCountdown') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD ShowCountdown BIT NOT NULL DEFAULT 1;
    PRINT 'Added ShowCountdown';
END
GO

-- Setup / Teardown times
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'SetupStartTime') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD SetupStartTime NVARCHAR(10) NULL;
    PRINT 'Added SetupStartTime';
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'TeardownEndTime') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD TeardownEndTime NVARCHAR(10) NULL;
    PRINT 'Added TeardownEndTime';
END
GO

-- Visibility window
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'VisibilityStartDate') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD VisibilityStartDate DATE NULL;
    PRINT 'Added VisibilityStartDate';
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'VisibilityStartTime') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD VisibilityStartTime NVARCHAR(10) NULL;
    PRINT 'Added VisibilityStartTime';
END
GO

-- Duration columns (derived / stored for reporting)
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'DurationDays') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD DurationDays INT NULL;
    PRINT 'Added DurationDays';
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'DurationHours') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD DurationHours INT NULL;
    PRINT 'Added DurationHours';
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'DurationMinutes') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD DurationMinutes INT NULL;
    PRINT 'Added DurationMinutes';
END
GO

-- Recurrence columns (only meaningful when EventMode = 'recurring')
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'RecurrenceFrequency') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD RecurrenceFrequency NVARCHAR(20) NULL;
    PRINT 'Added RecurrenceFrequency';
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'RecurrenceInterval') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD RecurrenceInterval INT NULL DEFAULT 1;
    PRINT 'Added RecurrenceInterval';
END
GO

IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'RecurrenceEndDate') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD RecurrenceEndDate DATE NULL;
    PRINT 'Added RecurrenceEndDate';
END
GO

-- OccurrenceIndex: 0-based index within the recurring series (0 for single)
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'OccurrenceIndex') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD OccurrenceIndex INT NOT NULL DEFAULT 0;
    PRINT 'Added OccurrenceIndex';
END
GO

-- StartDate
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'StartDate') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD StartDate DATETIME NULL;
    PRINT 'Added StartDate to Tracket_Master_Event_Slot';
END
GO

-- EndDate
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'EndDate') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot ADD EndDate DATETIME NULL;
    PRINT 'Added EndDate to Tracket_Master_Event_Slot';
END
GO

PRINT 'Migration_Slots_Full completed.';
GO
