'use client'

import React, { useContext, useEffect } from 'react'
import { Context } from '../../context'
import { useRouter } from 'next/navigation'
import { Col, Row } from 'react-bootstrap'
import Link from 'next/link'

const OrderCancel = () => {

    const { state: { user } } = useContext(Context)

    const router = useRouter()

    useEffect(() => {

        if (!user || !user.email) {

            router.push('/')

        }

    }, [router, user])

    return (

        <>

            <Row>

                <Col md={{ span: 6, offset: 3 }}>

                    <div className='jumbotron text-center'>

                        <h1 className='display-3 text-danger'>Oops! Cancelled !</h1>

                        <p className='lead'>

                            <strong> Payment failed !</strong> Your order got cancelled. Please try again

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

export default OrderCancel