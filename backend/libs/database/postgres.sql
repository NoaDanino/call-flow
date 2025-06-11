CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE task_status_enum AS ENUM ('Open', 'In Progress', 'Completed');
CREATE TYPE user_role_enum AS ENUM ('user', 'admin');

CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE suggested_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE suggested_task_tags (
    suggested_task_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (suggested_task_id, tag_id),
    FOREIGN KEY (suggested_task_id) REFERENCES suggested_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    status task_status_enum NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    call_id UUID NOT NULL,
    suggested_task_id UUID,
    UNIQUE (name, call_id),
    FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
    FOREIGN KEY (suggested_task_id) REFERENCES suggested_tasks(id) ON DELETE SET NULL
);

CREATE TABLE call_tags (
    call_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    PRIMARY KEY (call_id, tag_id),
    FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'user'
);
