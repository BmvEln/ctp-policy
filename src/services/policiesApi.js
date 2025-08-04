import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const policiesApi = createApi({
  reducerPath: "policiesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/" }),
  tagTypes: ["Policy"],

  endpoints: (builder) => ({
    getPolicies: builder.query({
      query: () => "policies",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Policy", id })),
              { type: "Policy", id: "LIST" },
            ]
          : [{ type: "Policy", id: "LIST" }],
    }),

    getPolicyById: builder.query({
      query: (id) => `policies/${id}`,
      providesTags: (result, error, id) => [{ type: "Policy", id }],
    }),

    addPolicy: builder.mutation({
      query: (body) => ({
        url: "policies",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Policy", id: "LIST" }],
    }),

    updatePolicy: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `policies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Policy", id },
        { type: "Policy", id: "LIST" },
      ],
    }),

    // DELETE
    // deletePolicy: builder.mutation({ ... })
  }),
});

export const {
  useGetPoliciesQuery,
  useGetPolicyByIdQuery,
  useAddPolicyMutation,
  useUpdatePolicyMutation,
} = policiesApi;
