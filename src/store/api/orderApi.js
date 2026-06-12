import { apiSlice } from "./apiSlice";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Place a new order
    placeOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order"],
    }),

    // Get my orders (paginated)
    getMyOrders: builder.query({
      query: ({ page = 1, limit = 10, status } = {}) => {
        let url = `/orders?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: ["Order"],
    }),

    // Get single order detail
    getOrderDetail: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // Cancel order
    cancelOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: "PATCH",
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderDetailQuery,
  useCancelOrderMutation,
} = orderApi;
