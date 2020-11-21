import React from 'react'
import { Formik, Form } from "formik"
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core'
import { Wrapper } from '../components/Wrapper'
import { useRouter } from 'next/router'
import { InputField } from '../components/InputField'
import { useMutation } from 'urql'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'

interface registerProps {

}
const REGISTER_MUTATION = ""
export const Register: React.FC<registerProps> = ({ }) => {
    const router = useRouter()
    const [, register] = useRegisterMutation()
    return (
        <Wrapper>
            <Formik initialValues={{ username: "", password: "" }} onSubmit={async (values, { setErrors }) => {
                const response = await register(values)
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

export default Register