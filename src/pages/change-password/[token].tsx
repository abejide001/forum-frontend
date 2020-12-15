import { Box, Button } from '@chakra-ui/core'
import { query } from '@urql/exchange-graphcache'
import { Formik, Form } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { InputField } from '../../components/InputField'
import { Wrapper } from '../../components/Wrapper'
import { useChangePasswordMutation } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { toErrorMap } from '../../utils/toErrorMap'

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
    const [, changePassword] = useChangePasswordMutation()
    const [tokenError, setTokenError] = useState('')
    const router = useRouter()
    return (
        <Wrapper>
            <Formik initialValues={{ newPassword: "" }} onSubmit={async (values, { setErrors }) => {
                const response = await changePassword({ newPassword: values.newPassword, token })
                if (response.data?.changePassword.errors) {
                    const errorMap = toErrorMap(response.data.changePassword.errors)
                    if ('token' in errorMap) {
                        setTokenError(errorMap.token)
                    }
                    setErrors(errorMap)
                } else if (response.data?.changePassword.user) {
                    router.push("/")
                }
            }}>
                {({ values, handleChange, isSubmitting }) => (
                    <Form>
                        <InputField name="newPassword" placeholder="new password" label="New Password" type="password" required/>
                        {tokenError ? <Box style={{ color:'red' }}>{tokenError}</Box> : null }
                        <Button type="submit" variantColor="teal" mt={4} isLoading={isSubmitting}>Change Password</Button>
                    </Form>
                )
                }
            </Formik>
        </Wrapper>
    )
}

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.token as string
    }
}

export default withUrqlClient(createUrqlClient, { ssr: false })(ChangePassword)