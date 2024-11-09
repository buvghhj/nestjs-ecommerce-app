import axios, { AxiosResponse } from "axios"

export interface responsePayload {
    success: boolean
    result: any
    message: string
}

const responseBody = (response: AxiosResponse) => response.data

const requests = {

    get: (url: string) => axios.get(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url).then(responseBody),

    post: (url: string, body: {}) => axios.post(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url, body).then(responseBody),

    put: (url: string, body: {}) => axios.put(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url, body).then(responseBody),

    delete: (url: string) => axios.delete(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url).then(responseBody),

    patch: (url: string, body: {}) => axios.patch(process.env.NEXT_PUBLIC_BASE_API_PREFIX + url, body).then(responseBody)

}

const api = {

    get: (url: string) => requests.get(url),

    post: (url: string, body: {}) => requests.post(url, body),

    put: (url: string, body: {}) => requests.put(url, body),

    delete: (url: string) => requests.delete(url),

    patch: (url: string, body: {}) => requests.patch(url, body)

}

export default api