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
                                // response.EventSlots.Add(new EventSlotDropdownItem
                                // {
                                //     Value = Convert.ToInt64(row["Value"]),
                                //     Label = Convert.ToString(row["Label"]) ?? "",
                                //     SlotId = Convert.ToInt64(row["SlotId"]),
                                //     EventId = Convert.ToInt64(row["EventId"]),
                                //     EventName = Convert.ToString(row["EventName"]) ?? "",
                                //     SlotDate = Convert.ToDateTime(row["SlotDate"]),
                                //     StartTime = Convert.ToString(row["StartTime"]) ?? "",
                                //     EndTime = Convert.ToString(row["EndTime"]) ?? "",
                                //     SlotName = Convert.ToString(row["SlotName"]) ?? "",
                                //     TicketPrice = Convert.ToDecimal(row["TicketPrice"])
                                // });

                        response.EventSlots.Add(new EventSlotDropdownItem
                        {
                            Value = Convert.ToInt64(row["Value"]),
                            Label = Convert.ToString(row["Label"]) ?? "",

                            SlotId = Convert.ToInt64(row["SlotId"]),
                            EventId = Convert.ToInt64(row["EventId"]),

                            EventName = Convert.ToString(row["EventName"]) ?? "",

                            StartDate = row["StartDate"] == DBNull.Value
                                ? DateTime.MinValue
                                : Convert.ToDateTime(row["StartDate"]),

                            EndDate = row["EndDate"] == DBNull.Value
                                ? (DateTime?)null
                                : Convert.ToDateTime(row["EndDate"]),

                            StartTime = row["StartTime"] == DBNull.Value
                                ? ""
                                : Convert.ToString(row["StartTime"]),

                            EndTime = row["EndTime"] == DBNull.Value
                                ? ""
                                : Convert.ToString(row["EndTime"]),

                            SlotName = row["SlotName"] == DBNull.Value
                                ? ""
                                : Convert.ToString(row["SlotName"]),

                            TicketPrice = row["TicketPrice"] == DBNull.Value
                                ? 0
                                : Convert.ToDecimal(row["TicketPrice"]),

                            Capacity = row["Capacity"] == DBNull.Value
                                ? 0
                                : Convert.ToInt32(row["Capacity"]),

                            BookedSeats = row["BookedSeats"] == DBNull.Value
                                ? 0
                                : Convert.ToInt32(row["BookedSeats"]),

                            AvailableSeats = row["AvailableSeats"] == DBNull.Value
                                ? 0
                                : Convert.ToInt32(row["AvailableSeats"]),

                            EventMode = row["EventMode"] == DBNull.Value
                                ? ""
                                : Convert.ToString(row["EventMode"]),

                            Timezone = row["Timezone"] == DBNull.Value
                                ? ""
                                : Convert.ToString(row["Timezone"]),

                            AllDay = row["AllDay"] != DBNull.Value &&
                                    Convert.ToBoolean(row["AllDay"])
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

                        // Timezones (Table 8)
                        if (ds.Tables.Count > 8)
                        {
                            foreach (DataRow row in ds.Tables[8].Rows)
                            {
                                response.Timezones.Add(new StringDropdownItem
                                {
                                    Value = Convert.ToString(row["Value"]) ?? "",
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // VenueTypes (Table 9)
                        if (ds.Tables.Count > 9)
                        {
                            foreach (DataRow row in ds.Tables[9].Rows)
                            {
                                response.VenueTypes.Add(new StringDropdownItem
                                {
                                    Value = Convert.ToString(row["Value"]) ?? "",
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // VenueCategories (Table 10)
                        if (ds.Tables.Count > 10)
                        {
                            foreach (DataRow row in ds.Tables[10].Rows)
                            {
                                response.VenueCategories.Add(new StringDropdownItem
                                {
                                    Value = Convert.ToString(row["Value"]) ?? "",
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // EmployeeCounts (Table 11) - from Tracket_Master_GeneralMasterValue where DDL_ID = 'EMPLOYEE_COUNT'
                        if (ds.Tables.Count > 11)
                        {
                            foreach (DataRow row in ds.Tables[11].Rows)
                            {
                                response.EmployeeCounts.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // Industries (Table 12) - from Tracket_Master_GeneralMasterValue where DDL_ID = 'INDUSTRY'
                        if (ds.Tables.Count > 12)
                        {
                            foreach (DataRow row in ds.Tables[12].Rows)
                            {
                                response.Industries.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // BusinessTypes (Table 13) - from Tracket_Master_GeneralMasterValue where DDL_ID = 'BUSINESS_TYPE'
                        if (ds.Tables.Count > 13)
                        {
                            foreach (DataRow row in ds.Tables[13].Rows)
                            {
                                response.BusinessTypes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // OrganizerTypes (Table 14)
                        if (ds.Tables.Count > 14)
                        {
                            foreach (DataRow row in ds.Tables[14].Rows)
                            {
                                response.OrganizerTypes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // TicketCategories (Table 15) - DDL_ID = 'TICKET_CATEGORY'
                        if (ds.Tables.Count > 15)
                        {
                            foreach (DataRow row in ds.Tables[15].Rows)
                            {
                                response.TicketCategories.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // AddonRequired (Table 16) - DDL_ID = 'ADDON_REQUIRED'
                        if (ds.Tables.Count > 16)
                        {
                            foreach (DataRow row in ds.Tables[16].Rows)
                            {
                                response.AddonRequired.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // CalculationTypes (Table 17) - DDL_ID = 'CALCULATION_TYPE'
                        if (ds.Tables.Count > 17)
                        {
                            foreach (DataRow row in ds.Tables[17].Rows)
                            {
                                response.CalculationTypes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // ChargeToOptions (Table 18) - DDL_ID = 'CHARGE_TO'
                        if (ds.Tables.Count > 18)
                        {
                            foreach (DataRow row in ds.Tables[18].Rows)
                            {
                                response.ChargeToOptions.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // Taxes (Table 19) - Tracket_Master_Tax
                        if (ds.Tables.Count > 19)
                        {
                            foreach (DataRow row in ds.Tables[19].Rows)
                            {
                                response.Taxes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // PassIncludes (Table 20)
                        if (ds.Tables.Count > 20)
                        {
                            foreach (DataRow row in ds.Tables[20].Rows)
                            {
                                response.PassIncludes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // RepeatsConfig (Table 21)
                        if (ds.Tables.Count > 21)
                        {
                            foreach (DataRow row in ds.Tables[21].Rows)
                            {
                                response.RepeatsConfig.Add(new StringDropdownItem
                                {
                                    Value = Convert.ToString(row["Value"]) ?? "",
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // EventZones (Table 22)
                        if (ds.Tables.Count > 22)
                        {
                            foreach (DataRow row in ds.Tables[22].Rows)
                            {
                                response.EventZones.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // ArrangementTypes (Table 23)
                        if (ds.Tables.Count > 23)
                        {
                            foreach (DataRow row in ds.Tables[23].Rows)
                            {
                                response.ArrangementTypes.Add(new StringDropdownItem
                                {
                                    Value = Convert.ToString(row["Value"]) ?? "",
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // BookableAs (Table 24)
                        if (ds.Tables.Count > 24)
                        {
                            foreach (DataRow row in ds.Tables[24].Rows)
                            {
                                response.BookableAs.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // Accessibility (Table 25)
                        if (ds.Tables.Count > 25)
                        {
                            foreach (DataRow row in ds.Tables[25].Rows)
                            {
                                response.Accessibility.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // ShapeTypes (Table 26)
                        if (ds.Tables.Count > 26)
                        {
                            foreach (DataRow row in ds.Tables[26].Rows)
                            {
                                response.ShapeTypes.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // ComponentCurrencies (Table 27)
                        if (ds.Tables.Count > 27)
                        {
                            foreach (DataRow row in ds.Tables[27].Rows)
                            {
                                response.ComponentCurrencies.Add(new CurrencyDropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? "",
                                    Symbol = Convert.ToString(row["Symbol"]) ?? "",
                                    Code = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // LabelPositions (Table 28)
                        if (ds.Tables.Count > 28)
                        {
                            foreach (DataRow row in ds.Tables[28].Rows)
                            {
                                response.LabelPositions.Add(new DropdownItem
                                {
                                    Value = Convert.ToInt64(row["Value"]),
                                    Label = Convert.ToString(row["Label"]) ?? ""
                                });
                            }
                        }

                        // ComponentCategories (Table 29)
                        if (ds.Tables.Count > 29)
                        {
                            foreach (DataRow row in ds.Tables[29].Rows)
                            {
                                response.ComponentCategories.Add(new DropdownItem
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
