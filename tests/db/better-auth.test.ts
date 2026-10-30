import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { auth } from "@/lib/auth/better-auth";
import { gerarHashSenha, verificarSenha } from "@/lib/auth/senha";
import { db } from "@/lib/db";

// Prova do Better Auth (#125, etapa A1): cadastro, login, sessão e saída pelo
// auth.api, gravando nas tabelas em português e com o scrypt de hoje.

async function limparBanco() {
  await db.$executeRawUnsafe(`TRUNCATE "VerificacaoAuth", "VinculoAuth", "SessaoAuth", "UsuarioAuth" CASCADE`);
}

/** Transforma os Set-Cookie da resposta no cabeçalho Cookie das próximas chamadas. */
function cookiesDe(resposta: Headers): Headers {
  const cookie = resposta
    .getSetCookie()
    .map((linha) => linha.split(";")[0])
    .join("; ");
  return new Headers({ cookie });
}

async function entrar(email: string, password: string): Promise<Headers> {
  const { headers } = await auth.api.signInEmail({ body: { email, password }, returnHeaders: true });
  return cookiesDe(headers);
}

beforeEach(limparBanco);
afterAll(async () => {
  await limparBanco();
  await db.$disconnect();
});

describe("Better Auth com as tabelas em português", () => {
  it("cadastra com o scrypt de hoje e grava nas tabelas *Auth", async () => {
    const { user } = await auth.api.signUpEmail({
      body: { name: "Ana", email: "ana@exemplo.com", password: "senha-da-ana" },
    });

    const usuario = await db.usuarioAuth.findUniqueOrThrow({ where: { id: user.id } });
    expect(usuario).toMatchObject({ nome: "Ana", email: "ana@exemplo.com", emailVerificado: false });

    const vinculo = await db.vinculoAuth.findFirstOrThrow({ where: { usuarioId: user.id } });
    expect(vinculo).toMatchObject({ provedor: "credential", idNoProvedor: user.id });
    expect(vinculo.senhaHash).toMatch(/^scrypt\$32768\$8\$1\$[^$]+\$[^$]+$/);
    expect(await verificarSenha("senha-da-ana", vinculo.senhaHash!)).toBe(true);
  });

  it("entra com a senha, lê a sessão e sai", async () => {
    await auth.api.signUpEmail({ body: { name: "Ana", email: "ana@exemplo.com", password: "senha-da-ana" } });

    const cookies = await entrar("ana@exemplo.com", "senha-da-ana");
    const sessao = await auth.api.getSession({ headers: cookies });
    expect(sessao?.user).toMatchObject({ name: "Ana", email: "ana@exemplo.com" });
    expect(await db.sessaoAuth.count({ where: { usuarioId: sessao!.user.id } })).toBeGreaterThan(0);

    await auth.api.signOut({ headers: cookies });
    expect(await auth.api.getSession({ headers: cookies })).toBeNull();
    expect(await db.sessaoAuth.count({ where: { token: sessao!.session.token } })).toBe(0);
  });

  it("recusa a senha errada", async () => {
    await auth.api.signUpEmail({ body: { name: "Ana", email: "ana@exemplo.com", password: "senha-da-ana" } });
    await expect(entrar("ana@exemplo.com", "outra-senha")).rejects.toThrow();
  });

  it("aceita um hash scrypt gravado direto no banco, como os das contas de hoje", async () => {
    const senhaHash = await gerarHashSenha("senha-antiga-da-bia");
    await db.usuarioAuth.create({
      data: {
        id: "usuario-antigo",
        nome: "Bia",
        email: "bia@exemplo.com",
        vinculos: {
          create: { id: "vinculo-antigo", provedor: "credential", idNoProvedor: "usuario-antigo", senhaHash },
        },
      },
    });

    const cookies = await entrar("bia@exemplo.com", "senha-antiga-da-bia");
    const sessao = await auth.api.getSession({ headers: cookies });
    expect(sessao?.user).toMatchObject({ id: "usuario-antigo", name: "Bia" });
    await expect(entrar("bia@exemplo.com", "senha-errada-da-bia")).rejects.toThrow();
  });
});
