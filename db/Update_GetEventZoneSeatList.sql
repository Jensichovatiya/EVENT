-- ============================================================
-- SQL Script: Update USP_GetEventZoneSeatList
-- Joins Tracket_Master_Asset to return AssetName for seats.
-- ============================================================
USE EVENT_Master;
GO

IF OBJECT_ID('dbo.USP_GetEventZoneSeatList', 'P') IS NOT NULL
BEGIN
    EXEC('
    ALTER PROCEDURE dbo.USP_GetEventZoneSeatList
        @ZoneId BIGINT,
        @EventId BIGINT = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        SELECT S.*, A.AssetId, AST.AssetName
        FROM Tracket_Master_Event_Zone_Seat S WITH (NOLOCK)
        LEFT JOIN Tracket_Master_Event_Zone_Asset A WITH (NOLOCK) ON S.ZoneAssetId = A.ZoneAssetId
        LEFT JOIN Tracket_Master_Asset AST WITH (NOLOCK) ON A.AssetId = AST.AssetId
        WHERE S.ZoneId = @ZoneId 
          AND (S.EventId = @EventId OR @EventId IS NULL OR @EventId = 0)
          AND S.IsDeleted = 0;
    END;
    ')
    PRINT 'Updated USP_GetEventZoneSeatList stored procedure.';
END
GO
