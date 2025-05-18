import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../hooks/store";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export const ProtectedRoute = ({
	children,
	requireAuth = true,
}: ProtectedRouteProps) => {
	const { user } = useAppSelector((state) => state.auth);
	const location = useLocation();

	if (requireAuth && !user) {
		// Kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir
		// Mevcut sayfayı state'e kaydet, giriş sonrası geri dönmek için
		return <Navigate to="/giris" state={{ from: location }} replace />;
	}

	if (!requireAuth && user) {
		// Kullanıcı giriş yapmışsa ve giriş/kayıt sayfalarına erişmeye çalışıyorsa
		// ana sayfaya yönlendir
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};
