import axios from 'axios';

const CALL_SERVICE_URL = 'http://localhost:3000/calls/';
const TAG_SERVICE_URL = 'http://localhost:3001/tags/';
const TASK_SERVICE_URL = 'http://localhost:3002/tasks/';

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
  status: 'Open' | 'In Progress' | 'Completed';
}

export interface SuggestedTask {
  id: string;
  name: string;
}

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

export async function deleteCallTask(taskId: string): Promise<Call[]> {
  const res = await axios.delete(`${TASK_SERVICE_URL}${taskId}`);
  console.log(res.data);
  return res.data;
}
export async function getSuggestedTasks(callId: string): Promise<any[]> {
  console.log('hi');

  const res = await axios.get(`${CALL_SERVICE_URL}suggested-tasks/${callId}`);
  console.log('bey');

  return res.data;
}

export async function getCallTags(callId: string): Promise<SuggestedTask[]> {
  const res = await axios.get(`${CALL_SERVICE_URL}tags/${callId}`);
  return res.data;
}

export async function editTaskName(taskId: string, name: string): Promise<SuggestedTask[]> {
  const res = await axios.put(`${TASK_SERVICE_URL}updateTaskName/${taskId}`, { name });
  return res.data;
}

export async function getCallTasks(callId: string): Promise<any[]> {
  try {
    const res = await axios.get(`${TASK_SERVICE_URL}callTasks/${callId}`);
    return res.data;
  } catch (err: any) {
    if (
      axios.isAxiosError(err) &&
      err.response?.status === 404 &&
      err.response?.data?.message === 'No tasks found for this call'
    ) {
      return [];
    }

    console.error('שגיאה בקריאת משימות:', err);
    throw err;
  }
}

interface AddTaskParams {
  callId: string;
  name?: string;
  suggestedTaskId?: string;
}

export async function addTask({ callId, name, suggestedTaskId }: AddTaskParams): Promise<Task[]> {
  console.log(`${TASK_SERVICE_URL}addTaskByCallId/${callId}`, { name, suggestedTaskId });

  const res = await axios.post(`${TASK_SERVICE_URL}addTaskByCallId/${callId}`, {
    name,
    suggestedTaskId,
  });
  return res.data;
}

export async function editTaskStatus(
  taskId: string,
  status: Task['status']
): Promise<SuggestedTask[]> {
  const res = await axios.put(`${TASK_SERVICE_URL}status/${taskId}`, { status });
  return res.data;
}

export async function addSuggestedTaskToCall(
  callId: string,
  suggestedTaskId: string
): Promise<void> {
  await axios.post(`${CALL_SERVICE_URL}${callId}/tasks`, { suggestedTaskId });
}
