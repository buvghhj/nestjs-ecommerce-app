import api, { responsePayload } from "./api";

export const Product = {

    getProduct: async (): Promise<responsePayload> => await api.get('/products'),

    createProduct: async (product: Record<string, any>): Promise<responsePayload> => await api.post('/products', product),

    updateProduct: async (id: string, product: Record<string, any>): Promise<responsePayload> => await api.patch(`/products/${id}`, product),

    deleteProduct: async (id: string): Promise<responsePayload> => await api.delete(`/products/${id}`),

    uploadProdImage: async (id: string, formData: any): Promise<responsePayload> => {

        return await api.post(`/products/${id}/image`, formData)

    },

    updateSku: async (productId: string, skuId: string, sku: Record<string, any>): Promise<responsePayload> => await api.put(`/products/${productId}/sku/${skuId}`, sku),

    createSku: async (productId: string, sku: Record<string, any>): Promise<responsePayload> => await api.post(`/products/${productId}/skus`, sku),

    deleteSku: async (productId: string, skuId: string): Promise<responsePayload> => await api.delete(`/products/${productId}/sku/${skuId}`),

    updateLicense: async (productId: string, skuId: string, licenseKeyId: string, licenseKey: Record<string, any>): Promise<responsePayload> => await api.put(`/products/${productId}/sku/${skuId}/licenses/${licenseKeyId}`, licenseKey),

    createLicense: async (productId: string, skuId: string, licenseKey: Record<string, any>): Promise<responsePayload> => await api.post(`/products/${productId}/sku/${skuId}/licenses`, licenseKey),

    deleteLicense: async (licenseId: string): Promise<responsePayload> => await api.delete(`/products/licenses/${licenseId}`),

    getLicenses: async (productId: string, skuId: string): Promise<responsePayload> => await api.get(`/products/${productId}/sku/${skuId}/licenses`),

}