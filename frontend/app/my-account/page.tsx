'use client'

import AccountDetails from '@/components/MyAccounts/AccountDetails'
import { Context } from '@/context'
import { User } from '@/services/user.service'
import { useRouter } from 'next/navigation'
import React, { useContext, useEffect } from 'react'
import { Col, Nav, Row, Tab } from 'react-bootstrap'
import { useToasts } from 'react-toast-notifications'
import AllOrders from '@/components/MyAccounts/AllOrders'

const MyAccount = () => {

    const { addToast } = useToasts()

    const router = useRouter()

    const { state: { user }, dispatch } = useContext(Context)

    useEffect(() => {

        if (!user) {

            router.push('/auth')

        }

    }, [router, user])

    const handleLogout = async (e: any) => {

        e.preventDefault()

        try {

            dispatch({ type: 'LOGOUT', payload: undefined })

            await User.logoutUser()

            localStorage.removeItem('_user')

            addToast('Logged out successfully', { appearance: 'success', autoDismiss: true })

        } catch (error: any) {

            addToast(error.message, { appearance: 'error', autoDismiss: true })

        }

    }

    return (

        <>

            <Tab.Container
                id='left-tabs-example'
                defaultActiveKey='first'
            >

                <Row>

                    <Col sm={3}>

                        <Nav
                            variant='pills'
                            className='flex-column'
                        >

                            <Nav.Item>

                                <Nav.Link eventKey='first'> Account Details </Nav.Link>

                            </Nav.Item>

                            <Nav.Item>

                                <Nav.Link eventKey='second'>All Orders</Nav.Link>

                            </Nav.Item>

                            <Nav.Item>

                                <Nav.Link
                                    eventKey='third'
                                    onClick={(e) => handleLogout(e)}
                                >
                                    Logout
                                </Nav.Link>

                            </Nav.Item>

                        </Nav>

                    </Col>

                    <Col sm={9}>

                        <Tab.Content>

                            <Tab.Pane eventKey='first'>

                                <AccountDetails
                                    user={user}
                                    dispatch={dispatch}
                                    addToast={addToast}
                                />

                            </Tab.Pane>

                            <Tab.Pane eventKey='second'>

                                <AllOrders />

                            </Tab.Pane>

                        </Tab.Content>

                    </Col>

                </Row>

            </Tab.Container>

        </>

    )

}

export default MyAccount