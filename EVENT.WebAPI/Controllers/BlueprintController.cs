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
    [Route("api/blueprints")]
    [AllowAnonymous]
    public class BlueprintController : ControllerBase
    {
        private readonly IBlueprintRepository _blueprintRepository;

        public BlueprintController(IBlueprintRepository blueprintRepository)
        {
            _blueprintRepository = blueprintRepository;
        }

        // ==========================================
        // BLUEPRINT ENDPOINTS
        // ==========================================

        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetBlueprints(long eventId)
        {
            var result = await _blueprintRepository.GetBlueprintsByEventAsync(eventId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{blueprintId}")]
        public async Task<IActionResult> GetBlueprintById(long blueprintId, [FromQuery] string rid = "")
        {
            var result = await _blueprintRepository.GetBlueprintByIdAsync(blueprintId, rid);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        public async Task<IActionResult> AddEditBlueprint([FromBody] BlueprintRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _blueprintRepository.AddEditBlueprintAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{blueprintId}")]
        public async Task<IActionResult> DeleteBlueprint(long blueprintId, [FromQuery] string rid = "")
        {
            var result = await _blueprintRepository.DeleteBlueprintAsync(blueprintId, rid);
            return StatusCode(result.StatusCode, result);
        }

        // ==========================================
        // ZONE ENDPOINTS
        // ==========================================

        [HttpGet("zones/blueprint/{blueprintId}")]
        public async Task<IActionResult> GetZones(long blueprintId)
        {
            var result = await _blueprintRepository.GetZonesByBlueprintAsync(blueprintId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("zones/{zoneId}")]
        public async Task<IActionResult> GetZoneById(long zoneId, [FromQuery] string rid = "")
        {
            var result = await _blueprintRepository.GetZoneByIdAsync(zoneId, rid);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("zones")]
        public async Task<IActionResult> AddEditZone([FromBody] ZoneRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _blueprintRepository.AddEditZoneAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("zones/{zoneId}")]
        public async Task<IActionResult> DeleteZone(long zoneId, [FromQuery] string rid = "")
        {
            var result = await _blueprintRepository.DeleteZoneAsync(zoneId, rid);
            return StatusCode(result.StatusCode, result);
        }

        // ==========================================
        // SEAT ENDPOINTS
        // ==========================================

        [HttpGet("seats/zone/{zoneId}")]
        public async Task<IActionResult> GetSeats(long zoneId)
        {
            var result = await _blueprintRepository.GetSeatsByZoneAsync(zoneId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("seats/save-bulk")]
        public async Task<IActionResult> SaveSeats([FromBody] List<ZoneSeatRequest> request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _blueprintRepository.SaveZoneSeatsAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        // ==========================================
        // ENTRY GATE ENDPOINTS
        // ==========================================

        [HttpGet("entrygates/event/{eventId}")]
        public async Task<IActionResult> GetEntryGates(long eventId)
        {
            var result = await _blueprintRepository.GetEntryGatesByEventAsync(eventId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("entrygates")]
        public async Task<IActionResult> AddEditEntryGate([FromBody] EntryGateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _blueprintRepository.AddEditEntryGateAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        // ==========================================
        // PRICING ENDPOINTS
        // ==========================================

        [HttpGet("pricing/event/{eventId}")]
        public async Task<IActionResult> GetZonePricing(long eventId)
        {
            var result = await _blueprintRepository.GetZonePricingByEventAsync(eventId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("pricing")]
        public async Task<IActionResult> AddEditZonePricing([FromBody] ZonePricingRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _blueprintRepository.AddEditZonePricingAsync(request);
            return StatusCode(result.StatusCode, result);
        }
    }
}
