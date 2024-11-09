'use client'

import React, { useContext, useEffect } from 'react'
import { Context } from '../../context'
import { useRouter } from 'next/navigation'
import { Col, Row } from 'react-bootstrap'
import Link from 'next/link'

const OrderSuccess = () => {

    const { state: { user } } = useContext(Context)

    const { cartDispatch } = useContext(Context)

    const router = useRouter()

    useEffect(() => {

        cartDispatch({ type: 'CLEAR_CART', payload: {} })

    }, [cartDispatch])

    return (

        <>


            <Row >

                <Col md={{ span: 6, offset: 3 }}>

                    <div className=' text-center'>

                        <h1 className='display-3 '>Thank You !</h1>

                        <p className='lead'>

                            <strong> Please check your order details </strong> for further instructions. You will receive an email with order details

                        </p>

                        <hr />

                        <p className='lead'>

                            <Link href={'/products'} className='btn btn-primary btn-sm' role='button'>Shop More</Link>

                        </p>

                    </div>

                </Col>

            </Row>

        </>

    )

}

export default OrderSuccess