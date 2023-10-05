import styles from '../../styles/Todo.module.css'
import TodoList from './TodoList'

const TodoSection = ({ title, todos, action1, action2 }) => {
    return (
        <div className={styles.todoSection}>
            <h1 className="title">
                {title} - {todos.length}
            </h1>

            <TodoList todos={todos} action1={action1} action2={action2} />
        </div>
    )
}

export default TodoSection
