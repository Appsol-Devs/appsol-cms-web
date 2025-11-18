import { Button } from "@/components/ui/button";
import {
  useRequestVerificationOTPMutation,
  useVerifyOTPMutation,
} from "@/pages/users/common/usersApi";
import type { RootState } from "@/store";
import { useState, type ChangeEvent } from "react";
import { useSelector } from "react-redux";
import type { ILoginResponse } from "./common/login";
import type {
  IRequestOTPPayload,
  IVerifiyOTPPayload,
} from "@/pages/customer/common/customers";
import CustomInputField from "@/components/CustomInputField";
import { showToast } from "@/components/ui/CustomToast";
import { useNavigate } from "react-router-dom";
import { allRoutes } from "@/utils/routes";
import LoadingComponent from "@/components/LoadingComponent";

const LoginOTPVerification = () => {
  const [requestVerificationOTP, { isLoading: isRequesting }] =
    useRequestVerificationOTPMutation();
  const [verifyUserOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const navigate = useNavigate();

  const user = useSelector(
    (state: RootState) => state.user.user as ILoginResponse
  );
  const [otpSent, setOtpSent] = useState(false);
  const [userOTP, setUserOTP] = useState<string>("");

  const requestOTP = async () => {
    const payload: IRequestOTPPayload = {
      userId: user?._id as string,
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
      userId: user?._id as string,
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
      {otpSent ? (
        <div>
          <CustomInputField
            disabled={loading}
            type="text"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setUserOTP(event.target.value)
            }
          />
          <Button disabled={loading} onClick={() => verifyOTP()}>
            Verify OTP
          </Button>
        </div>
      ) : (
        <div>
          <Button disabled={loading} onClick={() => requestOTP()}>
            Request OTP
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoginOTPVerification;
