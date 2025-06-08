import { useEffect, useState } from 'react';
import { IconPencil, IconX } from '@tabler/icons-react';
import { Box, Button, Group, Paper, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { createTag, deleteTag, getAllTags, updateTag } from './TagsService';

export function Tags() {
  const [status, setStatus] = useState<{ message: string; color: 'red' | 'green' | null }>({
    message: '',
    color: null,
  });

  const [updateStatus, setUpdateStatus] = useState<{
    message: string;
    color: 'red' | 'green' | null;
  }>({
    message: '',
    color: null,
  });

  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<
    { id: string; name: string; isEditing: boolean; editedName: string }[]
  >([]);

  const mapTags = (rawTags: { id?: string; name: string }[]) =>
    rawTags.map((tag) => ({
      id: tag.id ?? tag.name,
      name: tag.name,
      isEditing: false,
      editedName: tag.name,
    }));

  const fetchTags = async () => {
    try {
      const result: any[] = await getAllTags();
      setTags(mapTags(result));
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const form = useForm({
    initialValues: {
      tagName: '',
    },
    validate: {
      tagName: (value) =>
        typeof value === 'string' && value.trim().length > 0 ? null : 'Tag name is required',
    },
  });

  async function handleDelete(id: string) {
    try {
      await deleteTag(id);
      const result = await getAllTags();
      setTags(mapTags(result));
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  }

  const handleSubmit = async (values: typeof form.values) => {
    setStatus({ message: '', color: null });
    setLoading(true);
    try {
      const result: any = await createTag(values.tagName);
      if (result.status === 201 || result.id) {
        setStatus({
          message: `Tag "${values.tagName}" added successfully.`,
          color: 'green',
        });
        fetchTags();
        form.reset();
      } else {
        setStatus({
          message: 'Failed to add tag.',
          color: 'red',
        });
      }
    } catch (error) {
      setStatus({ message: `Failed to add tag. Please try again.`, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (id: string) => {
    setTags((prev) =>
      prev.map((tag) => (tag.id === id ? { ...tag, isEditing: true, editedName: tag.name } : tag))
    );
    setUpdateStatus({ message: '', color: null });
  };

  const changeEditedName = (id: string, newName: string) => {
    setTags((prev) => prev.map((tag) => (tag.id === id ? { ...tag, editedName: newName } : tag)));
  };

  const saveTag = async (id: string) => {
    const tagToUpdate = tags.find((tag) => tag.id === id);
    if (!tagToUpdate) return;

    if (!tagToUpdate.editedName || tagToUpdate.editedName.trim().length === 0) {
      setUpdateStatus({ message: 'Tag name cannot be empty.', color: 'red' });
      return;
    }

    try {
      await updateTag(id, tagToUpdate.editedName);
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === id ? { ...tag, name: tag.editedName, isEditing: false } : tag
        )
      );
      setUpdateStatus({ message: 'Tag updated successfully.', color: 'green' });
    } catch (error) {
      setUpdateStatus({ message: 'Failed to update tag.', color: 'red' });
      console.error(error);
    }
  };

  const cancelEditing = (id: string) => {
    setTags((prev) =>
      prev.map((tag) => (tag.id === id ? { ...tag, isEditing: false, editedName: tag.name } : tag))
    );
    setUpdateStatus({ message: '', color: null });
  };

  return (
    <Paper withBorder shadow="xs" radius="md" p="lg">
      <Stack>
        <Title order={2}>Tags</Title>

        {status.message && (
          <Text color={status.color ?? undefined} mt="sm" fw={600}>
            {status.message}
          </Text>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group gap="xs" align="end" mb="md">
            <TextInput
              required
              label="New tag name"
              placeholder="my tag"
              value={form.values.tagName}
              onChange={(event) => form.setFieldValue('tagName', event.currentTarget.value)}
              error={form.errors.tagName}
              radius="md"
              style={{ flex: 1 }}
            />
            <Button type="submit" radius="xl" loading={loading}>
              Submit
            </Button>
          </Group>
        </form>

        <Group justify="space-between" mb="sm">
          <Text fw={600}>All Tags</Text>
          <Button variant="outline" size="sm" onClick={fetchTags}>
            Refresh
          </Button>
        </Group>

        {updateStatus.message && (
          <Text color={updateStatus.color ?? undefined} mt="sm" fw={600}>
            {updateStatus.message}
          </Text>
        )}

        <Stack gap="xs">
          {tags.length === 0 ? (
            <Text color="dimmed">No tags available.</Text>
          ) : (
            tags.map(({ id, name, isEditing, editedName }) => (
              <Paper
                key={id}
                withBorder
                radius="md"
                p="sm"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {isEditing ? (
                  <>
                    <TextInput
                      value={editedName}
                      onChange={(e) => changeEditedName(id, e.currentTarget.value)}
                      radius="md"
                      size="sm"
                      style={{ flex: 1, marginRight: 10 }}
                    />
                    <Group gap="xs">
                      <Button size="xs" color="green" onClick={() => saveTag(id)}>
                        Save
                      </Button>
                      <Button
                        size="xs"
                        color="gray"
                        variant="outline"
                        onClick={() => cancelEditing(id)}
                      >
                        Cancel
                      </Button>
                    </Group>
                  </>
                ) : (
                  <>
                    <Text>{name}</Text>
                    <Group gap="xs">
                      <Button size="xs" variant="subtle" onClick={() => startEditing(id)}>
                        <IconPencil size={14} style={{ marginRight: 6 }} />
                        Edit
                      </Button>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        onClick={() => handleDelete(id)}
                      >
                        <IconX size={16} />
                      </Button>
                    </Group>
                  </>
                )}
              </Paper>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
