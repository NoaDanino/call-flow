import { useEffect, useState } from 'react';
import { IconCheck, IconCircleX, IconPencil, IconPlus, IconX } from '@tabler/icons-react';
import {
  Badge,
  Box,
  Button,
  Group,
  MultiSelect,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { getAllTags } from '../Tags/TagsService';
import {
  createSuggestedTask,
  deleteSuggestedTask,
  getAllSuggestedTasks,
  SuggestedTaskDTO,
  updateSuggestedTaskName,
  updateSuggestedTaskTags,
} from './SuggestedTasksService';

type Tag = { id: string; name: string };

export default function SuggestedTasks() {
  /* ---------- state ---------- */
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [taskName, setTaskName] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tasks, setTasks] = useState<SuggestedTaskDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);

  /* edit mode state */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTagIds, setEditTagIds] = useState<string[]>([]);

  /* ---------- initial load ---------- */
  useEffect(() => {
    (async () => {
      try {
        const tagsRaw = await getAllTags();
        const safeTags = (Array.isArray(tagsRaw) ? tagsRaw : (tagsRaw?.data ?? [])).map(
          (t: Tag) => ({ id: t.id ?? t.name, name: t.name })
        );
        setAllTags(safeTags);

        setTasks(await getAllSuggestedTasks());
      } catch (err) {
        console.error('initial load failed:', err);
      } finally {
        setInitialising(false);
      }
    })();
  }, []);

  /* ---------- actions ---------- */
  async function handleAddTask() {
    if (!taskName.trim() || selectedTagIds.length === 0) return;
    setLoading(true);
    try {
      await createSuggestedTask(taskName.trim(), selectedTagIds);
      setTasks(await getAllSuggestedTasks());
      setTaskName('');
      setSelectedTagIds([]);
    } catch (err) {
      console.error('createSuggestedTask failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSuggestedTask(id);
      setTasks(await getAllSuggestedTasks());
    } catch (err) {
      console.error('deleteSuggestedTask failed:', err);
    }
  }

  /* ---------- edit helpers ---------- */
  function startEdit(task: SuggestedTaskDTO) {
    setEditingId(task.id);
    setEditName(task.name);
    setEditTagIds(task.tags.map((t) => t.id));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditTagIds([]);
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);

    try {
      const original = tasks.find((t) => t.id === editingId);
      if (!original) return;

      const requests = [];

      /* compare name */
      if (editName.trim() !== original.name) {
        requests.push(updateSuggestedTaskName(editingId, editName.trim()));
      }

      /* compare tags (array diff) */
      const origTagIds = original.tags
        .map((t) => t.id)
        .sort()
        .join(',');
      const newTagIds = [...editTagIds].sort().join(',');
      if (origTagIds !== newTagIds) {
        requests.push(updateSuggestedTaskTags(editingId, editTagIds));
      }

      // Run all updates
      if (requests.length) {
        await Promise.all(requests);
      }

      // Refresh list
      setTasks(await getAllSuggestedTasks());
      cancelEdit();
    } catch (err) {
      console.error('updateSuggestedTask failed:', err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- UI ---------- */
  if (initialising) {
    return (
      <Paper withBorder shadow="sm" radius="md" p="lg">
        <Text>Loading suggested tasks…</Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder shadow="sm" radius="md" p="lg">
      <Stack>
        <Title order={3}>Suggested Tasks</Title>

        {/* ----- create form ----- */}
        <Paper withBorder p="md">
          <Stack gap="sm">
            <TextInput
              label="Name"
              placeholder="Enter task name"
              value={taskName}
              onChange={(e) => setTaskName(e.currentTarget.value)}
            />
            <MultiSelect
              label="Tags"
              data={allTags.map(({ id, name }) => ({ value: id, label: name }))}
              value={selectedTagIds}
              onChange={setSelectedTagIds}
              placeholder="Select tags"
              searchable
              rightSection={<IconPlus size={16} />}
            />
            <Button onClick={handleAddTask} loading={loading}>
              Submit
            </Button>
          </Stack>
        </Paper>

        {/* ----- list ----- */}
        <Box mt="md" p="md" style={{ border: '1px solid #ccc', borderRadius: 8 }}>
          <Title order={4} mb="sm">
            All Suggested Tasks
          </Title>

          {tasks.length === 0 ? (
            <Text c="dimmed">No tasks added yet.</Text>
          ) : (
            tasks.map((task) =>
              editingId === task.id ? (
                /* -------- edit mode row -------- */
                <Paper key={task.id} withBorder radius="md" p="sm" mt="sm">
                  <Stack>
                    <TextInput
                      label="Name"
                      value={editName}
                      onChange={(e) => setEditName(e.currentTarget.value)}
                    />
                    <MultiSelect
                      label="Tags"
                      data={allTags.map(({ id, name }) => ({ value: id, label: name }))}
                      value={editTagIds}
                      onChange={setEditTagIds}
                      placeholder="Select tags"
                      searchable
                    />
                    <Group gap="xs">
                      <Button
                        size="xs"
                        color="green"
                        leftSection={<IconCheck size={14} />}
                        onClick={saveEdit}
                        loading={loading}
                      >
                        Save
                      </Button>
                      <Button
                        size="xs"
                        color="gray"
                        variant="outline"
                        leftSection={<IconCircleX size={14} />}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ) : (
                /* -------- view mode row -------- */
                <Paper key={task.id} withBorder radius="md" p="sm" mt="sm">
                  <Group justify="space-between" align="center">
                    <div>
                      <Text fw={500}>{task.name}</Text>
                      <Group gap="xs" mt="xs">
                        {task.tags.map(({ id: tid, name: tname }) => (
                          <Badge key={tid}>{tname}</Badge>
                        ))}
                      </Group>
                    </div>

                    <Group gap="xs">
                      <Button
                        variant="subtle"
                        color="blue"
                        size="xs"
                        onClick={() => startEdit(task)}
                      >
                        <IconPencil size={16} />
                      </Button>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => handleDelete(task.id)}
                      >
                        <IconX size={16} />
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              )
            )
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
