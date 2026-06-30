/* ===========================================================================
   EventPro 8-step "Create Event" wizard — backend persistence
   ---------------------------------------------------------------------------
   The React wizard sends every field through the EXISTING /api/events endpoint.
   - Scalar fields (title, slug, dates, venue, capacity, currency ...) already
     map to existing columns consumed by USP_AddEditEvent_Full.
   - The full rich draft (organizers, ticket types, passes, add-ons, promo
     codes, taxes, fees, payment settings, floor-plan components, branding) is
     serialized into the MetaJson field (already part of EventRequest and
     already passed to USP_AddEditEvent_Full as part of @JsonData).

   This script makes that data durable & queryable:
     1. Ensures a MetaJson column exists on the event header table.
     2. Creates normalized EventPro tables.
     3. USP_SaveEventPro_FromMeta  — shreds MetaJson into the normalized tables
        (call it at the end of USP_AddEditEvent_Full, or run standalone).
     4. USP_GetEventPro            — returns MetaJson + normalized rows for the
        edit screen to re-hydrate the wizard.

   NOTE: adjust @EventTable below if your event header table is not
   [Tracket_Master_Event]. Run on the EVENTMASTER database. Review before prod.
   =========================================================================== */

SET NOCOUNT ON;
GO

/* ---------------------------------------------------------------------------
   1) Ensure MetaJson column on the event header table
   --------------------------------------------------------------------------- */
IF COL_LENGTH('dbo.Tracket_Master_Event', 'MetaJson') IS NULL
BEGIN
    ALTER TABLE dbo.Tracket_Master_Event ADD MetaJson NVARCHAR(MAX) NULL;
END
GO

/* ---------------------------------------------------------------------------
   2) Normalized EventPro tables (idempotent)
   --------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.Tracket_Event_Organizer', 'U') IS NULL
CREATE TABLE dbo.Tracket_Event_Organizer (
    OrganizerId   BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId       BIGINT       NOT NULL,
    Name          NVARCHAR(300) NOT NULL,
    ContactPerson NVARCHAR(200) NULL,
    Email         NVARCHAR(200) NULL,
    Phone         NVARCHAR(50)  NULL,
    [Role]        NVARCHAR(50)  NULL,
    Website       NVARCHAR(300) NULL,
    About         NVARCHAR(MAX) NULL,
    IsPrimary     BIT          NOT NULL DEFAULT 0
);
GO

IF OBJECT_ID('dbo.Tracket_Event_TicketType', 'U') IS NULL
CREATE TABLE dbo.Tracket_Event_TicketType (
    TicketTypeId  BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId       BIGINT        NOT NULL,
    Name          NVARCHAR(200) NOT NULL,
    Category      NVARCHAR(20)  NOT NULL,      -- single | group | pass
    [Description] NVARCHAR(MAX) NULL,
    Price         DECIMAL(18,2) NOT NULL DEFAULT 0,
    Available     INT           NOT NULL DEFAULT 0,
    PerOrderLimit INT           NULL,
    SalesFrom     DATETIME      NULL,
    SalesTo       DATETIME      NULL,
    Badge         NVARCHAR(50)  NULL,
    BadgeColor    NVARCHAR(20)  NULL,
    IsActive      BIT           NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.Tracket_Event_Pass', 'U') IS NULL
CREATE TABLE dbo.Tracket_Event_Pass (
    PassId        BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId       BIGINT        NOT NULL,
    Name          NVARCHAR(200) NOT NULL,
    ValidFrom     DATETIME      NULL,
    ValidTo       DATETIME      NULL,
    Includes      NVARCHAR(MAX) NULL,          -- JSON array
    Price         DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalLimit    INT           NOT NULL DEFAULT 0,
    Badge         NVARCHAR(50)  NULL,
    BadgeColor    NVARCHAR(20)  NULL,
    [Description] NVARCHAR(MAX) NULL,
    IsActive      BIT           NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.Tracket_Event_AddOn', 'U') IS NULL
CREATE TABLE dbo.Tracket_Event_AddOn (
    AddOnId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId       BIGINT        NOT NULL,
    Name          NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    Price         DECIMAL(18,2) NOT NULL DEFAULT 0,
    Available     INT           NOT NULL DEFAULT 0,
    IsRequired    BIT           NOT NULL DEFAULT 0,
    AttachTo      NVARCHAR(MAX) NULL,          -- JSON array of ticket type ids
    IsActive      BIT           NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.Tracket_Event_PromoCode', 'U') IS NULL
CREATE TABLE dbo.Tracket_Event_PromoCode (
    PromoId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId       BIGINT        NOT NULL,
    Code          NVARCHAR(50)  NOT NULL,
    DiscountType  NVARCHAR(20)  NOT NULL,      -- percentage | fixed
    DiscountValue DECIMAL(18,2) NOT NULL DEFAULT 0,
    AppliesTo     NVARCHAR(50)  NULL,
    UsageLimit    INT           NULL,
    MinPurchase   DECIMAL(18,2) NULL,
    ValidFrom     DATETIME      NULL,
    ValidUntil    DATETIME      NULL,
    MaxDiscount   DECIMAL(18,2) NULL,
    IsActive      BIT           NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.Tracket_Event_TaxRule', 'U') IS NULL
CREATE TABLE dbo.Tracket_Event_TaxRule (
    TaxId           BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId         BIGINT        NOT NULL,
    Name            NVARCHAR(100) NOT NULL,
    [Type]          NVARCHAR(20)  NOT NULL,    -- percentage | fixed
    Rate            DECIMAL(18,2) NOT NULL DEFAULT 0,
    AppliesTo       NVARCHAR(50)  NULL,
    IncludedInPrice BIT           NOT NULL DEFAULT 0,
    IsActive        BIT           NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.Tracket_Event_FeeRule', 'U') IS NULL
CREATE TABLE dbo.Tracket_Event_FeeRule (
    FeeId           BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId         BIGINT        NOT NULL,
    Name            NVARCHAR(100) NOT NULL,
    [Type]          NVARCHAR(20)  NOT NULL,
    Amount          DECIMAL(18,2) NOT NULL DEFAULT 0,
    AppliesTo       NVARCHAR(50)  NULL,
    ChargeTo        NVARCHAR(20)  NULL,        -- buyer | organizer
    IncludedInPrice BIT           NOT NULL DEFAULT 0,
    MinFee          DECIMAL(18,2) NULL,
    MaxFee          DECIMAL(18,2) NULL,
    IsActive        BIT           NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.Tracket_Event_FloorComponent', 'U') IS NULL
CREATE TABLE dbo.Tracket_Event_FloorComponent (
    ComponentId BIGINT IDENTITY(1,1) PRIMARY KEY,
    EventId     BIGINT        NOT NULL,
    [Type]      NVARCHAR(50)  NOT NULL,
    Label       NVARCHAR(100) NULL,
    Shape       NVARCHAR(30)  NULL,
    Width       INT           NULL,
    Height      INT           NULL,
    Rotation    INT           NULL,
    X           INT           NULL,
    Y           INT           NULL,
    Color       NVARCHAR(20)  NULL
);
GO

/* ---------------------------------------------------------------------------
   3) Shred MetaJson -> normalized tables.
      Call at the end of USP_AddEditEvent_Full (after the event row is saved),
      or run on demand:  EXEC dbo.USP_SaveEventPro_FromMeta @EventId = 123;
   --------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.USP_SaveEventPro_FromMeta', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_SaveEventPro_FromMeta;
GO
CREATE PROCEDURE dbo.USP_SaveEventPro_FromMeta
    @EventId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Meta NVARCHAR(MAX);
    SELECT @Meta = MetaJson FROM dbo.Tracket_Master_Event WHERE EventId = @EventId;
    IF @Meta IS NULL OR ISJSON(@Meta) = 0 RETURN;

    BEGIN TRY
        BEGIN TRAN;

        -- Replace-all strategy keeps the normalized tables in sync with the draft.
        DELETE FROM dbo.Tracket_Event_Organizer      WHERE EventId = @EventId;
        DELETE FROM dbo.Tracket_Event_TicketType     WHERE EventId = @EventId;
        DELETE FROM dbo.Tracket_Event_Pass           WHERE EventId = @EventId;
        DELETE FROM dbo.Tracket_Event_AddOn          WHERE EventId = @EventId;
        DELETE FROM dbo.Tracket_Event_PromoCode      WHERE EventId = @EventId;
        DELETE FROM dbo.Tracket_Event_TaxRule        WHERE EventId = @EventId;
        DELETE FROM dbo.Tracket_Event_FeeRule        WHERE EventId = @EventId;
        DELETE FROM dbo.Tracket_Event_FloorComponent WHERE EventId = @EventId;

        INSERT INTO dbo.Tracket_Event_Organizer (EventId, Name, ContactPerson, Email, Phone, [Role], Website, About, IsPrimary)
        SELECT @EventId, j.name, j.contactPerson, j.email, j.phone, j.[role], j.website, j.about, ISNULL(j.isPrimary,0)
        FROM OPENJSON(@Meta, '$.organizers')
             WITH (name NVARCHAR(300), contactPerson NVARCHAR(200), email NVARCHAR(200), phone NVARCHAR(50),
                   [role] NVARCHAR(50), website NVARCHAR(300), about NVARCHAR(MAX), isPrimary BIT) j;

        INSERT INTO dbo.Tracket_Event_TicketType (EventId, Name, Category, [Description], Price, Available, PerOrderLimit, SalesFrom, SalesTo, Badge, BadgeColor, IsActive)
        SELECT @EventId, j.name, j.category, j.[description], ISNULL(j.price,0), ISNULL(j.available,0), j.perOrderLimit,
               TRY_CONVERT(DATETIME, j.salesFrom), TRY_CONVERT(DATETIME, j.salesTo), j.badge, j.badgeColor, ISNULL(j.active,1)
        FROM OPENJSON(@Meta, '$.tickets.ticketTypes')
             WITH (name NVARCHAR(200), category NVARCHAR(20), [description] NVARCHAR(MAX), price DECIMAL(18,2),
                   available INT, perOrderLimit INT, salesFrom NVARCHAR(40), salesTo NVARCHAR(40),
                   badge NVARCHAR(50), badgeColor NVARCHAR(20), active BIT) j;

        INSERT INTO dbo.Tracket_Event_Pass (EventId, Name, ValidFrom, ValidTo, Includes, Price, TotalLimit, Badge, BadgeColor, [Description], IsActive)
        SELECT @EventId, j.name, TRY_CONVERT(DATETIME, j.validFrom), TRY_CONVERT(DATETIME, j.validTo), j.includes,
               ISNULL(j.price,0), ISNULL(j.totalLimit,0), j.badge, j.badgeColor, j.[description], ISNULL(j.active,1)
        FROM OPENJSON(@Meta, '$.tickets.passes')
             WITH (name NVARCHAR(200), validFrom NVARCHAR(40), validTo NVARCHAR(40), includes NVARCHAR(MAX) AS JSON,
                   price DECIMAL(18,2), totalLimit INT, badge NVARCHAR(50), badgeColor NVARCHAR(20),
                   [description] NVARCHAR(MAX), active BIT) j;

        INSERT INTO dbo.Tracket_Event_AddOn (EventId, Name, [Description], Price, Available, IsRequired, AttachTo, IsActive)
        SELECT @EventId, j.name, j.[description], ISNULL(j.price,0), ISNULL(j.available,0), ISNULL(j.required,0), j.attachTo, ISNULL(j.active,1)
        FROM OPENJSON(@Meta, '$.tickets.addOns')
             WITH (name NVARCHAR(200), [description] NVARCHAR(MAX), price DECIMAL(18,2), available INT,
                   required BIT, attachTo NVARCHAR(MAX) AS JSON, active BIT) j;

        INSERT INTO dbo.Tracket_Event_PromoCode (EventId, Code, DiscountType, DiscountValue, AppliesTo, UsageLimit, MinPurchase, ValidFrom, ValidUntil, MaxDiscount, IsActive)
        SELECT @EventId, j.code, j.discountType, ISNULL(j.discountValue,0), j.appliesTo, j.usageLimit, j.minPurchase,
               TRY_CONVERT(DATETIME, j.validFrom), TRY_CONVERT(DATETIME, j.validUntil), j.maxDiscount, ISNULL(j.active,1)
        FROM OPENJSON(@Meta, '$.tickets.promoCodes')
             WITH (code NVARCHAR(50), discountType NVARCHAR(20), discountValue DECIMAL(18,2), appliesTo NVARCHAR(50),
                   usageLimit INT, minPurchase DECIMAL(18,2), validFrom NVARCHAR(40), validUntil NVARCHAR(40),
                   maxDiscount DECIMAL(18,2), active BIT) j;

        INSERT INTO dbo.Tracket_Event_TaxRule (EventId, Name, [Type], Rate, AppliesTo, IncludedInPrice, IsActive)
        SELECT @EventId, j.name, j.[type], ISNULL(j.rate,0), j.appliesTo, ISNULL(j.includedInPrice,0), ISNULL(j.active,1)
        FROM OPENJSON(@Meta, '$.tickets.taxes')
             WITH (name NVARCHAR(100), [type] NVARCHAR(20), rate DECIMAL(18,2), appliesTo NVARCHAR(50),
                   includedInPrice BIT, active BIT) j;

        INSERT INTO dbo.Tracket_Event_FeeRule (EventId, Name, [Type], Amount, AppliesTo, ChargeTo, IncludedInPrice, MinFee, MaxFee, IsActive)
        SELECT @EventId, j.name, j.[type], ISNULL(j.amount,0), j.appliesTo, j.chargeTo, ISNULL(j.includedInPrice,0), j.minFee, j.maxFee, ISNULL(j.active,1)
        FROM OPENJSON(@Meta, '$.tickets.fees')
             WITH (name NVARCHAR(100), [type] NVARCHAR(20), amount DECIMAL(18,2), appliesTo NVARCHAR(50),
                   chargeTo NVARCHAR(20), includedInPrice BIT, minFee DECIMAL(18,2), maxFee DECIMAL(18,2), active BIT) j;

        INSERT INTO dbo.Tracket_Event_FloorComponent (EventId, [Type], Label, Shape, Width, Height, Rotation, X, Y, Color)
        SELECT @EventId, j.[type], j.label, j.shape, j.width, j.height, j.rotation, j.x, j.y, j.color
        FROM OPENJSON(@Meta, '$.details.components')
             WITH ([type] NVARCHAR(50), label NVARCHAR(100), shape NVARCHAR(30), width INT, height INT,
                   rotation INT, x INT, y INT, color NVARCHAR(20)) j;

        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH
END
GO

/* ---------------------------------------------------------------------------
   4) Reader for the edit screen.
      The UI's eventToDraft() prefers MetaJson; this also returns normalized
      result sets for any server-side consumers.
   --------------------------------------------------------------------------- */
IF OBJECT_ID('dbo.USP_GetEventPro', 'P') IS NOT NULL
    DROP PROCEDURE dbo.USP_GetEventPro;
GO
CREATE PROCEDURE dbo.USP_GetEventPro
    @EventId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT EventId, MetaJson FROM dbo.Tracket_Master_Event WHERE EventId = @EventId;
    SELECT * FROM dbo.Tracket_Event_Organizer      WHERE EventId = @EventId;
    SELECT * FROM dbo.Tracket_Event_TicketType     WHERE EventId = @EventId;
    SELECT * FROM dbo.Tracket_Event_Pass           WHERE EventId = @EventId;
    SELECT * FROM dbo.Tracket_Event_AddOn          WHERE EventId = @EventId;
    SELECT * FROM dbo.Tracket_Event_PromoCode      WHERE EventId = @EventId;
    SELECT * FROM dbo.Tracket_Event_TaxRule        WHERE EventId = @EventId;
    SELECT * FROM dbo.Tracket_Event_FeeRule        WHERE EventId = @EventId;
    SELECT * FROM dbo.Tracket_Event_FloorComponent WHERE EventId = @EventId;
END
GO

/* ---------------------------------------------------------------------------
   INTEGRATION CHECKLIST (apply once, by your DBA):
   [ ] Confirm the event header table name (assumed dbo.Tracket_Master_Event).
   [ ] Ensure USP_AddEditEvent_Full writes @JsonData's "metaJson" value into the
       MetaJson column (add a SET/INSERT mapping if it does not already).
   [ ] At the end of USP_AddEditEvent_Full add:
          EXEC dbo.USP_SaveEventPro_FromMeta @EventId = <savedEventId>;
   [ ] Ensure USP_GetEvents SELECTs the MetaJson column so the edit screen can
       re-hydrate all wizard modules (the UI reads response.metaJson).
   =========================================================================== */
