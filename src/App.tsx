import { useState } from "react";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Mypage from "./pages/mypage/Mypage";
import Register from "./pages/register/Register";
import RegisterDetail from "./pages/register/RegisterDetail";
import { deleteMockUser } from "./services/mockAuth";
import { useAuthStore } from "./stores/useAuthStore";

type AppPage = "login" | "register" | "registerDetail" | "home" | "mypage";

function App() {
  const [page, setPage] = useState<AppPage>("login");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleDeleteAccount = async () => {
    if (!user) {
      return;
    }

    setDeleteErrorMessage("");

    try {
      await deleteMockUser(user.email);
      logout();
      setPage("login");
    } catch {
      setDeleteErrorMessage(
        "계정 삭제에 실패했습니다. mock 서버를 확인해 주세요.",
      );
    }
  };

  if (user) {
    if (page === "mypage") {
      return (
        <Mypage
          deleteErrorMessage={deleteErrorMessage}
          onDeleteAccount={handleDeleteAccount}
          onLogout={() => {
            logout();
            setPage("login");
          }}
          onGoHome={() => setPage("home")}
        />
      );
    }

    return <Home onGoToMypage={() => setPage("mypage")} />;
  }

  if (page === "home") {
    return <Home onGoToMypage={() => setPage("mypage")} />;
  }

  if (page === "register") {
    return (
      <Register
        onLoginClick={() => setPage("login")}
        onRegisterComplete={() => setPage("registerDetail")}
      />
    );
  }

  if (page === "registerDetail") {
    return (
      <RegisterDetail
        onComplete={() => setPage("home")}
        onBackToRegister={() => setPage("register")}
      />
    );
  }

  return (
    <Login
      onSignupClick={() => setPage("register")}
      onLoginSuccess={() => setPage("home")}
    />
  );
}

export default App;
