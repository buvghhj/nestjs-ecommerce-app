
import axios from "axios"
import { useRouter } from "next/navigation"
import { act, createContext, useEffect, useReducer } from "react"

type Props = {
    children: React.ReactNode
}

const initialState = {
    user: null
}

type Context = {

    state: Record<string, any>,

    dispatch: (action: { type: string, payload: any }) => void

    cartItems: any

    cartDispatch: (action: { type: string, payload: Record<string, any> }) => void

}

const initialContext: Context = {

    state: initialState,

    dispatch: () => null,

    cartItems: [],

    cartDispatch: function (action: { type: string, payload: Record<string, any> }): void {

        throw new Error('Function is not implemented ')

    }

}

const Context = createContext<Context>(initialContext)

const userReducer = (state: Record<string, any>, action: { type: string, payload: any }) => {

    switch (action.type) {

        case 'LOGIN':

            return {

                ...state,

                user: action.payload

            }

        case 'LOGOUT':

            return {

                ...state,

                user: null

            }

        case 'UPDATE_USER':

            return {

                ...state,

                user: action.payload

            }

        default:

            return state

    }

}

const cartReducer = (state: any, action: { type: string, payload: Record<string, any> }) => {

    switch (action.type) {

        case 'ADD_TO_CART':

            const cartItems = [...state, action.payload]

            window.localStorage.setItem('_cart', JSON.stringify(cartItems))

            return cartItems

        case 'REMOVE_FROM_CART':

            const newCartItems = state.filter((item: { skuId: string }) => item.skuId !== action.payload?.skuId)

            window.localStorage.setItem('_cart', JSON.stringify(newCartItems))

            return newCartItems

        case 'UPDATE_CART':

            const updatedCartItems = state.map((item: any) => {

                if (item.skuId === action.payload?.skuId) {

                    return action.payload

                }

                return item

            })

            window.localStorage.setItem('_cart', JSON.stringify(updatedCartItems))

            return updatedCartItems

        case 'GET_CART_ITEMS':

            return action.payload

        case 'CLEAR_CART':

            window.localStorage.removeItem('_cart')

            return null
        default:

            return state
    }

}

const Provider = ({ children }: Props) => {

    const [state, dispatch] = useReducer(userReducer, initialState)

    const [cartItems, cartDispatch] = useReducer(cartReducer, [])

    const router = useRouter()

    useEffect(() => {

        dispatch({

            type: 'LOGIN',
            payload: JSON.parse(window.localStorage.getItem('_user') || '{}')

        })

        const cartItems = JSON.parse(window.localStorage.getItem('_cart') || '[]')

        cartDispatch({ type: 'GET_CART_ITEMS', payload: cartItems })

        return

    }, [])


    axios.interceptors.response.use(

        function (response) {

            return response

        },
        function (error) {

            let res = error.response

            if (error.status === 401 && res.config && !res.config.__isRetryRequest) {

                return new Promise((reslove, reject) => {

                    axios.put('/api/v1/users/logout').then((res: any) => {

                        dispatch({ type: 'LOGOUT', payload: null })

                        localStorage.removeItem('_user')

                        router.push('/auth')

                    }).catch((err) => {

                        reject(err)

                    })

                }

                )

            }

            return Promise.reject(error)

        }

    )

    useEffect(() => {

        const getCsrfToken = async () => {

            const { data } = await axios.get('/api/v1/csrf-token')

            axios.defaults.headers['X-CSRF-TOKEN'] = data.result

        }

        getCsrfToken()

    }, [])

    return (

        <Context.Provider value={{ state, dispatch, cartItems, cartDispatch }}> {children} </Context.Provider>

    )

}

export { Context, Provider }