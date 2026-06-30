-- ============================================================
-- USP_GetAvailableZones
-- Altered to get EventId from Tracket_Master_Event_Blueprint B
-- ============================================================
USE EVENT_Master;
GO

IF OBJECT_ID('dbo.USP_GetAvailableZones', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_GetAvailableZones;
GO

CREATE PROCEDURE dbo.USP_GetAvailableZones
    @EventId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT Z.ZoneId, Z.ZoneRId, Z.BlueprintId, B.EventId, Z.ZoneName, Z.ZoneCode, Z.ZoneType, Z.ColorCode, Z.Capacity, Z.[RowCount], Z.ColumnCount, Z.SeatPrice, Z.IsVIP, Z.IsReserved, Z.IsSeatSelectionAllowed, Z.EntryGateId
    FROM Tracket_Master_Event_Zone Z WITH (NOLOCK)
    INNER JOIN Tracket_Master_Event_Blueprint B WITH (NOLOCK) ON Z.BlueprintId = B.BlueprintId
    WHERE B.EventId = @EventId 
      AND Z.IsActive = 1 
      AND Z.IsDeleted = 0 
      AND B.IsDeleted = 0;
END;
GO

PRINT 'USP_GetAvailableZones altered successfully.';
GO
