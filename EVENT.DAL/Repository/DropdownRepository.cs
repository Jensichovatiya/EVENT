using EVENT.Business.BusinessClass;
using EVENT.DAL.IRepository;
using EVENT.Web.Models;
using INvoice.Models;
using System;
using System.Data;
using System.Threading.Tasks;

namespace EVENT.DAL.Repository
{
    public class DropdownRepository : IDropdownRepository
    {
        private readonly IGeneralFunctions _gf;

        public DropdownRepository(IGeneralFunctions gf)
        {
            _gf = gf;
        }

        public async Task<ApiResponseModel<UserDDLResponse>> GetUserDDLAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_User_GetDDL");
                var response = new UserDDLResponse();

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    int status = Convert.ToInt32(ds.Tables[0].Rows[0]["ResultStatus"]);
                    string message = Convert.ToString(ds.Tables[0].Rows[0]["ResultMessage"]) ?? "";

                    if (status == 200 && ds.Tables.Count > 1)
                    {
                        foreach (DataRow row in ds.Tables[1].Rows)
                        {
                            response.Roles.Add(new DropdownItem
                            {
                                Value = Convert.ToInt64(row["RoleId"]),
                                Label = Convert.ToString(row["RoleName"]) ?? ""
                            });
                        }

                        return new ApiResponseModel<UserDDLResponse>
                        {
                            Success = true,
                            StatusCode = 200,
                            Message = message,
                            Data = response
                        };
                    }
                }
                return new ApiResponseModel<UserDDLResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to fetch user DDL."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<UserDDLResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<EventDDLResponse>> GetEventDDLAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_Event_GetDDL");
                var response = new EventDDLResponse();

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    int status = Convert.ToInt32(ds.Tables[0].Rows[0]["ResultStatus"]);
                    string message = Convert.ToString(ds.Tables[0].Rows[0]["ResultMessage"]) ?? "";

                    if (status == 200)
                    {
                        if (ds.Tables.Count > 1)
                        {
                            foreach (DataRow row in ds.Tables[1].Rows)
                            {
                                response.Categories.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["CategoryId"]),
                                    Label = Convert.ToString(row["CategoryName"]) ?? ""
                                });
                            }
                        }

                        if (ds.Tables.Count > 2)
                        {
                            foreach (DataRow row in ds.Tables[2].Rows)
                            {
                                response.Organizers.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["UserId"]),
                                    Label = Convert.ToString(row["Name"]) ?? ""
                                });
                            }
                        }

                        return new ApiResponseModel<EventDDLResponse>
                        {
                            Success = true,
                            StatusCode = 200,
                            Message = message,
                            Data = response
                        };
                    }
                }
                return new ApiResponseModel<EventDDLResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to fetch event DDL."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventDDLResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<AssetDDLResponse>> GetAssetDDLAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_Asset_GetDDL");
                var response = new AssetDDLResponse();

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    int status = Convert.ToInt32(ds.Tables[0].Rows[0]["ResultStatus"]);
                    string message = Convert.ToString(ds.Tables[0].Rows[0]["ResultMessage"]) ?? "";

                    if (status == 200 && ds.Tables.Count > 1)
                    {
                        foreach (DataRow row in ds.Tables[1].Rows)
                        {
                            response.AssetTypes.Add(new DropdownItem
                            {
                                Value = Convert.ToInt64(row["AssetTypeId"]),
                                Label = Convert.ToString(row["TypeName"]) ?? ""
                            });
                        }

                        return new ApiResponseModel<AssetDDLResponse>
                        {
                            Success = true,
                            StatusCode = 200,
                            Message = message,
                            Data = response
                        };
                    }
                }
                return new ApiResponseModel<AssetDDLResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to fetch asset DDL."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<AssetDDLResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<BookingDDLResponse>> GetBookingDDLAsync()
        {
            try
            {
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_Booking_GetDDL");
                var response = new BookingDDLResponse();

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    int status = Convert.ToInt32(ds.Tables[0].Rows[0]["ResultStatus"]);
                    string message = Convert.ToString(ds.Tables[0].Rows[0]["ResultMessage"]) ?? "";

                    if (status == 200)
                    {
                        if (ds.Tables.Count > 1)
                        {
                            foreach (DataRow row in ds.Tables[1].Rows)
                            {
                                response.EventSlots.Add(new EventSlotDropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? "",
                                    SlotId = Convert.ToInt64(row["SlotId"]),
                                    EventId = Convert.ToInt64(row["EventId"]),
                                    EventName = Convert.ToString(row["EventName"]) ?? "",
                                    SlotDate = Convert.ToDateTime(row["SlotDate"]),
                                    StartTime = Convert.ToString(row["StartTime"]) ?? "",
                                    EndTime = Convert.ToString(row["EndTime"]) ?? "",
                                    SlotName = Convert.ToString(row["SlotName"]) ?? "",
                                    TicketPrice = Convert.ToDecimal(row["TicketPrice"])
                                });
                            }
                        }

                        if (ds.Tables.Count > 2)
                        {
                            foreach (DataRow row in ds.Tables[2].Rows)
                            {
                                response.Zones.Add(new ZoneDropdownItem
                                {
                                    Value = Convert.ToInt64(row["ZoneId"]),
                                    Label = Convert.ToString(row["ZoneName"]) ?? "",
                                    SeatPrice = Convert.ToDecimal(row["SeatPrice"]),
                                    Capacity = Convert.ToInt32(row["Capacity"]),
                                    BlueprintId = Convert.ToInt64(row["BlueprintId"]),
                                    EventId = Convert.ToInt64(row["EventId"])
                                });
                            }
                        }

                        return new ApiResponseModel<BookingDDLResponse>
                        {
                            Success = true,
                            StatusCode = 200,
                            Message = message,
                            Data = response
                        };
                    }
                }
                return new ApiResponseModel<BookingDDLResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to fetch booking DDL."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<BookingDDLResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }

        public async Task<ApiResponseModel<EventDropdownsResponse>> GetEventDropdownsAsync(long eventId = 0)
        {
            try
            {
                var parameters = new Dictionary<string, object> { { "@EventId", eventId } };
                DataSet ds = await _gf.GetDataSetFromSPAsync("USP_GetEventDropdowns", parameters);
                var response = new EventDropdownsResponse();

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    int status = Convert.ToInt32(ds.Tables[0].Rows[0]["ResultStatus"]);
                    string message = Convert.ToString(ds.Tables[0].Rows[0]["ResultMessage"]) ?? "";

                    if (status == 200)
                    {
                        // Currencies (Table 1)
                        if (ds.Tables.Count > 1)
                        {
                            foreach (DataRow row in ds.Tables[1].Rows)
                            {
                                response.Currencies.Add(new CurrencyDropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Code = Convert.ToString(row["Code"]) ?? "",
                                    Label = Convert.ToString(row["Label"]) ?? "",
                                    Symbol = Convert.ToString(row["Symbol"]) ?? ""
                                });
                            }
                        }

                        // ListingTypes (Table 2)
                        if (ds.Tables.Count > 2)
                        {
                            foreach (DataRow row in ds.Tables[2].Rows)
                            {
                                response.ListingTypes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // BookingTypes (Table 3)
                        if (ds.Tables.Count > 3)
                        {
                            foreach (DataRow row in ds.Tables[3].Rows)
                            {
                                response.BookingTypes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // EventTypes (Table 4)
                        if (ds.Tables.Count > 4)
                        {
                            foreach (DataRow row in ds.Tables[4].Rows)
                            {
                                response.EventTypes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // ZoneTypes (Table 5)
                        if (ds.Tables.Count > 5)
                        {
                            foreach (DataRow row in ds.Tables[5].Rows)
                            {
                                response.ZoneTypes.Add(new StringDropdownItem
                                {
                                    Value = Convert.ToString(row["Value"]) ?? "",
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }
 
                        // GateTypes (Table 6)
                        if (ds.Tables.Count > 6)
                        {
                            foreach (DataRow row in ds.Tables[6].Rows)
                            {
                                response.GateTypes.Add(new StringDropdownItem
                                {
                                    Value = Convert.ToString(row["Value"]) ?? "",
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // EntryGates (Table 7)
                        if (ds.Tables.Count > 7)
                        {
                            foreach (DataRow row in ds.Tables[7].Rows)
                            {
                                response.EntryGates.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        return new ApiResponseModel<EventDropdownsResponse>
                        {
                            Success = true,
                            StatusCode = 200,
                            Message = message,
                            Data = response
                        };
                    }
                }

                return new ApiResponseModel<EventDropdownsResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Failed to fetch event dropdowns."
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<EventDropdownsResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = ex.Message
                };
            }
        }
    }
}
