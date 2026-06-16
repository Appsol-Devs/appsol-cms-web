import LoginBanner from "./LoginBanner";
import ForgotPasswordForm from "./ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <div className="flex w-screen h-screen bg-surface text-onSurface">
      <LoginBanner />
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPassword;
