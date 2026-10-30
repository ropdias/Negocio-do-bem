import { toNextJsHandler } from "better-auth/next-js";

// Rota do Better Auth, da prova da etapa A1 (#125). Em produção e nos previews ela
// responde 404: o login do site ainda é o de src/lib/auth/sessao.ts, e um cadastro
// paralelo aberto criaria contas que o site não reconhece. A configuração só é
// carregada fora de produção, então o deploy não precisa do BETTER_AUTH_SECRET.

export const { GET, POST } = toNextJsHandler(async (request) => {
  if (process.env.NODE_ENV === "production") return new Response("Não encontrado", { status: 404 });
  const { auth } = await import("@/lib/auth/better-auth");
  return auth.handler(request);
});
