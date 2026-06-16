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

        public async Task<ApiResponseModel<EventResponse>> AddEditEvent(EventRequest model, List<IFormFile>? attachments)
        {
            Console.WriteLine($"[DIAGNOSTIC] Model binding check: EventName = {model.EventName}, CategoryId = {model.CategoryId}, EventId = {model.EventId}, SlotsCount = {model.Slots?.Count}");
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

                if (attachments != null && attachments.Count > 0)
                {
                    var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Uploads");
                    if (!Directory.Exists(uploadsDir))
                    {
                        Directory.CreateDirectory(uploadsDir);
                    }

                    foreach (var file in attachments)
                    {
                        if (file.Length > 0)
                        {
                            var uniqueName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                            var filePath = Path.Combine(uploadsDir, uniqueName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await file.CopyToAsync(stream);
                            }

                            docs.Add(new
                             {
                                 DocumentName = file.FileName,
                                 RelativePath = "/Uploads/" + uniqueName,
                                 IsPrimary = false,
                                 DisplayOrder = 0,
                                 ThumbnailPath = ""
                             });
                        }
                    }
                }

                // Serialize model with attachments to JSON
                var payload = new
                {
                    model.EventId,
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
                    model.Slots,
                    Documents = docs,
                    // Booking Configuration Fields
                    model.MinBookingQty,
                    model.MaxBookingQty,
                    model.MaxBookingPerUser,
                    model.AllowGroupBooking,
                    model.AllowMultipleDateBooking,
                    model.MaxGroupMember,
                    model.BookingStartDate,
                    model.BookingEndDate,
                    model.AllowSeatSelection,
                    model.AllowMultiSlotBooking
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

                            if (ds.Tables.Count > 2)
                            {
                                responseObj.Slots = ds.Tables[2].AsEnumerable()
                                    .Select(row => DataRowToObject.CreateItemFromRow<EventSlotResponse>(row))
                                    .ToList();
                            }

                            if (ds.Tables.Count > 3)
                            {
                                responseObj.Documents = ds.Tables[3].AsEnumerable()
                                    .Select(row => DataRowToObject.CreateItemFromRow<EventDocumentResponse>(row))
                                    .ToList();
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
                // Note: USP_GetEvents only accepts @EventId (INT).
                // If rid is not numeric, no parameter is passed and SP returns 404.
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEvents", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var ev = DataRowToObject.CreateItemFromRow<EventResponse>(ds.Tables[0].Rows[0]);

                    if (ds.Tables.Count > 1)
                    {
                        ev.Slots = ds.Tables[1].AsEnumerable()
                            .Select(r => DataRowToObject.CreateItemFromRow<EventSlotResponse>(r))
                            .ToList();
                    }

                    if (ds.Tables.Count > 2)
                    {
                        ev.Documents = ds.Tables[2].AsEnumerable()
                            .Select(r => DataRowToObject.CreateItemFromRow<EventDocumentResponse>(r))
                            .ToList();
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
    }
}
