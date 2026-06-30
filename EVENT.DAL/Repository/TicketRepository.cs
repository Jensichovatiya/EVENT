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
    public class TicketRepository : ITicketRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public TicketRepository(
            IGeneralFunctions gf,
            IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }

        public async Task<ApiResponseModel<TicketResponse>> AddTicketAsync(TicketRequest request)
        {
            try
            {
                string jsonData =
                    JsonConvert.SerializeObject(request);

                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@HeaderJson", jsonData },
                        { "@Ticket_PublicId", request.PublicId ?? Guid.NewGuid() }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                    "USP_InsertEvent_Ticket",
                    parameters);

                if (ds != null &&
                    ds.Tables.Count > 0 &&
                    ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row =
                        ds.Tables[0].Rows[0];

                    int status =
                        Convert.ToInt32(
                            row["StatusCode"]);

                    string message =
                        Convert.ToString(
                            row["StatusMessage"]) ?? "";

                    if (status == 201)
                    {
                        var data =
                            ds.Tables.Count > 1
                            ? DataRowToObject
                            .CreateItemFromRow<TicketResponse>(
                                ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<TicketResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }

                    return new ApiResponseModel<TicketResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }

                return new ApiResponseModel<TicketResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to create ticket."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<TicketResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<EventPassResponse>> AddPassAsync(EventPassRequest request)
        {
            try
            {
                string jsonData =
                    JsonConvert.SerializeObject(request);

                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@HeaderJson", jsonData },
                        { "@Pass_PublicId", request.PublicId ?? Guid.NewGuid() }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_InsertEvent_Pass",
                        parameters);

                DataRow row = ds.Tables[0].Rows[0];

                int status =
                    Convert.ToInt32(row["StatusCode"]);

                string message =
                    Convert.ToString(row["StatusMessage"]) ?? "";

                if (status == 201)
                {
                    var data =
                        DataRowToObject
                        .CreateItemFromRow<EventPassResponse>(
                            ds.Tables[1].Rows[0]);

                    return new ApiResponseModel<EventPassResponse>
                    {
                        Success = true,
                        StatusCode = status,
                        Message = message,
                        Data = data
                    };
                }

                return new ApiResponseModel<EventPassResponse>
                {
                    Success = false,
                    StatusCode = status,
                    Message = message
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventPassResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<EventAddOnResponse>> AddAddOnAsync(EventAddOnRequest request)
        {
            try
            {
                string jsonData =
                    JsonConvert.SerializeObject(request);

                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@HeaderJson", jsonData },
                        { "@AddOn_PublicId", request.PublicId ?? Guid.NewGuid() }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_InsertEvent_AddOn",
                        parameters);

                if (ds != null &&
                    ds.Tables.Count > 0 &&
                    ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];

                    int status =
                        Convert.ToInt32(row["StatusCode"]);

                    string message =
                        Convert.ToString(row["StatusMessage"]) ?? "";

                    if (status == 201)
                    {
                        var data =
                            DataRowToObject
                            .CreateItemFromRow<EventAddOnResponse>(
                                ds.Tables[1].Rows[0]);

                        return new ApiResponseModel<EventAddOnResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }

                    return new ApiResponseModel<EventAddOnResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }

                return new ApiResponseModel<EventAddOnResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to create add-on."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventAddOnResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> DeleteAddOnAsync(string publicId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@AddOn_PublicId", publicId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_DeleteEvent_AddOn",
                        parameters);

                DataRow row =
                    ds.Tables[0].Rows[0];

                int status =
                    Convert.ToInt32(row["StatusCode"]);

                string message =
                    Convert.ToString(row["StatusMessage"]) ?? "";

                return new ApiResponseModel<string>
                {
                    Success = status == 200,
                    StatusCode = status,
                    Message = message,
                    Data = status == 200
                        ? "Add-On deleted successfully"
                        : null
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<EventPromoCodeResponse>> AddPromoCodeAsync(EventPromoCodeRequest request)
        {
            try
            {
                string jsonData =
                    JsonConvert.SerializeObject(request);

                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@HeaderJson", jsonData },
                        { "@PromoCode_PublicId", request.PublicId ?? Guid.NewGuid() }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_InsertEvent_PromoCode",
                        parameters);

                if (ds != null &&
                    ds.Tables.Count > 0 &&
                    ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row =
                        ds.Tables[0].Rows[0];

                    int status =
                        Convert.ToInt32(row["StatusCode"]);

                    string message =
                        Convert.ToString(row["StatusMessage"]) ?? "";

                    if (status == 201)
                    {
                        var data =
                            ds.Tables.Count > 1
                            ? DataRowToObject
                            .CreateItemFromRow<EventPromoCodeResponse>(
                                ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<EventPromoCodeResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }

                    return new ApiResponseModel<EventPromoCodeResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }

                return new ApiResponseModel<EventPromoCodeResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to create promo code."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventPromoCodeResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> DeletePromoCodeAsync(string publicId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@PromoCode_PublicId", publicId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_DeleteEvent_PromoCode",
                        parameters);

                DataRow row =
                    ds.Tables[0].Rows[0];

                int status =
                    Convert.ToInt32(row["StatusCode"]);

                string message =
                    Convert.ToString(row["StatusMessage"]) ?? "";

                return new ApiResponseModel<string>
                {
                    Success = status == 200,
                    StatusCode = status,
                    Message = message,
                    Data = status == 200
                        ? "Promo Code deleted successfully"
                        : null
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<EventTaxResponse>> AddTaxAsync(EventTaxRequest request)
        {
            try
            {
                string jsonData =
                    JsonConvert.SerializeObject(request);

                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@HeaderJson", jsonData },
                        { "@EventTax_PublicId", request.PublicId ?? Guid.NewGuid() }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_InsertEvent_Tax",
                        parameters);

                if (ds != null &&
                    ds.Tables.Count > 0 &&
                    ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row =
                        ds.Tables[0].Rows[0];

                    int status =
                        Convert.ToInt32(row["StatusCode"]);

                    string message =
                        Convert.ToString(row["StatusMessage"]) ?? "";

                    if (status == 201)
                    {
                        var data =
                            ds.Tables.Count > 1
                            ? DataRowToObject
                                .CreateItemFromRow<EventTaxResponse>(
                                    ds.Tables[1].Rows[0])
                            : null;

                        return new ApiResponseModel<EventTaxResponse>
                        {
                            Success = true,
                            StatusCode = status,
                            Message = message,
                            Data = data
                        };
                    }

                    return new ApiResponseModel<EventTaxResponse>
                    {
                        Success = false,
                        StatusCode = status,
                        Message = message
                    };
                }

                return new ApiResponseModel<EventTaxResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to create tax."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventTaxResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<string>> DeleteTaxAsync(string publicId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@EventTax_PublicId", publicId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_DeleteEvent_Tax",
                        parameters);

                DataRow row =
                    ds.Tables[0].Rows[0];

                int status =
                    Convert.ToInt32(row["StatusCode"]);

                string message =
                    Convert.ToString(row["StatusMessage"]) ?? "";

                return new ApiResponseModel<string>
                {
                    Success = status == 200,
                    StatusCode = status,
                    Message = message,
                    Data = status == 200
                        ? "Tax deleted successfully"
                        : null
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<string>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<EventFeeResponse>> AddFeeAsync(EventFeeRequest request)
        {
            string jsonData =
                JsonConvert.SerializeObject(request);

            var parameters =
                new Dictionary<string, object>
                {
                    { "@HeaderJson", jsonData },
                    { "@Fee_PublicId", request.PublicId ?? Guid.NewGuid() }
                };

            DataSet ds =
                await _gf.GetDataSetFromSPAsync(
                    "USP_InsertEvent_Fee",
                    parameters);

            DataRow row = ds.Tables[0].Rows[0];

            int status =
                Convert.ToInt32(row["StatusCode"]);

            string message =
                Convert.ToString(row["StatusMessage"]) ?? "";

            if (status == 201)
            {
                return new ApiResponseModel<EventFeeResponse>
                {
                    Success = true,
                    StatusCode = status,
                    Message = message,
                    Data = DataRowToObject
                        .CreateItemFromRow<EventFeeResponse>(
                            ds.Tables[1].Rows[0])
                };
            }

            return new ApiResponseModel<EventFeeResponse>
            {
                Success = false,
                StatusCode = status,
                Message = message
            };
        }

        public async Task<ApiResponseModel<string>> DeleteFeeAsync(string publicId)
        {
            var parameters =
                new Dictionary<string, object>
                {
                    { "@Fee_PublicId", publicId }
                };

            DataSet ds =
                await _gf.GetDataSetFromSPAsync(
                    "USP_DeleteEvent_Fee",
                    parameters);

            DataRow row = ds.Tables[0].Rows[0];

            return new ApiResponseModel<string>
            {
                Success =
                    Convert.ToInt32(row["StatusCode"]) == 200,

                StatusCode =
                    Convert.ToInt32(row["StatusCode"]),

                Message =
                    Convert.ToString(row["StatusMessage"]) ?? ""
            };
        }

        public async Task<ApiResponseModel<List<TicketResponse>>> GetTicketsAsync(long eventId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@EventId", eventId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_GetAllEvent_Ticket",
                        parameters);

                var list =
                    new List<TicketResponse>();

                if (ds != null &&
                    ds.Tables.Count > 0)
                {
                    list = ds.Tables[0]
                        .AsEnumerable()
                        .Select(x =>
                            DataRowToObject
                            .CreateItemFromRow<TicketResponse>(x))
                        .ToList();
                }

                return new ApiResponseModel<List<TicketResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Success",
                    Data = list
                };
            }
            catch(Exception ex)
            {
                return new ApiResponseModel<List<TicketResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<List<EventPassResponse>>> GetPassesAsync(long eventId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@EventId", eventId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_GetAllEvent_Pass",
                        parameters);

                var list =
                    new List<EventPassResponse>();

                if (ds != null &&
                    ds.Tables.Count > 0)
                {
                    list = ds.Tables[0]
                        .AsEnumerable()
                        .Select(x =>
                            DataRowToObject
                            .CreateItemFromRow<EventPassResponse>(x))
                        .ToList();
                }

                return new ApiResponseModel<List<EventPassResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Success",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<EventPassResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<List<EventAddOnResponse>>> GetAddOnsAsync(long eventId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@EventId", eventId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_GetAllEvent_AddOn",
                        parameters);

                var list =
                    new List<EventAddOnResponse>();

                if (ds != null &&
                    ds.Tables.Count > 0)
                {
                    list = ds.Tables[0]
                        .AsEnumerable()
                        .Select(x =>
                            DataRowToObject
                            .CreateItemFromRow<EventAddOnResponse>(x))
                        .ToList();
                }

                return new ApiResponseModel<List<EventAddOnResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Success",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<EventAddOnResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<List<EventPromoCodeResponse>>> GetPromoCodesAsync(long eventId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@EventId", eventId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_GetAllEvent_PromoCode",
                        parameters);

                var list =
                    new List<EventPromoCodeResponse>();

                if (ds != null &&
                    ds.Tables.Count > 0)
                {
                    list = ds.Tables[0]
                        .AsEnumerable()
                        .Select(x =>
                            DataRowToObject
                            .CreateItemFromRow<EventPromoCodeResponse>(x))
                        .ToList();
                }

                return new ApiResponseModel<List<EventPromoCodeResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Success",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<EventPromoCodeResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<List<EventTaxResponse>>> GetTaxesAsync(long eventId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@EventId", eventId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_GetAllEvent_Tax",
                        parameters);

                var list =
                    new List<EventTaxResponse>();

                if (ds != null &&
                    ds.Tables.Count > 0)
                {
                    list = ds.Tables[0]
                        .AsEnumerable()
                        .Select(x =>
                            DataRowToObject
                            .CreateItemFromRow<EventTaxResponse>(x))
                        .ToList();
                }

                return new ApiResponseModel<List<EventTaxResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Success",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<EventTaxResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<List<EventFeeResponse>>> GetFeesAsync(long eventId)
        {
            try
            {
                var parameters =
                    new Dictionary<string, object>
                    {
                        { "@EventId", eventId }
                    };

                DataSet ds =
                    await _gf.GetDataSetFromSPAsync(
                        "USP_GetAllEvent_Fee",
                        parameters);

                var list =
                    new List<EventFeeResponse>();

                if (ds != null &&
                    ds.Tables.Count > 0)
                {
                    list = ds.Tables[0]
                        .AsEnumerable()
                        .Select(x =>
                            DataRowToObject
                            .CreateItemFromRow<EventFeeResponse>(x))
                        .ToList();
                }

                return new ApiResponseModel<List<EventFeeResponse>>
                {
                    Success = true,
                    StatusCode = 200,
                    Message = "Success",
                    Data = list
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<List<EventFeeResponse>>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }
    }
}