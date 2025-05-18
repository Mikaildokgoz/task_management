import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import { refreshSession, getCurrentSession } from "../features/auth/authSlice";

export const useSessionManager = () => {
	const dispatch = useAppDispatch();
	const { accessToken } = useAppSelector((state) => state.auth);

	const checkAndRefreshSession = useCallback(async () => {
		if (!accessToken) return;

		try {
			await dispatch(refreshSession()).unwrap();
		} catch (error) {
			console.error("Oturum yenileme hatası:", error);
		}
	}, [dispatch, accessToken]);

	useEffect(() => {
		// Sayfa yüklendiğinde mevcut oturumu kontrol et
		const initializeSession = async () => {
			try {
				await dispatch(getCurrentSession()).unwrap();
			} catch (error) {
				console.error("Oturum başlatma hatası:", error);
			}
		};

		initializeSession();
	}, [dispatch]);

	useEffect(() => {
		if (!accessToken) return;

		// Her 4 dakikada bir oturumu yenile (Supabase token'ı 60 dakikada sona erer)
		const refreshInterval = setInterval(checkAndRefreshSession, 4 * 60 * 1000);

		return () => clearInterval(refreshInterval);
	}, [checkAndRefreshSession, accessToken]);

	return { checkAndRefreshSession };
};
