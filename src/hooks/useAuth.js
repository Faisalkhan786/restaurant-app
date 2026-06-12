import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { setCredentials, logout as logoutAction } from "../store/slices/authSlice";
import { useLoginMutation, useRegisterMutation, useLogoutMutation } from "../store/api/authApi";
import { tokenService } from "../services/tokenService";

export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (email, password) => {
    const res = await loginMutation({ email, password }).unwrap();
    const { user, accessToken, refreshToken } = res.data;

    await tokenService.setTokens(accessToken, refreshToken);
    dispatch(setCredentials({ user, token: accessToken }));
    router.replace("/(tabs)/home");

    return res;
  };

  const register = async (name, email, password, phone) => {
    const body = { name, email, password };
    if (phone) body.phone = phone;

    const res = await registerMutation(body).unwrap();
    const { user, accessToken, refreshToken } = res.data;

    await tokenService.setTokens(accessToken, refreshToken);
    dispatch(setCredentials({ user, token: accessToken }));
    router.replace("/(tabs)/home");

    return res;
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (_) {
      // Even if API fails, clear local state
    }
    await tokenService.clearTokens();
    dispatch(logoutAction());
    router.replace("/(auth)/login");
  };

  return {
    user,
    isAuthenticated,
    token,
    login,
    register,
    logout,
    isLoginLoading,
    isRegisterLoading,
  };
};
