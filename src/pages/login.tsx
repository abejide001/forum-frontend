import React from 'react'
import { Formik, Form } from "formik"
import { Box, Button, Flex, Link } from '@chakra-ui/core'
import { Wrapper } from '../components/Wrapper'
import { useRouter } from 'next/router'
import { InputField } from '../components/InputField'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'
import NextLink from "next/link"
interface loginProps {

}

export const Login: React.FC<loginProps> = ({ }) => {
    const router = useRouter()
    const [, login] = useLoginMutation()
    return (
        <Wrapper>
            <Formik initialValues={{ usernameOrEmail: "", password: "" }} onSubmit={async (values, { setErrors }) => {
                const response = await login(values)
                if (response.data?.login.errors) {
                    setErrors(toErrorMap(response.data.login.errors))
                } else if (response.data?.login.user) {
                    router.push("/")
                }
            }}>
                {({ values, handleChange, isSubmitting }) => (
                    <Form>
                        <InputField name="usernameOrEmail" placeholder="username or email" label="Username or Email" required />
                        <Box mt={4}>
                            <InputField name="password" placeholder="password" label="Password" type="password" required />
                        </Box>
                        <Flex mt={2}>
                        <Box>
                            <NextLink href="/forgot-password">
                                <Link ml="auto">forget password?</Link>
                            </NextLink>
                        </Box>
                        </Flex>
                        <Button type="submit" variantColor="teal" mt={4} isLoading={isSubmitting}>Login</Button>
                    </Form>
                )
                }
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Login)