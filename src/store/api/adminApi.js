import { apiSlice } from "./apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard stats
    getDashboard: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),

    // Categories
    getAdminCategories: builder.query({
      query: () => "/admin/categories",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation({
      query: (formData) => ({
        url: "/admin/categories",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Category", "Menu"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category", "Menu"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category", "Menu"],
    }),

    // Menu Items
    getAdminItems: builder.query({
      query: ({ category_id } = {}) => {
        let url = "/admin/items";
        if (category_id) url += `?category_id=${category_id}`;
        return url;
      },
      providesTags: ["Menu"],
    }),

    createItem: builder.mutation({
      query: (formData) => ({
        url: "/admin/items",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Menu"],
    }),

    updateItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/items/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Menu"],
    }),

    toggleItemAvailability: builder.mutation({
      query: (id) => ({
        url: `/admin/items/${id}/toggle`,
        method: "PATCH",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - toggle immediately in cache
        const patches = [];
        for (const { endpointName, originalArgs } of adminApi.util.selectInvalidatedBy(getState(), ["Menu"])) {
          if (endpointName === "getAdminItems") {
            const patch = dispatch(
              adminApi.util.updateQueryData("getAdminItems", originalArgs, (draft) => {
                const item = draft?.data?.find((i) => i.id === id);
                if (item) item.is_available = !item.is_available;
              })
            );
            patches.push(patch);
          }
        }
        try {
          await queryFulfilled;
        } catch {
          // Revert on failure
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: ["Menu"],
    }),

    deleteItem: builder.mutation({
      query: (id) => ({
        url: `/admin/items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Menu"],
    }),

    // Orders
    getAdminOrders: builder.query({
      query: ({ page = 1, limit = 20, status, date, search } = {}) => {
        let url = `/admin/orders?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (date) url += `&date=${date}`;
        if (search) url += `&search=${search}`;
        return url;
      },
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/admin/orders/${id}/status`,
        method: "PATCH",
        body: reason ? { status, reason } : { status },
      }),
      invalidatesTags: ["Order", "Dashboard"],
    }),

    assignDeliveryBoy: builder.mutation({
      query: ({ id, delivery_boy_id }) => ({
        url: `/admin/orders/${id}/assign`,
        method: "PATCH",
        body: { delivery_boy_id },
      }),
      invalidatesTags: ["Order"],
    }),

    // Delivery Boys list
    getDeliveryBoys: builder.query({
      query: () => "/admin/delivery-boys",
      providesTags: ["Staff"],
    }),

    // Staff - create user
    createStaff: builder.mutation({
      query: (userData) => ({
        url: "/auth/create-user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAdminItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useToggleItemAvailabilityMutation,
  useDeleteItemMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useAssignDeliveryBoyMutation,
  useGetDeliveryBoysQuery,
  useCreateStaffMutation,
} = adminApi;
