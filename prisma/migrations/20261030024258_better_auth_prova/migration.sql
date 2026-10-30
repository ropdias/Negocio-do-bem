-- CreateTable
CREATE TABLE "UsuarioAuth" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "imagem" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessaoAuth" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "ip" TEXT,
    "navegador" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessaoAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VinculoAuth" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "provedor" TEXT NOT NULL,
    "idNoProvedor" TEXT NOT NULL,
    "senhaHash" TEXT,
    "tokenAcesso" TEXT,
    "tokenRenovacao" TEXT,
    "tokenId" TEXT,
    "tokenAcessoExpiraEm" TIMESTAMP(3),
    "tokenRenovacaoExpiraEm" TIMESTAMP(3),
    "escopo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VinculoAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificacaoAuth" (
    "id" TEXT NOT NULL,
    "identificador" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificacaoAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioAuth_email_key" ON "UsuarioAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SessaoAuth_token_key" ON "SessaoAuth"("token");

-- CreateIndex
CREATE INDEX "SessaoAuth_usuarioId_idx" ON "SessaoAuth"("usuarioId");

-- CreateIndex
CREATE INDEX "VinculoAuth_usuarioId_idx" ON "VinculoAuth"("usuarioId");

-- CreateIndex
CREATE INDEX "VerificacaoAuth_identificador_idx" ON "VerificacaoAuth"("identificador");

-- AddForeignKey
ALTER TABLE "SessaoAuth" ADD CONSTRAINT "SessaoAuth_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoAuth" ADD CONSTRAINT "VinculoAuth_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "UsuarioAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
