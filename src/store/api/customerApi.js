import { apiSlice } from "./apiSlice";

export const customerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all addresses
    getAddresses: builder.query({
      query: () => "/customer/addresses",
      providesTags: ["Address"],
    }),

    // Add new address
    addAddress: builder.mutation({
      query: (addressData) => ({
        url: "/customer/addresses",
        method: "POST",
        body: addressData,
      }),
      invalidatesTags: ["Address"],
    }),

    // Update address
    updateAddress: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/customer/addresses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Address"],
    }),

    // Delete address
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/customer/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),

    // Update profile
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "/customer/profile",
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useUpdateProfileMutation,
} = customerApi;
