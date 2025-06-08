//TODO: put all shred libs in a shared folder
const TAG_SERVICE_URL = 'http://localhost:3001/tags';

export async function createTag(tagName: string): Promise<any> {
  try {
    const response = await fetch(TAG_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: tagName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create tag: ${response.statusText}`);
    }
    const createdTag = await response;
    return createdTag;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
}

export async function getAllTags() {
  const response = await fetch(TAG_SERVICE_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  return response.json(); // expected to return an array of tag objects
}

// TagsService.js

export async function updateTag(id: string, newName: string) {
  try {
    const response = await fetch(`${TAG_SERVICE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      throw new Error('Failed to update tag');
    }

    const updatedTag = await response.json();
    return updatedTag;
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
}

export async function deleteTag(id: string): Promise<void> {
  const res = await fetch(`${TAG_SERVICE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete tag: ${errorText}`);
  }
}
