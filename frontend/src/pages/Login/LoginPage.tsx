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
import { handleLogin } from './LoginService.js';

export function LoginPage(props: PaperProps) {
  const [status, setStatus] = useState<{ message: string; color: 'red' | 'green' | null }>({
    message: '',
    color: null,
  });
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
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
      const result = await handleLogin(values);
      console.log('Login result:', result);
      if (result.status === 200) {
        if (result.data.role == 'admin') {
          console.log('Login successful, redirecting to admins page');
          window.location.href = '/admin';
        }
        if (result.data.role == 'user') {
          console.log('Login successful, redirecting to users page');
          window.location.href = '/user';
        }
      } else {
        setStatus({ message: 'Login failed. Please check your credentials.', color: 'red' });
      }
    } catch (error) {
      console.error('Error in submit:', error);
      setStatus({ message: `Login failed. Please try again.`, color: 'red' });
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
            Login
          </Title>
          <Text size="md" fw={500}>
            Welcome to CALL FLOW call center, login with your email and password
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
          </Stack>

          <Group justify="space-between" align="center" mt="xl" style={{ width: '100%' }}>
            <Anchor
              component={Link}
              c="dimmed"
              to="/register"
              size="sm"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              Don't have an account? Register here
            </Anchor>
            <Button type="submit" radius="xl" loading={loading}>
              Login
            </Button>
          </Group>
        </form>
      </Paper>
    </Center>
  );
}
