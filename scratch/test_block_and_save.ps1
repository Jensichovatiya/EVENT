# 1. Log in
$loginBody = @{
    UserName = "organizer@gmail.com"
    Password = "Password123"
} | ConvertTo-Json

$loginHeaders = @{
    "Content-Type" = "application/json"
}

write-output "Logging in..."
$loginRes = Invoke-RestMethod -Uri "http://localhost:5209/api/auth/login" -Method Post -Body $loginBody -Headers $loginHeaders
$token = $loginRes.data.token
write-output "Token obtained: $token"

# 2. Get event details
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
}

write-output "Fetching Event 1..."
$eventRes = Invoke-RestMethod -Uri "http://localhost:5209/api/events/1" -Method Get -Headers $headers
$event = $eventRes.data

# 3. Parse MetaJson and update layout items to test blocking
$meta = $event.metaJson | ConvertTo-Json -Depth 1
# Let's decode the metaJson
$metaObj = $event.metaJson | ConvertFrom-Json
$details = $metaObj.details

write-output "Original active zone: $($details.zoneId)"

# Let's find seat C6 and A1 in details.assetItems and set statuses
# C6 -> Blocked, A1 -> Reserved
$items = $details.assetItems
foreach ($item in $items) {
    if ($item.label -eq "C6") {
        $item.status = "Blocked"
        write-output "Setting C6 status to Blocked"
    }
    if ($item.label -eq "A1") {
        $item.status = "Reserved"
        write-output "Setting A1 status to Reserved"
    }
}

# Update the zones dictionary layout too to stay in sync
$zone1 = $details.zones."1"
if ($zone1) {
    foreach ($item in $zone1.assetItems) {
        if ($item.label -eq "C6") {
            $item.status = "Blocked"
        }
        if ($item.label -eq "A1") {
            $item.status = "Reserved"
        }
    }
}

# Re-serialize metaJson
$metaObj.details = $details
$updatedMetaJson = $metaObj | ConvertTo-Json -Depth 10

# 4. Prepare save request payload
$slotsMapped = @()
if ($event.slots) {
    foreach ($slot in $event.slots) {
        $slotsMapped += @{
            slotId = $slot.slotId
            publicId = $slot.publicId
            slotDate = $slot.slotDate
            startTime = $slot.startTime
            endTime = $slot.endTime
            capacity = $slot.capacity
            slotName = $slot.slotName
            ticketPrice = $slot.ticketPrice
            occurrenceIndex = $slot.occurrenceIndex
        }
    }
}

$docsMapped = @()
if ($event.documents) {
    foreach ($doc in $event.documents) {
        $docsMapped += @{
            documentName = $doc.fileName
            relativePath = $doc.filePath
            isPrimary = $doc.isPrimary
            displayOrder = $doc.displayOrder
            thumbnailPath = $doc.thumbnailPath
        }
    }
}

$payload = @{
    EventId = $event.eventId
    EventRId = $event.eventRId
    PublicId = $event.publicId
    Tagline = $event.tagline
    Purpose = $event.purpose
    TargetAudience = $event.targetAudience
    EventName = $event.eventName
    EventCode = $event.eventCode
    CategoryId = $event.categoryId
    EventSubCategoryId = $event.eventSubCategoryId
    ThumbnailImage = $event.thumbnailImage
    BannerImage = $event.bannerImage
    Description = $event.description
    About = $event.about
    TermsAndConditions = $event.termsAndConditions
    FacebookLink = $event.facebookLink
    WebsiteLink = $event.websiteLink
    YoutubeLink = $event.youtubeLink
    InstagramLink = $event.instagramLink
    TwitterLink = $event.twitterLink
    LinkedInLink = $event.linkedInLink
    PintrestLink = $event.pintrestLink
    ListingType = $event.listingType
    IsBookingAccept = $event.isBookingAccept
    BookingType = $event.bookingType
    Currency = $event.currency
    EventType = $event.eventType
    IsPublishActive = $event.isPublishActive
    IsPassBookingActive = $event.isPassBookingActive
    Status = $event.status
    ApprovalStatus = $event.approvalStatus
    Capacity = $event.capacity
    TicketPrice = $event.ticketPrice
    IsCancelled = $event.isCancelled
    CancelReason = $event.cancelReason
    RejectionReason = $event.rejectionReason
    UserId = $event.userId
    ShortDescription = $event.shortDescription
    Slug = $event.slug
    SeoTitle = $event.seoTitle
    SeoDescription = $event.seoDescription
    SeoKeywords = $event.seoKeywords
    Tags = $event.tags
    StartDate = $event.startDate
    EndDate = $event.endDate
    IsFree = $event.isFree
    IsPublic = $event.isPublic
    MetaJson = $updatedMetaJson
    LocationId = $event.locationId
    LocationName = $event.locationName
    Address = $event.address
    VenueName = $event.venueName
    AddressLine1 = $event.addressLine1
    AddressLine2 = $event.addressLine2
    AreaName = $event.areaName
    Landmark = $event.landmark
    Pincode = $event.pincode
    Latitude = $event.latitude
    Longitude = $event.longitude
    GoogleMapLink = $event.googleMapLink
    HallName = $event.hallName
    GroundName = $event.groundName
    ParkingAvailable = $event.parkingAvailable
    ParkingDetails = $event.parkingDetails
    CountryId = $event.countryId
    StateId = $event.stateId
    CityId = $event.cityId
    VenueType = $event.venueType
    VenueCategory = $event.venueCategory
    Facilities = $event.facilities
    VenueCapacity = $event.venueCapacity
    ContactPerson = $event.contactPerson
    ContactDesignation = $event.contactDesignation
    ContactPhoneCode = $event.contactPhoneCode
    ContactPhone = $event.contactPhone
    ContactEmail = $event.contactEmail
    Notes = $event.notes
    OtherFacility = $event.otherFacility

    # Step-5 Organizers
    OrganizerTypeId = $event.organizerTypeId
    OrganizationName = $event.organizationName
    GSTIN = $event.gstin
    PANNumber = $event.panNumber
    OrgWebsite = $event.orgWebsite
    OrgPrimaryEmail = $event.orgPrimaryEmail
    OrgPrimaryPhone = $event.orgPrimaryPhone
    OrgAlternatePhone = $event.orgAlternatePhone
    OrgAddress = $event.orgAddress
    OrgCity = $event.orgCity
    OrgState = $event.orgState
    OrgCountry = $event.orgCountry
    OrgPinCode = $event.orgPinCode
    PrimaryContactName = $event.primaryContactName
    PrimaryContactDesignation = $event.primaryContactDesignation
    PrimaryContactEmail = $event.primaryContactEmail
    PrimaryContactPhone = $event.primaryContactPhone
    EmergencyContactName = $event.emergencyContactName
    EmergencyContactRelationship = $event.emergencyContactRelationship
    EmergencyContactPhone = $event.emergencyContactPhone
    EmergencyAlternatePhone = $event.emergencyAlternatePhone
    YearEstablished = $event.yearEstablished
    EmployeeCountId = $event.employeeCountId
    IndustryId = $event.industryId
    BusinessTypeId = $event.businessTypeId
    RegistrationNumber = $event.registrationNumber
    RegisteredAddress = $event.registeredAddress
    OrgFacebookLink = $event.orgFacebookLink
    OrgInstagramLink = $event.orgInstagramLink
    OrgLinkedInLink = $event.orgLinkedInLink
    OrgTwitterLink = $event.orgTwitterLink
    OrgYouTubeLink = $event.orgYouTubeLink
    OrganizationLogo = $event.organizationLogo
    GSTCertificate = $event.gstCertificate
    PANCardDocument = $event.panCardDocument
    RegistrationCertificate = $event.registrationCertificate
    OtherDocument = $event.otherDocument

    # Audit fields
    CreatedBy = "organizer@gmail.com"
    CreatedFrom = "WebUI"
    UpdatedBy = "organizer@gmail.com"
    UpdatedFrom = "WebUI"

    # Slots & Docs
    Slots = $slotsMapped
    Documents = $docsMapped
}

$payloadJson = $payload | ConvertTo-Json -Depth 10

# Write payloadJson to temp file to check
[System.IO.File]::WriteAllText("scratch_save_payload.json", $payloadJson, [System.Text.Encoding]::UTF8)

# 5. Save Event (multipart/form-data)
write-output "Posting update to /api/events..."
$Boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"
$bodyLines = (
    "--$Boundary",
    "Content-Disposition: form-data; name=`"model`"",
    "Content-Type: application/json; charset=utf-8",
    "",
    $payloadJson,
    "--$Boundary--"
) -join $LF

$saveHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "multipart/form-data; boundary=$Boundary"
}

$saveRes = Invoke-RestMethod -Uri "http://localhost:5209/api/events" -Method Post -Body $bodyLines -Headers $saveHeaders
write-output "Save response status: $($saveRes.statusCode)"
write-output "Save response message: $($saveRes.message)"

# 6. Verify Database
write-output "`nChecking seat status in database..."
$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT SeatNumber, SeatStatus, IsBlocked, IsReserved, ZoneAssetId FROM dbo.Tracket_Master_Event_Zone_Seat WHERE EventId = 1 AND ZoneId = 1 AND SeatNumber IN ('C6', 'A1')"
$r = $cmd.ExecuteReader()
while($r.Read()) {
    write-output ("Seat: {0} | Status: {1} | IsBlocked: {2} | IsReserved: {3} | ZoneAssetId: {4}" -f $r["SeatNumber"], $r["SeatStatus"], $r["IsBlocked"], $r["IsReserved"], $r["ZoneAssetId"])
}
$conn.Close()
