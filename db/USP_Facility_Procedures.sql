USE EVENT_Master;
GO

-- 1. USP_GetEventMasterFacilities
IF OBJECT_ID('dbo.USP_GetEventMasterFacilities', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_GetEventMasterFacilities;
GO

CREATE PROCEDURE dbo.USP_GetEventMasterFacilities
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        FacilityId,
        EventId,
        FacilityName,
        EntryBy,
        EntryDate,
        UpdateBy,
        UpdateDate
    FROM Tracket_Master_Event_Master_Facility
    WHERE EventId IS NULL
    ORDER BY FacilityName ASC;
END;
GO

-- 2. USP_AddEditEventMasterFacility
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
    
    -- Check if facility name already exists (excluding current ID on edit)
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
        INSERT INTO Tracket_Master_Event_Master_Facility (EventId, FacilityName, EntryBy, EntryDate)
        VALUES (NULL, @FacilityName, @UserId, GETDATE());
        
        DECLARE @NewId BIGINT = SCOPE_IDENTITY();
        SELECT 201 AS ResultStatus, 'Facility created successfully.' AS ResultMessage;
        
        -- Return details
        SELECT FacilityId, EventId, FacilityName, EntryBy, EntryDate, UpdateBy, UpdateDate 
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
        SET FacilityName = @FacilityName,
            UpdateBy = @UserId,
            UpdateDate = GETDATE()
        WHERE FacilityId = @FacilityId;

        SELECT 200 AS ResultStatus, 'Facility updated successfully.' AS ResultMessage;
        
        -- Return details
        SELECT FacilityId, EventId, FacilityName, EntryBy, EntryDate, UpdateBy, UpdateDate 
        FROM Tracket_Master_Event_Master_Facility WHERE FacilityId = @FacilityId;
    END
END;
GO

-- 3. USP_DeleteEventMasterFacility
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

PRINT 'Facilities stored procedures created successfully.';
GO
