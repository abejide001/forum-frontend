import { Box, Flex, Link, Button } from '@chakra-ui/core'
import { Formik, Form } from 'formik'
import { withUrqlClient } from 'next-urql'
import router from 'next/dist/next-server/lib/router/router'
import React, { useState } from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'


const ForgetPassword: React.FC<{}> = ({ }) => {
    const [, forgotPassword] = useForgotPasswordMutation()
    const [complete, setComplete] = useState(false)
    return (
        <Wrapper>
            <Formik initialValues={{ email: "" }} onSubmit={async (values) => {
                await forgotPassword(values)
                setComplete(true)

            }}>
                {({ values, handleChange, isSubmitting }) => complete ? <Box>Email sent</Box> : (
                    <Form>
                        <Box mt={4}>
                            <InputField name="email" placeholder="email" label="Email" type="email" required />
                        </Box>
                        <Button type="submit" variantColor="teal" mt={4} isLoading={isSubmitting}>Submit</Button>
                    </Form>
                )
                }
            </Formik>
        </Wrapper>
    )
}
export default withUrqlClient(createUrqlClient)(ForgetPassword)