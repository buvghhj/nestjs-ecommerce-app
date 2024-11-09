import React, { FC, useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { getFormatedStringFromDays } from '../../utils'
import { Button, Card, Dropdown, DropdownButton, Form, InputGroup } from 'react-bootstrap'
import { Product } from '../../services/product.service'
import { useRouter } from 'next/navigation'

const initialState = {
    skuName: '',
    price: 0,
    validity: 0,
    validityType: 'months',
    lifetime: false,
}

interface SkuDetailsFormProps {
    setAllSkuDetailsFormShow: any
    productId: any
    setAllSkuDetails: any
    allSkuDetails: any
    skuIdForUpdate: string
    setSkuIdForUpdate: any
}

const SkuDetailsForm: FC<SkuDetailsFormProps> = ({
    setAllSkuDetailsFormShow,
    productId,
    setAllSkuDetails,
    allSkuDetails,
    skuIdForUpdate,
    setSkuIdForUpdate
}) => {

    const { addToast } = useToasts()

    const [isLoading, setIsLoading] = useState(false)

    const [skuForm, setSkuForm] = useState(initialState)

    useEffect(() => {

        if (skuIdForUpdate) {

            const skuDetail = allSkuDetails.find((sku: { _id: string }) => sku._id === skuIdForUpdate)

            if (skuDetail) {

                const validityTime = getFormatedStringFromDays(skuDetail.validity)

                setSkuForm({
                    ...initialState,
                    ...skuDetail,
                    validity: Number(validityTime.split(' ')[0]) || 0,
                    validityType: validityTime.split(' ')[1] || 'months'

                })

            }

        }

    }, [allSkuDetails, skuIdForUpdate])

    const handleCancel = () => {

        setAllSkuDetailsFormShow(false)
        setSkuForm(initialState)
        setSkuIdForUpdate('')

    }

    const router = useRouter()

    const handleSubmit = async (e: any) => {

        e.preventDefault()
        setIsLoading(true)

        try {

            const { skuName, price, validity, lifetime } = skuForm

            if (!skuName || !price) {

                return addToast('Please fill all required fields', { appearance: 'error', autoDismiss: true })

            }

            if (!lifetime && !validity) {

                return addToast('Please fill all required fields', { appearance: 'error', autoDismiss: true })

            }

            if (!lifetime) {

                skuForm.validity = skuForm.validityType === 'months' ? skuForm.validity * 30 : skuForm.validity * 365

            } else {

                skuForm.validity = Number.MAX_SAFE_INTEGER

            }

            const res = skuIdForUpdate
                ?
                await Product.updateSku(productId, skuIdForUpdate, skuForm)
                :
                await Product.createSku(productId, { skuDetails: [skuForm] })

            if (!res.success) {

                return addToast(res.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            setAllSkuDetailsFormShow(false)

            setSkuIdForUpdate('')

            setAllSkuDetails(res.result?.skuDetails)

            addToast(res.message, { appearance: 'success', autoDismiss: true })

            router.push(`/products/${productId}`)

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })


        } finally {

            setIsLoading(false)

        }

    }

    return (

        <>

            <Card style={{ padding: '10px' }}>

                <h6 style={{ color: 'green' }}>SKU information ::</h6>

                <Form>

                    <Form.Group controlId='formBasicEmail'>

                        <Form.Label>

                            Sku Name

                        </Form.Label>

                        <Form.Control
                            type='text'
                            placeholder='Enter Sku name ...'
                            value={skuForm.skuName}
                            onChange={(e) => setSkuForm({ ...skuForm, skuName: e.target.value })}
                        />

                    </Form.Group>

                    <Form.Group controlId='formBasicPassword'>

                        <Form.Control
                            type='number'
                            placeholder='Enter  Sku price ...'
                            value={skuForm.price}
                            onChange={(e) => setSkuForm({ ...skuForm, price: parseFloat(e.target.value) })}
                        />

                    </Form.Group>

                    <Form.Group controlId='formBasicPassword'>

                        <Form.Label>Sku validity</Form.Label>{' '}

                        <small style={{ color: 'gray' }}>

                            (If validity is lifetime then check the box)

                            <Form.Check
                                type='switch'
                                id='custom-switch'
                                label='Lifetime'
                                checked={skuForm.lifetime}
                                onChange={(e) => e.target.checked ? setSkuForm({ ...skuForm, lifetime: e.target.checked, validity: 0, validityType: 'Select Type' }) : setSkuForm({ ...skuForm, validity: 0, lifetime: e.target.checked, validityType: 'Select Type' })}
                            />

                        </small>

                        <InputGroup className='mb-3'>

                            <Form.Control
                                aria-label='Text input with checkbox'
                                disabled={skuForm.lifetime}
                                type='number'
                                value={skuForm.validity}
                                onChange={(e) => setSkuForm({ ...skuForm, validity: parseFloat(e.target.value) })}
                            />

                            <DropdownButton
                                variant='outline-secondary'
                                title={skuForm.validityType}
                                id='input-group-dropdown-9'
                                disabled={skuForm.lifetime}
                                align='end'
                                onSelect={(e) => setSkuForm({ ...skuForm, validityType: e || '' })}
                            >

                                <Dropdown.Item href='#' eventKey={'months'}>Months</Dropdown.Item>
                                <Dropdown.Item href='#' eventKey={'years'}>Years</Dropdown.Item>

                            </DropdownButton>

                        </InputGroup>

                    </Form.Group>

                    <div style={{ marginTop: '10px' }}>

                        <Button
                            variant='outline-info'
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button> {' '}

                        <Button
                            variant='primary'
                            type='submit'
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >

                            {isLoading && (

                                <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>

                            )}

                            Submit

                        </Button>

                    </div>

                </Form>

            </Card>

        </>

    )

}

export default SkuDetailsForm