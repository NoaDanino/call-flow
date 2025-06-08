import { useEffect, useState } from 'react';
import { IconCheck, IconPencil, IconPlus, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { TagSection } from './CallTagsPage';
import {
  addSuggestedTaskToCall,
  addTagToCall,
  addTask,
  Call,
  deleteCallTag,
  deleteCallTask,
  editTaskName,
  editTaskStatus,
  getAllCalls,
  getAllTags,
  getCallTags,
  getCallTasks,
  getSuggestedTasks,
  SuggestedTask,
  Tag,
  Task,
} from './UserService';

/** the statuses you support in the DB */
const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
] as const;

export function UserPage() {
  /* ─── calls list ─────────────────────────────────────────────────────── */
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [loadingCalls, setLoadingCalls] = useState(false);

  /* ─── tags ───────────────────────────────────────────────────────────── */
  const [callTags, setCallTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  /* ─── call-specific tasks ────────────────────────────────────────────── */
  const [callTasks, setCallTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  /* editing state for a single task name */
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  /* status / suggested-tasks helpers */
  const [taskStatusUpdating, setTaskStatusUpdating] = useState<string | null>(null);
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [addingSuggestedTaskId, setAddingSuggestedTaskId] = useState<string | null>(null);

  const [addingNewTask, setAddingNewTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  async function handleCreateTask() {
    const name = newTaskName.trim();
    if (!selectedCallId || !name) return;
    setCreatingTask(true);
    try {
      const created = await addTask({ callId: selectedCallId, name });
      setCallTasks((prev: any[]) => {
        const updated = [...prev, created];
        return updated;
      });
      setAddingNewTask(false);
      setNewTaskName('');
    } finally {
      setCreatingTask(false);
    }
  }

  /* ─── initial load: calls & all tags ─────────────────────────────────── */
  useEffect(() => {
    (async () => {
      setLoadingCalls(true);
      try {
        const [callsApi, tagsApi] = await Promise.all([getAllCalls(), getAllTags()]);
        if (Array.isArray(callsApi)) {
          setCalls(callsApi);
          if (callsApi.length) setSelectedCallId(callsApi[0].id);
        }
        if (Array.isArray(tagsApi)) setAllTags(tagsApi);
      } catch (e) {
        console.error('Initial load failed', e);
      } finally {
        setLoadingCalls(false);
      }
    })();
  }, []);

  /* ─── when call changes: load tags, tasks & suggested tasks ──────────── */
  useEffect(() => {
    if (!selectedCallId) return;

    /* tags */
    (async () => {
      setLoadingTags(true);
      try {
        const tags = await getCallTags(selectedCallId);
        setCallTags(Array.isArray(tags) ? tags : []);
      } finally {
        setLoadingTags(false);
      }
    })();

    /* tasks */
    (async () => {
      setLoadingTasks(true);
      try {
        const tasks = await getCallTasks(selectedCallId);
        setCallTasks(Array.isArray(tasks) ? tasks : []);
      } finally {
        setLoadingTasks(false);
      }
    })();

    /* suggested tasks */
    (async () => {
      setLoadingSuggested(true);
      try {
        const st = await getSuggestedTasks(selectedCallId);
        setSuggestedTasks(Array.isArray(st) ? st : []);
      } finally {
        setLoadingSuggested(false);
      }
    })();
  }, [selectedCallId]);

  useEffect(() => {
    setAddingNewTask(false);
    setNewTaskName('');
  }, [selectedCallId]);

  async function handleAddTag(tagId: string) {
    if (!selectedCallId) return;
    await addTagToCall(selectedCallId, tagId);
    setCallTags(await getCallTags(selectedCallId));
  }

  async function handleDeleteTag(tagId: string) {
    if (!selectedCallId) return;
    await deleteCallTag(selectedCallId, tagId);
    setCallTags(await getCallTags(selectedCallId));
  }

  async function handleStatusChange(task: Task, newStatus: string) {
    if (newStatus === task.status) return;
    setTaskStatusUpdating(task.id);
    try {
      await editTaskStatus(task.id, newStatus as Task['status']);
      setCallTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus as Task['status'] } : t))
      );
    } finally {
      setTaskStatusUpdating(null);
    }
  }

  async function handleDeleteTask(taskId: string) {
    await deleteCallTask(taskId);
    setCallTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  function startEditName(t: Task) {
    setEditingTaskId(t.id);
    setEditNameValue(t.name);
  }

  function cancelEditName() {
    setEditingTaskId(null);
    setEditNameValue('');
  }

  async function saveEditName(task: Task) {
    const trimmed = editNameValue.trim();
    if (!trimmed || trimmed === task.name) {
      cancelEditName();
      return;
    }
    await editTaskName(task.id, trimmed);
    setCallTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, name: trimmed } : t)));
    cancelEditName();
  }

  async function onAddSuggestedTask(st: SuggestedTask) {
    if (!selectedCallId) return;
    setAddingSuggestedTaskId(st.id);
    try {
      await addTask({ callId: selectedCallId, suggestedTaskId: st.id });
      setCallTasks(await getCallTasks(selectedCallId));
    } finally {
      setAddingSuggestedTaskId(null);
    }
  }

  const isAssigned = (st: SuggestedTask) => callTasks.some((t) => t.name === st.name);

  if (loadingCalls) {
    return (
      <Paper p="xl" h="100vh">
        <Loader size="xl" />
        <Text ta="center" mt="md">
          Loading calls…
        </Text>
      </Paper>
    );
  }

  const CallsColumn = (
    <Paper shadow="sm" p="md" w={250} style={{ overflowY: 'auto' }}>
      <Title order={4} mb="md">
        All Calls
      </Title>
      <Stack gap={6}>
        {calls.length ? (
          calls.map((c) => (
            <Button
              key={c.id}
              fullWidth
              variant={c.id === selectedCallId ? 'filled' : 'light'}
              color={c.id === selectedCallId ? 'blue' : 'gray'}
              onClick={() => setSelectedCallId(c.id)}
              styles={{ root: { justifyContent: 'flex-start' } }}
            >
              {c.title}
            </Button>
          ))
        ) : (
          <Text>No calls found</Text>
        )}
      </Stack>
    </Paper>
  );

  const TaskRow = (t: Task) => (
    <Group key={t.id} justify="space-between" align="center">
      {editingTaskId === t.id ? (
        <TextInput
          value={editNameValue}
          onChange={(e) => setEditNameValue(e.currentTarget.value)}
          size="xs"
          style={{ flex: 1 }}
        />
      ) : (
        <Text style={{ flex: 1 }}>{t.name}</Text>
      )}

      <Select
        data={STATUS_OPTIONS}
        value={t.status}
        onChange={(v) => v && handleStatusChange(t, v)}
        size="xs"
        disabled={taskStatusUpdating === t.id}
        w={140}
      />

      {editingTaskId === t.id ? (
        <>
          <ActionIcon color="green" variant="light" size="sm" onClick={() => saveEditName(t)}>
            <IconCheck size={14} />
          </ActionIcon>
          <ActionIcon color="gray" variant="subtle" size="sm" onClick={cancelEditName}>
            <IconX size={14} />
          </ActionIcon>
        </>
      ) : (
        <>
          <ActionIcon color="blue" variant="subtle" size="sm" onClick={() => startEditName(t)}>
            <IconPencil size={14} />
          </ActionIcon>
          <ActionIcon color="red" variant="subtle" size="sm" onClick={() => handleDeleteTask(t.id)}>
            <IconX size={14} />
          </ActionIcon>
        </>
      )}
    </Group>
  );

  const selectedCall = calls.find((c) => c.id === selectedCallId);
  const DetailsColumn = selectedCall && (
    <Stack flex={1} h="100%" gap="md" style={{ overflowY: 'auto' }}>
      <Title order={3}>{selectedCall.title}</Title>

      <TagSection
        callTags={callTags}
        allTags={allTags}
        loadingTags={loadingTags}
        selectedCallId={selectedCallId}
        handleAddTag={handleAddTag}
        handleDeleteTag={handleDeleteTag}
      />

      <Paper withBorder p="sm" style={{ flexGrow: 1, overflowY: 'auto' }}>
        <Group justify="space-between" align="center" mb="xs">
          <Text fw={500}>Tasks</Text>
          <ActionIcon
            color={addingNewTask ? 'red' : 'blue'}
            variant="filled"
            size="sm"
            onClick={() => {
              if (addingNewTask) {
                setAddingNewTask(false);
                setNewTaskName('');
              } else {
                setAddingNewTask(true);
              }
            }}
            title={addingNewTask ? 'Cancel' : 'Add new task'}
          >
            {addingNewTask ? <IconX size={16} /> : <IconPlus size={16} />}
          </ActionIcon>
        </Group>

        {addingNewTask && (
          <Group mb="sm" align="center">
            <TextInput
              placeholder="New task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTask();
                }
              }}
              disabled={creatingTask}
              style={{ flex: 1 }}
              size="xs"
            />
            <Button
              size="xs"
              onClick={handleCreateTask}
              loading={creatingTask}
              disabled={!newTaskName.trim()}
            >
              Add
            </Button>
          </Group>
        )}

        {loadingTasks ? (
          <Loader size="sm" />
        ) : callTasks.length ? (
          <Stack gap="xs">{callTasks.map(TaskRow)}</Stack>
        ) : (
          <Text color="dimmed">No tasks</Text>
        )}
      </Paper>

      <Paper withBorder p="sm" style={{ flexGrow: 1, overflowY: 'auto' }}>
        <Text fw={500} mb="xs">
          Suggested Tasks
        </Text>
        {loadingSuggested ? (
          <Loader size="sm" />
        ) : (
          <Stack gap="xs">
            {suggestedTasks.length ? (
              suggestedTasks.map((st) => (
                <Group key={st.id} justify="space-between" align="center">
                  <Text>{st.name}</Text>
                  {isAssigned(st) ? (
                    <Badge color="green" leftSection={<IconCheck size={14} />}>
                      Assigned
                    </Badge>
                  ) : (
                    <Button
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => onAddSuggestedTask(st)}
                      loading={addingSuggestedTaskId === st.id}
                    >
                      Add
                    </Button>
                  )}
                </Group>
              ))
            ) : (
              <Text color="dimmed">No suggested tasks</Text>
            )}
          </Stack>
        )}
      </Paper>
    </Stack>
  );

  return (
    <Group gap="xl" align="stretch" h="100vh" p={20}>
      {CallsColumn}
      {DetailsColumn ?? <Text>Select a call to see details</Text>}
    </Group>
  );
}
