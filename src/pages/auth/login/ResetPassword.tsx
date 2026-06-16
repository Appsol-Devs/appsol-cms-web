import LoginBanner from "./LoginBanner";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPassword = () => {
  return (
    <div className="flex w-screen h-screen bg-surface text-onSurface">
      <LoginBanner />
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPassword;
