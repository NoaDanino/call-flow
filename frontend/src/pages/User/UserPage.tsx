// UserPage.tsx
import React, { useEffect, useState } from 'react';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { Badge, Button, Checkbox, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { TagSection } from './CallTagsPage'; // ⬅️ NEW import
import {
  addSuggestedTaskToCall,
  addTagToCall,
  Call,
  deleteCallTag,
  getAllCalls,
  getAllTags,
  getCallTags,
  getSuggestedTasks,
  SuggestedTask,
  Tag,
  Task,
  updateTaskStatus,
} from './UserService';

export function UserPage() {
  /* ─────────── state ─────────── */
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  /* tags */
  const [callTags, setCallTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  /* suggested tasks */
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  /* UI helpers */
  const [taskStatusUpdating, setTaskStatusUpdating] = useState<string | null>(null);
  const [addingSuggestedTaskId, setAddingSuggestedTaskId] = useState<string | null>(null);

  /* ─────────── mount: load calls + all tags ─────────── */
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
      } catch (err) {
        console.error('Initial load failed', err);
      } finally {
        setLoadingCalls(false);
      }
    })();
  }, []);

  /* ─────────── when selectedCallId changes: refresh tags & suggested tasks ─────────── */
  useEffect(() => {
    if (!selectedCallId) return;

    /* tags */
    (async () => {
      setLoadingTags(true);
      try {
        const tags = await getCallTags(selectedCallId);
        setCallTags(Array.isArray(tags) ? tags : []);
      } catch (err) {
        console.error('Failed to load call tags', err);
        setCallTags([]);
      } finally {
        setLoadingTags(false);
      }
    })();

    /* suggested tasks */
    (async () => {
      setLoadingSuggested(true);
      try {
        const tasks = await getSuggestedTasks(selectedCallId);
        setSuggestedTasks(Array.isArray(tasks) ? tasks : []);
      } catch (err) {
        console.error('Failed to load suggested tasks', err);
        setSuggestedTasks([]);
      } finally {
        setLoadingSuggested(false);
      }
    })();
  }, [selectedCallId]);

  const selectedCall = calls.find((c) => c.id === selectedCallId);

  /* ─────────── tag actions ─────────── */
  async function handleDeleteTag(tagId: string) {
    if (!selectedCallId) return;
    try {
      await deleteCallTag(selectedCallId, tagId);
      const refreshed = await getCallTags(selectedCallId);
      setCallTags(Array.isArray(refreshed) ? refreshed : []);
    } catch (err) {
      console.error('Delete tag failed', err);
    }
  }

  async function handleAddTag(tagId: string) {
    if (!selectedCallId) return;
    try {
      await addTagToCall(selectedCallId, tagId);
      const refreshed = await getCallTags(selectedCallId);
      setCallTags(Array.isArray(refreshed) ? refreshed : []);
    } catch (err) {
      console.error('Add tag failed', err);
    }
  }

  /* ─────────── task status toggle ─────────── */
  async function onToggleTaskStatus(task: Task) {
    if (!selectedCall) return;
    setTaskStatusUpdating(task.id);
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTaskStatus(task.id, newStatus);
      setCalls((prev) =>
        prev.map((call) =>
          call.id === selectedCall.id
            ? {
                ...call,
                tasks: call.tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
              }
            : call
        )
      );
    } catch (err) {
      console.error('Update status failed', err);
    } finally {
      setTaskStatusUpdating(null);
    }
  }

  /* ─────────── add suggested task ─────────── */
  async function onAddSuggestedTask(st: SuggestedTask) {
    if (!selectedCall) return;
    setAddingSuggestedTaskId(st.id);
    try {
      await addSuggestedTaskToCall(selectedCall.id, st.id);
      const tmp: Task = { id: `tmp-${st.id}`, name: st.name, status: 'pending' };
      setCalls((prev) =>
        prev.map((call) =>
          call.id === selectedCall.id ? { ...call, tasks: [...call.tasks, tmp] } : call
        )
      );
    } catch (err) {
      console.error('Add suggested task failed', err);
    } finally {
      setAddingSuggestedTaskId(null);
    }
  }

  const isAssigned = (st: SuggestedTask) =>
    selectedCall?.tasks?.some((t) => t.name === st.name) ?? false;

  /* ─────────── UI ─────────── */
  if (loadingCalls) {
    return (
      <Paper p="xl" h="100vh">
        <Loader size="xl" variant="dots" />
        <Text ta="center" mt="md">
          Loading calls…
        </Text>
      </Paper>
    );
  }

  return (
    <Group gap="xl" align="stretch" h="100vh" p={20}>
      {/* ───── LEFT: call list ───── */}
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

      {/* ───── RIGHT: details ───── */}
      {selectedCall ? (
        <Stack flex={1} h="100%" gap="md" style={{ overflowY: 'auto' }}>
          <Title order={3}>{selectedCall.title}</Title>

          {/* TAGS */}
          <TagSection
            callTags={callTags}
            allTags={allTags}
            loadingTags={loadingTags}
            selectedCallId={selectedCallId}
            handleAddTag={handleAddTag}
            handleDeleteTag={handleDeleteTag}
          />

          {/* TASKS */}
          <Paper withBorder p="sm" style={{ flexGrow: 1, overflowY: 'auto' }}>
            <Text fw={500} mb="xs">
              Tasks
            </Text>
            <Stack gap="xs">
              {selectedCall.tasks?.length ? (
                selectedCall.tasks.map((task) => (
                  <Checkbox
                    key={task.id}
                    label={task.name}
                    checked={task.status === 'completed'}
                    onChange={() => onToggleTaskStatus(task)}
                    disabled={taskStatusUpdating === task.id}
                  />
                ))
              ) : (
                <Text color="dimmed">No tasks</Text>
              )}
            </Stack>
          </Paper>

          {/* SUGGESTED TASKS */}
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
      ) : (
        <Text>Select a call to see details</Text>
      )}
    </Group>
  );
}
