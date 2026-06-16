import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useApp } from './store';
import Layout from './Layout';

export default function Root() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [user, navigate, location.pathname]);

  if (!user) return null;
  return <Layout />;
}
