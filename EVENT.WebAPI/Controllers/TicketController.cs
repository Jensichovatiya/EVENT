using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EVENT.WebApi.Controllers
{
    [Route("api")]
    [ApiController]
    [AllowAnonymous]
    public class TicketController : ControllerBase
    {
        private readonly ITicketRepository _ticketRepository;

        public TicketController(
            ITicketRepository ticketRepository)
        {
            _ticketRepository = ticketRepository;
        }

        [HttpPost("tickets")]
        public async Task<IActionResult> AddTicket([FromBody] TicketRequest request)
        {
            var result = await _ticketRepository.AddTicketAsync(request);

            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{eventId}/tickets")]
        public async Task<IActionResult> GetTickets(long eventId)
        {
            var result =await _ticketRepository.GetTicketsAsync(eventId);

            return StatusCode(result.StatusCode,result);
        }

        [HttpPost("passes")]
        public async Task<IActionResult> AddPass([FromBody] EventPassRequest request)
        {
            var result = await _ticketRepository.AddPassAsync(request);

            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{eventId}/passes")]
        public async Task<IActionResult> GetPasses(long eventId)
        {
            var result = await _ticketRepository.GetPassesAsync(eventId);

            return StatusCode(result.StatusCode,result);
        }

        [HttpPost("addons")]
        public async Task<IActionResult>   AddAddOn([FromBody] EventAddOnRequest request)
        {
            var result =  await _ticketRepository .AddAddOnAsync(request);

            return StatusCode( result.StatusCode,result);
        }

        [HttpGet("{eventId}/addons")]
        public async Task<IActionResult>
            GetAddOns(long eventId)
        {
            var result =await _ticketRepository.GetAddOnsAsync(eventId);

            return StatusCode(result.StatusCode,result);
        }

        [HttpDelete("addons/{publicId}")]
        public async Task<IActionResult> DeleteAddOn(string publicId)
        {
            var result = await _ticketRepository.DeleteAddOnAsync(publicId);

            return StatusCode(result.StatusCode, result);
        }

      
        [HttpPost("promo-codes")]
        public async Task<IActionResult> AddPromoCode([FromBody] EventPromoCodeRequest request)
        {
            var result = await _ticketRepository.AddPromoCodeAsync(request);

            return StatusCode(result.StatusCode, result);
        }

       [HttpGet("{eventId}/promocodes")]
        public async Task<IActionResult> GetPromoCodes(long eventId)
        {
            var result =
                await _ticketRepository.GetPromoCodesAsync(eventId);

            return StatusCode(result.StatusCode,result);
        }


        [HttpDelete("promo-codes/{publicId}")]
        public async Task<IActionResult> DeletePromoCode(string publicId)
        {
            var result = await _ticketRepository.DeletePromoCodeAsync(publicId);

            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("event-taxes")]
        public async Task<IActionResult> AddTax([FromBody] EventTaxRequest request)
        {
            var result =
                await _ticketRepository
                .AddTaxAsync(request);

            return StatusCode(
                result.StatusCode,
                result);
        }

        [HttpDelete("event-taxes/{publicId}")]
        public async Task<IActionResult> DeleteTax(string publicId)
        {
            var result =await _ticketRepository.DeleteTaxAsync(publicId);

            return StatusCode(result.StatusCode,result);
        }

        [HttpGet("{eventId}/taxes")]
        public async Task<IActionResult> GetTaxes(long eventId)
        {
            var result = await _ticketRepository.GetTaxesAsync(eventId);

            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("fees")]
        public async Task<IActionResult> AddFee(
            [FromBody] EventFeeRequest request)
        {
            var result =await _ticketRepository.AddFeeAsync(request);

            return StatusCode(result.StatusCode,result);
        }

        [HttpDelete("fees/{publicId}")]
        public async Task<IActionResult> DeleteFee(string publicId)
        {
            var result =await _ticketRepository.DeleteFeeAsync(publicId);

            return StatusCode(result.StatusCode,result);
        }

        [HttpGet("{eventId}/fees")]
        public async Task<IActionResult> GetFees(long eventId)
        {
            var result = await _ticketRepository.GetFeesAsync(eventId);

            return StatusCode(result.StatusCode, result);
        }
    }
}