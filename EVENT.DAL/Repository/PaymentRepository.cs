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
    public class PaymentRepository : IPaymentRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public PaymentRepository(IGeneralFunctions gf, IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }

        public async Task<ApiResponseModel<TaxResponse>> AddEditTaxAsync(TaxRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditTax", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<TaxResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<TaxResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<TaxResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<TaxResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete tax operation."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<TaxResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<TaxResponse>>> GetTaxesAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetTaxes");
                var list = new List<TaxResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<TaxResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<TaxResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Taxes retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<TaxResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<InvoiceResponse>> AddEditInvoiceAsync(InvoiceRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddEditInvoice", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<InvoiceResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<InvoiceResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<InvoiceResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<InvoiceResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete invoice operation."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<InvoiceResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<InvoiceResponse>>> GetInvoicesAsync(long? userId = null, int? userRole = null)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                if (userId.HasValue)
                {
                    parameters.Add("@UserId", userId.Value);
                }
                if (userRole.HasValue)
                {
                    parameters.Add("@UserRole", userRole.Value);
                }
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetInvoices", parameters);
                var list = new List<InvoiceResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<InvoiceResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<InvoiceResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Invoices retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<InvoiceResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<PaymentResponse>> AddPaymentAsync(PaymentRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_AddPayment", parameters);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    int status = Convert.ToInt32(row["ResultStatus"]);
                    string message = Convert.ToString(row["ResultMessage"]) ?? "";

                    if (status == 201 || status == 200)
                    {
                        var data = ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0
                            ? DataRowToObject.CreateItemFromRow<PaymentResponse>(ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<PaymentResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }
                    return new ApiResponseModel<PaymentResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }
                return new ApiResponseModel<PaymentResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to complete payment."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<PaymentResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<List<PaymentResponse>>> GetPaymentsAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetPayments");
                var list = new List<PaymentResponse>();

                if (ds != null && ds.Tables.Count > 0)
                {
                    list = ds.Tables[0].AsEnumerable()
                        .Select(row => DataRowToObject.CreateItemFromRow<PaymentResponse>(row))
                        .ToList();
                }

                return new ApiResponseModel<List<PaymentResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Payments retrieved successfully.",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<PaymentResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message,
                    Errors = new List<string> { ex.StackTrace ?? "" }
                };
            }
        }

        public async Task<ApiResponseModel<string>> RefundPaymentAsync(RefundRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_RefundPayment", parameters);

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
                        Data = status == 200 ? "Refund processed successfully" : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Refund failed."
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

        public async Task<ApiResponseModel<string>> RecordFailedPaymentAsync(PaymentRequest request)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(request);
                var parameters = new Dictionary<string, object> { { "@JsonData", jsonData } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_RecordFailedPayment", parameters);

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
                        Data = status == 200 ? "Failed payment logged successfully." : null
                    };
                }
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to log failed payment."
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
    }
}
