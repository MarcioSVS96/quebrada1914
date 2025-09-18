import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      // Adicione outras propriedades que você tem no seu usuário
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}
