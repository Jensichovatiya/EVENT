-- ============================================================
-- USP_GetEventZoneSeatList
-- Altered to support filtering by EventId
-- ============================================================
USE EVENT_Master;
GO

IF OBJECT_ID('dbo.USP_GetEventZoneSeatList', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_GetEventZoneSeatList;
GO

CREATE PROCEDURE dbo.USP_GetEventZoneSeatList
    @ZoneId BIGINT,
    @EventId BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT S.*, A.AssetId 
    FROM Tracket_Master_Event_Zone_Seat S WITH (NOLOCK)
    LEFT JOIN Tracket_Master_Event_Zone_Asset A WITH (NOLOCK) ON S.ZoneAssetId = A.ZoneAssetId
    WHERE S.ZoneId = @ZoneId 
      AND (S.EventId = @EventId OR @EventId IS NULL OR @EventId = 0)
      AND S.IsDeleted = 0;
END;
GO

PRINT 'USP_GetEventZoneSeatList altered successfully.';
GO
