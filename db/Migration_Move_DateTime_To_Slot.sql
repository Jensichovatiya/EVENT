-- ============================================================
-- Migration: Move Date & Time fields OUT of Tracket_Master_Event
--            and keep them ONLY in Tracket_Master_Event_Slot
--
-- Fields removed from Tracket_Master_Event:
--   DateTimeMode, Timezone, DurationDays, DurationHours, DurationMinutes,
--   AllDay, ShowCountdown, VisibilityStartDate, VisibilityStartTime,
--   SetupStartTime, TeardownEndTime,
--   RecurrenceFrequency, RecurrenceInterval, RecurrenceEndDate
--
-- These are already present in Tracket_Master_Event_Slot
-- (added by Migration_Slots_Full.sql).
-- Run AFTER Migration_Slots_Full.sql.
-- ============================================================
USE EVENT_Master;
GO

SET NOCOUNT ON;

-- Helper: drop a DEFAULT constraint by column name (safe to call even if missing)
DECLARE @sql NVARCHAR(1000);

-- DateTimeMode
IF COL_LENGTH('dbo.Tracket_Master_Event', 'DateTimeMode') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'DateTimeMode';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN DateTimeMode;
    PRINT 'Removed DateTimeMode from Tracket_Master_Event';
END
GO

-- Timezone
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'Timezone') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'Timezone';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN Timezone;
    PRINT 'Removed Timezone from Tracket_Master_Event';
END
GO

-- DurationDays
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'DurationDays') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'DurationDays';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN DurationDays;
    PRINT 'Removed DurationDays from Tracket_Master_Event';
END
GO

-- DurationHours
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'DurationHours') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'DurationHours';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN DurationHours;
    PRINT 'Removed DurationHours from Tracket_Master_Event';
END
GO

-- DurationMinutes
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'DurationMinutes') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'DurationMinutes';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN DurationMinutes;
    PRINT 'Removed DurationMinutes from Tracket_Master_Event';
END
GO

-- AllDay
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'AllDay') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'AllDay';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN AllDay;
    PRINT 'Removed AllDay from Tracket_Master_Event';
END
GO

-- ShowCountdown
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'ShowCountdown') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'ShowCountdown';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN ShowCountdown;
    PRINT 'Removed ShowCountdown from Tracket_Master_Event';
END
GO

-- VisibilityStartDate
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'VisibilityStartDate') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'VisibilityStartDate';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN VisibilityStartDate;
    PRINT 'Removed VisibilityStartDate from Tracket_Master_Event';
END
GO

-- VisibilityStartTime
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'VisibilityStartTime') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'VisibilityStartTime';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN VisibilityStartTime;
    PRINT 'Removed VisibilityStartTime from Tracket_Master_Event';
END
GO

-- SetupStartTime
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'SetupStartTime') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'SetupStartTime';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN SetupStartTime;
    PRINT 'Removed SetupStartTime from Tracket_Master_Event';
END
GO

-- TeardownEndTime
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'TeardownEndTime') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'TeardownEndTime';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN TeardownEndTime;
    PRINT 'Removed TeardownEndTime from Tracket_Master_Event';
END
GO

-- RecurrenceFrequency
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'RecurrenceFrequency') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'RecurrenceFrequency';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN RecurrenceFrequency;
    PRINT 'Removed RecurrenceFrequency from Tracket_Master_Event';
END
GO

-- RecurrenceInterval
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'RecurrenceInterval') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'RecurrenceInterval';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN RecurrenceInterval;
    PRINT 'Removed RecurrenceInterval from Tracket_Master_Event';
END
GO

-- RecurrenceEndDate
DECLARE @sql NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'RecurrenceEndDate') IS NOT NULL
BEGIN
    SELECT @sql = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'RecurrenceEndDate';
    IF @sql IS NOT NULL EXEC(@sql); SET @sql = NULL;
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN RecurrenceEndDate;
    PRINT 'Removed RecurrenceEndDate from Tracket_Master_Event';
END
GO

-- StartDate
DECLARE @sql_sd NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'StartDate') IS NOT NULL
BEGIN
    SELECT @sql_sd = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'StartDate';
    IF @sql_sd IS NOT NULL EXEC(@sql_sd);
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN StartDate;
    PRINT 'Removed StartDate from Tracket_Master_Event';
END
GO

-- EndDate
DECLARE @sql_ed NVARCHAR(1000);
IF COL_LENGTH('dbo.Tracket_Master_Event', 'EndDate') IS NOT NULL
BEGIN
    SELECT @sql_ed = 'ALTER TABLE dbo.Tracket_Master_Event DROP CONSTRAINT ' + dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID('dbo.Tracket_Master_Event') AND c.name = 'EndDate';
    IF @sql_ed IS NOT NULL EXEC(@sql_ed);
    ALTER TABLE dbo.Tracket_Master_Event DROP COLUMN EndDate;
    PRINT 'Removed EndDate from Tracket_Master_Event';
END
GO

-- EventDate (drop from slot table since StartDate and EndDate are now slot-specific)
IF COL_LENGTH('dbo.Tracket_Master_Event_Slot', 'EventDate') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Slot DROP COLUMN EventDate;
    PRINT 'Removed EventDate from Tracket_Master_Event_Slot';
END
GO

PRINT '=== Migration_Move_DateTime_To_Slot completed ===';
PRINT 'Tracket_Master_Event now has: EventName, Tagline, Purpose, TargetAudience, MetaJson ...';
PRINT 'Tracket_Master_Event_Slot now holds ALL date/time detail fields (including StartDate, EndDate, and excluding EventDate).';
GO
