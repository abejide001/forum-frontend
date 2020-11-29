import React from 'react'
import { Formik, Form } from "formik"
import { Box, Button } from '@chakra-ui/core'
import { Wrapper } from '../components/Wrapper'
import { useRouter } from 'next/router'
import { InputField } from '../components/InputField'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'

interface registerProps {

}

export const Register: React.FC<registerProps> = ({ }) => {
    const router = useRouter()
    const [, register] = useRegisterMutation()
    return (
        <Wrapper>
            <Formik initialValues={{ email: "", username: "", password: "" }} onSubmit={async (values, { setErrors }) => {
                const response = await register({ data: values })
                console.log(response)
                if (response.data?.register.errors) {
                    setErrors(toErrorMap(response.data.register.errors))
                } else if (response.data?.register.user) {
                    router.push("/")
                }
            }}>
                {({ values, handleChange, isSubmitting }) => (
                    <Form>
                        <InputField name="username" placeholder="username" label="Username" required />
                        <Box mt={4}>
                            <InputField name="email" placeholder="email" label="email" type="email" required />
                        </Box>
                        <Box mt={4}>
                            <InputField name="password" placeholder="password" label="Password" type="password" required />
                        </Box>
                        <Button type="submit" variantColor="teal" mt={4} isLoading={isSubmitting}>Register</Button>
                    </Form>
                )
                }
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Register)