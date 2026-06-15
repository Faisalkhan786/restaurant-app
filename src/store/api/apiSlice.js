import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../constants/config";
import { logout } from "../slices/authSlice";
import { tokenService } from "../../services/tokenService";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    // First try Redux state, fallback to SecureStore
    let token = getState().auth.token;
    if (!token) {
      token = await tokenService.getAccessToken();
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper to handle 401 responses
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // Try refreshing the token
    const refreshToken = await tokenService.getRefreshToken();
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh-token",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult?.data?.data) {
        const { accessToken, refreshToken: newRefreshToken } = refreshResult.data.data;
        await tokenService.setTokens(accessToken, newRefreshToken);

        // Update Redux state
        const currentUser = api.getState().auth.user;
        api.dispatch({
          type: "auth/setCredentials",
          payload: { user: currentUser, token: accessToken },
        });

        // Retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout
        await tokenService.clearTokens();
        api.dispatch(logout());
      }
    } else {
      await tokenService.clearTokens();
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Menu", "Cart", "Order", "User", "Category", "Address", "Dashboard", "Staff"],
  endpoints: () => ({}),
});
