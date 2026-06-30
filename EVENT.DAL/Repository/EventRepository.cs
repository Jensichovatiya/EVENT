using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class EventRepository : IEventRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public EventRepository(IGeneralFunctions gf, IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }

        public async Task<ApiResponseModel<EventResponse>> AddEditEvent(EventRequest model, IFormFileCollection? files)
        {
            try
            {
                // Upload files
                var docs = new List<object>();
                if (model.Documents != null && model.Documents.Count > 0)
                {
                    foreach (var doc in model.Documents)
                    {
                        docs.Add(new
                        {
                            DocumentName = doc.DocumentName,
                            RelativePath = doc.RelativePath,
                            IsPrimary = doc.IsPrimary,
                            DisplayOrder = doc.DisplayOrder,
                            ThumbnailPath = doc.ThumbnailPath ?? ""
                        });
                    }
                }

                if (files != null)
                {
                    var logoFile = files.GetFile("logoFile");
                    if (logoFile != null)
                    {
                        model.ThumbnailImage = await SaveFileAsync(logoFile, "EventLogo");
                    }

                    var coverFile = files.GetFile("coverFile");
                    if (coverFile != null)
                    {
                        model.BannerImage = await SaveFileAsync(coverFile, "CoverImage");
                    }

                    var faviconFile = files.GetFile("faviconFile");
                    if (faviconFile != null)
                    {
                        var path = await SaveFileAsync(faviconFile, "Favicon");
                        docs.Add(new { DocumentName = faviconFile.FileName, RelativePath = path, IsPrimary = false, DisplayOrder = 0, ThumbnailPath = "" });
                    }

                    var bannerFile = files.GetFile("bannerFile");
                    if (bannerFile != null)
                    {
                        var path = await SaveFileAsync(bannerFile, "BannerImage");
                        docs.Add(new { DocumentName = bannerFile.FileName, RelativePath = path, IsPrimary = false, DisplayOrder = 0, ThumbnailPath = "" });
                    }

                    var shareImageFile = files.GetFile("shareImageFile");
                    if (shareImageFile != null)
                    {
                        var path = await SaveFileAsync(shareImageFile, "ShareImage");
                        docs.Add(new { DocumentName = shareImageFile.FileName, RelativePath = path, IsPrimary = false, DisplayOrder = 0, ThumbnailPath = "" });
                    }

                    var galleryFiles = files.GetFiles("galleryFiles");
                    foreach (var file in galleryFiles)
                    {
                        var path = await SaveFileAsync(file, "Gallery");
                        docs.Add(new { DocumentName = file.FileName, RelativePath = path, IsPrimary = false, DisplayOrder = 0, ThumbnailPath = "" });
                    }

                    var documentFiles = files.GetFiles("documentFiles");
                    foreach (var file in documentFiles)
                    {
                        var path = await SaveFileAsync(file, "Documents");
                        docs.Add(new { DocumentName = file.FileName, RelativePath = path, IsPrimary = false, DisplayOrder = 0, ThumbnailPath = "" });
                    }

                    var videoFiles = files.GetFiles("videoFiles");
                    foreach (var file in videoFiles)
                    {
                        var path = await SaveFileAsync(file, "Videos");
                        docs.Add(new { DocumentName = file.FileName, RelativePath = path, IsPrimary = false, DisplayOrder = 0, ThumbnailPath = "" });
                    }

                    var audioFiles = files.GetFiles("audioFiles");
                    foreach (var file in audioFiles)
                    {
                        var path = await SaveFileAsync(file, "Audio");
                        docs.Add(new { DocumentName = file.FileName, RelativePath = path, IsPrimary = false, DisplayOrder = 0, ThumbnailPath = "" });
                    }

                    var organizerLogo = files.GetFile("organizerLogo");
                    if (organizerLogo != null)
                    {
                        model.OrganizationLogo = await SaveFileAsync(organizerLogo, "OrganizerLogo");
                    }

                    var gstCertificate = files.GetFile("gstCertificate");
                    if (gstCertificate != null)
                    {
                        model.GSTCertificate = await SaveFileAsync(gstCertificate, "GSTCertificate");
                    }

                    var panCardDocument = files.GetFile("panCardDocument");
                    if (panCardDocument != null)
                    {
                        model.PANCardDocument = await SaveFileAsync(panCardDocument, "PANCard");
                    }

                    var registrationCertificate = files.GetFile("registrationCertificate");
                    if (registrationCertificate != null)
                    {
                        model.RegistrationCertificate = await SaveFileAsync(registrationCertificate, "RegistrationCertificate");
                    }

                    var otherDocument = files.GetFile("otherDocument");
                    if (otherDocument != null)
                    {
                        model.OtherDocument = await SaveFileAsync(otherDocument, "OtherDocuments");
                    }

                    // Fallback attachments
                    var attachments = files.GetFiles("attachments");
                    foreach (var file in attachments)
                    {
                        var path = await SaveFileAsync(file, "Other");
                        docs.Add(new { DocumentName = file.FileName, RelativePath = path, IsPrimary = false, DisplayOrder = 0, ThumbnailPath = "" });
                    }
                }

                // Serialize model with attachments to JSON
                var payload = new
                {
                    model.EventId,
                    model.EventRId,
                    model.EventName,
                    model.EventCode,
                    model.CategoryId,
                    model.EventSubCategoryId,
                    model.ThumbnailImage,
                    model.BannerImage,
                    model.Description,
                    model.About,
                    model.TermsAndConditions,
                    model.FacebookLink,
                    model.WebsiteLink,
                    model.YoutubeLink,
                    model.InstagramLink,
                    model.TwitterLink,
                    model.LinkedInLink,
                    model.PintrestLink,
                    model.ListingType,
                    model.IsBookingAccept,
                    model.BookingType,
                    model.Currency,
                    model.EventType,
                    model.IsPublishActive,
                    model.IsPassBookingActive,
                    model.Status,
                    model.ApprovalStatus,
                    model.Capacity,
                    model.TicketPrice,
                    model.IsCancelled,
                    model.CancelReason,
                    model.RejectionReason,
                    model.ShortDescription,
                    model.Slug,
                    model.SeoTitle,
                    model.SeoDescription,
                    model.SeoKeywords,
                    model.Tags,
                    model.StartDate,
                    model.EndDate,
                    model.IsFree,
                    model.IsPublic,
                    model.MetaJson,
                    model.UserId,
                    model.LocationName,
                    model.Address,
                    model.VenueName,
                    model.AddressLine1,
                    model.AddressLine2,
                    model.AreaName,
                    model.Landmark,
                    model.Pincode,
                    model.Latitude,
                    model.Longitude,
                    model.GoogleMapLink,
                    model.HallName,
                    model.GroundName,
                    model.ParkingAvailable,
                    model.ParkingDetails,
                    model.CountryId,
                    model.StateId,
                    model.CityId,
                    model.CreatedBy,
                    model.CreatedFrom,
                    model.UpdatedBy,
                    model.UpdatedFrom,
                    // ── Step-1 extra fields ──────────────────────────────────
                    model.Tagline,
                    model.Purpose,
                    model.TargetAudience,
                    // ── Step-2 Date & Time fields ────────────────────────────
                    model.DateTimeMode,
                    model.Timezone,
                    model.DurationDays,
                    model.DurationHours,
                    model.DurationMinutes,
                    model.AllDay,
                    model.ShowCountdown,
                    model.VisibilityStartDate,
                    model.VisibilityStartTime,
                    model.SetupStartTime,
                    model.TeardownEndTime,
                    model.RecurrenceFrequency,
                    model.RecurrenceInterval,
                    model.RecurrenceEndDate,
                    // ── Step-3 Venue extra fields ────────────────────────────
                    model.VenueType,
                    model.VenueCategory,
                    model.Facilities,
                    model.VenueCapacity,
                    model.ContactPerson,
                    model.ContactDesignation,
                    model.ContactPhoneCode,
                    model.ContactPhone,
                    model.ContactEmail,
                    model.Notes,
                    model.OtherFacility,
                    // ── Step-5 Organizer Profile Additions ───────────────────
                    model.OrganizerTypeId,
                    model.OrganizationName,
                    model.GSTIN,
                    model.PANNumber,
                    model.OrgWebsite,
                    model.OrgPrimaryEmail,
                    model.OrgPrimaryPhone,
                    model.OrgAlternatePhone,
                    model.OrgAddress,
                    model.OrgCity,
                    model.OrgState,
                    model.OrgCountry,
                    model.OrgPinCode,
                    model.PrimaryContactName,
                    model.PrimaryContactDesignation,
                    model.PrimaryContactEmail,
                    model.PrimaryContactPhone,
                    model.EmergencyContactName,
                    model.EmergencyContactRelationship,
                    model.EmergencyContactPhone,
                    model.EmergencyAlternatePhone,
                    model.YearEstablished,
                    model.EmployeeCountId,
                    model.IndustryId,
                    model.BusinessTypeId,
                    model.RegistrationNumber,
                    model.RegisteredAddress,
                    model.OrgFacebookLink,
                    model.OrgInstagramLink,
                    model.OrgLinkedInLink,
                    model.OrgTwitterLink,
                    model.OrgYouTubeLink,
                    model.OrganizationLogo,
                    model.GSTCertificate,
                    model.PANCardDocument,
                    model.RegistrationCertificate,
                    model.OtherDocument,
                    // ── Slots & Documents ────────────────────────────────────
                    model.Slots,
                    Documents = docs,
                    // ── Booking Configuration Fields ─────────────────────────
                    model.MinBookingQty,
                    model.MaxBookingQty,
                    model.MaxBookingPerUser,
                    model.AllowGroupBooking,
                    model.AllowMultipleDateBooking,
                    model.MaxGroupMember,
                    model.BookingStartDate,
                    model.BookingEndDate,
                    model.AllowSeatSelection,
                    model.AllowMultiSlotBooking,
                    model.CurrentActiveStep
                };

                string jsonData = JsonConvert.SerializeObject(payload);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };

                // Execute SP
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditEvent_Full", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow statusRow = ds.Tables[0].Rows[0];
                    int statusCode = Convert.ToInt32(statusRow["ResultStatus"]);
                    string message = Convert.ToString(statusRow["ResultMessage"]) ?? "";

                    if (statusCode == 200 || statusCode == 201)
                    {
                        EventResponse? responseObj = null;
                        if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                        {
                            responseObj = DataRowToObject.CreateItemFromRow<EventResponse>(ds.Tables[1].Rows[0]);

                            for (int i = 2; i < ds.Tables.Count; i++)
                            {
                                var table = ds.Tables[i];
                                if (table.Columns.Contains("SlotId"))
                                {
                                    responseObj.Slots = table.AsEnumerable()
                                        .Select(row => DataRowToObject.CreateItemFromRow<EventSlotResponse>(row))
                                        .ToList();
                                }
                                else if (table.Columns.Contains("DocumentId"))
                                {
                                    responseObj.Documents = table.AsEnumerable()
                                        .Select(row => DataRowToObject.CreateItemFromRow<EventDocumentResponse>(row))
                                        .ToList();
                                }
                                else if (table.Columns.Contains("CompletionPercentage") && table.Rows.Count > 0)
                                {
                                    responseObj.Progress = DataRowToObject.CreateItemFromRow<EventProgressResponse>(table.Rows[0]);
                                }
                            }
                        }

                        return new ApiResponseModel<EventResponse>
                        {
                            Success = true,
                            StatusCode = statusCode,
                            Message = message,
                            Data = responseObj
                        };
                    }

                    return new ApiResponseModel<EventResponse>
                    {
                        Success = false,
                        StatusCode = statusCode,
                        Message = message
                    };
                }

                return new ApiResponseModel<EventResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "No response from database."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<EventResponse>>> GetEventsAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEvents");
                var events = new List<EventResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    var eventTable = ds.Tables[0];
                    var slotsTable = ds.Tables.Count > 1 ? ds.Tables[1] : new DataTable();
                    var docsTable = ds.Tables.Count > 2 ? ds.Tables[2] : new DataTable();

                    foreach (DataRow row in eventTable.Rows)
                    {
                        var ev = DataRowToObject.CreateItemFromRow<EventResponse>(row);

                        ev.Slots = slotsTable.AsEnumerable()
                            .Where(r => Convert.ToInt64(r["EventId"]) == ev.EventId)
                            .Select(r => DataRowToObject.CreateItemFromRow<EventSlotResponse>(r))
                            .ToList();

                        ev.Documents = docsTable.AsEnumerable()
                            .Where(r => Convert.ToInt64(r["EventId"]) == ev.EventId)
                            .Select(r => DataRowToObject.CreateItemFromRow<EventDocumentResponse>(r))
                            .ToList();

                        events.Add(ev);
                    }
                }

                return new ApiResponseModel<List<EventResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Events retrieved successfully.",
                    Data = events
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<EventResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<EventResponse>> GetEventByIdAsync(string rid)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                if (long.TryParse(rid, out long id))
                {
                    parameters.Add("@EventId", id);
                }
                else if (Guid.TryParse(rid, out Guid publicId))
                {
                    parameters.Add("@PublicId", publicId);
                }
                else
                {
                    parameters.Add("@EventRId", rid);
                }
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEvents", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var ev = DataRowToObject.CreateItemFromRow<EventResponse>(ds.Tables[0].Rows[0]);

                    for (int i = 1; i < ds.Tables.Count; i++)
                    {
                        var table = ds.Tables[i];
                        if (table.Columns.Contains("SlotId"))
                        {
                            ev.Slots = table.AsEnumerable()
                                .Select(r => DataRowToObject.CreateItemFromRow<EventSlotResponse>(r))
                                .ToList();
                        }
                        else if (table.Columns.Contains("DocumentId"))
                        {
                            ev.Documents = table.AsEnumerable()
                                .Select(r => DataRowToObject.CreateItemFromRow<EventDocumentResponse>(r))
                                .ToList();
                        }
                        else if (table.Columns.Contains("CompletionPercentage") && table.Rows.Count > 0)
                        {
                            ev.Progress = DataRowToObject.CreateItemFromRow<EventProgressResponse>(table.Rows[0]);
                        }
                    }

                    return new ApiResponseModel<EventResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "Event retrieved successfully.",
                        Data = ev
                    };
                }

                return new ApiResponseModel<EventResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Event not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> UpdateEventStatusAsync(EventStatusUpdateRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_UpdateEventStatus", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Event status updated successfully" : null
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to update event status."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<EventResponse>> DuplicateEventAsync(DuplicateEventRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_DuplicateEvent", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow statusRow = ds.Tables[0].Rows[0];
                    int statusCode = Convert.ToInt32(statusRow["ResultStatus"]);
                    string message = Convert.ToString(statusRow["ResultMessage"]) ?? "";

                    if (statusCode == 201 && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                    {
                        var duplicated = DataRowToObject.CreateItemFromRow<EventResponse>(ds.Tables[1].Rows[0]);
                        return new ApiResponseModel<EventResponse>
                        {
                            Success = true,
                            StatusCode = statusCode,
                            Message = message,
                            Data = duplicated
                        };
                    }

                    return new ApiResponseModel<EventResponse>
                    {
                        Success = false,
                        StatusCode = statusCode,
                        Message = message
                    };
                }

                return new ApiResponseModel<EventResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to duplicate event."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> DeleteEventSlotAsync(long slotId)
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "@ItemId", slotId },
                    { "@Type", "SLOT" }
                };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_DeleteEventItem", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Slot deleted successfully" : null
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to delete slot."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> DeleteEventDocumentAsync(long documentId)
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "@ItemId", documentId },
                    { "@Type", "DOCUMENT" }
                };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_DeleteEventItem", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    return new ApiResponseModel<string>
                    {
                        Success = status == 200,
                        StatusCode = status,
                        Message = message,
                        Data = status == 200 ? "Document deleted successfully" : null
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to delete document."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<EventAnalyticsResponse>> GetEventAnalyticsAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventAnalytics");

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var analytics = DataRowToObject.CreateItemFromRow<EventAnalyticsResponse>(ds.Tables[0].Rows[0]);
                    return new ApiResponseModel<EventAnalyticsResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "Analytics retrieved successfully.",
                        Data = analytics
                    };
                }

                return new ApiResponseModel<EventAnalyticsResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Analytics not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventAnalyticsResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        private async Task<string> SaveFileAsync(IFormFile file, string subFolder)
        {
            if (file == null || file.Length == 0) return string.Empty;

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Image", "Event", subFolder);
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var ext = Path.GetExtension(file.FileName);
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            
            var prefix = subFolder;
            if (subFolder == "EventLogo") prefix = "Logo";
            else if (subFolder == "CoverImage") prefix = "Cover";
            else if (subFolder == "BannerImage") prefix = "Banner";
            else if (subFolder == "ShareImage") prefix = "Share";
            else if (subFolder == "Favicon") prefix = "Favicon";
            else if (subFolder == "OrganizerLogo") prefix = "OrgLogo";
            else if (subFolder == "Videos") prefix = "Video";
            else if (subFolder == "Audio") prefix = "Audio";

            var uniqueName = $"{prefix}_{timestamp}{ext}";
            var filePath = Path.Combine(uploadsDir, uniqueName);
            
            int counter = 1;
            while (File.Exists(filePath))
            {
                uniqueName = $"{prefix}_{timestamp}_{counter}{ext}";
                filePath = Path.Combine(uploadsDir, uniqueName);
                counter++;
            }

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return "/Image/Event/" + subFolder + "/" + uniqueName;
        }
    }
}


