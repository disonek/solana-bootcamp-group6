import styles from '../../styles/Todo.module.css'
import TodoItem from './TodoItem'

const TodoList = ({ todos, action1, action2 }) => {
    return (
        <ul className={styles.todoList}>
            {todos.map((todo) => (
                <TodoItem key={todo.account.idx} {...todo.account} publicKey={todo.publicKey} action1={action1} action2={action2} />
            ))}
        </ul>
    )
}

export default TodoList
