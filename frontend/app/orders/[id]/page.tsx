'use client'


import { useParams } from 'next/navigation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useToasts } from 'react-toast-notifications';
import { Badge, Button, Card, Col, Image, ListGroup, Row, Table } from 'react-bootstrap';
import Link from 'next/link';
import { Clipboard } from 'react-bootstrap-icons';




const OrderDetails = () => {

    const params = useParams()

    const orderId = params.id

    const { addToast } = useToasts()

    const [order, setOrder] = useState({
        paymentInfor: {
            paymentAmount: 0,
            paymentMethod: ''
        },
        orderStatus: '',
        createdAt: '',
        customerAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            country: '',
            postal_code: ''
        },
        orderedItems: []
    })

    useEffect(() => {

        const fetchOrderDetails = async () => {

            try {

                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/orders/${orderId}`)

                setOrder(data.result || {})

            } catch (error) {

                addToast('Error fetching order details', { appearance: 'error', autoDismiss: true })

            }

        }

        if (orderId) {

            fetchOrderDetails()

        }

    }, [orderId])

    const dateToLocal = (date: any) => new Date(date).toLocaleString()

    return (

        <>

            <Row>

                <Col>

                    <Card style={{ marginTop: '20px' }}>

                        <Card.Header>

                            <Card.Title>Order Details</Card.Title>

                        </Card.Header>

                        <Card.Body>

                            <Table responsive>

                                <thead>
                                    <tr>
                                        <th>Products</th>
                                        <th>License Keys</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {order.orderedItems.map((item: any) => (

                                        <tr key={item.skuCode}>

                                            <td>

                                                {' '}

                                                <div className='itemTitle'>

                                                    <Image
                                                        height={50}
                                                        width={50}
                                                        roundedCircle={true}
                                                        src={item.productImage}
                                                        alt=''
                                                    />

                                                    <p style={{ marginLeft: '5px' }}>

                                                        <Link
                                                            style={{ textDecoration: 'none' }}
                                                            href={`/products/${item.product}`}
                                                        >

                                                            {item.productName || 'Demo Product'}

                                                        </Link>

                                                        <p style={{ fontWeight: 'bold' }}>

                                                            {item.quantity} X ₹{item.price}

                                                        </p>

                                                    </p>

                                                </div>

                                                <Link href={''}>

                                                    <Button variant='link'>
                                                        Issue with this product? Then Contact US...
                                                    </Button>

                                                </Link>

                                            </td>

                                            <td>

                                                {item.licenses || ' Not Found '}{' '}

                                                {item.licenses && (

                                                    <Button
                                                        variant='light'
                                                        size='sm'
                                                        onClick={() => {

                                                            navigator.clipboard.writeText(item.licenses)

                                                            addToast('License key copied successfully', { appearance: 'success', autoDismiss: true })

                                                        }}
                                                    >

                                                        <Clipboard />

                                                    </Button>

                                                )}

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </Table>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

            <Row>

                <Col>

                    <Card style={{ marginTop: '20px' }}>

                        <Card.Header>


                            <Card.Title>Total Amount: ₹{order?.paymentInfor?.paymentAmount}</Card.Title>

                        </Card.Header>

                        <Card.Body>

                            <ListGroup className='list-group-flush'>

                                <ListGroup.Item>Order Date & Time: {dateToLocal(order?.createdAt)}</ListGroup.Item>

                                <ListGroup.Item>Payment Method:{' '} {order?.paymentInfor?.paymentMethod.toUpperCase()}</ListGroup.Item>

                                <ListGroup.Item>Order Status:   <Badge bg={order.orderStatus === 'pending' ? 'warning' : 'success'}>{order.orderStatus.toUpperCase()}</Badge></ListGroup.Item>

                                <ListGroup.Item>

                                    Add line 1: {order.customerAddress.line1}

                                    <br />

                                    Add line 2: {order.customerAddress.line2}

                                    <br />

                                    City: {order.customerAddress.city}

                                    <br />

                                    State: {order.customerAddress.state}

                                    <br />

                                    Country: {order.customerAddress.country}

                                    <br />

                                    Postal Code: {order.customerAddress.postal_code}

                                </ListGroup.Item>

                            </ListGroup>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

        </>

    )
};

export default OrderDetails;
