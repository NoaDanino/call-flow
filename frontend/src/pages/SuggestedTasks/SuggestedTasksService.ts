const BASE = 'http://localhost:3003/suggested-tasks/';

export interface SuggestedTaskDTO {
  id: string;
  name: string;
  tags: TagDTO[];
}

export interface TagDTO {
  id: string;
  name: string;
}

export async function createSuggestedTask(
  name: string,
  tagIds: string[]
): Promise<SuggestedTaskDTO> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, tagIds }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create suggested task: ${errorText}`);
  }

  const data: SuggestedTaskDTO = await res.json();
  return data;
}

/** GET /suggested-tasks */
export async function getAllSuggestedTasks(): Promise<SuggestedTaskDTO[]> {
  const res = await fetch(BASE);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch suggested tasks: ${errorText}`);
  }

  const data: SuggestedTaskDTO[] = await res.json();
  return data;
}

export async function deleteSuggestedTask(id: string): Promise<void> {
  const res = await fetch(`${BASE}${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete suggested task: ${errorText}`);
  }
}

export async function updateSuggestedTaskTags(
  id: string,
  tags: string[]
): Promise<SuggestedTaskDTO> {
  if (tags == undefined) {
    tags = [];
  }
  console.log(tags);

  const res = await fetch(`${BASE}tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update task tags: ${error}`);
  }

  return res.json();
}

export async function updateSuggestedTaskName(id: string, name: string): Promise<SuggestedTaskDTO> {
  const res = await fetch(`${BASE}name/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update task name: ${error}`);
  }

  return res.json();
}
