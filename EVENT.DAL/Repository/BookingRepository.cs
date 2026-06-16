using EVENT.Business.BusinessClass;
using EVENT.Business.Settings;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;

namespace EVENT.DAL.Repository
{
    public class BookingRepository : BaseRepository, IBookingRepository
    {
        private readonly IConfiguration _config;

        public BookingRepository(IOptions<ApplicationSettings> connectionString, IConfiguration config) : base(connectionString)
        {
            _config = config;
        }

        public async Task<ApiResponseModel<BookingResponse>> CreateUpdateBookingAsync(BookingRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new { JsonData = jsonData };

                using (var connection = new SqlConnection(_connectionString.Value.ConnectionString))
                {
                    await connection.OpenAsync();
                    using (var multi = await connection.QueryMultipleAsync("USP_CreateUpdateBooking", parameters, commandType: CommandType.StoredProcedure))
                    {
                        var status = await multi.ReadFirstOrDefaultAsync<dynamic>();
                        if (status != null)
                        {
                            int statusCode = (int)status.ResultStatus;
                            string message = (string)status.ResultMessage;

                            if (statusCode == 200 || statusCode == 201)
                            {
                                var booking = await multi.ReadFirstOrDefaultAsync<BookingResponse>();
                                if (booking != null)
                                {
                                    booking.Attendees = (await multi.ReadAsync<AttendeeResponse>()).ToList();
                                }

                                return new ApiResponseModel<BookingResponse>
                                {
                                    Success = true,
                                    StatusCode = statusCode,
                                    Message = message,
                                    Data = booking
                                };
                            }

                            return new ApiResponseModel<BookingResponse>
                            {
                                Success = false,
                                StatusCode = statusCode,
                                Message = message
                            };
                        }
                    }
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
                using (var connection = new SqlConnection(_connectionString.Value.ConnectionString))
                {
                    await connection.OpenAsync();
                    using (var multi = await connection.QueryMultipleAsync("USP_GetBookings", commandType: CommandType.StoredProcedure))
                    {
                        var bookings = (await multi.ReadAsync<BookingResponse>()).ToList();
                        var attendees = (await multi.ReadAsync<AttendeeResponse>()).ToList();

                        foreach (var bk in bookings)
                        {
                            bk.Attendees = attendees.Where(a => a.BookingId == bk.BookingId).ToList();
                        }

                        return new ApiResponseModel<List<BookingResponse>>
                        {
                            Success = true,
                            StatusCode = 200,
                            Message = "Bookings retrieved successfully.",
                            Data = bookings
                        };
                    }
                }
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
                var parameters = new DynamicParameters();
                if (long.TryParse(rid, out long id))
                {
                    parameters.Add("@BookingId", id);
                }
                else
                {
                    parameters.Add("@BookingRId", rid);
                }

                using (var connection = new SqlConnection(_connectionString.Value.ConnectionString))
                {
                    await connection.OpenAsync();
                    using (var multi = await connection.QueryMultipleAsync("USP_GetBookings", parameters, commandType: CommandType.StoredProcedure))
                    {
                        var booking = await multi.ReadFirstOrDefaultAsync<BookingResponse>();
                        if (booking != null)
                        {
                            booking.Attendees = (await multi.ReadAsync<AttendeeResponse>()).ToList();

                            return new ApiResponseModel<BookingResponse>
                            {
                                Success = true,
                                StatusCode = 200,
                                Message = "Booking retrieved successfully.",
                                Data = booking
                            };
                        }
                    }
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
                var parameters = new { JsonData = jsonData };

                using (var connection = new SqlConnection(_connectionString.Value.ConnectionString))
                {
                    await connection.OpenAsync();
                    var row = await connection.QueryFirstOrDefaultAsync<dynamic>("USP_CancelBooking", parameters, commandType: CommandType.StoredProcedure);
                    if (row != null)
                    {
                        int status = (int)row.ResultStatus;
                        string message = (string)row.ResultMessage;

                        return new ApiResponseModel<string>
                        {
                            Success = status == 200,
                            StatusCode = status,
                            Message = message,
                            Data = status == 200 ? "Booking cancelled successfully" : null
                        };
                    }
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
                var parameters = new { EventId = request.EventId, SlotId = request.SlotId };

                using (var connection = new SqlConnection(_connectionString.Value.ConnectionString))
                {
                    await connection.OpenAsync();
                    using (var multi = await connection.QueryMultipleAsync("USP_CheckSeatAvailability", parameters, commandType: CommandType.StoredProcedure))
                    {
                        var availability = await multi.ReadFirstOrDefaultAsync<SeatAvailabilityResponse>();
                        if (availability != null)
                        {
                            var bookedSeats = await multi.ReadAsync<string>();
                            availability.BookedSeatNumbers = bookedSeats.ToList();

                            return new ApiResponseModel<SeatAvailabilityResponse>
                            {
                                Success = true,
                                StatusCode = 200,
                                Message = "Seat availability checked successfully.",
                                Data = availability
                            };
                        }
                    }
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

