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
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentRepository _paymentRepository;

        public PaymentController(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        [HttpPost("taxes")]
        public async Task<IActionResult> AddEditTax([FromBody] TaxRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _paymentRepository.AddEditTaxAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("taxes")]
        public async Task<IActionResult> GetTaxes()
        {
            var result = await _paymentRepository.GetTaxesAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("invoices")]
        public async Task<IActionResult> AddEditInvoice([FromBody] InvoiceRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _paymentRepository.AddEditInvoiceAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices([FromQuery] long? userId = null)
        {
            int? resolvedUserRole = null;

            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (int.TryParse(roleClaim, out int parsedRole))
            {
                resolvedUserRole = parsedRole;
            }

            // Visitor (or other non-authorized roles) cannot view or access invoices at all
            if (resolvedUserRole != 1 && resolvedUserRole != 2)
            {
                return StatusCode(403, new ApiResponseModel<object> { Success = false, StatusCode = 403, Message = "Access denied. Invoices are only accessible to Administrators and Organizers." });
            }

            var userIdClaim = User.FindFirst("UserId")?.Value;
            long.TryParse(userIdClaim, out long parsedUserId);

            long? resolvedUserId = userId;
            // Role-based access control: only SuperAdmin (Role 1) can fetch invoices for other user IDs.
            // Organizer (Role 2) must only be allowed to query using their own UserId.
            if (resolvedUserRole != 1)
            {
                resolvedUserId = parsedUserId;
            }
            else if (!resolvedUserId.HasValue)
            {
                resolvedUserId = parsedUserId;
            }

            var result = await _paymentRepository.GetInvoicesAsync(resolvedUserId, resolvedUserRole);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("payments")]
        public async Task<IActionResult> AddPayment([FromBody] PaymentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _paymentRepository.AddPaymentAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("payments/fail")]
        public async Task<IActionResult> RecordFailedPayment([FromBody] PaymentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _paymentRepository.RecordFailedPaymentAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments()
        {
            var result = await _paymentRepository.GetPaymentsAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("payments/refund")]
        public async Task<IActionResult> RefundPayment([FromBody] RefundRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponseModel<object> { Success = false, StatusCode = 400, Message = "Invalid state input." });

            var result = await _paymentRepository.RefundPaymentAsync(request);
            return StatusCode(result.StatusCode, result);
        }
    }
}
