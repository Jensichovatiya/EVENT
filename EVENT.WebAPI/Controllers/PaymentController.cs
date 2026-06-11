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
        public async Task<IActionResult> GetInvoices()
        {
            var result = await _paymentRepository.GetInvoicesAsync();
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
