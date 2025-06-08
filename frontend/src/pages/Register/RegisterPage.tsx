import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Anchor,
  Button,
  Center,
  Group,
  Paper,
  PaperProps,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { handleRegister } from './RegisterService.js';

export function RegisterPage(props: PaperProps) {
  const [status, setStatus] = useState<{ message: string; color: 'red' | 'green' | null }>({
    message: '',
    color: null,
  });
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length < 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setStatus({ message: '', color: null });
    setLoading(true);
    try {
      console.log('Submitting', values);
      const result = await handleRegister(values);
      console.log('Register result:', result);
      if (result.status === 201) {
        setStatus({ message: 'User created successfully, you can sign in', color: 'green' });
      } else {
        //TODO:return the real error?
        setStatus({ message: 'Register failed. Please check your credentials.', color: 'red' });
      }
    } catch (error) {
      console.error('Error in submit:', error);
      setStatus({ message: `Register failed. Please try again.`, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ height: '100vh', backgroundColor: '#fff' }}>
      <Paper
        radius="md"
        p="lg"
        withBorder
        style={{
          minWidth: 400,
          border: '1px solid #ccc',
          backgroundColor: '#fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.05)',
        }}
        {...props}
      >
        <Stack mb="md">
          <Title order={1} c="blue" fw={700}>
            Register
          </Title>
          <Text size="md" fw={500}>
            Welcome to CALL FLOW call center, register with your credentials
          </Text>
          {status.message && (
            <Text c={status.color ?? undefined} mt="sm" fw={600}>
              {status.message}
            </Text>
          )}
        </Stack>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xs">
            <TextInput
              required
              label="Email"
              placeholder="myMail@gmail.com"
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email}
              radius="md"
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password}
              radius="md"
            />
            <TextInput
              required
              label="First Name"
              placeholder="First name"
              value={form.values.firstName}
              onChange={(event) => form.setFieldValue('firstName', event.currentTarget.value)}
              error={form.errors.firstName}
              radius="md"
            />
            <TextInput
              required
              label="Last Name"
              placeholder="Last name"
              value={form.values.lastName}
              onChange={(event) => form.setFieldValue('lastName', event.currentTarget.value)}
              error={form.errors.lastName}
              radius="md"
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor
              component={Link}
              c="dimmed"
              to="/login"
              size="sm"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              Already have an account? Login here
            </Anchor>
            <Button type="submit" radius="xl" loading={loading}>
              Register
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
}
