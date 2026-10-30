import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { gerarHashSenha, verificarSenha } from "@/lib/auth/senha";

// Prova do Better Auth (#125, etapa A1). O login do site continua em sessao.ts;
// esta configuração só grava nas tabelas *Auth do schema e não é usada pelas páginas.

const DURACAO_SEGUNDOS = 30 * 24 * 60 * 60;

export const auth = betterAuth({
  appName: "Negócio do Bem",
  baseURL: process.env.APP_URL,
  // O Better Auth lê o BETTER_AUTH_SECRET sozinho; fica explícito para quem procurar.
  secret: process.env.BETTER_AUTH_SECRET,
  telemetry: { enabled: false },
  database: prismaAdapter(db, { provider: "postgresql" }),
  // modelName é o nome do model no cliente do Prisma (db.usuarioAuth), e fields
  // liga cada campo do Better Auth ao campo em português do schema.
  user: {
    modelName: "usuarioAuth",
    fields: {
      name: "nome",
      emailVerified: "emailVerificado",
      image: "imagem",
      createdAt: "criadoEm",
      updatedAt: "atualizadoEm",
    },
  },
  session: {
    modelName: "sessaoAuth",
    // Igual à sessão de hoje (sessao.ts): 30 dias.
    expiresIn: DURACAO_SEGUNDOS,
    fields: {
      userId: "usuarioId",
      expiresAt: "expiraEm",
      ipAddress: "ip",
      userAgent: "navegador",
      createdAt: "criadoEm",
      updatedAt: "atualizadoEm",
    },
  },
  account: {
    modelName: "vinculoAuth",
    fields: {
      userId: "usuarioId",
      providerId: "provedor",
      accountId: "idNoProvedor",
      password: "senhaHash",
      accessToken: "tokenAcesso",
      refreshToken: "tokenRenovacao",
      idToken: "tokenId",
      accessTokenExpiresAt: "tokenAcessoExpiraEm",
      refreshTokenExpiresAt: "tokenRenovacaoExpiraEm",
      scope: "escopo",
      createdAt: "criadoEm",
      updatedAt: "atualizadoEm",
    },
  },
  verification: {
    modelName: "verificacaoAuth",
    fields: {
      identifier: "identificador",
      value: "valor",
      expiresAt: "expiraEm",
      createdAt: "criadoEm",
      updatedAt: "atualizadoEm",
    },
  },
  emailAndPassword: {
    enabled: true,
    // Os mesmos limites do cadastro de hoje (src/acoes/conta.ts).
    minPasswordLength: 8,
    maxPasswordLength: 200,
    // O mesmo scrypt de hoje: as senhas já gravadas continuam valendo e as novas
    // saem no mesmo formato (scrypt$N$r$p$sal$hash).
    password: {
      hash: gerarHashSenha,
      verify: ({ hash, password }) => verificarSenha(password, hash),
    },
  },
  // Grava os cookies do Better Auth quando ele é chamado de uma Server Action. Fica por último.
  plugins: [nextCookies()],
});
