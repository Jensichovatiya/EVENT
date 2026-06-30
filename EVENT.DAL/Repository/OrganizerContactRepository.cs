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
    public class OrganizerContactRepository : IOrganizerContactRepository
    {
        private readonly IGeneralFunctions _gf;
        private readonly IConfiguration _config;

        public OrganizerContactRepository(
            IGeneralFunctions gf,
            IConfiguration config)
        {
            _gf = gf;
            _config = config;
        }


public async Task<ApiResponseModel<OrganizerContactResponse>> AddEditOrganizerContactAsync(OrganizerContactRequest request)
{
    try
    {
        string jsonData = JsonConvert.SerializeObject(request);

        var parameters = new Dictionary<string, object>
        {
            { "@HeaderJson", jsonData }
        };

        DataSet ds = await _gf.GetDataSetFromSPAsync(
            "USP_InsertUpdate_Organizer_Contact",
            parameters);

        if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
        {
            DataRow row = ds.Tables[0].Rows[0];

            int status = Convert.ToInt32(row["StatusCode"]);

            string message = Convert.ToString(row["StatusMessage"]) ?? "";

            if (status == 200 || status == 201)
            {
                var data = ds.Tables.Count > 1
                    ? DataRowToObject.CreateItemFromRow<OrganizerContactResponse>(ds.Tables[1].Rows[0])
                    : null;

                return new ApiResponseModel<OrganizerContactResponse>
                {
                    Success = true,
                    StatusCode = status,
                    Message = message,
                    Data = data
                };
            }

            return new ApiResponseModel<OrganizerContactResponse>
            {
                Success = false,
                StatusCode = status,
                Message = message
            };
        }

        return new ApiResponseModel<OrganizerContactResponse>
        {
            Success = false,
            StatusCode = 500,
            Message = "Operation failed."
        };
    }
    catch (Exception ex)
    {
        return new ApiResponseModel<OrganizerContactResponse>
        {
            Success = false,
            StatusCode = 500,
            Message = ex.Message
        };
    }
}

public async Task<ApiResponseModel<List<OrganizerContactResponse>>> GetOrganizerContactsAsync()
{
    try
    {
        DataSet ds = await _gf.GetDataSetFromSPAsync(
            "USP_GetAll_Organizer_Contact");

        var list = new List<OrganizerContactResponse>();

        if (ds != null &&
            ds.Tables.Count > 0)
        {
            list = ds.Tables[0]
                .AsEnumerable()
                .Select(x => DataRowToObject.CreateItemFromRow<OrganizerContactResponse>(x))
                .ToList();
        }

        return new ApiResponseModel<List<OrganizerContactResponse>>
        {
            Success = true,
            StatusCode = 200,
            Message = "Success",
            Data = list
        };
    }
    catch (Exception ex)
    {
        return new ApiResponseModel<List<OrganizerContactResponse>>
        {
            Success = false,
            StatusCode = 500,
            Message = ex.Message
        };
    }
}

public async Task<ApiResponseModel<OrganizerContactResponse>> GetOrganizerContactByIdAsync(string id)
{
    try
    {
        var parameters = new Dictionary<string, object>
        {
            { "@PublicId", id }
        };

        DataSet ds = await _gf.GetDataSetFromSPAsync(
            "USP_Get_Organizer_Contact",
            parameters);

        if (ds != null &&
            ds.Tables.Count > 0 &&
            ds.Tables[0].Rows.Count > 0)
        {
            var item = DataRowToObject.CreateItemFromRow<OrganizerContactResponse>(
                ds.Tables[0].Rows[0]);

            return new ApiResponseModel<OrganizerContactResponse>
            {
                Success = true,
                StatusCode = 200,
                Message = "Success",
                Data = item
            };
        }

        return new ApiResponseModel<OrganizerContactResponse>
        {
            Success = false,
            StatusCode = 404,
            Message = "Record not found."
        };
    }
    catch (Exception ex)
    {
        return new ApiResponseModel<OrganizerContactResponse>
        {
            Success = false,
            StatusCode = 500,
            Message = ex.Message
        };
    }
}


public async Task<ApiResponseModel<string>> DeleteOrganizerContactAsync(string id)
{
    try
    {
        var parameters = new Dictionary<string, object>
        {
            { "@PublicId", id }
        };

        DataSet ds = await _gf.GetDataSetFromSPAsync(
            "USP_Delete_Organizer_Contact",
            parameters);

        DataRow row = ds.Tables[0].Rows[0];

        return new ApiResponseModel<string>
        {
            Success = Convert.ToInt32(row["StatusCode"]) == 200,
            StatusCode = Convert.ToInt32(row["StatusCode"]),
            Message = Convert.ToString(row["StatusMessage"]) ?? ""
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

   }
}



