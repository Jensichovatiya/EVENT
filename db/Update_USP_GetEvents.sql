-- ============================================================
-- Update USP_GetEvents (v3)
-- Returns FacilityIds JSON from Tracket_Master_Event_Location.
-- FacilityIds are stored as [1,2,5] in the Facilities column.
-- ============================================================
USE EVENT_Master;
GO

ALTER PROCEDURE USP_GetEvents
    @EventId   INT               = NULL,
    @PublicId  UNIQUEIDENTIFIER  = NULL,
    @EventRId  NVARCHAR(100)     = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @EventId IS NOT NULL OR @PublicId IS NOT NULL OR @EventRId IS NOT NULL
    BEGIN
        DECLARE @ActualEventId INT;
        SELECT TOP 1 @ActualEventId = EventId
        FROM Tracket_Master_Event
        WHERE IsDeleted = 0
          AND (@EventId  IS NULL OR EventId  = @EventId)
          AND (@PublicId IS NULL OR PublicId = @PublicId)
          AND (@EventRId IS NULL OR EventRId = @EventRId);

        -- Table[0]: Event header + location (Facilities stores FacilityId JSON array)
        SELECT 
            E.EventId, E.EventRId, E.PublicId,
            E.EventName, E.EventCode,
            E.EventCategoryId AS CategoryId, C.CategoryName,
            E.EventSubCategoryId,
            E.ThumbnailImage, E.BannerImage,
            E.About, E.About AS Description,
            E.TermsAndConditions,
            E.FacebookLink, E.WebsiteLink, E.YoutubeLink,
            E.InstagramLink, E.TwitterLink, E.LinkedInLink, E.PintrestLink,
            E.ListingType, E.IsBookingAccept, E.BookingType,
            E.Currency, E.EventType, E.IsPublishActive, E.IsPassBookingActive,
            E.Status, E.ApprovalStatus,
            E.Capacity, E.TicketPrice,
            E.IsCancelled, E.CancelReason, E.RejectionReason,
            E.UserId AS OrganizerId, E.UserId,
            E.ShortDescription, E.Slug,
            E.SeoTitle, E.SeoDescription, E.SeoKeywords, E.Tags,
            (SELECT MIN(StartDate) FROM Tracket_Master_Event_Slot WHERE EventId = E.EventId AND IsDeleted = 0) AS StartDate,
            (SELECT MAX(EndDate) FROM Tracket_Master_Event_Slot WHERE EventId = E.EventId AND IsDeleted = 0) AS EndDate,
            E.IsFree, E.IsPublic, E.MetaJson,
            -- Step-1 extras (belong to event header)
            E.Tagline, E.Purpose, E.TargetAudience,
            -- Location
            L.LocationId,
            L.VenueName, L.VenueName AS LocationName,
            L.AddressLine1, L.AddressLine1 AS Address,
            L.AddressLine2, L.AreaName, L.Landmark, L.Pincode,
            L.Latitude, L.Longitude, L.GoogleMapLink,
            L.HallName, L.GroundName,
            L.ParkingAvailable, L.ParkingDetails,
            L.CountryId, L.StateId, L.CityId,
            L.VenueType, L.VenueCategory,
            -- Facilities: stored as JSON array of FacilityIds e.g. [1,2,5]
            L.Facilities,
            L.Capacity AS VenueCapacity,
            L.ContactPerson, L.ContactDesignation, L.ContactPhoneCode, L.ContactPhone, L.ContactEmail,
            L.Notes, L.OtherFacility,
            E.IsPublishActive AS IsActive,
            E.CreatedBy, E.CreatedDate, E.CreatedFrom,
            E.UpdatedBy, E.UpdatedDate, E.UpdatedFrom,
            O.OrganizerTypeId, O.OrganizationName, O.GSTIN, O.PANNumber, O.Website AS OrgWebsite,
            O.PrimaryEmail AS OrgPrimaryEmail, O.PrimaryPhone AS OrgPrimaryPhone, O.AlternatePhone AS OrgAlternatePhone,
            O.Address AS OrgAddress, O.City AS OrgCity, O.State AS OrgState, O.Country AS OrgCountry, O.PinCode AS OrgPinCode,
            O.PrimaryContactName, O.PrimaryContactDesignation, O.PrimaryContactEmail, O.PrimaryContactPhone,
            O.EmergencyContactName, O.EmergencyContactRelationship, O.EmergencyContactPhone, O.EmergencyAlternatePhone,
            O.YearEstablished, O.EmployeeCountId, O.IndustryId, O.BusinessTypeId, O.RegistrationNumber, O.RegisteredAddress,
            O.FacebookLink AS OrgFacebookLink, O.InstagramLink AS OrgInstagramLink, O.LinkedInLink AS OrgLinkedInLink,
            O.TwitterLink AS OrgTwitterLink, O.YouTubeLink AS OrgYouTubeLink, O.OrganizationLogo,
            O.GSTCertificate, O.PANCardDocument, O.RegistrationCertificate, O.OtherDocument
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT  JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        LEFT  JOIN Tracket_Master_Event_Organizer O ON E.EventId = O.EventId AND O.IsDeleted = 0
        WHERE E.EventId = @ActualEventId AND E.IsDeleted = 0;

        -- Table[1]: Full slot detail (all Step-2 date & time fields)
        SELECT
            S.SlotId, S.PublicId, S.EventId,
            S.StartDate AS SlotDate,
            CONVERT(VARCHAR(8), S.StartTime, 108) AS StartTime,
            CONVERT(VARCHAR(8), S.EndTime,   108) AS EndTime,
            S.Capacity, S.SlotName, S.TicketPrice,
            S.GenderRestriction, S.AgeRestriction,
            -- Step-2 date & time detail
            S.EventMode, S.Timezone,
            S.AllDay, S.ShowCountdown,
            S.SetupStartTime, S.TeardownEndTime,
            S.VisibilityStartDate, S.VisibilityStartTime,
            S.DurationDays, S.DurationHours, S.DurationMinutes,
            S.RecurrenceFrequency, S.RecurrenceInterval, S.RecurrenceEndDate,
            S.OccurrenceIndex,
            S.StartDate, S.EndDate
        FROM Tracket_Master_Event_Slot S
        WHERE S.EventId = @ActualEventId AND S.IsDeleted = 0
        ORDER BY S.StartDate, S.OccurrenceIndex;

        -- Table[2]: Documents
        SELECT DocumentId, FileName AS DocumentName, FilePath AS RelativePath,
               IsPrimary, DisplayOrder, ThumbnailPath
        FROM Tracket_Master_Event_Document
        WHERE EventId = @ActualEventId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        -- List all events (summary)
        SELECT 
            E.EventId, E.EventRId, E.PublicId,
            E.EventName, E.EventCode,
            E.EventCategoryId AS CategoryId, C.CategoryName,
            E.ThumbnailImage, E.BannerImage,
            E.ListingType, E.BookingType,
            E.Currency, E.EventType, E.IsPublishActive,
            E.Status, E.ApprovalStatus,
            E.Capacity, E.TicketPrice,
            E.IsFree, E.IsPublic,
            E.ShortDescription, E.Slug,
            E.IsCancelled, E.CancelReason,
            E.UserId AS OrganizerId, E.UserId,
            E.Tagline, E.Purpose, E.TargetAudience,
            (SELECT MIN(StartDate) FROM Tracket_Master_Event_Slot WHERE EventId = E.EventId AND IsDeleted = 0) AS StartDate,
            (SELECT MAX(EndDate) FROM Tracket_Master_Event_Slot WHERE EventId = E.EventId AND IsDeleted = 0) AS EndDate,
            L.VenueName, L.VenueName AS LocationName, L.AddressLine1 AS Address,
            L.CountryId, L.StateId, L.CityId,
            L.VenueType, L.VenueCategory,
            E.CreatedBy, E.CreatedDate, E.IsPublishActive AS IsActive
        FROM Tracket_Master_Event E
        INNER JOIN Tracket_Master_Event_Location L ON E.EventId = L.EventId
        LEFT  JOIN Tracket_Master_Event_Category C ON E.EventCategoryId = C.CategoryId
        WHERE E.IsDeleted = 0
        ORDER BY E.EventId DESC;
    END
END;
GO

PRINT 'USP_GetEvents updated (v3) - Facilities stores FacilityId JSON array.';
GO
