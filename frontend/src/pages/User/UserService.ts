import axios from 'axios';

const CALL_SERVICE_URL = 'http://localhost:3000/calls/';
const TAG_SERVICE_URL = 'http://localhost:3001/tags/';

export interface Call {
  id: string;
  title: string;
  tags: { id: string; name: string }[];
  tasks: Task[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'in-progress';
}

export interface SuggestedTask {
  id: string;
  name: string;
}

// Fetch all calls
export async function getAllCalls(): Promise<Call[]> {
  const res = await axios.get(CALL_SERVICE_URL);
  console.log(res.data);

  return res.data;
}
export async function getAllTags(): Promise<SuggestedTask[]> {
  const res = await axios.get(`${TAG_SERVICE_URL}`);
  return res.data;
}

export async function addTagToCall(callId: string, tagId: String): Promise<Call[]> {
  const res = await axios.post(`${CALL_SERVICE_URL}add-tag`, { callId, tagId });
  console.log(res.data);
  return res.data;
}

export async function deleteCallTag(callId: string, tagId: String): Promise<Call[]> {
  const res = await axios.delete(`${CALL_SERVICE_URL}delete-call-tag`, {
    data: { callId, tagId },
  });
  console.log(res.data);
  return res.data;
}
// Fetch all suggested tasks
export async function getSuggestedTasks(callId: string): Promise<SuggestedTask[]> {
  const res = await axios.get(`${CALL_SERVICE_URL}suggested-tasks/${callId}`);
  return res.data;
}

// Fetch all suggested tasks
export async function getCallTags(callId: string): Promise<SuggestedTask[]> {
  const res = await axios.get(`${CALL_SERVICE_URL}tags/${callId}`);
  return res.data;
}

// export async function editTagName(tagId: string, name: string): Promise<SuggestedTask[]> {
//   const res = await axios.put(`${TAG_SERVICE_URL}${tagId}`, { name });
//   return res.data;
// }

// export async function deleteTagName(tagId: string): Promise<SuggestedTask[]> {
//   const res = await axios.delete(`${TAG_SERVICE_URL}${tagId}`);
//   return res.data;
// }

// Update task status
export async function updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
  await axios.put(`${CALL_SERVICE_URL}${taskId}`, { status });
}

// Add a suggested task as a new task for a call
export async function addSuggestedTaskToCall(
  callId: string,
  suggestedTaskId: string
): Promise<void> {
  await axios.post(`${CALL_SERVICE_URL}${callId}/tasks`, { suggestedTaskId });
}
