import React from 'react'
import { Form } from '../src/components/Form'
import { Input } from '../src/components/Input'
import { Button } from '../src/components/Button'

export default {
  title: 'Components/Form',
  component: Form,
}

export const LoginForm = () => (
  <Form onSubmit={() => alert('submitted')}>
    <Input label="Email" placeholder="you@example.com" />
    <Input label="Password" type="password" />
    <Button type="submit">Sign in</Button>
  </Form>
)
