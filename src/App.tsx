import { useState } from 'react';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import RegisterDetail from './pages/register/RegisterDetail';

type AuthView = 'login' | 'register' | 'registerDetail';

function App() {
  const [authView, setAuthView] = useState<AuthView>('login');

  if (authView === 'register') {
    return (
      <Register
        onLoginClick={() => setAuthView('login')}
        onRegisterComplete={() => setAuthView('registerDetail')}
      />
    );
  }

  if (authView === 'registerDetail') {
    return <RegisterDetail />;
  }

  return <Login onSignupClick={() => setAuthView('register')} />;
}

export default App;
