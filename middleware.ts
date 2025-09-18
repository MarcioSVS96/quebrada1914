import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Esta função será executada para cada requisição que corresponder ao `matcher`
export function middleware(request: NextRequest) {
  // Aqui você pode adicionar sua lógica.
  // Por exemplo, verificar se o usuário está autenticado,
  // redirecionar para outra página, etc.

  console.log('Middleware executado para a rota:', request.nextUrl.pathname);

  // Continua o fluxo da requisição
  return NextResponse.next();
}

// O objeto `config` permite especificar em quais rotas o middleware deve ser executado.
// Isso evita que ele rode em todas as requisições, como para arquivos de imagem ou CSS.
export const config = {
  /*
   * Corresponde a todas as rotas, exceto para:
   * - rotas da API (api/)
   * - rotas internas do Next.js (_next/)
   * - arquivos estáticos (qualquer arquivo com um ponto, como .png, .ico)
   */
  matcher: '/((?!api|_next/static|favicon.ico).*)',
};
