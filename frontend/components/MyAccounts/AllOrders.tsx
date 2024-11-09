import React, { useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { Order } from '../../services/order.service'
import { Badge, Button, Dropdown, DropdownButton, Row, Table } from 'react-bootstrap'
import Link from 'next/link'

const AllOrders = () => {

    const { addToast } = useToasts()

    const [orders, setOrders] = useState([])

    useEffect(() => {

        fetchOrders()

    }, [])

    const fetchOrders = async (status?: string) => {

        try {

            const ordersRes = await Order.getAllOrders(status)

            if (!ordersRes.success) {

                return addToast(ordersRes.message, { appearance: 'error', autoDismiss: true })

            }

            setOrders(ordersRes.result)

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        }

    }

    const dateToLocal = (date: any) => new Date(date).toLocaleString()

    return (

        <>

            <Row>

                <DropdownButton
                    variant='outline-secondary'
                    title='Filter by status'
                    id='input-group-dropdown-2'
                    onSelect={(e) => { fetchOrders((e ? e : '')) }}
                >

                    <Dropdown.Item href='#' eventKey=''>All</Dropdown.Item>
                    <Dropdown.Item href='#' eventKey='pending'>Pending</Dropdown.Item>
                    <Dropdown.Item href='#' eventKey='completed'>Completed</Dropdown.Item>

                </DropdownButton>

            </Row>

            {orders?.length > 0
                ?
                (
                    <Table responsive>

                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Order Date</th>
                                <th>Order Status</th>
                                <th>Order Total</th>
                                <th>Order Action</th>
                            </tr>
                        </thead>

                        <tbody>


                            {orders.map((order: any) => (

                                <tr key={order._id}>

                                    <td style={{ color: 'green', cursor: 'pointer' }}>
                                        <Link href={`/orders/${order._id}`}>
                                            {order._id}
                                        </Link>
                                    </td>

                                    <td>{dateToLocal(order.createdAt)}</td>

                                    <td>

                                        <Badge bg={order.orderStatus === 'pending' ? 'warning' : 'success'}>{order.orderStatus.toUpperCase()}</Badge>

                                    </td>

                                    <td>₹{order.paymentInfor?.paymentAmount}</td>

                                    <td >
                                        <Link href={`/orders/${order._id}`}>
                                            <Button variant='outline-dark'>    View Details</Button>
                                        </Link>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </Table>
                )
                :
                ('No Order Not Found')
            }

        </>

    )

}

export default AllOrders