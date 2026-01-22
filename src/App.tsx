import React, { useState, FormEvent } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { TodoList } from './components/TodoList';
import { Todo, User } from './types/Todo';
import classNames from 'classnames';

export const App = () => {
  const initialTodos: Todo[] = todosFromServer.map(todo => {
    const user = usersFromServer.find(u => u.id === todo.userId);

    return {
      ...todo,
      user: user as User,
    };
  });

  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState(0);
  const [hasTitleError, setHasTitleError] = useState(false);
  const [hasUserError, setHasUserError] = useState(false);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
    setHasTitleError(false);
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserId(Number(event.target.value));
    setHasUserError(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const isTitleEmpty = !title.trim();
    const isUserNotSelected = userId === 0;

    setHasTitleError(isTitleEmpty);
    setHasUserError(isUserNotSelected);

    if (isTitleEmpty || isUserNotSelected) {
      return;
    }

    const selectedUser = usersFromServer.find(user => user.id === userId);

    if (!selectedUser) {
      return;
    }

    // FIX 1: Правильна генерація ID
    // Знаходимо максимальний ID серед існуючих. Якщо масив пустий — беремо 0.
    const maxId = Math.max(...todos.map(todo => todo.id), 0);

    const newTodo: Todo = {
      id: maxId + 1, // Додаємо 1 до максимального
      title: title.trim(),
      userId: userId,
      completed: false,
      user: selectedUser,
    };

    setTodos(currentTodos => [...currentTodos, newTodo]);
    setTitle('');
    setUserId(0);
  };

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <input
            type="text"
            data-cy="titleInput"
            // FIX 2: Додали placeholder
            placeholder="Todo title"
            value={title}
            onChange={handleTitleChange}
            className={classNames({ 'is-danger': hasTitleError })}
          />
          {hasTitleError && <span className="error">Please enter a title</span>}
        </div>

        <div className="field">
          <select
            data-cy="userSelect"
            value={userId}
            onChange={handleUserChange}
            className={classNames({ 'is-danger': hasUserError })}
          >
            <option value="0" disabled>
              Choose a user
            </option>
            {usersFromServer.map(user => (
              <option value={user.id} key={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {hasUserError && <span className="error">Please choose a user</span>}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={todos} />
    </div>
  );
};
