import { apiSlice } from "./apiSlice";

export const menuApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get full menu (all categories with items)
    getFullMenu: builder.query({
      query: () => "/menu",
      providesTags: ["Menu", "Category"],
    }),

    // Get items by category
    getByCategory: builder.query({
      query: (categoryId) => `/menu/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: "Menu", id: categoryId },
      ],
    }),

    // Get single item detail
    getItemDetail: builder.query({
      query: (id) => `/menu/item/${id}`,
      providesTags: (result, error, id) => [{ type: "Menu", id }],
    }),
  }),
});

export const {
  useGetFullMenuQuery,
  useGetByCategoryQuery,
  useGetItemDetailQuery,
} = menuApi;
