export type OtpProvider = {
  sendOtp(params: { phoneNumber: string; otp: string }): Promise<void>;
};
