# Quebrada 1914 - Painel Administrativo

Este é um projeto de um painel administrativo completo para gerenciar uma loja online, desenvolvido com Next.js, TypeScript, MongoDB e NextAuth.js.

## Funcionalidades

*   **Dashboard**: Visão geral com métricas de produtos, categorias e mensagens.
*   **Gerenciamento de Produtos**: CRUD completo para produtos da loja.
*   **Gerenciamento de Categorias**: CRUD completo para categorias de produtos.
*   **Caixa de Entrada**: Visualização e exclusão de mensagens de contato.
*   **Lista de Tarefas**: Sistema de to-do list para o administrador.

## Como Rodar o Projeto

### Pré-requisitos

*   Node.js (v18 ou superior)
*   MongoDB Atlas (ou uma instância local do MongoDB)
*   Um editor de código (ex: VS Code)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone <url-do-seu-repositorio>
    ```
2.  Navegue até a pasta do projeto:
    ```bash
    cd quebrada1914
    ```
3.  Instale as dependências:
    ```bash
    npm install
    ```

### Configuração do Banco de Dados

1.  Crie um arquivo `.env.local` na raiz do projeto.
2.  Copie o conteúdo do arquivo `.env.example` (se houver) ou adicione as seguintes variáveis:

    ```
    # MongoDB
    MONGODB_URI="sua_string_de_conexao_do_mongodb_atlas"
    MONGODB_DB="quebrada1914"

    # NextAuth.js
    NEXTAUTH_SECRET="gere_um_secret_aqui" # Use: openssl rand -base64 32
    NEXTAUTH_URL="http://localhost:3000"

    # Admin
    ADMIN_EMAIL="quebrada1914@outlook.com"
    ADMIN_PASSWORD="Scfc*1914#"
    ```

### Executando a Aplicação

1.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
2.  Abra seu navegador e acesse `http://localhost:3000/auth/login`.
3.  Use as credenciais definidas em `ADMIN_EMAIL` e `ADMIN_PASSWORD` para fazer login.

