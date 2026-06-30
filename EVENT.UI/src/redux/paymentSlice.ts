import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payment } from '../models';

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    paymentStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPaymentsSuccess(state, action: PayloadAction<Payment[]>) {
      state.loading = false;
      state.payments = action.payload;
    },
    paymentFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { paymentStart, fetchPaymentsSuccess, paymentFailure } = paymentSlice.actions;
export default paymentSlice.reducer;
