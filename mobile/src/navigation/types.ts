export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  VerifyEmail: { token?: string } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Store: undefined;
  Profile: undefined;
  Settings: undefined;
};
