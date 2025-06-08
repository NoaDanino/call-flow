// CallTasksPage.tsx
import { useState } from 'react';
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';
import { ActionIcon, Group, Select, Stack, Text, TextInput } from '@mantine/core';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface CallTask {
  id: string;
  name: string;
  status: TaskStatus;
}

interface Props {
  /** Tasks that belong to the call */
  tasks: CallTask[];
  /**
   * Persist a change (name or status)
   * – Parent should handle API call + local state refresh.
   */
  onUpdate: (id: string, changes: Partial<CallTask>) => Promise<void>;
}

const STATUS_DATA = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export function CallTasksPage({ tasks, onUpdate }: Props) {
  /* inline-name-edit state */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  /* ───────── handlers ───────── */
  const startEdit = (task: CallTask) => {
    setEditingId(task.id);
    setDraftName(task.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName('');
  };

  const saveEdit = async () => {
    if (!editingId || !draftName.trim()) return;
    await onUpdate(editingId, { name: draftName.trim() });
    cancelEdit();
  };

  const changeStatus = async (taskId: string, status: string | null) => {
    if (!status) return;
    await onUpdate(taskId, { status: status as TaskStatus });
  };

  /* ───────── UI ───────── */
  return (
    <Stack gap="xs">
      {tasks.length ? (
        tasks.map((task) => (
          <Group key={task.id} justify="space-between" align="center">
            {/* Task name – view vs. edit */}
            {editingId === task.id ? (
              <>
                <TextInput
                  value={draftName}
                  onChange={(e) => setDraftName(e.currentTarget.value)}
                  w="60%"
                  size="xs"
                />
                <Group gap="xs">
                  <ActionIcon color="green" onClick={saveEdit} size="xs">
                    <IconCheck size={14} />
                  </ActionIcon>
                  <ActionIcon color="gray" onClick={cancelEdit} size="xs">
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              </>
            ) : (
              <>
                <Text style={{ flex: 1 }}>{task.name}</Text>
                <ActionIcon variant="subtle" size="xs" onClick={() => startEdit(task)}>
                  <IconPencil size={14} />
                </ActionIcon>
              </>
            )}

            {/* Status dropdown */}
            <Select
              data={STATUS_DATA}
              value={task.status}
              onChange={(val) => changeStatus(task.id, val)}
              size="xs"
              w={140}
            />
          </Group>
        ))
      ) : (
        <Text c="dimmed">No tasks</Text>
      )}
    </Stack>
  );
}
