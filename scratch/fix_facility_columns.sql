USE EVENT_Master;
GO

IF COL_LENGTH('dbo.Tracket_Master_Event_Master_Facility', 'EventId') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Master_Facility ADD EventId BIGINT NULL;
    PRINT 'Added EventId column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Master_Facility', 'EntryBy') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Master_Facility ADD EntryBy BIGINT NULL;
    PRINT 'Added EntryBy column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Master_Facility', 'EntryDate') IS NULL
BEGIN
    -- Add column with default constraint in a single operation
    ALTER TABLE dbo.Tracket_Master_Event_Master_Facility ADD EntryDate DATETIME NOT NULL DEFAULT GETDATE();
    PRINT 'Added EntryDate column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Master_Facility', 'UpdateBy') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Master_Facility ADD UpdateBy BIGINT NULL;
    PRINT 'Added UpdateBy column.';
END

IF COL_LENGTH('dbo.Tracket_Master_Event_Master_Facility', 'UpdateDate') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event_Master_Facility ADD UpdateDate DATETIME NULL;
    PRINT 'Added UpdateDate column.';
END
GO
