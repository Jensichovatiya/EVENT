using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.WebAPI.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;

        public BookingController(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        [HttpPost("bookings")]
        public async Task<IActionResult> CreateUpdateBooking([FromBody] BookingRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _bookingRepository.CreateUpdateBookingAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetBookings()
        {
            var result = await _bookingRepository.GetBookingsAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("bookings/{id}")]
        public async Task<IActionResult> GetBookingById(string id)
        {
            var result = await _bookingRepository.GetBookingByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("bookings/cancel")]
        public async Task<IActionResult> CancelBooking([FromBody] CancelBookingRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _bookingRepository.CancelBookingAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("bookings/availability")]
        public async Task<IActionResult> CheckSeatAvailability([FromQuery] SeatAvailabilityRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _bookingRepository.CheckSeatAvailabilityAsync(request);
            return StatusCode(result.StatusCode, result);
        }
    }
}
