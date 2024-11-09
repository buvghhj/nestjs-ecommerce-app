import { Product } from '@/services/product.service'
import { getFormatedStringFromDays } from '@/utils'
import React, { FC, useState } from 'react'
import { Badge, Button, Table } from 'react-bootstrap'
import { useToasts } from 'react-toast-notifications'
import SkuDetailsForm from './SkuDetailsForm'
import { Pencil, Trash } from 'react-bootstrap-icons'
import SkuDetailsLicense from '../Products/SkuDetailsLicense'

interface SkuDetailsProps {
    skuDetails: any
    productId: any
    setAllSkuDetails: any
}

const SkuDetailsList: FC<SkuDetailsProps> = ({ skuDetails: allSkuDetails, productId, setAllSkuDetails }) => {

    const [allSkuDetailsFormShow, setAllSkuDetailsFormShow] = useState(false)

    const [licensesListFor, setLicensesListFor] = useState(null)

    const { addToast } = useToasts()

    const [skuIdForUpdate, setSkuIdForUpdate] = useState('')

    const handleDelSku = async (skuId: string) => {

        try {

            const deleteConfirm = confirm('Are you sure you want to delete this sku?')

            if (deleteConfirm) {

                const deleteSkuRes = await Product.deleteSku(productId, skuId)

                if (!deleteSkuRes.success) {

                    return addToast(deleteSkuRes.message, { appearance: 'error', autoDismiss: true })

                }

                setAllSkuDetails(allSkuDetails.filter((sku: { _id: string }) => sku._id !== skuId))

                addToast(deleteSkuRes.message, { appearance: 'success', autoDismiss: true })

            }

        } catch (error: any) {

            if (error.response) {

                return addToast(error.response.data.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

            }

            return addToast(error.message || 'Something went wrong', { appearance: 'error', autoDismiss: true })

        }

    }

    return (

        <>

            {!allSkuDetailsFormShow && !licensesListFor && (

                <>

                    <Button
                        variant='secondary'
                        onClick={() => { setAllSkuDetailsFormShow(true) }}
                    >

                        Add Sku Details

                    </Button>

                    <Table responsive>

                        <thead>

                            <tr>
                                <th>Sku Name</th>
                                <th>Price</th>
                                <th>License Keys</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>

                            {allSkuDetails && allSkuDetails.length > 0 && allSkuDetails.map((sku: any, key: any) => (
                                <tr key={sku._id}>
                                    <td>{sku.skuName}</td>
                                    <td>

                                        ₹{sku.price}{' '}

                                        <Badge bg='warning' text='dark'>

                                            {sku?.lifetime ? 'Lifetime' : getFormatedStringFromDays(sku?.validity)}

                                        </Badge>

                                    </td>
                                    <td>

                                        <Button
                                            variant='link'
                                            onClick={() => {
                                                setLicensesListFor(sku._id);
                                                setAllSkuDetailsFormShow(false)
                                            }}
                                        >
                                            View
                                        </Button>

                                    </td>
                                    <td>
                                        <Button
                                            variant='primary'
                                            onClick={() => { setSkuIdForUpdate(sku._id), setAllSkuDetailsFormShow(true) }}
                                        >
                                            <Pencil />
                                        </Button> {' '}

                                        <Button
                                            variant='danger'
                                            onClick={() => handleDelSku(sku._id)}
                                        ><Trash /></Button>
                                    </td>
                                </tr>
                            ))}

                            {allSkuDetails.length === 0 && (

                                <tr>
                                    <td colSpan={4} className='text-center'>No Sku Details Found</td>
                                </tr>

                            )}

                        </tbody>

                    </Table>

                </>

            )}

            {allSkuDetailsFormShow && (

                <SkuDetailsForm
                    setAllSkuDetailsFormShow={setAllSkuDetailsFormShow}
                    productId={productId}
                    setAllSkuDetails={setAllSkuDetails}
                    allSkuDetails={allSkuDetails}
                    skuIdForUpdate={skuIdForUpdate}
                    setSkuIdForUpdate={setSkuIdForUpdate}
                />

            )}

            {licensesListFor && (

                <SkuDetailsLicense
                    productId={productId}
                    licensesListFor={licensesListFor}
                    setLicensesListFor={setLicensesListFor}
                />

            )}

        </>

    )

}

export default SkuDetailsList