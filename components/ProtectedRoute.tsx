import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';
import Forbidden403 from '../pages/Forbidden403';

interface Props {
  children:      React.ReactNode;
  allowedRoles?: UserRole[];   
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location             = useLocation();

  // ✅ Ambil lang dari URL param /:lang
  const { lang }    = useParams<{ lang?: string }>();
  const currentLang = lang ?? 'id';

  // Tunggu auth selesai load sebelum memutuskan redirect
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ✅ Belum login → redirect ke /:lang/login (bukan /login)
  if (!user) {
    return (
      <Navigate
        to={`/${currentLang}/login`}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Sudah login tapi role tidak diizinkan → tampilkan 403
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Forbidden403 />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
