import { DataSourceOptions } from 'typeorm';
import { Task, Call, Tag, CallTag, SuggestedTask, User } from './entities';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'call_center_db',
  synchronize: true,
  entities: [Call, Task, SuggestedTask, Tag, CallTag, User],
};
