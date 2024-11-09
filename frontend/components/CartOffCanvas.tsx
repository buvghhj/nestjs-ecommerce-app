import React, { FC, useContext, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { Context } from '../context'
import { Button, Offcanvas } from 'react-bootstrap'
import CartItems from './CartItems'
import { Order } from '../services/order.service'
import { useRouter } from 'next/navigation'

interface IProps {
    show: boolean
    setShow: (show: boolean) => void
}

const CartOffCanvas: FC<IProps> = ({ show, setShow }) => {

    const { addToast } = useToasts()

    const router = useRouter()

    const { cartItems, cartDispatch } = useContext(Context)

    const [isLoading, setIsLoading] = useState(false)

    const handleClose = () => {

        setShow(false)

    }

    const handleChekout = async () => {

        try {

            setIsLoading(true)

            if (cartItems.length > 0) {

                const res = await Order.checkoutOrder(cartItems)

                if (!res.success) {

                    addToast(res.message, { appearance: 'error', autoDismiss: true })

                }

                router.push(res.result)

            }

        } catch (error) {

            addToast('Something went wrong, Please try again. !', { appearance: 'error', autoDismiss: true })

        } finally {

            setIsLoading(false)

        }

    }

    return (

        <>

            <Offcanvas show={show} onHide={handleClose} placement='end' >

                <Offcanvas.Header closeButton>

                    <Offcanvas.Title>Shopping Cart</Offcanvas.Title>

                </Offcanvas.Header>

                <Offcanvas.Body>

                    <CartItems
                        cartItems={cartItems}
                        cartDispatch={cartDispatch}
                    />

                    <Button
                        variant='primary'
                        style={{ width: '100%' }}
                        disabled={isLoading}
                        onClick={() => handleChekout()}
                    >

                        {isLoading && (
                            <span
                                className='spinner-border spinner-border-sm mr-2'
                                role='status'
                                aria-hidden='true'
                            >
                            </span>
                        )}
                        Checkout
                    </Button>

                </Offcanvas.Body>

            </Offcanvas>

        </>

    )

}

export default CartOffCanvas