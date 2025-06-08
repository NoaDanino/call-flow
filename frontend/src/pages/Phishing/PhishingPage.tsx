import { useEffect, useState } from 'react';
import {
  Button,
  Group,
  Paper,
  PaperProps,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { getAllAttempts, handlePhishingAttempt } from './PhishingService.js';

export function PhishingPage(props: PaperProps) {
  const [status, setStatus] = useState<{ message: string; color: 'red' | 'green' | null }>({
    message: '',
    color: null,
  });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const fetchAttempts = async () => {
    setRefreshing(true);
    setFetchError(null);
    try {
      const result = await getAllAttempts();
      setAttempts(result);
      setPage(1); // Reset to first page when data is refreshed
    } catch (err) {
      setFetchError('Failed to load phishing attempts. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setStatus({ message: '', color: null });
    setLoading(true);
    try {
      const result = await handlePhishingAttempt(values.email);
      if (result.status === 201) {
        setStatus({
          message: `Phishing attempt done successfully on email ${values.email}.`,
          color: 'green',
        });
      } else {
        setStatus({
          message: 'Phishing attempt failed.',
          color: 'red',
        });
      }
    } catch (error) {
      setStatus({ message: `Phishing attempt failed. Please try again.`, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate indexes for pagination
  const totalPages = Math.ceil(attempts.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAttempts = attempts.slice(startIndex, endIndex);

  return (
    <div
      style={{
        minHeight: '70vh',
        paddingTop: 40,
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Paper
        withBorder
        shadow="sm"
        radius="md"
        p="lg"
        style={{ minWidth: 400, width: '90%', maxWidth: 900 }}
        {...props}
      >
        <Stack mb="md">
          <Title order={1} c="blue" fw={700}>
            Phishing Attempts
          </Title>
          <Text size="md" fw={500}>
            Please enter the email you want to attack with phishing.
          </Text>

          {status.message && (
            <Text c={status.color ?? undefined} mt="sm" fw={600}>
              {status.message}
            </Text>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group gap="xs" align="end">
              <TextInput
                required
                label="Email To Attack"
                placeholder="the-email-I-want-to-attack@gmail.com"
                value={form.values.email}
                onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                error={form.errors.email}
                radius="md"
                style={{ flex: 1 }}
              />
              <Button type="submit" radius="xl" loading={loading}>
                Attack
              </Button>
            </Group>
          </form>

          <Group justify="space-between" mt="lg">
            <Title order={3}>Past Attempts</Title>
            <Button onClick={fetchAttempts} loading={refreshing}>
              Refresh
            </Button>
          </Group>

          {fetchError && (
            <Text c="red" fw={600}>
              {fetchError}
            </Text>
          )}

          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              style={{
                fontSize: 12, // smaller font size
                borderCollapse: 'collapse', // ensure borders show well
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>clicked</Table.Th>
                  <Table.Th>link</Table.Th>
                  <Table.Th>sentAt</Table.Th>
                  <Table.Th>updatedAt</Table.Th>
                  <Table.Th>Current Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {!attempts || attempts.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={8}>No attempts found.</Table.Td>
                  </Table.Tr>
                ) : (
                  paginatedAttempts.map((attempt, index) => (
                    <Table.Tr key={attempt.id ?? index}>
                      <Table.Td>{startIndex + index + 1}</Table.Td>
                      <Table.Td>{attempt._id}</Table.Td>
                      <Table.Td>{attempt.email}</Table.Td>
                      <Table.Td>{attempt.clicked?.toString()}</Table.Td>
                      <Table.Td>{attempt.link}</Table.Td>
                      <Table.Td>{attempt.sentAt}</Table.Td>
                      <Table.Td>{attempt.updatedAt}</Table.Td>
                      <Table.Td>{new Date(attempt.date).toLocaleString()}</Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Group justify="center" mt="md" gap="xs">
              <Button
                size="xs"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    size="xs"
                    variant={pageNum === page ? 'filled' : 'outline'}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                size="xs"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </Group>
          )}
        </Stack>
      </Paper>
    </div>
  );
}
