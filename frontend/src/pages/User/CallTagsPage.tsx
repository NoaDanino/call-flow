import React from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { ActionIcon, Badge, Group, Loader, Menu, Paper, Stack, Text } from '@mantine/core';
import type { Tag } from './UserService';

interface TagSectionProps {
  callTags: Tag[];
  allTags: Tag[];
  loadingTags: boolean;
  selectedCallId: string | null;
  handleAddTag: (tagId: string) => Promise<void>;
  handleDeleteTag: (tagId: string) => Promise<void>;
}

export function TagSection({
  callTags,
  allTags,
  loadingTags,
  selectedCallId,
  handleAddTag,
  handleDeleteTag,
}: TagSectionProps) {
  const remainingTags = allTags.filter((t) => !callTags.some((assigned) => assigned.id === t.id));

  return (
    <Paper withBorder p="sm">
      <Group justify="space-between" align="center" mb="xs">
        <Text fw={500}>Tags</Text>

        {/* PLUS menu with remaining tags */}
        <Menu withinPortal position="bottom-end" shadow="md">
          <Menu.Target>
            <ActionIcon variant="light" color="blue" size="sm" disabled={!selectedCallId}>
              <IconPlus size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {remainingTags.length ? (
              remainingTags.map((t) => (
                <Menu.Item key={t.id} onClick={() => handleAddTag(t.id)}>
                  {t.name}
                </Menu.Item>
              ))
            ) : (
              <Menu.Label>(No more tags)</Menu.Label>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>

      {loadingTags ? (
        <Loader size="sm" />
      ) : (
        <Stack gap="xs">
          {callTags.length ? (
            callTags.map((tag) => (
              <Group key={tag.id} gap="xs">
                <Badge color="cyan" variant="light">
                  {tag.name}
                </Badge>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDeleteTag(tag.id)}
                  disabled={!selectedCallId}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            ))
          ) : (
            <Text color="dimmed">No tags</Text>
          )}
        </Stack>
      )}
    </Paper>
  );
}
