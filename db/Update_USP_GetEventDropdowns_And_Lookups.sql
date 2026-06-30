USE EVENT_Master;
GO

-- 1. Seed missing master values
-- Add 'Limited' to ACCESSIBILITY
DECLARE @AccessibilityCatId INT;
SELECT @AccessibilityCatId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'ACCESSIBILITY';
IF @AccessibilityCatId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @AccessibilityCatId AND Description = 'Limited')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, IsActive, CreatedBy, CreatedDate, CreatedFrom)
        VALUES (@AccessibilityCatId, 'Limited', 1, 'system', GETDATE(), 'Migration');
END

-- Add missing shapes to SHAPETYPE
DECLARE @ShapeCatId INT;
SELECT @ShapeCatId = CategoryId FROM Tracket_Master_GeneralMasterCategory WHERE DDL_ID = 'SHAPETYPE';
IF @ShapeCatId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @ShapeCatId AND Description = 'Triangle')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, IsActive, CreatedBy, CreatedDate, CreatedFrom)
        VALUES (@ShapeCatId, 'Triangle', 1, 'system', GETDATE(), 'Migration');

    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @ShapeCatId AND Description = 'Hexagon')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, IsActive, CreatedBy, CreatedDate, CreatedFrom)
        VALUES (@ShapeCatId, 'Hexagon', 1, 'system', GETDATE(), 'Migration');

    IF NOT EXISTS (SELECT 1 FROM Tracket_Master_GeneralMasterValue WHERE CategoryId = @ShapeCatId AND Description = 'Custom')
        INSERT INTO Tracket_Master_GeneralMasterValue (CategoryId, Description, IsActive, CreatedBy, CreatedDate, CreatedFrom)
        VALUES (@ShapeCatId, 'Custom', 1, 'system', GETDATE(), 'Migration');
END
GO

-- 2. Alter USP_GetEventDropdowns to include Component Category (Table 29)
ALTER PROCEDURE [dbo].[USP_GetEventDropdowns]
    @EventId BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- ResultStatus
    SELECT 200 AS ResultStatus, 'Dropdowns fetched successfully' AS ResultMessage;

    -- Currencies Table (1)
    SELECT CurrencyId AS Value, Code AS Code, Name AS Label, Symbol AS Symbol 
    FROM Tracket_Master_Settings_Currencies 
    WHERE IsDeleted = 0;

    -- ListingTypes Table (2)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ListingType' AND V.IsActive = 1;

    -- BookingTypes Table (3)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'BookingType' AND V.IsActive = 1;

    -- EventTypes Table (4)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'EventType' AND V.IsActive = 1;

    -- ZoneTypes Table (5)
    SELECT V.Description AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ZoneType' AND V.IsActive = 1;

    -- GateTypes Table (6)
    SELECT V.Description AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'GateType' AND V.IsActive = 1;

    -- EntryGates Table (7)
    SELECT EntryGateId AS Value, GateName AS Label
    FROM Tracket_Master_Event_Entry_Gate
    WHERE EventId = @EventId AND IsDeleted = 0;

    -- Timezones Table (8)
    SELECT V.AdditionalField AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'Timezone' AND V.IsActive = 1;

    -- VenueTypes Table (9)
    SELECT V.AdditionalField AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'VenueType' AND V.IsActive = 1;

    -- VenueCategories Table (10)
    SELECT V.AdditionalField AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'VenueCategory' AND V.IsActive = 1;

    -- Employee Count Table (11)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'EMPLOYEE_COUNT' AND V.IsActive = 1;

    -- Industry Table (12)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'INDUSTRY' AND V.IsActive = 1;

    -- Business Type Table (13)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'BUSINESS_TYPE' AND V.IsActive = 1;

    -- Organizer Type Table (14)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ORGANIZER_TYPE' AND V.IsActive = 1;

    -- Ticket Category Table (15)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'TICKET_CATEGORY' AND V.IsActive = 1;

    -- Add-On Required Table (16)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ADDON_REQUIRED' AND V.IsActive = 1;

    -- Calculation Type Table (17)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'CALCULATION_TYPE' AND V.IsActive = 1;

    -- Charge To Table (18)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'CHARGE_TO' AND V.IsActive = 1;

    -- Taxes Table (19)
    SELECT 
        TaxId AS Value,
        TaxName + ' (' + CAST(CAST(TaxPercentage AS FLOAT) AS VARCHAR) + '%)' AS Label
    FROM Tracket_Master_Tax
    WHERE IsActive = 1 AND IsDeleted = 0;

    -- PassIncludes Table (20)
    SELECT V.ValueId AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'PASS_INCLUDE' AND V.IsActive = 1;

    -- RepeatsConfig Table (21)
    SELECT V.AdditionalField AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'REPEATS_CONFIG' AND V.IsActive = 1;

    -- Event Zones Table (22)
    SELECT
        ZoneId AS Value,
        ZoneName AS Label
    FROM Tracket_Master_Event_Zone
    WHERE IsDeleted = 0 AND IsActive = 1
    ORDER BY SortOrder, ZoneName;

    -- ArrangementTypes Table (23)
    SELECT V.Description AS Value, V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ArrangementType' AND V.IsActive = 1;

    -- Bookable As Table (24)
    SELECT
        V.ValueId AS Value,
        V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'BOOKABLEAS' AND V.IsActive = 1;

    -- Accessibility Table (25)
    SELECT
        V.ValueId AS Value,
        V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'ACCESSIBILITY' AND V.IsActive = 1;

    -- Shape Type Table (26)
    SELECT
        V.ValueId AS Value,
        V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'SHAPETYPE' AND V.IsActive = 1;

    -- Currency Table (27)
    SELECT
        V.ValueId AS Value,
        V.Description AS Label,
        V.AdditionalField AS Symbol
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'CURRENCY' AND V.IsActive = 1;

    -- Label Position Table (28)
    SELECT
        V.ValueId AS Value,
        V.Description AS Label
    FROM Tracket_Master_GeneralMasterValue V
    INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
    WHERE C.DDL_ID = 'LABELPOSITION' AND V.IsActive = 1;

    -- Component Categories Table (29)
    SELECT
        CategoryId AS Value,
        CategoryName AS Label
    FROM Tracket_Master_Component_Category
    WHERE IsActive = 1 AND IsDeleted = 0;

END;
GO

-- 3. Alter USP_AddEditComponent to resolve strings to IDs and support ID fields
ALTER PROCEDURE [dbo].[USP_AddEditComponent]
    @JsonData NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE
        @ComponentId BIGINT,
        @ComponentName NVARCHAR(200),
        @ComponentCode NVARCHAR(50),
        @CategoryId BIGINT,
        @Description NVARCHAR(1000),
        @IconUrl NVARCHAR(500),

        @IsBookable BIT,
        @BookableAsId BIGINT,

        @AccessibilityId BIGINT,
        @AccessTypeId BIGINT,

        @ShapeTypeId BIGINT,

        @Width DECIMAL(18,2),
        @Height DECIMAL(18,2),
        @RotationAngle DECIMAL(18,2),

        @BackgroundColor NVARCHAR(20),
        @BorderColor NVARCHAR(20),
        @BorderWidth DECIMAL(18,2),
        @Opacity DECIMAL(5,2),

        @CurrencyId BIGINT,
        @DefaultBookingPrice DECIMAL(18,2),

        @SnapToGrid BIT,
        @IsStackable BIT,
        @IsMovable BIT,
        @IsResizable BIT,

        @DefaultLabel NVARCHAR(100),
        @LabelPositionId BIGINT,
        @ShowLabel BIT,

        @ZIndex INT,
        @Notes NVARCHAR(1000),

        @CreatedBy NVARCHAR(256),
        @CreatedFrom NVARCHAR(100),
        @UpdatedBy NVARCHAR(256),
        @UpdatedFrom NVARCHAR(100),

        -- String inputs from JSON for resolution
        @Category NVARCHAR(100),
        @Shape NVARCHAR(100),
        @BookableAs NVARCHAR(100),
        @Accessibility NVARCHAR(100),
        @AccessType NVARCHAR(100),
        @Currency NVARCHAR(100),
        @LabelPosition NVARCHAR(100);

    SELECT
        @ComponentId = ComponentId,
        @ComponentName = ComponentName,
        @ComponentCode = ComponentCode,
        @CategoryId = CategoryId,
        @Description = Description,
        @IconUrl = IconUrl,

        @IsBookable = IsBookable,
        @BookableAsId = BookableAsId,

        @AccessibilityId = AccessibilityId,
        @AccessTypeId = AccessTypeId,

        @ShapeTypeId = ShapeTypeId,

        @Width = Width,
        @Height = Height,
        @RotationAngle = RotationAngle,

        @BackgroundColor = BackgroundColor,
        @BorderColor = BorderColor,
        @BorderWidth = BorderWidth,
        @Opacity = Opacity,

        @CurrencyId = CurrencyId,
        @DefaultBookingPrice = DefaultBookingPrice,

        @SnapToGrid = SnapToGrid,
        @IsStackable = IsStackable,
        @IsMovable = IsMovable,
        @IsResizable = IsResizable,

        @DefaultLabel = DefaultLabel,
        @LabelPositionId = LabelPositionId,
        @ShowLabel = ShowLabel,

        @ZIndex = ZIndex,
        @Notes = Notes,

        @CreatedBy = CreatedBy,
        @CreatedFrom = CreatedFrom,
        @UpdatedBy = UpdatedBy,
        @UpdatedFrom = UpdatedFrom,

        -- Extract strings
        @Category = Category,
        @Shape = Shape,
        @BookableAs = BookableAs,
        @Accessibility = Accessibility,
        @AccessType = AccessType,
        @Currency = Currency,
        @LabelPosition = LabelPosition

    FROM OPENJSON(@JsonData)
    WITH
    (
        ComponentId BIGINT,
        ComponentName NVARCHAR(200),
        ComponentCode NVARCHAR(50),
        CategoryId BIGINT,
        Description NVARCHAR(1000),
        IconUrl NVARCHAR(500),

        IsBookable BIT '$.AllowBooking',
        BookableAsId BIGINT,

        AccessibilityId BIGINT,
        AccessTypeId BIGINT,

        ShapeTypeId BIGINT,

        Width DECIMAL(18,2) '$.DefaultWidth',
        Height DECIMAL(18,2) '$.DefaultHeight',
        RotationAngle DECIMAL(18,2) '$.Rotation',

        BackgroundColor NVARCHAR(20) '$.DefaultColor',
        BorderColor NVARCHAR(20),
        BorderWidth DECIMAL(18,2),
        Opacity DECIMAL(5,2),

        CurrencyId BIGINT,
        DefaultBookingPrice DECIMAL(18,2) '$.DefaultPrice',

        SnapToGrid BIT,
        IsStackable BIT '$.Stackable',
        IsMovable BIT '$.Movable',
        IsResizable BIT '$.Resizable',

        DefaultLabel NVARCHAR(100),
        LabelPositionId BIGINT,
        ShowLabel BIT,

        ZIndex INT,
        Notes NVARCHAR(1000),

        CreatedBy NVARCHAR(256),
        CreatedFrom NVARCHAR(100),
        UpdatedBy NVARCHAR(256),
        UpdatedFrom NVARCHAR(100),

        Category NVARCHAR(100),
        Shape NVARCHAR(100),
        BookableAs NVARCHAR(100),
        Accessibility NVARCHAR(100),
        AccessType NVARCHAR(100),
        Currency NVARCHAR(100),
        LabelPosition NVARCHAR(100)
    );

    -- RESOLUTIONS FOR STRINGS TO IDS
    -- 1. CategoryId
    IF ISNULL(@CategoryId, 0) = 0 AND @Category IS NOT NULL AND @Category <> ''
    BEGIN
        SELECT TOP 1 @CategoryId = CategoryId 
        FROM Tracket_Master_Component_Category 
        WHERE CategoryName = @Category AND IsDeleted = 0;
    END

    -- 2. ShapeTypeId
    IF ISNULL(@ShapeTypeId, 0) = 0 AND @Shape IS NOT NULL AND @Shape <> ''
    BEGIN
        SELECT TOP 1 @ShapeTypeId = V.ValueId 
        FROM Tracket_Master_GeneralMasterValue V
        INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
        WHERE C.DDL_ID = 'SHAPETYPE' AND V.Description = @Shape;
    END

    -- 3. BookableAsId
    IF ISNULL(@BookableAsId, 0) = 0 AND @BookableAs IS NOT NULL AND @BookableAs <> ''
    BEGIN
        SELECT TOP 1 @BookableAsId = V.ValueId 
        FROM Tracket_Master_GeneralMasterValue V
        INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
        WHERE C.DDL_ID = 'BOOKABLEAS' AND V.Description = @BookableAs;
    END

    -- 4. AccessibilityId
    IF ISNULL(@AccessibilityId, 0) = 0 AND @Accessibility IS NOT NULL AND @Accessibility <> ''
    BEGIN
        SELECT TOP 1 @AccessibilityId = V.ValueId 
        FROM Tracket_Master_GeneralMasterValue V
        INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
        WHERE C.DDL_ID = 'ACCESSIBILITY' AND V.Description = @Accessibility;
    END

    -- 5. AccessTypeId (User requested AccessType maps to ListingType general master)
    IF ISNULL(@AccessTypeId, 0) = 0 AND @AccessType IS NOT NULL AND @AccessType <> ''
    BEGIN
        SELECT TOP 1 @AccessTypeId = V.ValueId 
        FROM Tracket_Master_GeneralMasterValue V
        INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
        WHERE C.DDL_ID = 'ListingType' AND V.Description = @AccessType;
    END

    -- 6. CurrencyId (Resolve from Code like 'INR' in Settings_Currencies)
    IF ISNULL(@CurrencyId, 0) = 0 AND @Currency IS NOT NULL AND @Currency <> ''
    BEGIN
        SELECT TOP 1 @CurrencyId = CurrencyId 
        FROM Tracket_Master_Settings_Currencies 
        WHERE Code = @Currency AND IsDeleted = 0;
    END

    -- 7. LabelPositionId
    IF ISNULL(@LabelPositionId, 0) = 0 AND @LabelPosition IS NOT NULL AND @LabelPosition <> ''
    BEGIN
        SELECT TOP 1 @LabelPositionId = V.ValueId 
        FROM Tracket_Master_GeneralMasterValue V
        INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
        WHERE C.DDL_ID = 'LABELPOSITION' AND V.Description = @LabelPosition;
    END

    IF ISNULL(@ComponentId,0)=0
    BEGIN
        IF EXISTS
        (
            SELECT 1
            FROM Tracket_Master_Component
            WHERE ComponentName=@ComponentName
            AND IsDeleted=0
        )
        BEGIN
            SELECT 409 AS ResultStatus,
                   'Component already exists.' AS ResultMessage;
            RETURN;
        END

        INSERT INTO Tracket_Master_Component
        (
            ComponentRId,
            ComponentName,
            ComponentCode,
            CategoryId,
            Description,
            IconUrl,
            IsBookable,
            BookableAsId,
            AccessibilityId,
            AccessTypeId,
            ShapeTypeId,
            Width,
            Height,
            RotationAngle,
            BackgroundColor,
            BorderColor,
            BorderWidth,
            Opacity,
            CurrencyId,
            DefaultBookingPrice,
            SnapToGrid,
            IsStackable,
            IsMovable,
            IsResizable,
            DefaultLabel,
            LabelPositionId,
            ShowLabel,
            ZIndex,
            Notes,
            IsActive,
            IsDeleted,
            CreatedBy,
            CreatedDate,
            CreatedFrom
        )
        VALUES
        (
            NEWID(),
            @ComponentName,
            @ComponentCode,
            @CategoryId,
            @Description,
            @IconUrl,
            @IsBookable,
            @BookableAsId,
            @AccessibilityId,
            @AccessTypeId,
            @ShapeTypeId,
            @Width,
            @Height,
            @RotationAngle,
            @BackgroundColor,
            @BorderColor,
            @BorderWidth,
            @Opacity,
            @CurrencyId,
            @DefaultBookingPrice,
            @SnapToGrid,
            @IsStackable,
            @IsMovable,
            @IsResizable,
            @DefaultLabel,
            @LabelPositionId,
            @ShowLabel,
            @ZIndex,
            @Notes,
            1,
            0,
            @CreatedBy,
            GETDATE(),
            @CreatedFrom
        );

        SET @ComponentId = SCOPE_IDENTITY();

        SELECT 201 AS ResultStatus,
               'Component created successfully.' AS ResultMessage;
    END
    ELSE
    BEGIN
        UPDATE Tracket_Master_Component
        SET
            ComponentName=@ComponentName,
            ComponentCode=@ComponentCode,
            CategoryId=@CategoryId,
            Description=@Description,
            IconUrl=@IconUrl,
            IsBookable=@IsBookable,
            BookableAsId=@BookableAsId,
            AccessibilityId=@AccessibilityId,
            AccessTypeId=@AccessTypeId,
            ShapeTypeId=@ShapeTypeId,
            Width=@Width,
            Height=@Height,
            RotationAngle=@RotationAngle,
            BackgroundColor=@BackgroundColor,
            BorderColor=@BorderColor,
            BorderWidth=@BorderWidth,
            Opacity=@Opacity,
            CurrencyId=@CurrencyId,
            DefaultBookingPrice=@DefaultBookingPrice,
            SnapToGrid=@SnapToGrid,
            IsStackable=@IsStackable,
            IsMovable=@IsMovable,
            IsResizable=@IsResizable,
            DefaultLabel=@DefaultLabel,
            LabelPositionId=@LabelPositionId,
            ShowLabel=@ShowLabel,
            ZIndex=@ZIndex,
            Notes=@Notes,
            UpdatedBy=@UpdatedBy,
            UpdatedDate=GETDATE(),
            UpdatedFrom=@UpdatedFrom
        WHERE ComponentId=@ComponentId;

        SELECT 200 AS ResultStatus,
               'Component updated successfully.' AS ResultMessage;
    END

    -- Return full data mapped with strings
    SELECT
        C.*,
        Cat.CategoryName AS Category,
        V_Shape.Description AS Shape,
        V_Bookable.Description AS BookableAs,
        V_Access.Description AS Accessibility,
        V_AccessType.Description AS AccessType,
        V_LabelPos.Description AS LabelPosition,
        Curr.Code AS Currency
    FROM Tracket_Master_Component C
    LEFT JOIN Tracket_Master_Component_Category Cat ON C.CategoryId = Cat.CategoryId
    LEFT JOIN Tracket_Master_GeneralMasterValue V_Shape ON C.ShapeTypeId = V_Shape.ValueId
    LEFT JOIN Tracket_Master_GeneralMasterValue V_Bookable ON C.BookableAsId = V_Bookable.ValueId
    LEFT JOIN Tracket_Master_GeneralMasterValue V_Access ON C.AccessibilityId = V_Access.ValueId
    LEFT JOIN Tracket_Master_GeneralMasterValue V_AccessType ON C.AccessTypeId = V_AccessType.ValueId
    LEFT JOIN Tracket_Master_GeneralMasterValue V_LabelPos ON C.LabelPositionId = V_LabelPos.ValueId
    LEFT JOIN Tracket_Master_Settings_Currencies Curr ON C.CurrencyId = Curr.CurrencyId
    WHERE C.ComponentId = @ComponentId;
END;
GO

-- 4. Alter USP_GetAllComponent to output strings via joins
ALTER PROCEDURE [dbo].[USP_GetAllComponent]
(
    @SearchText NVARCHAR(200)=NULL,
    @PageNumber INT=1,
    @PageSize INT=20
)
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH ComponentData AS
    (
        SELECT
            C.*,
            Cat.CategoryName AS Category,
            V_Shape.Description AS Shape,
            V_Bookable.Description AS BookableAs,
            V_Access.Description AS Accessibility,
            V_AccessType.Description AS AccessType,
            V_LabelPos.Description AS LabelPosition,
            Curr.Code AS Currency,
            COUNT(*) OVER() AS TotalCount
        FROM Tracket_Master_Component C
        LEFT JOIN Tracket_Master_Component_Category Cat
            ON C.CategoryId = Cat.CategoryId
        LEFT JOIN Tracket_Master_GeneralMasterValue V_Shape
            ON C.ShapeTypeId = V_Shape.ValueId
        LEFT JOIN Tracket_Master_GeneralMasterValue V_Bookable
            ON C.BookableAsId = V_Bookable.ValueId
        LEFT JOIN Tracket_Master_GeneralMasterValue V_Access
            ON C.AccessibilityId = V_Access.ValueId
        LEFT JOIN Tracket_Master_GeneralMasterValue V_AccessType
            ON C.AccessTypeId = V_AccessType.ValueId
        LEFT JOIN Tracket_Master_GeneralMasterValue V_LabelPos
            ON C.LabelPositionId = V_LabelPos.ValueId
        LEFT JOIN Tracket_Master_Settings_Currencies Curr
            ON C.CurrencyId = Curr.CurrencyId
        WHERE C.IsDeleted = 0
        AND
        (
            @SearchText IS NULL
            OR C.ComponentName LIKE '%' + @SearchText + '%'
            OR C.ComponentCode LIKE '%' + @SearchText + '%'
        )
    )
    SELECT *
    FROM ComponentData
    ORDER BY ComponentId DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO
