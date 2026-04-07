import { 
  BaseQueryFn,
  FetchArgs,
  createApi, 
  fetchBaseQuery, 
  FetchBaseQueryError 
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { setToken, logout } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://crm-api-production-4d4f.up.railway.app/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    
    if (refreshToken) {
      const refreshResult: any = await baseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data && refreshResult.data.success) {
        // Store the new token
        const newAccessToken = refreshResult.data.data.accessToken;
        api.dispatch(setToken({ accessToken: newAccessToken }));
        
        // Retry the initial query
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Attendance', 'User'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    googleLogin: builder.mutation({
      query: (data) => ({
        url: '/auth/google-login',
        method: 'POST',
        body: data,
      }),
    }),
    refreshToken: builder.mutation({
      query: (data) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),

    // Attendance endpoints
    getClockInStatus: builder.query({
      query: () => '/attendance/status',
      providesTags: ['Attendance'],
    }),
    clockIn: builder.mutation({
      query: (data) => ({
        url: '/attendance/clock-in',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    clockOut: builder.mutation({
      query: (data) => ({
        url: '/attendance/clock-out',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    submitCorrection: builder.mutation({
      query: (data) => ({
        url: '/attendance/correction',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    correctLogout: builder.mutation({
      query: (data) => ({
        url: '/attendance/correct-logout',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Employee endpoints
    getRecentActivity: builder.query({
      query: ({ date, employeeId }) => ({
        url: '/employee/recent-activity',
        params: { date, employeeId },
      }),
      providesTags: ['Attendance'],
    }),
    breakStart: builder.mutation({
      query: (data) => ({
        url: '/attendance/break-start',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    breakResume: builder.mutation({
      query: (data) => ({
        url: '/attendance/break-resume',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    checkCorrection: builder.query({
      query: () => '/attendance/check-correction',
      providesTags: ['Attendance'],
    }),
    getRoster: builder.query({
      query: ({ userId, startDate, endDate, hardRefresh }) => ({
        url: `/schedules/${userId}/roster`,
        params: { startDate, endDate, refresh: hardRefresh },
      }),
      providesTags: ['Attendance'],
    }),
    getMyLeaves: builder.query({
      query: (params) => ({
        url: '/leave-requests/my-requests',
        params,
      }),
      providesTags: ['Attendance'],
    }),
    createLeave: builder.mutation({
      query: (data) => ({
        url: '/leave-requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getMyBalance: builder.query({
      query: () => '/leave-requests/balance',
      providesTags: ['Attendance'],
    }),
    getMyStats: builder.query({
      query: () => '/leave-requests/my-stats',
      providesTags: ['Attendance'],
    }),
    getLeaveTypes: builder.query({
      query: () => '/leave-types',
      providesTags: ['Attendance'],
    }),
    cancelLeave: builder.mutation({
      query: (id) => ({
        url: `/leave-requests/${id}/cancel`,
        method: 'PATCH',
        body: { status: 'cancelled' },
      }),
      invalidatesTags: ['Attendance'],
    }),
    calculateDays: builder.query({
      query: (params) => ({
        url: '/leave-requests/calculate-days',
        params,
      }),
    }),
    
    // Reimbursement endpoints
    getMyReimbursements: builder.query({
      query: () => '/reimbursements/my',
      providesTags: ['Attendance'],
    }),
    getReimbursementTypes: builder.query({
      query: () => '/reimbursement-types/active',
      providesTags: ['Attendance'],
    }),
    createReimbursement: builder.mutation({
      query: (data) => ({
        url: '/reimbursements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    updateReimbursement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/reimbursements/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    deleteReimbursement: builder.mutation({
      query: (id) => ({
        url: `/reimbursements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attendance'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useGetClockInStatusQuery,
  useClockInMutation,
  useClockOutMutation,
  useGetRecentActivityQuery,
  useBreakStartMutation,
  useBreakResumeMutation,
  useCheckCorrectionQuery,
  useSubmitCorrectionMutation,
  useCorrectLogoutMutation,
  useGetRosterQuery,
  useGetMyLeavesQuery,
  useCreateLeaveMutation,
  useGetMyBalanceQuery,
  useGetMyStatsQuery,
  useGetLeaveTypesQuery,
  useCancelLeaveMutation,
  useCalculateDaysQuery,
  useGetMyReimbursementsQuery,
  useGetReimbursementTypesQuery,
  useCreateReimbursementMutation,
  useUpdateReimbursementMutation,
  useDeleteReimbursementMutation,
} = apiSlice;
