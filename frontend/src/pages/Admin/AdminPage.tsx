import { Box, Group, Paper, PaperProps, Stack, Title } from '@mantine/core';
import SuggestedTasks from '../SuggestedTasks/SuggestedTasksPage';
import { Tags } from '../Tags/TagsPage';

export function AdminPage(props: PaperProps) {
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
        style={{ minWidth: 400, width: '90%', maxWidth: 1200 }}
        {...props}
      >
        <Stack mb="md">
          <Title order={1} c="blue" fw={700}>
            Admin Page
          </Title>

          <Group align="start" grow wrap="nowrap" gap="xl">
            <Box style={{ flex: 1 }}>
              <Tags />
            </Box>

            <Box style={{ flex: 1 }}>
              <SuggestedTasks />
            </Box>
          </Group>
        </Stack>
      </Paper>
    </div>
  );
}
