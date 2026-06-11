using EVENT.Business.BusinessClass;
using EVENT.Business.Helper;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class BookingRepository : IBookingRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public BookingRepository(IGeneralFunctions gf, IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }

        public async Task<ApiResponseModel<BookingResponse>> CreateUpdateBookingAsync(BookingRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_CreateUpdateBooking", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow statusRow = ds.Tables[0].Rows[0];
                    int statusCode = Convert.ToInt32(statusRow["ResultStatus"]);
                    string message = Convert.ToString(statusRow["ResultMessage"]) ?? "";

                    if (statusCode == 200 || statusCode == 201)
                    {
                        BookingResponse? responseObj = null;
                        if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                        {
                            responseObj = DataRowToObject.CreateItemFromRow<BookingResponse>(ds.Tables[1].Rows[0]);

                            if (ds.Tables.Count > 2)
                            {
                                responseObj.Attendees = ds.Tables[2].AsEnumerable()
                                    .Select(row => DataRowToObject.CreateItemFromRow<AttendeeResponse>(row))
                                    .ToList();
                            }
                        }

                        return new ApiResponseModel<BookingResponse>
                        {
                            Success = true,
                            StatusCode = statusCode,
                            Message = message,
                            Data = responseObj
                        };
                    }

                    return new ApiResponseModel<BookingResponse>
                    {
                        Success = false,
                        StatusCode = statusCode,
                        Message = message
                    };
                }

                return new ApiResponseModel<BookingResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "No response from database."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<BookingResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<BookingResponse>>> GetBookingsAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetBookings");
                var bookings = new List<BookingResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    var bookingTable = ds.Tables[0];
                    var attendeeTable = ds.Tables.Count > 1 ? ds.Tables[1] : new DataTable();

                    foreach (DataRow row in bookingTable.Rows)
                    {
                        var bk = DataRowToObject.CreateItemFromRow<BookingResponse>(row);

                        bk.Attendees = attendeeTable.AsEnumerable()
                            .Where(r => Convert.ToInt64(r["BookingId"]) == bk.BookingId)
                            .Select(r => DataRowToObject.CreateItemFromRow<AttendeeResponse>(r))
                            .ToList();

                        bookings.Add(bk);
                    }
                }

                return new ApiResponseModel<List<BookingResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Bookings retrieved successfully.",
                    Data = bookings
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<BookingResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<BookingResponse>> GetBookingByIdAsync(string rid)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                if (long.TryParse(rid, out long id))
                {
                    parameters.Add("@BookingId", id);
                }
                else
                {
                    parameters.Add("@BookingRId", rid);
                }
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetBookings", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var bk = DataRowToObject.CreateItemFromRow<BookingResponse>(ds.Tables[0].Rows[0]);

                    if (ds.Tables.Count > 1)
                    {
                        bk.Attendees = ds.Tables[1].AsEnumerable()
                            .Select(r => DataRowToObject.CreateItemFromRow<AttendeeResponse>(r))
                            .ToList();
                    }

                    return new ApiResponseModel<BookingResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "Booking retrieved successfully.",
                        Data = bk
                    };
                }

                return new ApiResponseModel<BookingResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Booking not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<BookingResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> CancelBookingAsync(CancelBookingRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_CancelBooking", parameters);

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
                        Data = status == 200 ? "Booking cancelled successfully" : null
                    };
                }

                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to cancel booking."
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

        public async Task<ApiResponseModel<SeatAvailabilityResponse>> CheckSeatAvailabilityAsync(SeatAvailabilityRequest request)
        {
            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "@EventId", request.EventId },
                    { "@SlotId", request.SlotId }
                };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_CheckSeatAvailability", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    var availability = DataRowToObject.CreateItemFromRow<SeatAvailabilityResponse>(ds.Tables[0].Rows[0]);
                    return new ApiResponseModel<SeatAvailabilityResponse>
                    {
                        Success = true,
                        StatusCode = 200,
                        Message = "Seat availability checked successfully.",
                        Data = availability
                    };
                }

                return new ApiResponseModel<SeatAvailabilityResponse>
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "Slot or Event not found."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<SeatAvailabilityResponse>
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
