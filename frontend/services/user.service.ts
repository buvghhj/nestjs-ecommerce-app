import api, { responsePayload } from "./api"

export const User = {

    getUsers: async (): Promise<responsePayload> => await api.get('/users'),

    createUser: async (user: Record<string, any>): Promise<responsePayload> => await api.post('/users', user),

    updateUser: async (id: string, user: Record<string, any>): Promise<responsePayload> => await api.patch(`/users/update-user/${id}`, user),

    loginUser: async (user: Record<string, any>): Promise<responsePayload> => await api.post('/users/login', user),

    logoutUser: async (): Promise<responsePayload> => await api.put('/users/logout', {}),

    forgotPassword: async (email: string): Promise<responsePayload> => await api.get(`/users/forgot-password/${email}`),

    resendOtp: async (email: string): Promise<responsePayload> => await api.get(`/users/send-otp-email/${email}`),

    verifyOtp: async (otp: string, email: string): Promise<responsePayload> => await api.get(`/users/verify-email/${otp}/${email}`)

}