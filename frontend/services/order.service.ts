import api, { responsePayload } from "./api";

export const Order = {

    checkoutOrder: async (cartItems: any): Promise<responsePayload> => await api.post(`/orders/checkout`, { checkoutDetails: cartItems }),

    getAllOrders: async (status?: string): Promise<responsePayload> => await api.get(`/orders${status ? `?status=${status}` : ''}`),

    getOrder: async (id: string): Promise<responsePayload> => await api.get(`/orders/${id}`)

}