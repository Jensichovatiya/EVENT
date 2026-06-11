import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventModel, EventCategory } from '../models';

interface EventState {
  events: EventModel[];
  categories: EventCategory[];
  currentEvent: EventModel | null;
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  categories: [],
  currentEvent: null,
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEventsSuccess(state, action: PayloadAction<EventModel[]>) {
      state.loading = false;
      state.events = action.payload;
    },
    fetchCategoriesSuccess(state, action: PayloadAction<EventCategory[]>) {
      state.loading = false;
      state.categories = action.payload;
    },
    setCurrentEvent(state, action: PayloadAction<EventModel>) {
      state.currentEvent = action.payload;
    },
    fetchFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStart, fetchEventsSuccess, fetchCategoriesSuccess, setCurrentEvent, fetchFailure } = eventSlice.actions;
export default eventSlice.reducer;
