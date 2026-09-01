import { Button } from "@/components/ui/button";
import {
  useRequestVerificationOTPMutation,
  useVerifyOTPMutation,
} from "@/pages/users/common/usersApi";
import type { RootState } from "@/store";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { ILoginResponse } from "./common/login";
import type {
  IRequestOTPPayload,
  IVerifiyOTPPayload,
} from "@/pages/customer/common/customers";
import { showToast } from "@/components/ui/CustomToast";
import { useNavigate } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import LoadingComponent from "@/components/LoadingComponent";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/BackButton";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const LoginOTPVerification = () => {
  const [requestVerificationOTP, { isLoading: isRequesting }] =
    useRequestVerificationOTPMutation();
  const [verifyUserOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const navigate = useNavigate();

  const user = useSelector(
    (state: RootState) => state.user.user as ILoginResponse,
  );
  const [otpSent, setOtpSent] = useState(false);
  const [userOTP, setUserOTP] = useState<string>("");

  const requestOTP = async () => {
    const payload: IRequestOTPPayload = {
      userId: user?.id as string,
      email: user?.email as string,
    };
    const res = await requestVerificationOTP(payload).unwrap();
    if (res) {
      setOtpSent(true);
      showToast({
        title: "Success",
        message: "OTP successfully sent to your email.",
        type: "success",
      });
    }
  };

  const verifyOTP = async () => {
    const payload: IVerifiyOTPPayload = {
      otp: userOTP,
      userId: user?.id as string,
    };
    const res = await verifyUserOTP(payload).unwrap();
    if (res) {
      showToast({
        title: "Success",
        message: "OTP verified successfully.",
        type: "success",
      });
      navigate(`${allRoutes.PORTAL}${allRoutes.DASHBOARD}`);
    }
  };

  const loading = isRequesting || isVerifying;

  return (
    <div>
      <LoadingComponent loading={loading} />
      <div className="w-full h-screen flex items-center justify-center relative">
        <div className="absolute top-5 left-5">
          <BackButton />
        </div>
        <div className="p-4 space-y-2 flex flex-col items-center justify-between border">
          <p className="text-2xl">
            Welcome,{" "}
            <span className="font-bold">
              {user.firstName ?? ""} {user.lastName ?? ""}
            </span>
          </p>
          <p className="text-center">
            You Are Not Verified. Please click on the button below to get
            verification OTP
          </p>
          <Badge variant={"secondary"}>{user.email}</Badge>
          {otpSent ? (
            <div className="p-4 space-y-2 text-center">
              <InputOTP
                onChange={(newValue) => setUserOTP(newValue)}
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                disabled={loading}
                placeholder="- - - - - -"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {/* <CustomInputField
                disabled={loading}
                type="text"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setUserOTP(event.target.value)
                }
              /> */}
              <Button
                className="text-sm"
                disabled={loading}
                onClick={() => verifyOTP()}
              >
                Verify OTP
              </Button>
            </div>
          ) : (
            <Button
              className="min-w-[250px] bg-primary! text-primary-foreground! text-sm"
              disabled={loading}
              onClick={() => requestOTP()}
            >
              <Mail />
              Request OTP
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginOTPVerification;
