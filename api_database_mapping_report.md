# API & Database Tables Mapping Report

This document maps the Event Management System (EMS) APIs, their backing SQL Stored Procedures, and the precise database tables they read, insert, update, or delete during checkout and the booking lifecycle.

---

## 1. Booking & Checkout API Mappings

| API Endpoint | HTTP Method | Stored Procedure | Affected Tables | Operation Type | Business Context & Table Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/common/booking/ddl` | `GET` | `USP_Booking_GetDDL` | `Tracket_Master_Event_Slot`<br>`Tracket_Master_Event`<br>`Tracket_Master_Event_Zone` | `SELECT` | **Reads** available event slots and details (dates, times, prices) and zone configurations to populate checkout booking selectors. |
| `/api/bookings` | `POST` | `USP_CreateUpdateBooking` | `Tracket_Master_Booking`<br>`Tracket_Master_Booking_Attendee`<br>`Tracket_Master_Event_Zone_Seat`<br>`Tracket_Master_Notification` | `INSERT`<br>`UPDATE` | **Inserts** a temporary booking (status `0`) and attendee details. **Updates** seat status to `'Hold'`. **Inserts** a queued notification for Seat Hold Active. |
| `/api/bookings/cancel` | `PUT` | `USP_CancelBooking` | `Tracket_Master_Booking`<br>`Tracket_Master_Event_Zone_Seat`<br>`Tracket_Master_Notification` | `UPDATE`<br>`INSERT` | **Updates** booking status to Cancelled (`4`). **Updates** seat status back to `'Available'` and sets `BookingId` to `NULL`. **Inserts** a Booking Cancelled notification. |
| `/api/bookings/availability` | `GET` | `USP_CheckSeatAvailability` | `Tracket_Master_Event_Slot`<br>`Tracket_Master_Booking`<br>`Tracket_Master_Booking_Attendee`<br>`Tracket_Master_Event_Zone_Seat`<br>`Tracket_Master_Notification` | `SELECT`<br>`UPDATE`<br>`INSERT` | **Reads** seat configurations. Cleans the DB by calling `USP_SweepExpiredHolds` which **updates** expired bookings to `4`, **updates** expired seats to `'Available'`, and **inserts** Hold Expired notifications. |

---

## 2. Payment & Billing API Mappings

| API Endpoint | HTTP Method | Stored Procedure | Affected Tables | Operation Type | Business Context & Table Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/payments` | `POST` | `USP_AddPayment` | `Tracket_Master_Payment`<br>`Tracket_Master_Invoice`<br>`Tracket_Master_Booking`<br>`Tracket_Master_Event_Zone_Seat`<br>`Tracket_Master_Pass`<br>`Tracket_Master_Notification` | `INSERT`<br>`UPDATE` | **Inserts** payment (status `1`). **Inserts/Updates** invoice status to Paid (`1`). **Updates** booking status to Confirmed (`1`). **Updates** seats status to `'Booked'`. **Inserts** passes. **Inserts** notifications for Payment Success, Booking Confirmation, and Pass Generation. |
| `/api/payments/fail` | `POST` | `USP_RecordFailedPayment` | `Tracket_Master_Payment`<br>`Tracket_Master_Notification` | `INSERT` | **Inserts** a failed payment transaction record (status `0`). **Inserts** a Payment Failed notification. |

---

## 3. Pass & Scanner Validation API Mappings

| API Endpoint | HTTP Method | Stored Procedure | Affected Tables | Operation Type | Business Context & Table Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/passes/my-passes` | `GET` | `USP_GetUserPasses` | `Tracket_Master_Pass`<br>`Tracket_Master_Booking`<br>`Tracket_Master_Event` | `SELECT` | **Reads** entry passes, QR codes, and event metadata for the visitor. |
| `/api/scanner/scan` | `POST` | `USP_ScanPass` | `Tracket_Master_Pass`<br>`Tracket_Master_Scanner_Log`<br>`Tracket_Master_Notification` | `UPDATE`<br>`INSERT` | **Updates** pass to checked-in (`IsUsed = 1`). **Inserts** scan event log row. **Inserts** Attendance Marked notification. |

---

## 4. Notifications Dashboard API Mappings

| API Endpoint | HTTP Method | Stored Procedure | Affected Tables | Operation Type | Business Context & Table Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/notifications` | `GET` | `USP_GetNotifications` | `Tracket_Master_Notification`<br>`Tracket_Master_User` | `SELECT` | **Reads** unread (`'QUEUED'`) and read (`'READ'`) notifications matching user ID. |
| `/api/notifications/{id}/read` | `PUT` | `USP_MarkNotificationAsRead` | `Tracket_Master_Notification` | `UPDATE` | **Updates** the selected notification status to `'READ'`. |
