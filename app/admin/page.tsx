import AdminDashboard from "@/components/admin-dashboard"

export default function AdminPage() {
  // A proteção desta rota agora é feita pelo middleware.
  // Se o usuário chegar aqui, ele já está autenticado como administrador.
  // Você pode colocar aqui o seu componente de tarefas (ex: <AdminTasks />).
  return <AdminDashboard />
}
