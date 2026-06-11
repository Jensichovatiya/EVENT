using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.WebAPI.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class EventController : ControllerBase
    {
        private readonly IEventRepository _eventRepository;

        public EventController(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        [HttpPost("events")]
        public async Task<IActionResult> AddEditEvent([FromForm] string model, List<IFormFile>? attachments)
        {
            if (string.IsNullOrEmpty(model))
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Model parameter is required." });

            var eventRequest = Newtonsoft.Json.JsonConvert.DeserializeObject<EventRequest>(model);
            if (eventRequest == null)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid event request JSON." });

            // Validate deserialized model
            TryValidateModel(eventRequest);
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _eventRepository.AddEditEvent(eventRequest, attachments);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetEvents()
        {
            var result = await _eventRepository.GetEventsAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("events/{id}")]
        public async Task<IActionResult> GetEventById(string id)
        {
            var result = await _eventRepository.GetEventByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("events/status")]
        public async Task<IActionResult> UpdateEventStatus([FromBody] EventStatusUpdateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _eventRepository.UpdateEventStatusAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("events/duplicate")]
        public async Task<IActionResult> DuplicateEvent([FromBody] DuplicateEventRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _eventRepository.DuplicateEventAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("events/slots/delete/{slotId}")]
        public async Task<IActionResult> DeleteSlot(long slotId)
        {
            var result = await _eventRepository.DeleteEventSlotAsync(slotId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("events/documents/delete/{documentId}")]
        public async Task<IActionResult> DeleteDocument(long documentId)
        {
            var result = await _eventRepository.DeleteEventDocumentAsync(documentId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("events/analytics")]
        public async Task<IActionResult> GetEventAnalytics()
        {
            var result = await _eventRepository.GetEventAnalyticsAsync();
            return StatusCode(result.StatusCode, result);
        }
    }
}
