import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportState {
  revenueData: any;
  bookingData: any;
  attendanceData: any;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  revenueData: null,
  bookingData: null,
  attendanceData: null,
  loading: false,
  error: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    reportStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchRevenueReportSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.revenueData = action.payload;
    },
    fetchBookingReportSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.bookingData = action.payload;
    },
    fetchAttendanceReportSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.attendanceData = action.payload;
    },
    reportFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  reportStart,
  fetchRevenueReportSuccess,
  fetchBookingReportSuccess,
  fetchAttendanceReportSuccess,
  reportFailure,
} = reportSlice.actions;
export default reportSlice.reducer;
