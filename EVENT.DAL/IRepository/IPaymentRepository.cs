using EVENT.Business.BusinessClass;
using EVENT.Web.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVENT.DAL.IRepository
{
    public interface IPaymentRepository
    {
        Task<ApiResponseModel<TaxResponse>> AddEditTaxAsync(TaxRequest request);
        Task<ApiResponseModel<List<TaxResponse>>> GetTaxesAsync();
        Task<ApiResponseModel<InvoiceResponse>> AddEditInvoiceAsync(InvoiceRequest request);
        Task<ApiResponseModel<List<InvoiceResponse>>> GetInvoicesAsync(long? userId = null, int? userRole = null);
        Task<ApiResponseModel<PaymentResponse>> AddPaymentAsync(PaymentRequest request);
        Task<ApiResponseModel<string>> RecordFailedPaymentAsync(PaymentRequest request);
        Task<ApiResponseModel<List<PaymentResponse>>> GetPaymentsAsync();
        Task<ApiResponseModel<string>> RefundPaymentAsync(RefundRequest request);
    }
}
