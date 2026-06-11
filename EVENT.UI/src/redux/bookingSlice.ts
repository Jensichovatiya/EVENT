import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Booking } from '../models';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    bookingStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchBookingsSuccess(state, action: PayloadAction<Booking[]>) {
      state.loading = false;
      state.bookings = action.payload;
    },
    bookingFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { bookingStart, fetchBookingsSuccess, bookingFailure } = bookingSlice.actions;
export default bookingSlice.reducer;
