import LoginBanner from "./LoginBanner";
import LoginForm from "./LoginForm";

const Login = () => {
  return (
    <div className="flex w-screen h-screen bg-surface text-onSurface">
      <LoginBanner />
      <LoginForm />
    </div>
  );
};

export default Login;
