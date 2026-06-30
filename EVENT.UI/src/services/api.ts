const API_BASE_URL = 'http://localhost:5209/api/';

async function handleResponse(response: Response): Promise<any> {
  if (!response.ok) {
    let errorData: any = null;
    try {
      errorData = await response.json();
    } catch (e) {
      // Not JSON
    }
    throw new Error(errorData?.message || errorData?.Message || `HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

export interface LoginRequest {
  dialCode: string;
  mobileNo: string;
  deviceId?: string;
}

export interface VerifyOtpRequest {
  otp: string;
  mobileNo: string;
  dialCode: string;
  deviceId?: string;
  fcmToken?: string;
}

export interface RegisterRequest {
  fullname: string;
  mobileNo: string;
  dialCode: string;
  refferedByRefferalCode?: string;
  isAgreedToTerms: boolean;
}

export interface EventDetailsRequest {
  pageNo: number;
  pageSize: number;
  eventId: number;
  userId: number;
}

export const apiService = {
  async getCountryList(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}Login/GetCountryList`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching country list:', error);
      throw error;
    }
  },

  async login(data: LoginRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}Login/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dialCode: data.dialCode,
          mobileNo: data.mobileNo,
          deviceId: data.deviceId || ''
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  async verifyOtp(data: VerifyOtpRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}Login/VerifyOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp: data.otp,
          mobileNo: data.mobileNo,
          dialCode: data.dialCode,
          deviceId: data.deviceId || '',
          fcmToken: data.fcmToken || ''
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}User/Register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullname: data.fullname,
          mobileNo: data.mobileNo,
          dialCode: data.dialCode,
          refferedByRefferalCode: data.refferedByRefferalCode || '',
          isAgreedToTerms: data.isAgreedToTerms,
          userRole: 2 // UserRole.EventOrganizer = 2 based on Enum
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  async getAllEventDetails(data: EventDetailsRequest, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}Event/GetAllEventDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pageNo: data.pageNo,
          pageSize: data.pageSize,
          eventId: data.eventId,
          userId: data.userId
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  }
};
