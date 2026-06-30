
ALTER   PROCEDURE USP_InsertEvent_PromoCode
(
      @PromoCode_PublicId UNIQUEIDENTIFIER OUTPUT
    , @HeaderJson NVARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF ISJSON(@HeaderJson) = 0
    BEGIN
        SELECT
            400 AS StatusCode,
            'Invalid JSON' AS StatusMessage;
        RETURN;
    END

    IF JSON_VALUE(@HeaderJson, '$[1]') IS NOT NULL
    BEGIN
        SELECT
            400 AS StatusCode,
            'Single JSON object only' AS StatusMessage;
        RETURN;
    END

    BEGIN TRY

        DECLARE
              @EventId BIGINT
            , @PromoCode NVARCHAR(100)
            , @DiscountTypeId BIGINT
            , @AppliesToId BIGINT
            , @DiscountValue DECIMAL(18,2)
            , @UsageLimit INT
            , @MinPurchaseAmount DECIMAL(18,2)
            , @MaxDiscountAmount DECIMAL(18,2)
            , @ValidFrom DATETIME
            , @ValidUntil DATETIME
            , @Description NVARCHAR(500)
            , @IsActive BIT
            , @CreatedBy NVARCHAR(100)
            , @CreatedFrom NVARCHAR(100);

        SELECT
              @PromoCode_PublicId = PublicId
            , @EventId = EventId
            , @PromoCode = PromoCode
            , @DiscountTypeId = DiscountTypeId
            , @AppliesToId = AppliesToId
            , @DiscountValue = DiscountValue
            , @UsageLimit = UsageLimit
            , @MinPurchaseAmount = MinPurchaseAmount
            , @MaxDiscountAmount = MaxDiscountAmount
            , @ValidFrom = ValidFrom
            , @ValidUntil = ValidUntil
            , @Description = Description
            , @IsActive = IsActive
            , @CreatedBy = CreatedBy
            , @CreatedFrom = CreatedFrom
        FROM OPENJSON(@HeaderJson)
        WITH
        (
              PublicId UNIQUEIDENTIFIER '$.PublicId'
            , EventId BIGINT '$.EventId'
            , PromoCode NVARCHAR(100) '$.PromoCode'
            , DiscountTypeId BIGINT '$.DiscountTypeId'
            , AppliesToId BIGINT '$.AppliesToId'
            , DiscountValue DECIMAL(18,2) '$.DiscountValue'
            , UsageLimit INT '$.UsageLimit'
            , MinPurchaseAmount DECIMAL(18,2) '$.MinPurchaseAmount'
            , MaxDiscountAmount DECIMAL(18,2) '$.MaxDiscountAmount'
            , ValidFrom DATETIME '$.ValidFrom'
            , ValidUntil DATETIME '$.ValidUntil'
            , Description NVARCHAR(500) '$.Description'
            , IsActive BIT '$.IsActive'
            , CreatedBy NVARCHAR(100) '$.CreatedBy'
            , CreatedFrom NVARCHAR(100) '$.CreatedFrom'
        );

        IF @PromoCode_PublicId IS NULL
            SET @PromoCode_PublicId = NEWID();

        IF EXISTS (
            SELECT 1 FROM Tracket_Master_Event_PromoCode 
            WHERE PromoCode = @PromoCode 
              AND EventId = @EventId 
              AND IsDeleted = 0 
              AND PublicId <> @PromoCode_PublicId
        )
        BEGIN
            SELECT
                400 AS StatusCode,
                'Promo Code already exists for this event.' AS StatusMessage;
            RETURN;
        END

        BEGIN TRANSACTION;

        INSERT INTO Tracket_Master_Event_PromoCode
        (
              PublicId
            , EventId
            , PromoCode
            , DiscountTypeId
            , AppliesToId
            , DiscountValue
            , UsageLimit
            , MinPurchaseAmount
            , MaxDiscountAmount
            , ValidFrom
            , ValidUntil
            , Description
            , IsActive
            , IsDeleted
            , CreatedBy
            , CreatedDate
            , CreatedFrom
        )
        VALUES
        (
              @PromoCode_PublicId
            , @EventId
            , @PromoCode
            , @DiscountTypeId
            , @AppliesToId
            , @DiscountValue
            , @UsageLimit
            , @MinPurchaseAmount
            , @MaxDiscountAmount
            , @ValidFrom
            , @ValidUntil
            , @Description
            , ISNULL(@IsActive,1)
            , 0
            , @CreatedBy
            , GETDATE()
            , @CreatedFrom
        );

        COMMIT TRANSACTION;

        SELECT
            201 AS StatusCode,
            'Promo Code created successfully' AS StatusMessage;

        SELECT
              P.*
            , DT.Description AS DiscountTypeName
            , ATY.Description AS AppliesToName
        FROM Tracket_Master_Event_PromoCode P
        LEFT JOIN Tracket_Master_GeneralMasterValue DT
            ON P.DiscountTypeId = DT.ValueId
        LEFT JOIN Tracket_Master_GeneralMasterValue ATY
            ON P.AppliesToId = ATY.ValueId
        WHERE P.PublicId = @PromoCode_PublicId;

    END TRY
    BEGIN CATCH

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SELECT
            ERROR_NUMBER() AS StatusCode,
            ERROR_MESSAGE() AS StatusMessage;

    END CATCH
END

