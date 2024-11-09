import { Product } from '../../services/product.service'
import React, { FC, useEffect, useState } from 'react'
import { Badge, Button, Card, Form, InputGroup, ListGroup } from 'react-bootstrap'
import { Archive, ArrowReturnLeft, Check2Circle, Pencil, Plus } from 'react-bootstrap-icons'
import { useToasts } from 'react-toast-notifications'

interface SkuLicenseProps {
    productId: string
    licensesListFor: string
    setLicensesListFor: any
}

const SkuDetailsLicense: FC<SkuLicenseProps> = ({ productId, licensesListFor, setLicensesListFor }) => {

    const { addToast } = useToasts()

    const [isLoading, setIsLoading] = useState(false)

    const [licenseKey, setLicenseKey] = useState('')

    const [addFormShow, setAddFormShow] = useState(false)

    const [licenseKeyForUpdate, setLicenseKeyForUpdate] = useState(null)

    const [licenses, setLicenses] = useState([])

    const [isLoadingForDelete, setIsLoadingForDelete] = useState({ status: false, id: '' })

    const [isLoadingForFetch, setIsLoadingForFetch] = useState(false)

    useEffect(() => {

        setLicenses([])
        setLicenseKey('')
        setAddFormShow(false)
        setLicenseKeyForUpdate(null)

    }, [])

    useEffect(() => {

        if (licensesListFor) {

            fetchAllLicenses(productId, licensesListFor)

        }

    }, [licensesListFor])

    const fetchAllLicenses = async (productId: string, skuId: string) => {

        try {

            setIsLoadingForFetch(true)

            const licensesRes = await Product.getLicenses(productId, skuId)

            if (!licensesRes.success) {

                addToast(licensesRes.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            setLicenses(licensesRes?.result)

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        } finally {

            setIsLoadingForFetch(false)

        }

    }

    const updateLicense = async (e: any) => {

        e.preventDefault()

        setIsLoading(true)

        try {

            const result = licenseKeyForUpdate
                ?
                await Product.updateLicense(productId, licensesListFor, licenseKeyForUpdate, { licenseKey })
                :
                await Product.createLicense(productId, licensesListFor, { licenseKey })

            if (!result.success) {

                addToast(result.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            setLicenseKey('')
            setAddFormShow(false)

            await fetchAllLicenses(productId, licensesListFor)

            addToast(result.message, { appearance: 'success', autoDismiss: true })

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        } finally {

            setIsLoading(false)

        }

    }

    const handleDeleteLicense = async (id: string) => {

        try {


            const deleteConfirm = confirm('Want to delete? You will be lost all licenses for this sku')

            if (deleteConfirm) {

                setIsLoadingForDelete({ status: true, id })

                const deleteLicenseRes = await Product.deleteLicense(id)

                if (!deleteLicenseRes.success) {

                    addToast(deleteLicenseRes.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

                }

                await fetchAllLicenses(productId, licensesListFor)

                addToast(deleteLicenseRes.message, { appearance: 'success', autoDismiss: true })

            }

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        } finally {

            setIsLoadingForDelete({ status: false, id })

        }

    }

    return (

        <>

            <Card style={{ padding: '10px' }}>

                <Button
                    className='btnBackLicense'
                    style={{ width: 'fit-content', margin: '3px' }}
                    variant='info'
                    onClick={() => setLicensesListFor(null)}
                >

                    <ArrowReturnLeft />

                </Button>

                <Button
                    variant='secondary'
                    className='btnAddLicense'
                    style={{ width: 'fit-content', margin: '3px' }}
                    onClick={() => { setAddFormShow(true); setLicenseKey('') }}
                >

                    <Plus />

                    Add New License

                </Button>

                {addFormShow && (

                    <Form>

                        <h6 style={{ color: 'green' }}>

                            License Keys Information ::

                        </h6>

                        <Form.Group controlId='formBasicPassword'>

                            <Form.Label>Sku License Keys</Form.Label>{' '}

                            <InputGroup>

                                <Form.Control
                                    type='text'
                                    placeholder='Enter License Keys ...'
                                    onChange={(e) => setLicenseKey(e.target.value)}
                                    value={licenseKey}
                                />

                                <Button
                                    variant='secondary'
                                    onClick={updateLicense}
                                    disabled={isLoading}
                                >

                                    {isLoading && (

                                        <span
                                            className='spinner-border spinner-border-sm mr-2'
                                            role='status'
                                            aria-hidden='true'
                                        ></span>

                                    )}

                                    <Check2Circle /> Submit

                                </Button>

                            </InputGroup>

                        </Form.Group>

                    </Form>

                )}

                <div>Licenses Keys are listed below ({licenses.length}):</div>

                {licenses.length > 0

                    ? licenses.map((license: any, index: number) =>
                    (
                        <>

                            <ListGroup.Item key={index} className='mt-2'>

                                <Badge bg='info'>{license.licenseKey}</Badge>{''}

                                <span
                                    className='editLBtn'
                                    onClick={() => {

                                        setLicenseKeyForUpdate(license._id);
                                        setLicenseKey(license.licenseKey);
                                        setAddFormShow(true)
                                    }}
                                >

                                    <Pencil />

                                </span>

                                <span
                                    className='delLBtn'
                                    onClick={() => handleDeleteLicense(license._id)}
                                >

                                    {isLoadingForDelete.status && isLoadingForDelete.id === license._id
                                        ?
                                        (
                                            <>
                                                <span
                                                    className='spinner-border  spinner-border-sm mr-2'
                                                    role='status'
                                                    aria-hidden='true'
                                                >
                                                </span>
                                            </>
                                        )
                                        :
                                        (
                                            <>
                                                <Archive />
                                            </>
                                        )
                                    }

                                </span>

                            </ListGroup.Item>

                        </>
                    )
                    )
                    :
                    (
                        <>

                            <ListGroup.Item>

                                <span>

                                    {isLoadingForFetch
                                        ?
                                        (
                                            <>

                                                <span
                                                    className='spinner-border spinner-border-sm mr-2'
                                                    role='status'
                                                    aria-hidden='true'
                                                >
                                                </span>{' '}

                                                <span>Loading...</span>

                                            </>
                                        )
                                        :
                                        (
                                            <>
                                                <br />
                                                No licenses key found
                                            </>
                                        )
                                    }

                                </span>

                            </ListGroup.Item>

                        </>
                    )
                }

            </Card>

        </>

    )

}

export default SkuDetailsLicense