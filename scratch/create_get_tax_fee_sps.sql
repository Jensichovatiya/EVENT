CREATE OR ALTER PROCEDURE USP_GetAllEvent_Tax
(
    @EventId BIGINT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
          T.*
        , M.TaxName
        , M.TaxPercentage
        , M.TaxTypeId
    FROM Tracket_Master_Event_Tax T
    LEFT JOIN Tracket_Master_Tax M ON T.TaxId = M.TaxId
    WHERE T.EventId = @EventId
      AND T.IsDeleted = 0
    ORDER BY T.EventTaxId DESC;
END;
GO

CREATE OR ALTER PROCEDURE USP_GetAllEvent_Fee
(
    @EventId BIGINT
)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM Tracket_Master_Event_Fee
    WHERE EventId = @EventId
      AND IsDeleted = 0
    ORDER BY FeeId DESC;
END;
GO
