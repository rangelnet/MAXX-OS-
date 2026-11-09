# MAXX OS — Mapa central de arquitetura e evolução

> Documento de orientação vivo para transformar a cópia local Herald OS em MAXX OS. Consolida o inventário e as análises Reversa existentes; não substitui os relatórios-fonte nem converte inspeção estática em prova de funcionamento.

## 1. Estado e proveniência

| Item | Estado confirmado |
|---|---|
| Projeto local | `/home/rangel/Documentos/MAXX-OS` |
| Base | `iamlukethedev/Herald-OS`, cópia local no commit `d8733e9393c7186e5e8c843ea4abc97d9173ee45` |
| Versão declarada | `0.1.0-alpha.5` |
| Linguagem principal | TypeScript: 1.465 de 1.758 arquivos rastreados no inventário |
| Desktop | Electron 44.5.1, React 19.3.0, Vite 8.3.0, TypeScript 6.0.3, Vitest 5.0.1 |
| Estado do checkout | arquivos de produto limpos na abertura desta frente; alterações Reversa anteriores permanecem não rastreadas e preservadas |
| Git remoto atual | `origin` aponta para o repositório original Herald OS em leitura e escrita; não foi alterado e nenhum push foi feito |
| MAXX OS remoto próprio | ainda não comprovado; não criar repositório nem enviar alterações sem confirmar endereço e autorização na etapa própria |
| Validação de runtime | Scout e Archaeologist fizeram leitura estática. Builds, suíte, instalador e boot do sistema não estão demonstrados por esses relatórios |

O branch do projeto local é a área de desenvolvimento autorizada. O remoto `origin` continua sendo a origem do Herald OS, não um destino de publicação do MAXX.

## 2. Referências canônicas já produzidas

Use estes documentos para navegar o detalhe e evitar repetir a extração:

- [`_reversa_sdd/inventory.md`](_reversa_sdd/inventory.md) — árvore de diretórios, linguagens, entry points, workflows, testes declarados, 28 áreas da UI e limites da inspeção.
- [`_reversa_sdd/dependencies.md`](_reversa_sdd/dependencies.md) — versões, scripts npm, dependências Python/upstream e riscos de instalação.
- [`_reversa_sdd/code-analysis.md`](_reversa_sdd/code-analysis.md) — processo desktop, preload/IPC, shell e análise parcial das features.
- [`_reversa_sdd/code-analysis-hermes-client.md`](_reversa_sdd/code-analysis-hermes-client.md) — JSON-RPC, WebSocket, eventos, REST, anexos e integração com Hermes; sem teste contra runtime local.
- [`_reversa_sdd/code-analysis-herald-os-bridge.md`](_reversa_sdd/code-analysis-herald-os-bridge.md) — catálogo de ferramentas, níveis de permissão, aprovação, auditoria, observer e skills do bridge.
- [`_reversa_sdd/data-dictionary.md`](_reversa_sdd/data-dictionary.md) — contratos e estruturas identificados estaticamente.
- [`_reversa_sdd/flowcharts/`](_reversa_sdd/flowcharts/) — sequências do desktop, preload/IPC, shell, cliente Hermes e features analisadas.
- [`.reversa/context/surface.json`](.reversa/context/surface.json) e [`.reversa/context/modules.json`](.reversa/context/modules.json) — superfície e módulos indexados pelo Scout/Archaeologist.
- [`.reversa/plan.md`](.reversa/plan.md) — plano Reversa atualizado com esta diretriz e suas frentes separadas.

**Confiança:** “confirmado” abaixo significa observado nos caminhos citados. Não significa que tenha sido compilado, iniciado, autenticado ou usado em runtime.

## 3. Árvore disponível

```text
.
├── .github/                 workflows, templates e automações de repositório
├── apps/desktop/            Electron: processo principal, preload, renderer React, recursos e build
├── docs/                    imagens, documentação interna e manual
├── examples/widgets/        exemplo de widget de medidor do sistema
├── linux/                   bootc, binários, catálogo, sessão, compositor, temas, testes e VM
├── packages/hermes-client/  cliente TypeScript de Hermes e contratos gerados do upstream pinado
├── packaging/arch/           receitas herald-os-bin e herald-os-git
├── plugins/herald-os-bridge/ ferramentas Python, adaptadores de host, permissões, auditoria e skills
├── scripts/                  bootstrap, bundle, sincronização e tarefas de desenvolvimento
├── upstream/                 pin e instruções para árvore Hermes externa ao checkout
├── LICENSE / NOTICE          licença e avisos que devem acompanhar derivações e pacotes
├── package.json / lock       workspace e dependências fixadas
└── apps/desktop/package.json versão e embalagem do produto desktop
```

A árvore completa e as subpastas funcionais estão no inventário-fonte. No desktop, `electron/` divide o processo principal por backend, IPC, janela/shell, temas, crash, catálogo, escritório e outras capacidades; `preload/` expõe APIs limitadas ao renderer; `shared/` guarda contratos e suporte de documentos; `src/` contém shell, stores, comandos, componentes e features.

## 4. Arquitetura e módulos

| Módulo | Responsabilidade existente | Evidência/limite |
|---|---|---|
| Desktop Electron/React | Janela principal e janelas flutuantes, menu, launcher, shell, rotas e páginas | `apps/desktop/electron/main.ts`, `apps/desktop/src/main.tsx`, `src/shell/`; mapeado estaticamente |
| Preload e IPC | Superfície tipada entre renderer e processo principal, com canais `herald-os:*` | `apps/desktop/preload/index.ts`, `apps/desktop/shared/ipc.ts`, `electron/ipc/`; contratos TS não substituem validação em runtime |
| Stores e comandos | Estado de chat, sessões, gateway, arquivos, voz, apps e comandos de sistema | `apps/desktop/src/store/`, `src/commands/`; uso local não homologado nesta extração |
| Cliente Hermes | Transporte JSON-RPC/WebSocket, reconexão, eventos e REST auxiliar | `packages/hermes-client/`; os arquivos pinados em `upstream/` estão ausentes, por isso tipos completos e compatibilidade com o Hermes instalado são lacunas |
| Plugin `herald-os-bridge` | Ferramentas de host com níveis `read`, `act`, `mutate`, `destructive`, política de confirmação, escopo e trilha de auditoria | `plugins/herald-os-bridge/`; relatório estático, registro runtime e política do host não validados |
| Imagem Linux | Imagem bootc, sessão Niri/Cage/greetd, serviços, migrações, catálogo e integração de desktop | `linux/image/`, `linux/session/`, `linux/migrations/`; não foi iniciada nem instalada |
| Temas do sistema | Temas de sessão Linux e preferências desktop | `linux/themes/`, `apps/desktop/electron/theme/`; detalhes de contraste e aplicação final pendem de teste visual |
| Arch | Pacotes e instaladores `herald-os-bin`/`herald-os-git` | `packaging/arch/`; builds não executados |
| Scripts e upstream | Bootstrap do workspace, bundle e sync de componentes upstream | `scripts/`, `upstream/`; não executar sync sem conferir impacto, pois altera árvore derivada |
| Docs, exemplos e CI | Manual, exemplos de widget, testes e workflows | `docs/`, `examples/`, `.github/workflows/`; declarações de CI não são resultados de execução |

### Dependências centrais

- Workspace npm com Electron, React, TypeScript, Vite e Vitest. O inventário observou Node 22.23.4/npm 10.9.9 no host na data da análise.
- UI e produtividade: Tailwind, Tabler, Tiptap, Univer, ECharts, xterm e ferramentas de documentos.
- Python no bridge; runtimes e adaptadores variam por macOS/Linux.
- Imagem Linux baseada em Fedora bootc 44, com `Containerfile` e variante Nvidia; não requer que a experiência desktop seja confundida com boot completo do MAXX OS.
- `node_modules` não estava presente no inventário. Não instalar dependências pesadas durante a etapa de mapa.

## 5. Telas, navegação e features identificadas

O shell registra áreas do desktop e janelas de apps em `apps/desktop/src/shell/apps.ts`, `Desktop.tsx` e componentes da janela. O inventário identificou estas 28 pastas em `apps/desktop/src/features/`:

`applications`, `auth`, `automations`, `calc`, `canvas`, `capture`, `chat`, `connections`, `emoji`, `files`, `hermes`, `memory`, `missions`, `office`, `overview`, `pet`, `petdex`, `plugins`, `room`, `screensaver`, `settings`, `setup`, `status`, `studio`, `system`, `terminal`, `voice`, `web`.

Interfaces vistas na análise parcial incluem Overview, launcher de aplicações, autenticação de Hermes, automações, chat/stream, arquivos, memória, conexões, configurações, voz, terminal, canvas, escritório, status e salas. Os nomes identificam estrutura e wiring; o funcionamento ponta a ponta de cada área não está validado. A análise profunda das 28 features permanece ativa em frente documental separada.

**MAXX IA:** não existe ainda uma tela MAXX IA independente confirmada. A experiência deve ser introduzida sem substituir a Visão Geral, reutilizando o shell, as APIs existentes e a ponte IPC. O conceito visual de referência registrado pelo usuário é um holograma neural luminoso azul/ciano, ondas de áudio, estado de voz, integração Hermes e indicadores laterais; a imagem não prova que esses elementos existam no produto.

## 6. Branding, ícones e temas

| Superfície | Arquivo/pasta observado | Trabalho MAXX planejado |
|---|---|---|
| Logo compartilhado do desktop | `apps/desktop/src/components/herald-logo.tsx` e `apps/desktop/src/assets/brand/herald-mark.png` | Adicionar marca MAXX sem apagar o recurso original; preservar o identificador de componente enquanto outros consumidores forem avaliados |
| Ícones empacotados | `apps/desktop/build/icon.png`, `icon.icns` | Gerar/conectar ícones MAXX em frente própria após conferir formatos, tamanhos e build |
| Imagens públicas | `apps/desktop/public/brand/` | Identificar usos antes da substituição |
| Splash Plymouth | `linux/plymouth/herald-os/` | Migrar apenas com teste da imagem/boot em ambiente DEV isolado |
| Temas Linux | `linux/themes/herald-*` | Renomear ou migrar incrementalmente; checar referências de sessão e compatibilidade |
| Texto/runtime do desktop | `apps/desktop/package.json` (`productName`, empacotamento) e `apps/desktop/electron/main.ts` (`app.setName`) | Atualizar branding visível; manter `appId`, nomes de IPC, aliases, plugins e caminhos técnicos até migração validada |
| README, manual, catálogo e receitas de pacote | `README.md`, `docs/`, `linux/catalog/`, `packaging/arch/` | Atualizar apresentação em fases, preservando atribuição ao autor original e aviso de não afiliação oficial |

Na primeira etapa, foram identificados como candidatos `productName`, título da aplicação e componente visual do logo. A reserva do REVERSA recusou arquivos de código até a passagem formal ao especialista de implementação; portanto nenhum desses arquivos de produto foi alterado nesta etapa.

## 7. Integração com Hermes e permissões

- O renderer conversa com APIs expostas pelo preload; o processo principal intermedeia REST/WebSocket e estado do backend. A extração confirmou consumidor e contratos de interface, não uma ligação ao Hermes local.
- O cliente declara sessão, submissão de prompt, streaming, anexos, eventos e erros. O pacote REST aceita token na factory e não centraliza allowlist de host/path; manter credenciais no processo principal e criar validação/timeouts antes de ampliar integração.
- O bridge declara 19 ferramentas e quatro níveis de permissão. Operações de alteração/exclusão exigem políticas e aprovações; a UI não deve substituir essa fronteira.
- O plugin/skills existente não é o Hermes do projeto local. O JARVIS/Hermes instalado é um projeto/runtime separado e não foi inspecionado nesta frente MAXX OS.
- Não reconstruir Hermes, copiar tokens, ampliar permissões silenciosamente nem associar sessões até confirmar versão, endpoints e autenticação reais.

## 8. Identificadores: o que é marca e o que é contrato

| Tipo | Exemplos | Política |
|---|---|---|
| Branding visível | `Herald OS`, logomarca, splash, nome do produto e nomes de temas | Pode migrar para MAXX por consumidor, com prova visual e reversão |
| Contratos internos | `window.heraldOS`, canais `herald-os:*`, `@herald-os/client`, storage keys, app IDs | Preservar no primeiro ciclo; alterar apenas com migração/compatibilidade e testes |
| Upstream/atribuição | nome do projeto, autores, `LICENSE`, `NOTICE`, afiliação | Preservar avisos MIT e NOTICE; identificar MAXX como derivação independente sem atribuição falsa |
| Caminhos operacionais | `/etc/herald-os`, user data, plugin, comandos e pacote Arch | Mapear consumidores e migração reversível antes de renomear |

## 9. Capacidades e maturidade atual

| Capacidade | Código/documentação | Runtime/estado para MAXX |
|---|---|---|
| Shell e 28 áreas de UI | Estrutura, navegação e alguns fluxos confirmados estaticamente | Testes completos e fidelidade visual ainda não verificados |
| Chat/stream com Hermes | Cliente e consumers identificados | Hermes runtime do computador não conectado nesta frente |
| Memória e contexto | Interface/consumidores no produto | Integração não comprovada; preservar fonte única quando conectada |
| Voice | Feature e stores declarados | Provedores, modelos e voz local não validados neste runtime |
| Permissões do bridge | Políticas, tiers, approvals e logs presentes em código | Registro e execução real do plugin não validados; frente audit anterior ficou bloqueada em runtime |
| Linux bootc/desktop | Containerfiles, unidade, temas e setup presentes | Não inicializado, instalado ou bootado |
| Android Core | Não identificado como runtime Android integrado comprovado | Pesquisa/PoC futura; sem promessa de compatibilidade |
| Windows Runtime | Wine/VM não identificados como experiência pronta do MAXX | Planejamento futuro, sem instalação |
| MAXX Visual Engine | ECharts/Three.js-like assets não significam engine MAXX existente; ECharts está na dependência | Esfera MAXX e conteúdo gerado ainda não implementados |
| Colab | CLI oficial validado numa sessão CPU genérica em frente separada | MAXX OS não foi enviado; MCP/Codex não conectado; sem isolamento de rede comprovado |
| Postiz/publicação | não é parte do escopo atual MAXX OS | não instalado/configurado nesta frente |

## 10. Riscos e pendências conhecidas

1. O repositório ainda tem `origin` fetch/push para o Herald. Não fazer `git push`; primeiro criar/confirmar remoto MAXX em tarefa separada e obter confirmação do endereço.
2. `upstream/hermes-agent` não está materializado localmente, embora o cliente dependa dos contratos gerados. Typecheck/build podem falhar até bootstrap autorizado; não executar sync ou baixar código automaticamente.
3. O inventário observou ausência de `node_modules`; testes e build ainda não executados nesta consolidação.
4. O usuário apontou falhas anteriores de TypeScript, contrato de aprovação e alertas npm. Permanecem **não verificados nesta tarefa**; fazer uma rodada focada antes de integração maior.
5. As análises internas de features continuam ativas em outra frente. Não modificar `apps/desktop/src/features/` até a liberação/coordenação formal.
6. A plataforma alvo do primeiro protótipo MAXX (desktop Electron dentro do Linux, ou a imagem bootc inteira) precisa permanecer explicitamente separada em relatórios e aceite.
7. Colab recebe código executado remotamente. Antes de enviar snapshot privado, comprovar controles de rede, autorização do material, versão e armazenamento; credenciais e dados de usuário não são permitidos na primeira prova.
8. Não assumir GPU no host: usar redução gráfica/CPU fallback no conceito da esfera e medir no runtime quando a tela MAXX IA existir.
9. Gate para começar a implementação: o ciclo atual ainda não contém `_reversa_sdd/architecture.md`, `_reversa_sdd/domain.md`, `.reversa/active-requirements.json` nem `actions.md` de feature. O especialista `reversa-coding` exige essas âncoras e uma delegação formal antes de reservar código. A extração de features segue ativa; a implementação não deve contornar esse gate nem tratar documentação parcial como arquitetura completa.

## 11. Ordem de implementação e critérios verificáveis

| Etapa | Incremento | Pronto quando |
|---:|---|---|
| 0 | Este mapa central + plano Reversa ligados aos registros existentes | fontes, confiança, frentes ativas, riscos e arquivos-alvo ligados sem alterar produto |
| 1 | Base de identidade MAXX | janela e logo MAXX aparecem em build DEV; `appId`, IPC e avisos legais preservados; captura real e build/typecheck documentados |
| 2 | Navegação/MAXX IA | seção distinta de Overview, sem mexer nos módulos em análise; teclado/mouse e estados vazios/erro demonstrados |
| 3 | Esfera e visual | renderização WebGL 3D com fallback CPU; estados listening/thinking/speaking/working visíveis e desempenho medido |
| 4 | Cliente local + Hermes | contrato/versionamento, endpoint, sessão, streaming, erros, cancelamento e autorização testados no runtime real; nenhum token no renderer |
| 5 | Colab como laboratório | snapshot autorizado, ambiente isolado, evidências retornadas e runtime encerrado; sem confundir desktop com boot de OS |
| 6 | Packaging, README e repositório MAXX | licença/NOTICE preservados; CI/build alinhados; remoto MAXX confirmado pelo usuário antes de primeiro push |
| 7 | OS runtime, Guardian, Android e Windows | cada módulo tem PoC separada, requisitos reais de hardware, reversão e critérios antes de instalação/integração |

## 12. Diário de mudanças deste mapa

| Data | Mudança | Estado |
|---|---|---|
| 2026-11-05 | Consolidação inicial dos relatórios Scout/Archaeologist, estado Reversa e prova anterior do Colab. | Documento criado; conteúdo de runtime continua explicitamente limitado às evidências citadas. |
| 2026-11-05 | Checagem de links internos, whitespace e indexação local da malha Reversa. | 11 links resolvidos; `git diff --check` sem erro; `verification.passed = true` e `orphan_cards = 0`. Ver [evidência da validação](.reversa/workstreams/20261105-223231-792-reversa-mapa-central-maxx-os-e-primeira-etapa-reversivel-de-identidade/evidence/map-validation.md). Produto ainda não modificado. |

Última atualização: 2026-11-05. A próxima alteração deve acrescentar hash/versão, arquivos tocados e evidências reais, sem reescrever os achados históricos.

